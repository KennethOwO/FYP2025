import SignUp from "@root/containers/SignUp/SignUp";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock the translation function to return the key
    i18n: {
      changeLanguage: jest.fn(), // Mock the changeLanguage function
    },
  }),
}));
describe("Test ForgotPassword", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
