import FaqAdmin from "@root/containers/Faq/Admin/FaqAdmin";
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
describe("Test FaqAdmin", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<FaqAdmin />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
