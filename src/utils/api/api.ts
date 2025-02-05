import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = "/api";

const api = {
  calls: {
    users: `${API_BASE_URL}/users`, // get, post
    user: (id: number) => `${API_BASE_URL}/users/${id}`, // get, put, delete
    auth: {
      login: `${API_BASE_URL}/auth/login`,
      forgotPassword: `${API_BASE_URL}/forgot-password`,
      resetPassword: `${API_BASE_URL}/reset-password`
    },
    agencies: `${API_BASE_URL}/agencies`, // get, post
    agency: (id: number) => `${API_BASE_URL}/agencies/${id}`, // get, put, delete
  },

  get: async (url: string, params?: Record<string, any>, config?: AxiosRequestConfig) => {
    try {
      const response = await axios.get(url, { params, ...config });
      return response.data;
    } catch (error) {
      console.error("API GET Error:", error);
      throw error;
    }
  },

  post: async (url: string, payload?: any, config?: AxiosRequestConfig) => {
    try {
      const response = await axios.post(url, payload, { ...config });
      return response.data;
    } catch (error) {
      console.error("API POST Error:", error);
      throw error;
    }
  },

  put: async (url: string, payload?: any, config?: AxiosRequestConfig) => {
    try {
      const response = await axios.put(url, payload, { ...config });
      return response.data;
    } catch (error) {
      console.error("API PUT Error:", error);
      throw error;
    }
  },

  delete: async (url: string, config?: AxiosRequestConfig) => {
    try {
      const response = await axios.delete(url, { ...config });
      return response.data;
    } catch (error) {
      console.error("API DELETE Error:", error);
      throw error;
    }
  }
};

export default api;
