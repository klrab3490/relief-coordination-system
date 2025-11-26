import { Navigate } from 'react-router-dom';
import { useApi } from '@/context/APIContext';

interface Props {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const { user, accessToken } = useApi();

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}