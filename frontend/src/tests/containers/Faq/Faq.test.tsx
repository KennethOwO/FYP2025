import React from "react";
import Faq from "@root/containers/Faq/Faq";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock the translation function to return the key
    i18n: {
      changeLanguage: jest.fn(), // Mock the changeLanguage function
    },
  }),
})); // Mock AccordionTrigger
describe("Test Faq", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<Faq />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
