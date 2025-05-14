import DataCollection from "@root/containers/DataCollection/components/DataCollection/DataCollection";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";

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

describe("Test DataCollection", () => {
  beforeAll(() => {});
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });

  it("should render correctly", () => {
    const tree = create(<DataCollection user="public" />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
