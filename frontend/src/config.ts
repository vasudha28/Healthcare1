export const API_URL = 'https://healthcare1-h2mi.onrender.com';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/api/auth/token`,
    REGISTER: `${API_URL}/api/auth/register`,
  },
  PATIENTS: {
    BASE: `${API_URL}/api/patients`,
    BY_ID: (id: string) => `${API_URL}/api/patients/${id}`,
  },
}; 