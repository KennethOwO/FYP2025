import React from "react";
import { render, cleanup } from "@testing-library/react";
import Notification from "@root/containers/Notification/Notification";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

describe("Test Notification", () => {
  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  it("should render correctly", () => {
    const { container } = render(<Notification />);

    expect(container).toMatchSnapshot();
  });
});
