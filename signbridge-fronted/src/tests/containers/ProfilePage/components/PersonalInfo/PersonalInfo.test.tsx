import PersonalInfo from "@root/containers/ProfilePage/components/PersonalInfo/PersonalInfo";
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
// Mock Cookies.get() before your test cases
jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

// or if you have the get method implementation
jest.mock("js-cookie");

describe("Test PersonalInfo", () => {
  it("should render correctly", () => {
    const tree = create(<PersonalInfo />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
