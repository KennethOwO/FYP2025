//Import necessary libraries -> either "@testing-library/react" or "react-test-renderer"
import { render, fireEvent, screen } from "@testing-library/react";
import { create } from "react-test-renderer";
import { Button } from "../../../components/Button/Button";

//1. Start with describing it in it() function
describe("Test Button Component", () => {
  //2. Write the purposes in the it() function
  it("should have been clicked 1 time", () => {
    //3. Define the necessary props
    const handleClick = jest.fn(); //mock function
    //4. Use the render function from "@testing-library/react"
    render(
      <Button
        type="button"
        onClick={handleClick}
        buttonStyle="btn--primary"
        buttonSize="btn--medium"
      >
        Click Me
      </Button>
    );
    const buttonElement = screen.getByText("Click Me");
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  //This is snapshot testing -> Recommended to do for all components
  it("renders correctly", () => {
    const handleClick = jest.fn();
    //props can be defined like this
    const props = {
      type: "button",
      onClick: handleClick,
      buttonStyle: "btn--outline",
      buttonSize: "btn--large",
    };
    const tree = create(<Button {...props}>Click Me</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
