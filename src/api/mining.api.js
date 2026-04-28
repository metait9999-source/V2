import axios from "axios";
import { API_BASE_URL } from "./getApiURL";

const BASE = `${API_BASE_URL}/mining`;

export const getMiningPackages = () => axios.get(`${BASE}/packages`);
export const subscribeMining = (data) => axios.post(`${BASE}/subscribe`, data);
export const getUserMiningSubscriptions = (userId) =>
  axios.get(`${BASE}/subscriptions/${userId}`);
export const cancelMiningSubscription = (data) =>
  axios.post(`${BASE}/cancel`, data);

export const getMiningPackagesAdmin = () => axios.get(`${BASE}/admin/packages`);
export const createMiningPackage = (data) =>
  axios.post(`${BASE}/admin/packages`, data);
export const updateMiningPackage = (id, data) =>
  axios.put(`${BASE}/admin/packages/${id}`, data);
export const deleteMiningPackage = (id) =>
  axios.delete(`${BASE}/admin/packages/${id}`);
export const getMiningSubscriptionsAdmin = () =>
  axios.get(`${BASE}/admin/subscriptions`);
export const runMiningPayout = () => axios.post(`${BASE}/admin/run-payout`);
