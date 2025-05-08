import ResetPassword from "@root/containers/Login/ResetPwd/ResetPassword";
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
        <ResetPassword />
      </MemoryRouter>
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
