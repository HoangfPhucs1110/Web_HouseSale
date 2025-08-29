import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { socket } from '@/socket'

export default function AdminRoute() {
  const { currentUser } = useSelector((s) => s.user);
  const user = currentUser?.rest || currentUser || {};
  if (!user?._id) return <Navigate to="/sign-in" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
