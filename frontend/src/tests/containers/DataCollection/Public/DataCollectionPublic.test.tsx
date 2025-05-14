import { create } from "react-test-renderer";
import {
  render,
  fireEvent,
  cleanup,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom"; //For extra validation => toBeInTheDocument()
import DataCollectionPublic from "../../../../containers/DataCollection/Public/DataCollectionPublic";
import { act } from "react-dom/test-utils";

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

jest.mock("js-cookie");

describe("Test DataCollectionPublic", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<DataCollectionPublic />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should be able to submit", async () => {
    // Mocking the selected video file => For video upload
    Object.defineProperty(global, "File", {
      value: class extends Blob {
        constructor(
          fileParts: Array<string>,
          fileName: string,
          options?: BlobPropertyBag
        ) {
          super(fileParts, options);
          (this as any).name = fileName;
        }
      },
    });

    // Use asFragment to render toMatchSnapshot
    const { asFragment } = render(<DataCollectionPublic />);

    // Fill in the form fields
    userEvent.type(screen.getByTestId("name"), "John Doe"); // If you go to my code you will find that I have put up testid for it, it's easier to use
    userEvent.type(screen.getByTestId("email"), "john@example.com");
    userEvent.type(screen.getByTestId("text"), "Test sentence");

    // Mock the Upload component behavior
    jest.mock("antd", () => ({
      Upload: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="upload-mock">{children}</div>
      ),
    }));

    // Click the submit button
    await act(async () => {
      fireEvent.click(screen.getByTestId("click-close-btn"));
      fireEvent.click(screen.getByTestId("submit_btn2"));
    });

    // Using snapshot as temporary solution
    expect(asFragment()).toMatchSnapshot();
    expect(screen.getByText("OK")).toBeTruthy();
  });
});
