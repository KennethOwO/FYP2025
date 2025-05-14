import VideoRecorder from "@root/containers/Education/components/RecordVideo/VideoRecorder";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";

describe("Test VideoRecorder", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const props = {
      countdown: 1,
      onStartRecording: jest.fn(),
      onStopRecording: jest.fn(),
      onVideoData: jest.fn(),
    };
    const tree = create(<VideoRecorder {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
