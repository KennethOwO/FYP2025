import SettingPopup from "@root/containers/Education/components/SettingPopup/SettingPopup";
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
describe("Test SettingPopup", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const props = {
      onClose: jest.fn(),
      onVolumeChange: jest.fn(),
    };
    const tree = create(<SettingPopup {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
