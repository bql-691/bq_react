import { Outlet, redirect, type MiddlewareFunction } from 'react-router';
import { hasSession } from '@/app/session/auth_session';
import { decideRoutePolicy } from './decide_route_policy';

export const clientMiddleware: MiddlewareFunction[] = [
  async ({ request }, next) => {
    const url = new URL(request.url);
    const policy = decideRoutePolicy('require-guest', hasSession(), url.pathname, url.search);
    if (policy.status === 'denied') throw redirect(policy.redirect.to);
    await next();
  },
];

export default function GuestLayout() {
  return <Outlet />;
}
