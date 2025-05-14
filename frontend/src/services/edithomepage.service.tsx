import axios from "axios";
import { User } from "firebase/auth";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
  withCredentials: true,
});

export default axiosInstance;

// ---------- Add Homepage Component ----------
export const AddComponent = async (data: any, user: User) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_API_URL}/homepage/add-component`,
      data,
      {
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

// ---------- Update Homepage Component ----------
export const UpdateComponent = async (data: any, user: User) => {
  try {
    const response = await axiosInstance.put(
      `${BASE_API_URL}/homepage/update-component/${data.homepage_component_id}`,
      data,
      {
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

// ---------- Delete Homepage Component ----------
export const DeleteComponent = async (data: any, user: User) => {
  try {
    const response = await axiosInstance.delete(
      `${BASE_API_URL}/homepage/delete-component/${data}`,
      {
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

// ---------- Get Homepage Component ----------
export const GetComponent = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_API_URL}/homepage/get-component`);
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Add Homepage Image Slider ----------
export const AddImageSlider = async (data: any, user: User) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_API_URL}/homepage/add-image-slider`,
      data,
      {
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

// ---------- Get Homepage Image Slider ----------
export const GetImageSlider = async () => {
  try {
    const response = await axiosInstance.get(
      `${BASE_API_URL}/homepage/get-image-slider`
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Update Homepage Image Slider ----------
export const UpdateImageSlider = async (data: any, user: User) => {
  try {
    const response = await axiosInstance.put(
      `${BASE_API_URL}/homepage/update-image-slider`,
      data,
      {
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
