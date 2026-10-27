import { Navigate } from 'react-router';

export default function CatchallRedirect() {
  return <Navigate to="/" replace />;
}
