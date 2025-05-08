import { create } from "react-test-renderer";
import {
  render,
  fireEvent,
  cleanup,
  screen,
  waitFor,
} from "@testing-library/react";
import Feedback from "../,./../../../containers/Feedback/Feedback";
import { userEvent } from "@testing-library/user-event";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock the translation function to return the key
    i18n: {
      changeLanguage: jest.fn(), // Mock the changeLanguage function
    },
  }),
}));
describe("Test Feedback", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<Feedback />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("should be able to submit", async () => {
    const { asFragment } = render(<Feedback />);
    // Fill in the form fields
    userEvent.type(screen.getByTestId("test_firstName"), "John");
    userEvent.type(screen.getByTestId("test_lastName"), "Doe");
    userEvent.type(screen.getByTestId("test_age"), "5");
    userEvent.click(screen.getByTestId("test_male"));
    userEvent.type(screen.getByTestId("test_email"), "john@BiLogoGmail.com");
    userEvent.type(screen.getByTestId("test_race"), "Asian");

    // Click the submit button
    fireEvent.click(screen.getByTestId("test_submit"));
    expect(asFragment).toMatchSnapshot();
  });
});
