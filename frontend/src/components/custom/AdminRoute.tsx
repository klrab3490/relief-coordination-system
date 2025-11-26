import { Navigate } from 'react-router-dom';
import { useAPI } from '@/contexts/APIContext';

interface Props {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: Props) => {
  const { user } = useAPI();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
}