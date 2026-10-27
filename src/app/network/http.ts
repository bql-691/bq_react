// src/app/network/self_http_client.ts
import axios, { type AxiosInstance } from 'axios';
import { injectable } from 'inversify';
import { TokenStore } from '@/app/session/token_store';

@injectable('Singleton')
export class Http {
  public readonly instance: AxiosInstance;

  constructor(private tokenStore: TokenStore) {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://mybackend.com',
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.initializeTransformers();
  }

  private initializeTransformers() {
    // 💡 1. 请求拦截器：自动注入 Token
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.tokenStore.get();
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        if (config.data !== undefined) config.data = stripDollar(config.data);
        return config;
      },
      (error) => Promise.reject(error),
    );

    // 💡 2. 响应拦截器：统一业务异常、处理 401 鉴权失效
    this.instance.interceptors.response.use(
      (response) => {
        // 假设自己后端的标准结构为 { code: 200, data: ..., message: '' }
        const res = response.data;
        if (res.code !== 200) {
          // 可以在此处结合领域抛出自定义业务异常
          return Promise.reject(new Error(res.message || '业务逻辑错误'));
        }
        return res.data;
      },
      (error) => {
        const status = error.response?.status as number | undefined;
        const serverMessage = error.response?.data?.message;
        if (status === 401) {
          this.tokenStore.remove();
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
  }
}

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
