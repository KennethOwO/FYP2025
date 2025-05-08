// // SLROutput.test.tsx
// import { render, screen } from '@testing-library/react';
// import '@testing-library/jest-dom'; // Import this to extend Jest's expect with DOM matchers
// import SLROutput from '../../../components/SLROutput/SLROutput';

// describe('SLROutput Component', () => {
//     test('renders with no output message when responseData is null', () => {
//         render(<SLROutput responseData={null} />);
//         const noOutputElement = screen.getByText(/No Output Available/i);
//         expect(noOutputElement).toBeInTheDocument();
//     });

//     test('renders received output when responseData is provided', () => {
//         const responseData = 'Sample SLR Output';
//         render(<SLROutput responseData={responseData} />);
//         const receivedOutputElement = screen.getByText(`Received Output: ${responseData}`);
//         expect(receivedOutputElement).toBeInTheDocument();
//     });

//     test('renders "No Output Available" when responseData is an empty string', () => {
//         render(<SLROutput responseData={''} />);
//         const noOutputElement = screen.getByText(/No Output Available/i);
//         expect(noOutputElement).toBeInTheDocument();
//     });
// });
