import RatingStars from "@root/containers/Feedback/components/RatingStars/RatingStars";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";

describe("Test RatingStars", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  it("should render correctly", () => {
    const tree = create(<RatingStars rating={3} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
