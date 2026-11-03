import axios from 'axios';
import { i18n } from '../i18n/i18n';
import { tokenStore } from '../session/token_store';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mybackend.com',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use(
  (config) => {
    const token = tokenStore.get();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (config.data !== undefined) config.data = stripDollar(config.data);
    return config;
  },
  (error) => Promise.reject(error),
);

http.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      return Promise.reject(new Error(res.message || i18n.t('common.http_error')));
    }
    return res.data;
  },
  (error) => {
    const status = error.response?.status as number | undefined;
    const serverMessage = error.response?.data?.message;
    if (status === 401) {
      tokenStore.remove();
      const path = `${window.location.pathname}${window.location.search}`;
      if (!path.startsWith('/security')) {
        window.location.replace(`/security?${new URLSearchParams({ from: path })}`);
      }
    }
    const message =
      typeof serverMessage === 'string' && serverMessage ? serverMessage : error.message;
    return Promise.reject(new Error(message));
  },
);

function stripDollar(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripDollar);
  if (!isPlainRecord(value)) return value;
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (key.startsWith('$')) continue;
    result[key] = stripDollar(item);
  }
  return result;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}
