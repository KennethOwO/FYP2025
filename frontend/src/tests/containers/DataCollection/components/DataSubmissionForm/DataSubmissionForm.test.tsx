import React from "react";
import DataSubmissionForm from "../../../../../containers/DataCollection/components/DataSubmissionForm/DataSubmissionForm";
import { cleanup } from "@testing-library/react";
import { create } from "react-test-renderer";
import Cookies from "js-cookie";
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock the translation function to return the key
    i18n: {
      changeLanguage: jest.fn(), // Mock the changeLanguage function
    },
  }),
}));
// Mock the useSpeechRecognition hook
jest.mock("react-speech-recognition", () => ({
  useSpeechRecognition: () => ({
    transcript: "Hello, World!",
    resetTranscript: jest.fn(),
    browserSupportsSpeechRecognition: true,
  }),
}));

describe("Test DataSubmissionForm", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  const props = {
    user: "public",
    isSubmitModalOpen: false,
    showPopup: false,
    setShowPopup: jest.fn(),
    showInstructionPopup: false,
    setShowInstructionPopup: jest.fn(),
    onOpenModal: jest.fn(),
  };

  it("should render correctly with simulated logged-in user", () => {
    jest.mock("js-cookie", () => ({
      get: (key: string): string | undefined => {
        const mockData: any = {
          token: "valid_token",
          user_id: "1",
        };
        return mockData[key];
      },
    }));
    const tree = create(<DataSubmissionForm {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
