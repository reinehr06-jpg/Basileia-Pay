let _token = '';
let _apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const setToken = (t: string) => { 
  _token = t; 
};

export const setApiUrl = (u: string) => { 
  _apiUrl = u; 
};

export const getToken = () => _token;

export const getApiUrl = (path: string) => `${_apiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
