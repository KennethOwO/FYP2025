import React from "react";
import InstructionPopup from "../../../../../containers/DataCollection/components/InstructionPopup/InstructionPopup";
import { cleanup } from "@testing-library/react";
import { create } from "react-test-renderer";

// Mock the translation functions
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock the translation function to return the key
    i18n: {
      changeLanguage: jest.fn(), // Mock the changeLanguage function
    },
  }),
}));

describe("Test InstructionPopup", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  const props = {
    showInstructionPopup: true,
    onClose: jest.fn(),
  };
  it("should render correctly", () => {
    const tree = create(<InstructionPopup {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
