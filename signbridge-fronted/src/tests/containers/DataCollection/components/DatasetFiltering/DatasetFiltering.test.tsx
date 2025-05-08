import DatasetFiltering from "@root/containers/DataCollection/components/DatasetFiltering/DatasetFiltering";
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

describe("Test DatasetFiltering", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });

  it("should render correctly", () => {
    const props = {
      filterFunction: "status",
      setFilterFunction: jest.fn(),
      filterStatus: "All",
      setFilterStatus: jest.fn(),
      sortOrder: "asc",
      setSortOrder: jest.fn(),
      user: "public",
    };
    const tree = create(<DatasetFiltering {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
