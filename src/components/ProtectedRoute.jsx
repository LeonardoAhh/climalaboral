import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireEmployee = false }) => {
    const { currentUser, userType } = useAuth();

    if (!currentUser) {
        return <Navigate to="/" replace />;
    }

    if (requireAdmin && userType !== 'admin') {
        return <Navigate to="/" replace />;
    }

    if (requireEmployee && userType !== 'employee') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
