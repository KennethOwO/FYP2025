import Login from "@root/containers/Login/Login";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";

describe("Test Login", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<Login />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
