import axios from "axios";
import { GOOGLE } from "../constants/account.constant";

import { User } from "firebase/auth";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

// ---------- Sign Up User ----------
export const SignUpUser = async (data: any, user: User) => {
  try {
    const registerUser = await axios.post(
      `${BASE_API_URL}/users/signup`,
      data,
      {
        headers: {
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      }
    );
    return registerUser;
  } catch (err) {
    throw err;
  }
};

export const VerifyEmail = async (firebase_id: any, user: User) => {
  try {
    const response = await axios.put(
      `${BASE_API_URL}/users/verify-email`,
      firebase_id,
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

export const FetchGoogleData = async (token: string) => {
  try {
    const response = await axios.get(GOOGLE.GOOGLELAPIS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Login User ----------
export const LoginUser = async (data: any) => {
  try {
    const loginUser = await axios.post(`${BASE_API_URL}/users/login`, data);
    return loginUser;
  } catch (err) {
    throw err;
  }
};

export const LogoutUser = async (data: any) => {
  try {
    const logoutUser = await axios.post(`${BASE_API_URL}/users/logout`, data);
    return logoutUser;
  } catch (err) {
    throw err;
  }
};

// ---------- Reset Password ----------
export const UserResetPassword = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/users/reset-password`,
      data
    );
    return response;
  } catch (err) {
    throw err;
  }
};

//  ---------- Get User by email ----------
export const GetUserByEmail = async (email: string | null, user: User) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/users/${email}/profile`, {
      headers: {
        Authorization: `Bearer ${await user?.getIdToken(true)}`,
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Update profile info by user_id ----------
export const UpdateUserProfileById = async (
  userID: string,
  data: FormData,
  user: User
) => {
  try {
    const response = await axios.put(
      `${BASE_API_URL}/users/${userID}/profile`,
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

// ---------- Fetch All Countries ----------
export const FetchAllCountries = async (user: User) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/users/countries`, {
      headers: {
        Authorization: `Bearer ${await user?.getIdToken(true)}`,
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Fetch dataset by user id ----------
export const FetchDatasetByUserId = async (userID: string, user: User) => {
  try {
    const response = await axios.get(
      `${BASE_API_URL}/users/${userID}/datasets`,
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

// ---------- Fetch all users ----------
export const FetchAllUsers = async (user: User | null) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/users/all-users`, {
      headers: {
        Authorization: `Bearer ${await user?.getIdToken(true)}`,
      },
    });
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Fetch all dataset ----------
export const FetchAllDataset = async (user: User | null) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/users/all-datasets`, {
      headers: {
        Authorization: `Bearer ${await user?.getIdToken(true)}`,
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};
