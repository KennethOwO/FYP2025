import axios from "axios";
import { use } from "i18next";
import { User } from "firebase/auth";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const createLogsByUser = async (data: any, user: User) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/logs/user/create`,
      data,
      {
        headers: {
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      }
    );
    return response.data; 
  } catch (err) {
    throw err; 
  }
};

export const deleteAllLogsByUser = async (
  userId: any,
  data: any,
  user: User
) => {
  try {
    const response = await axios.delete(`${BASE_API_URL}/logs/user/${userId}`, {
      data: data,
      headers: {
        Authorization: `Bearer ${await user?.getIdToken(true)}`,
      },
    });
    return response.data; 
  } catch (err) {
    throw err;
  }
};

export const fetchLogsByUser = async (data: any, user: User) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/logs/user`, data, {
      headers: {
        Authorization: `Bearer ${await user?.getIdToken(true)}`,
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const fetchNLPOutput = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/nlp/output`, data);
    return response.data; 
  } catch (err) {
    throw err; 
  }
};

export const fetchSLROutput = async (formData: FormData) : Promise<any> => {
  try {

    const response = await axios.post(`${BASE_API_URL}/slr/output`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Set this only if needed
      },
    });

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No response data received');
    }
  } catch (err) {
    throw err; 
  }
};


