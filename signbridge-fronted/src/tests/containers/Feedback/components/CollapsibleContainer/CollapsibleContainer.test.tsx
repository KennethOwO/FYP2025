import CollapsibleContainer from "@root/containers/Feedback/components/CollapsibleContainer/CollapsibleContainer";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";
// Mock the translation functions
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock the translation function to return the key
    i18n: {
      changeLanguage: jest.fn(), // Mock the changeLanguage function
    },
  }),
}));

describe("Test CollapsibleContainer", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });
  const props = {
    id: 1, // Example number for id
    name: "John Doe", // Example string for name
    age: 30, // Example number for age
    gender: "Male", // Example string for gender
    race: "Human", // Example string for race
    email: "john@example.com", // Example string for email
    fcategory: "Category", // Example string for fcategory
    experience: "Good", // Example string for experience
    friendliness: "Friendly", // Example string for friendliness
    quality: "High", // Example string for quality
    recommended: "Yes", // Example string for recommended
    q1_en: "Question 1 English", // Example string for q1_en
    q2_en: "Question 2 English", // Example string for q2_en
    q3_en: "Question 3 English", // Example string for q3_en
    q1_bm: "Question 1 BM", // Example string for q1_bm
    q2_bm: "Question 2 BM", // Example string for q2_bm
    q3_bm: "Question 3 BM", // Example string for q3_bm
    image: "path/to/image.jpg", // Example string for image path
    created_at: "2024-05-24", // Example string for created_at
    status_en: "Active", // Example string for status_en
    status_bm: "Aktif", // Example string for status_bm
    updateStatus: jest.fn(),
  };
  it("should render correctly", () => {
    const tree = create(<CollapsibleContainer {...props} />);
    expect(tree.toJSON).toMatchSnapshot();
  });
});
