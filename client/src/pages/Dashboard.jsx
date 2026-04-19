import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
    Users, 
    BedDouble, 
    TrendingUp, 
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import API from '../api/axios';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-700 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]`}>
                <Icon size={24} />
            </div>
            {trend && (
                <span className={`text-xs font-bold py-1 px-2 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {trend >= 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalGuests: 0,
        occupiedRooms: 0,
        monthlyIncome: 0,
        activeBookings: 0
    });

    const incomeData = [
        { name: 'Jan', amount: 45000 },
        { name: 'Feb', amount: 52000 },
        { name: 'Mar', amount: 48000 },
        { name: 'Apr', amount: 61000 },
        { name: 'May', amount: 55000 },
        { name: 'Jun', amount: 67000 },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const roomRes = await API.get('/rooms');
                const guestRes = await API.get('/guests');
                
                const occupiedCount = roomRes.data.data.filter(r => r.status === 'occupied').length;
                const totalRooms = roomRes.data.data.length;

                setStats({
                    totalGuests: guestRes.data.count,
                    occupiedRooms: occupiedCount,
                    totalRooms: totalRooms,
                    monthlyIncome: 125400, // Hardcoded for demo
                    activeBookings: occupiedCount
                });
            } catch (err) {
                console.error('Failed to fetch stats');
            }
        };
        fetchStats();
    }, []);

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Executive Overview</h2>
                        <p className="text-slate-500 mt-1">Real-time property and financial analytics.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-all border border-slate-700">
                            Custom Period
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all">
                            Export Summary
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Active Guests" 
                        value={stats.totalGuests} 
                        icon={Users} 
                        color="blue" 
                        trend={12} 
                    />
                    <StatCard 
                        title="Room Occupancy" 
                        value={`${stats.occupiedRooms}/${stats.totalRooms || 4}`} 
                        icon={BedDouble} 
                        color="emerald" 
                    />
                    <StatCard 
                        title="Monthly Revenue" 
                        value={`LKR ${stats.monthlyIncome.toLocaleString()}`} 
                        icon={DollarSign} 
                        color="amber" 
                        trend={8} 
                    />
                    <StatCard 
                        title="Average Stay" 
                        value="3.2 Days" 
                        icon={TrendingUp} 
                        color="purple" 
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white">Revenue Growth</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Income</span>
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={incomeData}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `LKR ${val/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                        <h3 className="font-bold text-white mb-6">Occupancy by Room</h3>
                        <div className="space-y-6">
                            {[
                                { name: 'Room 01', level: 90, status: 'Full' },
                                { name: 'Room 02', level: 65, status: 'Active' },
                                { name: 'Room 03', level: 82, status: 'Active' },
                                { name: 'Private House', level: 45, status: 'Available' },
                            ].map((room) => (
                                <div key={room.name}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-white font-medium">{room.name}</span>
                                        <span className="text-slate-400">{room.level}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-600 rounded-full" 
                                            style={{ width: `${room.level}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
