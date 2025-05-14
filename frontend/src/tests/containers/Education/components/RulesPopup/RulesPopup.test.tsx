import RulesPopup from "@root/containers/Education/components/RulesPopup/RulesPopup";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";

describe("Test RulesPopup", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const props = {
      onClose: jest.fn(),
      title: "This is the Rules Popup",
      rules: ["Rule 1", "Rule 2", "Rule 3"],
    };
    const tree = create(<RulesPopup {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
