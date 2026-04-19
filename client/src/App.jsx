import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Guests from './pages/Guests';
import Rooms from './pages/Rooms';
import Reports from './pages/Reports';
import SystemUsers from './pages/SystemUsers';
// Placeholder components for routes NOT YET implemented
const Placeholder = ({ title }) => (
    <Layout>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-400">This module is under development.</p>
        </div>
    </Layout>
);

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    return children;
};

const ProtectedAdminRoute = ({ children }) => {
    const { user, loading, isSuperAdmin } = useAuth();
    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!user || !isSuperAdmin) return <Navigate to="/dashboard" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/guests" element={
                        <ProtectedRoute>
                            <Guests />
                        </ProtectedRoute>
                    } />

                    <Route path="/rooms" element={
                        <ProtectedRoute>
                            <Rooms />
                        </ProtectedRoute>
                    } />

                    <Route path="/reports" element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    } />

                    <Route path="/users" element={
                        <ProtectedAdminRoute>
                            <SystemUsers />
                        </ProtectedAdminRoute>
                    } />

                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
