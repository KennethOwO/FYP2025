import GuessTheWord from "@root/containers/Education/Game/GuessTheWord";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";

describe("Test GuessTheWord", () => {
  jest.mock("react-i18next", () => ({
    useTranslation: () => ({
      t: (key: string) => key, // Mock the translation function to return the key
      i18n: {
        changeLanguage: jest.fn(), // Mock the changeLanguage function
      },
    }),
  }));
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  const tree = create(<GuessTheWord />);
  expect(tree.toJSON()).toMatchSnapshot();
});
