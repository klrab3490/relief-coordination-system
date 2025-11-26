import { Navigate } from 'react-router-dom';
import { useApi } from '@/context/APIContext';

interface Props {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: Props) => {
  const { user } = useApi();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
}