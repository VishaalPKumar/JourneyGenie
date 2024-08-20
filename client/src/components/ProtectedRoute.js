import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../ApplicationState'; 

const ProtectedRoute = ({ children }) => {
    const { userId } = useUser();

    if (!userId) {
        return <Navigate to="/" replace />;
    }

    return children;
};
export default ProtectedRoute;
