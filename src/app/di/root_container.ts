import 'reflect-metadata';
import { Container } from 'inversify';
/** 根容器 DI自动绑定 */
export const rootContainer = new Container({
  autobind: true,
  defaultScope: 'Singleton',
});
