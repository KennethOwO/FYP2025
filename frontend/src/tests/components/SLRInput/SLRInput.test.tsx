// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom'; // Import this to extend Jest's expect with DOM matchers
// import SLRInput from '../../../components/SLRInput/SLRInput';

// describe('SLRInput Component', () => {
//     test('renders video input buttons', () => {
//         render(<SLRInput onResponsiveReceived={() => {}} />);

//         // Check if file input button is present
//         const fileInputButton = screen.getByRole('button', { name: /get-video/i });
//         expect(fileInputButton).toBeInTheDocument();

//         // Check if camera permission button is present
//         const cameraPermissionButton = screen.getByRole('button', { name: /fa-video/i });
//         expect(cameraPermissionButton).toBeInTheDocument();
//     });

//     test('selects a video file and displays it', async () => {
//         render(<SLRInput onResponsiveReceived={() => {}} />);

//         // Simulate selecting a video file
//         const file = new File(['dummy video'], 'video.mp4', { type: 'video/mp4' });
//         const fileInput = screen.getByLabelText(/get-video/i);
//         fireEvent.change(fileInput, { target: { files: [file] } });

//         // Check if selected video is displayed
//         const selectedVideoElement = await screen.findByText(/Video Preview/i);
//         expect(selectedVideoElement).toBeInTheDocument();
//     });

//     test('starts and stops video recording', async () => {
//         render(<SLRInput onResponsiveReceived={() => {}} />);

//         // Simulate starting and stopping video recording
//         const startRecordingButton = screen.getByRole('button', { name: /fa-play/i });
//         fireEvent.click(startRecordingButton);

//         // Wait for recording to start
//         await waitFor(() => screen.getByRole('button', { name: /fa-stop/i }));

//         const stopRecordingButton = screen.getByRole('button', { name: /fa-stop/i });
//         fireEvent.click(stopRecordingButton);

//         // Wait for recording to stop
//         await waitFor(() => screen.getByRole('button', { name: /submit/i }));
//     });

//     test('uploads selected or recorded video', async () => {
//         const mockOnResponsiveReceived = jest.fn();
//         render(<SLRInput onResponsiveReceived={mockOnResponsiveReceived} />);

//         // Simulate selecting a video file
//         const file = new File(['dummy video'], 'video.mp4', { type: 'video/mp4' });
//         const fileInput = screen.getByLabelText(/get-video/i);
//         fireEvent.change(fileInput, { target: { files: [file] } });

//         // Simulate uploading the selected video
//         const uploadButton = screen.getByRole('button', { name: /fa-upload/i });
//         fireEvent.click(uploadButton);

//         // Wait for upload process
//         await waitFor(() => expect(mockOnResponsiveReceived).toHaveBeenCalled());
//     });
// });
