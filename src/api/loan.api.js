import axios from "axios";
import { API_BASE_URL } from "./getApiURL";

const BASE = `${API_BASE_URL}/loans`;

// ── User ──────────────────────────────────────────────────────
export const getLoanPackages = () => axios.get(`${BASE}/packages`);

export const submitLoan = (formData) =>
  axios.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMyLoans = (userId) => axios.get(`${BASE}?user_id=${userId}`);

// ── Admin ─────────────────────────────────────────────────────
export const getLoanPackagesAdmin = () => axios.get(`${BASE}/admin/packages`);

export const createLoanPackage = (data) =>
  axios.post(`${BASE}/admin/packages`, data);

export const updateLoanPackage = (id, data) =>
  axios.put(`${BASE}/admin/packages/${id}`, data);

export const deleteLoanPackage = (id) =>
  axios.delete(`${BASE}/admin/packages/${id}`);

export const getAllLoans = (params) =>
  axios.get(`${BASE}/admin/loans`, { params });

export const getLoanById = (id) => axios.get(`${BASE}/admin/loans/${id}`);

export const approveLoan = (id) =>
  axios.put(`${BASE}/admin/loans/${id}/approve`, {});

export const rejectLoan = (id, rejectReason) =>
  axios.put(`${BASE}/admin/loans/${id}/reject`, {
    reject_reason: rejectReason,
  });

export const deleteLoan = (id) => axios.delete(`${BASE}/admin/loans/${id}`);
