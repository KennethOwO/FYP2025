import InfoIcon from "../../../../../containers/DataCollection/components/InfoIcon/InfoIcon";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";
describe("Test InfoIcon", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<InfoIcon onClick={jest.fn()} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
