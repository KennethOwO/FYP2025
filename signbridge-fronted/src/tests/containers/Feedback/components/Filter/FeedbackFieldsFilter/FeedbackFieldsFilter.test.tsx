import FeedbackFieldsFilter from "@root/containers/Feedback/components/Filter/FeedbackFieldsFilter/FeedbackFieldsFilter";
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

describe("Test FeedbackFieldsFilter", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<FeedbackFieldsFilter sortData={jest.fn()} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
