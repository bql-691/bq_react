import type { RouteAccess, RoutePolicyResult } from './route_policy.type';

export function decideRoutePolicy(
  access: RouteAccess,
  authenticated: boolean,
  pathname: string,
  search: string,
): RoutePolicyResult {
  if (access === 'require-auth' && !authenticated) {
    const from = `${pathname}${search}`;
    return {
      status: 'denied',
      redirect: { to: `/security?${new URLSearchParams({ from })}` },
    };
  }
  if (access === 'require-guest' && authenticated) {
    return { status: 'denied', redirect: { to: '/' } };
  }
  return { status: 'allowed' };
}
