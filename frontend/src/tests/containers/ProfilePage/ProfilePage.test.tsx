// Importing necessary libraries
import ProfilePage from "@root/containers/ProfilePage/ProfilePage";
import { create } from "react-test-renderer";
import { cleanup } from "@testing-library/react";
import { ChartComponentLike } from "chart.js";
// Mock the useSpeechRecognition hook
jest.mock("react-speech-recognition", () => ({
  useSpeechRecognition: () => ({
    transcript: "Hello, World!",
    resetTranscript: jest.fn(),
    browserSupportsSpeechRecognition: true,
  }),
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
      t: (key: string) => key, // Mock the translation function to return the key
      i18n: {
        changeLanguage: jest.fn(), // Mock the changeLanguage function
      },
    }),
  }));
// Mocking chart.js components
jest.mock("chart.js", () => {
  const CategoryScale: jest.Mock<ChartComponentLike> = jest
    .fn()
    .mockImplementation(() => {
      return {
        id: "category",
        determineDataLimits: jest.fn(),
        buildTicks: jest.fn(),
      } as ChartComponentLike;
    });

  const LinearScale: jest.Mock<ChartComponentLike> = jest
    .fn()
    .mockImplementation(() => {
      return {
        id: "linear",
        determineDataLimits: jest.fn(),
        buildTicks: jest.fn(),
      } as ChartComponentLike;
    });

  const registerables: ReadonlyArray<ChartComponentLike> = [
    new CategoryScale,
    new LinearScale,
  ];

  return {
    Chart: {
      register: jest.fn(),
    },
    CategoryScale,
    LinearScale,
    registerables,
  };
});

// Tests for ProfilePage component
describe("Test Profile Page", () => {
  afterEach(() => {
    // Clean up the DOM
    cleanup();
    // Reset mocks to their initial state
    jest.resetAllMocks();
  });

  it("should render correctly", () => {
    const tree = create(<ProfilePage />);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
