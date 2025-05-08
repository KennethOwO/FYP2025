import React from "react";
import AccountForm from "@root/containers/ProfilePage/components/AccountForm/AccountForm";
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
// Define the type of the mocked function
jest.mock("js-cookie", () => ({
  get: jest.fn(), // No need to specify return type here
}));
describe("Test AccountForm", () => {
  afterEach(() => {
    // Clean up after each test
    cleanup();
    // Reset the cookie mock to avoid affecting other tests
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    // call the set method of Cookies
    const tree = create(<AccountForm />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
