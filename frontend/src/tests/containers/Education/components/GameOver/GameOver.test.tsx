import GameOverPopup from "@root/containers/Education/components/GameOver/GameOver";
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

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("Test GameOverPopup", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const props = {
      onClose: jest.fn(),
      score: 2,
    };
    const tree = create(<GameOverPopup {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
