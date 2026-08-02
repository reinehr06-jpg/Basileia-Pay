import { apiClient } from './index';

export const authApi = {
  login: (data: any) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
};

export const checkoutApi = {
  get: (uuid: string) => apiClient.get(`/checkout/${uuid}`),
  process: (uuid: string, data: any) => apiClient.post(`/checkout/${uuid}/process`, data)
};
