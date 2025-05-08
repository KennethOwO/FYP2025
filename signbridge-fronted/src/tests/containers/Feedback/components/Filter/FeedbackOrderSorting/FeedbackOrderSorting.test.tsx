import FeedbackOrderFilter from "@root/containers/Feedback/components/Filter/FeedbackOrderSorting/FeedbackOrderSorting";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";
// Mock the translation functions
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock the translation function to return the key
    i18n: {
      changeLanguage: jest.fn(), // Mock the changeLanguage function
    },
  }),
}));

describe("Test FeedbackOrderFilter", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<FeedbackOrderFilter sortData={jest.fn()} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
