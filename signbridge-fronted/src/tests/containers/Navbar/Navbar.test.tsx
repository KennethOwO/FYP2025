import Navbar from "@root/containers/Navbar/Navbar";
import { create } from "react-test-renderer";
import { MemoryRouter } from "react-router-dom"; // Import MemoryRouter
import { cleanup } from "@testing-library/react";
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock the translation function to return the key
    i18n: {
      changeLanguage: jest.fn(), // Mock the changeLanguage function
    },
  }),
}));
describe("Test Navbar", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });

  it("should render correctly", () => {
    const tree = create(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
