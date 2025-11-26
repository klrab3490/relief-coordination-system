import { Navigate } from 'react-router-dom';
import { useAPI } from '@/contexts/APIContext';

interface Props {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const { user, accessToken } = useAPI();

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}