import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    BedDouble, 
    FileText, 
    LogOut, 
    Menu, 
    X, 
    ShieldCheck,
    UserCircle,
    Calendar as CalendarIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarLink = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
            ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
        `}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </NavLink>
);

const Layout = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout, isSuperAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex">
            {/* Mobile Drawer Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 p-6 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <BedDouble className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-white leading-tight">Inforv</h1>
                        <p className="text-xs text-slate-500 font-medium">HOMESTAY ADMIN</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setSidebarOpen(false)} />
                    <SidebarLink to="/calendar" icon={CalendarIcon} label="Calendar" onClick={() => setSidebarOpen(false)} />
                    <SidebarLink to="/guests" icon={Users} label="Guests" onClick={() => setSidebarOpen(false)} />
                    <SidebarLink to="/rooms" icon={BedDouble} label="Rooms" onClick={() => setSidebarOpen(false)} />
                    <SidebarLink to="/reports" icon={FileText} label="Reports" onClick={() => setSidebarOpen(false)} />
                    
                    {isSuperAdmin && (
                        <div className="mt-8">
                            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Internal</p>
                            <SidebarLink to="/users" icon={ShieldCheck} label="System Admins" onClick={() => setSidebarOpen(false)} />
                        </div>
                    )}
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="ml-auto flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-white">{user?.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                            <UserCircle className="text-slate-400" size={32} />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                    <div className="w-full h-full flex flex-col">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
