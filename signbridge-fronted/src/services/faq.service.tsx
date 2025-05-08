import axios from "axios";
import { User } from "firebase/auth";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

// ---------- Create Faq ----------
export const CreateFaq = async (data: any, user: User) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/faqs/create-faq`, data, {
      headers: {
        Authorization: `Bearer ${await user?.getIdToken(true)}`,
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Update Faq ----------
export const UpdateFaq = async (data: any, user: User) => {
  try {
    const response = await axios.put(
      `${BASE_API_URL}/faqs/update-faq/${data.faq_id}`,
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

// ---------- Delete Faq ----------
export const DeleteFaq = async (data: any, user: User) => {
  try {
    const response = await axios.delete(
      `${BASE_API_URL}/faqs/delete-faq/${data}`,
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

// ---------- Fetch Faq ----------
export const FetchFaq = async () => {
  try {
    const response = await axios.get(`${BASE_API_URL}/faqs/fetch-faq`);
    return response;
  } catch (err) {
    throw err;
  }
};
