import axios from 'axios';
import { i18n } from '../i18n/i18n';

export const externalHttp = axios.create({
  timeout: 15000,
});

externalHttp.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

externalHttp.interceptors.response.use(
  (response) => response.data,
  (error: { message?: string }) => {
    console.error(i18n.t('common.external_http_failed'), error.message);
    return Promise.reject(error);
  },
);
