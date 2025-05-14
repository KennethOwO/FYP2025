import DatasetReviewSE from "@root/containers/DataCollection/SignExpert/DatasetReviewSE/DatasetReviewSE";
import { create } from "react-test-renderer";
import {
  cleanup,
  render,
  waitFor,
  fireEvent,
  screen,
  act,
} from "@testing-library/react";
import { getAllFormsForSignExpert } from "@root/services/dataset.service";
import "@testing-library/jest-dom";
import CollapsibleForm from "@root/containers/DataCollection/components/CollapsibleForm/CollapsibleForm";

jest.mock("react-i18next", () => ({
  useTranslation: () => {
    const changeLanguage = jest.fn();
    const t = (key: string) => key; // Mock the translation function to return the key
    const i18n = {
      changeLanguage: changeLanguage, // Mock the changeLanguage function
      on: jest.fn(), // Mock the on function
      off: jest.fn(), // Mock the off function
    };

    return { t, i18n };
  },
}));
jest.mock("moment", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    format: jest.fn(() => "2024-05-24 12:00:00"), // Mock the format method
  })),
}));
// Mock the useSpeechRecognition hook
jest.mock("react-speech-recognition", () => ({
  useSpeechRecognition: () => ({
    transcript: "Hello, World!",
    resetTranscript: jest.fn(),
    browserSupportsSpeechRecognition: true,
  }),
}));
jest.mock("@root/services/dataset.service", () => ({
  getAllFormsForSignExpert: jest.fn(),
}));

jest.mock("@root/services/notification.service", () => ({
  CreateNotification: jest.fn(),
  GetUserIdByEmail: jest.fn(() => {
    return {
      data: {
        user_id: 1,
      },
    };
  }),
}));

jest.mock("js-cookie");

describe("Test DataCollectionPublic", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });
  afterAll(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<DatasetReviewSE />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should be able to view submitted dataset collection form", () => {
    const mockForm = {
      form_id: 123,
      submitted_time: new Date(),
      status_SE_en: "Pending",
      status_SE_bm: "Menunggu",
      name: "John Doe",
      email: "john@example.com",
      text_sentence: "Test sentence",
      video_link: "https://example.com/video",
      avatar_link: "https://example.com/avatar",
      user: "signexpert", // or 'admin' based on your requirement
      user_id: 456,
      video_name: "video.mp4",
      avatar_name: "avatar.png",
    };
    (getAllFormsForSignExpert as jest.Mock).mockResolvedValueOnce(mockForm);
    const { getByText, asFragment } = render(<DatasetReviewSE />);
    waitFor(() => {
      // Check if form data is rendered
      expect(getByText(/John Doe/i)).toBeInTheDocument();
      expect(getByText(/Pending/i)).toBeInTheDocument(); // Assuming translation is done correctly
      // Add more assertions as needed
    });
    expect(asFragment).toMatchSnapshot();
  });
  it("should be able to update dataset collection form status", async () => {
    const handleSubmit = jest.fn();
    const props = {
      number: "1",
      form_id: 1,
      dateTime: "2024-05-24T10:30:00Z",
      status_en: "New",
      status_bm: "Baru",
      name: "John Doe",
      email: "john@example.com",
      text: "Lorem ipsum dolor sit amet.",
      video_link: "https://example.com/video",
      avatar_link: "https://example.com/avatar",
      user: "signexpert",
      user_id: 1,
      video_name: "video.mp4",
      avatar_name: "avatar.jpg",
      handleSubmit: handleSubmit,
      handleDelete: jest.fn(),
    };

    render(<CollapsibleForm {...props} />);
    fireEvent.click(screen.getByTestId("collapsible-content_1"));

    await waitFor(() => {
      // Assert that form details are rendered correctly
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/New/i)).toBeInTheDocument(); // English status
    });

    // Press the accept button
    fireEvent.click(screen.getByText(/Accept/i)); // Assuming accept button text is "Accept"

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("should be able to delete dataset collection form status", async () => {
    const handleSubmit = jest.fn();
    const handleDelete = jest.fn();
    const props = {
      number: "2",
      form_id: 2,
      dateTime: "2024-05-24T10:30:00Z",
      status_en: "New",
      status_bm: "Baru",
      name: "John Doe",
      email: "john@example.com",
      text: "Lorem ipsum dolor sit amet.",
      video_link: "https://example.com/video",
      avatar_link: "https://example.com/avatar",
      user: "signexpert",
      user_id: 1,
      video_name: "video.mp4",
      avatar_name: "avatar.jpg",
      handleSubmit: handleSubmit,
      handleDelete: handleDelete,
    };

    render(<CollapsibleForm {...props} />);
    fireEvent.click(screen.getByTestId("collapsible-content_2"));

    await waitFor(() => {
      // Assert that form details are rendered correctly
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/New/i)).toBeInTheDocument(); // English status
    });

    // Press the cancel button
    fireEvent.click(screen.getByText(/Cancel/i)); // Assuming cancel button text is "Cancel"

    expect(handleDelete).toHaveBeenCalledTimes(1);
  });
});
