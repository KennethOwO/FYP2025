import PhoneIcon from "../../../../../containers/DataCollection/components/PhoneIcon/PhoneIcon";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";
describe("Test PhoneIcon", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<PhoneIcon />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
