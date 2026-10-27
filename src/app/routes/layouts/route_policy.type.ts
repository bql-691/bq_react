export type RoutePolicyResult =
  { status: 'allowed' } | { status: 'denied'; redirect: { to: string } };

export type RouteAccess = 'require-auth' | 'require-guest';
