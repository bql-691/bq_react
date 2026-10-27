import type { BindingIdentifier } from 'inversify';
import { rootContainer } from './root_container';

const bindings = new WeakMap<object, Map<string, BindingIdentifier>>();

/**
 * 把抽象端口绑到实现类。同一端口有多个实现时传入 name。
 *
 * 写在 `@injectable` 上面。类装饰器自下而上执行，`@injectable` 先写入构造参数类型，这里的 `to(impl)` 才能读到。
 * 不要用 `isBound` 探测端口：`autobind` 会把抽象类自己绑上，且该绑定匹配任意 name。
 */
export function bindAs(port: abstract new (...args: never) => unknown, name?: string) {
  return (impl: new (...args: never) => unknown) => {
    const key = name ?? '';
    const byName = bindings.get(port) ?? new Map<string, BindingIdentifier>();
    const previous = byName.get(key);
    if (previous !== undefined) rootContainer.unbind(previous);
    const bound = rootContainer.bind(port).to(impl);
    const syntax = name === undefined ? bound : bound.whenNamed(name);
    byName.set(key, syntax.getIdentifier());
    bindings.set(port, byName);
  };
}
