import { CONFIG } from '../config';

const TOKEN_KEY = 'basileia_studio_token';
let _token = '';
let _apiUrl = CONFIG.API_URL;

export const setToken = (t: string) => { 
  _token = t; 
  localStorage.setItem(TOKEN_KEY, t);
};

export const setApiUrl = (u: string) => { 
  _apiUrl = u; 
};

export const getToken = (): string => {
  if (!_token) {
    _token = localStorage.getItem(TOKEN_KEY) || '';
  }
  return _token;
};

export const clearToken = () => {
  _token = '';
  localStorage.removeItem(TOKEN_KEY);
};

export const getApiUrl = (path: string) => `${_apiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
