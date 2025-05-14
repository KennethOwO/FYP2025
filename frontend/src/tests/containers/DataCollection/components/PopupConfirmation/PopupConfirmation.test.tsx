import React from "react";
import PopupConfirmation from "../../../../../containers/DataCollection/components/PopupConfirmation/PopupConfirmation";
import { cleanup } from "@testing-library/react";
import { create } from "react-test-renderer";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock the translation function to return the key
    i18n: {
      changeLanguage: jest.fn(), // Mock the changeLanguage function
    },
  }),
}));

describe("Test PopupConfirmation", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  const props = {
    name: "John Dope",
    email: "JohnDoe@gmail.com",
    text: "This is john doe testing",
    video: "demo-1222222.mp4",
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    isLoading: false,
    setIsLoading: jest.fn(),
  };
  it("should render correctly", () => {
    const tree = create(<PopupConfirmation {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
