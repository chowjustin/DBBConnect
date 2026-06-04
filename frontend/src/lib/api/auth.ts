import api from "./axios";

const API_URL = "http://localhost:3000/api";

export const login = async (email: string, password: string) => {
  const res = await api.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
  return res.data;
};

export const register = async (
  name: string,
  email: string,
  password: string,
  phoneNumber: string,
  role: "STUDENT" | "TUTOR"
) => {
  try {
    const payload = {
      name,
      email,
      password,
      role,
      phoneNumber,
    };

    console.log("Register payload:", payload); // Debug

    const res = await api.post(`${API_URL}/auth/register`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Register response:", res.data); // Debug

    return res.data;
  } catch (err: any) {
    console.error("Register error details:", err.response?.data || err.message);
    throw err;
  }
};

export const refreshToken = async (refreshToken: string) => {
  const res = await api.post(`${API_URL}/auth/refresh`, {
    refreshToken,
  });
  return res.data;
};

export const logout = async () => {
  const res = await api.post(`${API_URL}/auth/logout`);
  return res.data;
};
