import axios from "axios";
import { User } from "firebase/auth";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

// ---------- Create Feedback ----------
export const CreateFeedback = async (data: FormData) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/feedbacks/create-feedback`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Get Feedback ----------
export const GetFeedback = async (user: User) => {
  try {
    const response = await axios.get(
      `${BASE_API_URL}/feedbacks/fetch-feedback`,
      {
        headers: {
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Update Feedback ----------
export const UpdateFeedback = async (feedbackId: number, user: User) => {
  try {
    const response = await axios.put(
      `${BASE_API_URL}/feedbacks/update-feedback-status/${feedbackId}`,
      {}, // body can be an empty object if there's no data to send
      {
        headers: {
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
};
