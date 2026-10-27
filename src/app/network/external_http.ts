// src/app/network/third_party_http_client.ts
import axios, { type AxiosInstance } from 'axios';
import { injectable } from 'inversify';

@injectable()
export class ExternalHttp {
  public readonly instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      timeout: 15000,
    });

    this.initializeTransformers();
  }

  private initializeTransformers() {
    // 第三方请求拦截器：通常只做通用的日志或基础透传
    this.instance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error),
    );

    // 第三方响应拦截器：不对 response.data 进行解构，原样返回由业务层自己解析
    this.instance.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('第三方接口调用失败:', error.message);
        return Promise.reject(error);
      },
    );
  }
}
