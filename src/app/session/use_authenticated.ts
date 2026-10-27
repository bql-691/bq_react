import { useEffect, useState } from 'react';
import { hasSession } from './auth_session';
import { subscribeAuth } from './auth_event';

export function useAuthenticated(): boolean {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const sync = () => setAuthenticated(hasSession());
    sync();
    return subscribeAuth(sync);
  }, []);

  return authenticated;
}
