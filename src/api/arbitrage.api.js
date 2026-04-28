import axios from "axios";
import { API_BASE_URL } from "./getApiURL";

const BASE = `${API_BASE_URL}/arbitrage`;

// ── Packages ──────────────────────────────────────────────────

export const getPackagesAdmin = () => axios.get(`${BASE}/admin/packages`);

export const createPackage = (data) =>
  axios.post(`${BASE}/admin/packages`, data);

export const updatePackage = (id, data) =>
  axios.put(`${BASE}/admin/packages/${id}`, data);

export const deletePackage = (id) =>
  axios.delete(`${BASE}/admin/packages/${id}`);

// ── Subscriptions ─────────────────────────────────────────────

export const getSubscriptionsAdmin = () =>
  axios.get(`${BASE}/admin/subscriptions`);

export const getPackages = () => axios.get(`${BASE}/packages`);
export const subscribePackage = (data) => axios.post(`${BASE}/subscribe`, data);
export const getUserSubscriptions = (userId) =>
  axios.get(`${BASE}/subscriptions/${userId}`);
export const cancelSubscription = (data) => axios.post(`${BASE}/cancel`, data);
