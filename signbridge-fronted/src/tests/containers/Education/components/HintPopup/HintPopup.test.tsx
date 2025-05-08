import HintPopup from "@root/containers/Education/components/HintPopup/HintPopup";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";

describe("Test HintPopup", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  const props = {
    onClose: jest.fn(),
    title: "HintPopup Unit Test 1",
    animationKeyword: "",
  };
  it("should render correctly", () => {
    const tree = create(<HintPopup {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
