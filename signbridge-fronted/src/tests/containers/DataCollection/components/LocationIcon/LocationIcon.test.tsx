import LocationIcon from "../../../../../containers/DataCollection/components/LocationIcon/LocationIcon";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";
describe("Test LocationIcon", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<LocationIcon />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
