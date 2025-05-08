import sys
import os
import json
import numpy as np

def connect_gloss_jsonl(gloss_names, root_dir, output_path, trims=None):
    def find_gloss_jsonl(gloss):
        for dirpath, _, filenames in os.walk(root_dir):
            if f"{gloss}.jsonl" in filenames:
                return os.path.join(dirpath, f"{gloss}.jsonl")
        raise FileNotFoundError(f"X Gloss '{gloss}.jsonl' not found under {root_dir}")

    def load_jsonl_trimmed(path, trim_start, trim_end):
        with open(path, 'r', encoding='utf-8') as f:
            frames = [json.loads(line) for line in f]
        return frames[trim_start:len(frames) - trim_end if trim_end > 0 else None]

    def extract_keypoints(frame):
        kp = []
        for group in ['pose_keypoints_2d', 'hand_left_keypoints_2d', 'hand_right_keypoints_2d']:
            data = frame['people'][0][group]
            arr = np.array(data)

            if len(arr) % 3 == 0:
                reshaped = arr.reshape(-1, 3)[:, :2]  # 有 confidence，取前两列
            elif len(arr) % 2 == 0:
                reshaped = arr.reshape(-1, 2)        # 没有 confidence
            else:
                raise ValueError(
                    f"Keypoints 长度异常: {len(arr)}，不能 reshape。group: {group}"
                )

            kp.append(reshaped)

        return np.vstack(kp)

    def compute_avg_movement(frames):
        kps = [extract_keypoints(f) for f in frames]
        diffs = [np.abs(kps[i+1] - kps[i]) for i in range(len(kps)-1)]
        return np.mean([d.mean() for d in diffs]) if diffs else 1.0

    paths = [find_gloss_jsonl(g) for g in gloss_names]

    # auto trims
    if trims is None:
        trims = []
        if len(paths) == 1:
            trims = [(0, 0)]
        elif len(paths) == 2:
            trims = [(0, 15), (15, 0)]
        else:
            for i in range(len(paths)):
                if i == 0:
                    trims.append((0, 15))
                elif i == len(paths) - 1:
                    trims.append((15, 0))
                else:
                    trims.append((15, 15))

    # single gloss output
    if len(paths) == 1:
        with open(paths[0], 'r', encoding='utf-8') as fin, open(output_path, 'w', encoding='utf-8') as fout:
            for line in fin:
                fout.write(line)
        print("single gloss output.")
        return

    combined_frames = []
    interp_count_total = 0

    for i, path in enumerate(paths):
        trimmed = load_jsonl_trimmed(path, *trims[i])

        if i == 0:
            combined_frames.extend(trimmed)
        else:
            prev = combined_frames[-1]
            curr = trimmed[0]
            kpt_prev = extract_keypoints(prev)
            kpt_curr = extract_keypoints(curr)

            avg_move = (compute_avg_movement(combined_frames[-10:]) + compute_avg_movement(trimmed[:10])) / 2
            max_dist = np.max(np.linalg.norm(kpt_curr - kpt_prev, axis=1))
            num_interp = int(np.ceil(max_dist / avg_move) / 8)
            if num_interp > 25:
                num_interp = int(num_interp / 8)

            for j in range(1, num_interp + 1):
                ratio = j / (num_interp + 1)
                interp_kp = kpt_prev * (1 - ratio) + kpt_curr * ratio
                interp_frame = {
                    "version": 1.3,
                    "people": [{
                        "pose_keypoints_2d": interp_kp[:25].reshape(-1).tolist(),
                        "hand_left_keypoints_2d": interp_kp[25:46].reshape(-1).tolist(),
                        "hand_right_keypoints_2d": interp_kp[46:].reshape(-1).tolist()
                    }],
                    "gloss": "interpolated",
                    "id": f"interp_{i}_{j}",
                    "frame_index": 1000 + interp_count_total + j
                }
                combined_frames.append(interp_frame)

            interp_count_total += num_interp
            combined_frames.extend(trimmed)

    with open(output_path, 'w', encoding='utf-8') as f:
        for frame in combined_frames:
            json.dump(frame, f)
            f.write('\n')

    print(f"Succesful connect {len(gloss_names)} gloss(es), total {interp_count_total} frames, saved to: {output_path}")

if __name__ == "__main__":
    gloss_names = sys.argv[1:-1]
    output_path = sys.argv[-1]
    root_dir = os.path.join(os.path.dirname(__file__), "public", "glosses")
    connect_gloss_jsonl(gloss_names, root_dir, output_path)
