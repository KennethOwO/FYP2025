//Import necessary libraries -> either "@testing-library/react" or "react-test-renderer"
import { render, fireEvent } from "@testing-library/react";
import CollapsibleForm from "../../../../../containers/DataCollection/components/CollapsibleForm/CollapsibleForm";
import { cleanup } from "@testing-library/react";
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock the translation function to return the key
    i18n: {
      changeLanguage: jest.fn(), // Mock the changeLanguage function
    },
  }),
}));
jest.mock("moment", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    format: jest.fn(() => "2024-05-24 12:00:00"), // Mock the format method
  })),
}));
describe("Test Collapsible Form", () => {
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
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  const props = {
    number: "1",
    form_id: 1,
    dateTime: "2023-11-11",
    status_en: "New",
    status_bm: "Baru",
    name: "Luffy Lee",
    email: "luffynika@example.com",
    text: "Aku mahu makan nasi",
    video_link: "testing123.mp4",
    avatar_link: "",
    user: "admin",
    user_id: 1,
    video_name: "testing123",
    avatar_name: "testing123",
    handleSubmit: jest.fn(),
    handleDelete: jest.fn(),
  };
  it("should render correctly", () => {
    const { container, getByText } = render(<CollapsibleForm {...props} />);
    const header = getByText(`No: ${props.number}`).closest(
      ".collapsible-content-header"
    );

    if (header) {
      fireEvent.click(header);
    }

    expect(container).toMatchSnapshot();
  });
});
