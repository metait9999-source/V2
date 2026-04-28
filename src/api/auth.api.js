import axios from "axios";
import { API_BASE_URL } from "./getApiURL";

const BASE = `${API_BASE_URL}/users`;

export const createWalletUser = (data) => axios.post(`${BASE}/wallet`, data);
export const setPasscode = (data) => axios.post(`${BASE}/set-passcode`, data);
export const verifyPasscode = (data) =>
  axios.post(`${BASE}/verify-passcode`, data);
