import axios from "axios";
import { User } from "firebase/auth";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const GetAllGuessTheWordPlayer = async () => {
  try {
    const response = await axios.get(`${BASE_API_URL}/guess_the_word/player`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const GetAllDoTheSignPlayer = async () => {
  try {
    const response = await axios.get(`${BASE_API_URL}/do_the_sign/player`);
    return response;
  } catch (err) {
    throw err;
  }
};

type Score = {
  user_id: number;
  score: number;
};

export const SendResultToGuessTheWord = async (data: Score, user: User) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/guess_the_word/score`,
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

export const SendResultToDoTheSign = async (data: Score, user: User) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/do_the_sign/score`,
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
