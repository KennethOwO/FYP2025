import ForgotPassword from "@root/containers/Login/ForgotPwd/ForgotPassword";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

describe("Test ForgotPassword", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
