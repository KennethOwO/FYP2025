import React from "react";
import InputField from "@root/components/InputField/InputField";
import { create } from "react-test-renderer";

describe("Test InputField", () => {
  it("should render correctly", () => {
    const props = {
      label: "Test Label",
      name: "test",
      onChange: jest.fn(), // Mocking the onChange function
      error: "Test Error Message",
    };
    const tree = create(<InputField {...props} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
