//dataset.service.tsx
import axios from "axios";
import { User } from "firebase/auth";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const submitForm = async (
  formData: FormData,
  user: User
): Promise<any> => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/datasetForms`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const getAllFormsForSignExpert = async (user: User): Promise<any> => {
  try {
    const response = await axios.get(
      `${BASE_API_URL}/datasetForms/signexpert`,
      {
        headers: {
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      }
    );
    return response.data; // Assuming the forms are returned in the response data
  } catch (err) {
    throw err;
  }
};

export const getAllFormsForAdmin = async (user: User): Promise<any> => {
  try {
    const response = await axios.get(`${BASE_API_URL}/datasetForms/admin`, {
      headers: {
        Authorization: `Bearer ${await user?.getIdToken(true)}`,
      },
    });
    return response.data; // Assuming the forms are returned in the response data
  } catch (err) {
    throw err;
  }
};

export const updateFormById = async (
  formId: number,
  updatedFormData: Record<string, string>,
  updatedMessage: string,
  user: User
): Promise<any> => {
  try {
    const response = await axios.put(
      `${BASE_API_URL}/datasetForms/${formId}`,
      { ...updatedFormData, message: updatedMessage }, // Combine the form data and message
      {
        headers: {
          "Content-Type": "application/json", // Change content type to JSON
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      }
    );
    return response.data; // Return the response data
  } catch (err) {
    throw err;
  }
};

export const updateFormWithVideoById = async (
  formId: number,
  updatedFormData: Record<string, string>,
  video: File,
  updatedMessage: string,
  user: User
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("video", video);

    for (const key in updatedFormData) {
      formData.append(key, updatedFormData[key]);
    }
    formData.append("message", updatedMessage); // Add the updated message to form data

    const response = await axios.put(
      `${BASE_API_URL}/datasetForms/avatarVideo/${formId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Use multipart form data for file uploads
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      }
    );
    return response.data; // Return the response data
  } catch (err) {
    throw err;
  }
};

export const getFormById = async (formId: number, user: User): Promise<any> => {
  try {
    const response = await axios.get(`${BASE_API_URL}/datasetForms/${formId}`, {
      headers: {
        Authorization: `Bearer ${await user?.getIdToken(true)}`,
      },
    });

    return response.data; // Assuming the forms are returned in the response data
  } catch (err) {
    throw err;
  }
};

export const getDemoVidById = async (
  formId: number,
  user: User
): Promise<any> => {
  try {
    const response = await axios.get(
      `${BASE_API_URL}/datasetForms/demoVid/${formId}`,
      {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      } // Set responseType to 'arraybuffer' to receive raw binary data
    );
    return response; // Return the raw binary data
  } catch (err) {
    throw err;
  }
};

export const getAvatarVidById = async (
  formId: number,
  user: User
): Promise<any> => {
  try {
    const response = await axios.get(
      `${BASE_API_URL}/datasetForms/avatarVid/${formId}`,
      {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      } // Set responseType to 'arraybuffer' to receive raw binary data
    );
    return response; // Return the raw binary data
  } catch (err) {
    throw err;
  }
};

export const deleteFormById = async (
  formId: number,
  updatedMessage: string,
  user: User
): Promise<any> => {
  try {
    // Assuming updatedMessage needs to be sent as part of the request body
    const response = await axios.delete(
      `${BASE_API_URL}/datasetForms/${formId}`,
      {
        data: { message: updatedMessage },
        headers: {
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
};
