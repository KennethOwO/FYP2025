import EmailIcon from "../../../../../containers/DataCollection/components/EmailIcon/EmailIcon";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";
describe("Test EmailIcon", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<EmailIcon />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
