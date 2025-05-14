import React from "react";
import Footer from "@root/containers/Footer/Footer";
import { create, act } from "react-test-renderer";
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

describe("Test Footer", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });

  it("should render correctly", () => {
    // Mock the document.cookie
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "token=abc123; otherCookie=someValue",
    });

    let tree;
    act(() => {
      tree = create(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
    });

    expect(tree!.toJSON()).toMatchSnapshot();
  });
});
