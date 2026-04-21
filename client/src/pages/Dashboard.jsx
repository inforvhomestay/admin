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
} from 'recharts';
import { 
    format, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    parseISO, 
    isWithinInterval, 
    differenceInDays,
    startOfDay,
    isAfter,
    isBefore,
    isSameMonth
} from 'date-fns';
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
        totalRooms: 0,
        monthlyIncome: 0,
        averageStay: 0,
        activeBookings: 0
    });
    const [incomeData, setIncomeData] = useState([]);
    const [roomStats, setRoomStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [roomRes, guestRes] = await Promise.all([
                    API.get('/rooms'),
                    API.get('/guests')
                ]);
                
                const allRooms = roomRes.data.data;
                const allGuests = guestRes.data.data;
                const today = startOfDay(new Date());

                // 1. Calculate Active Guests (currently checked in)
                const activeGuests = allGuests.filter(g => {
                    const start = startOfDay(parseISO(g.checkIn));
                    const end = g.checkOut ? startOfDay(parseISO(g.checkOut)) : start;
                    return today >= start && today < end;
                }).length;

                // 2. Calculate Occupied Rooms (based on current guest placements)
                const occupiedRoomIds = new Set();
                allGuests.forEach(guest => {
                    const start = startOfDay(parseISO(guest.checkIn));
                    const end = guest.checkOut ? startOfDay(parseISO(guest.checkOut)) : start;
                    if (today >= start && today < end) {
                        guest.rooms?.forEach(r => {
                            const roomId = r.room?._id || r.room;
                            if (roomId) occupiedRoomIds.add(roomId.toString());
                        });
                    }
                });
                const occupiedCount = occupiedRoomIds.size;

                // 3. Calculate Monthly Revenue Growth (Last 6 months)
                const last6Months = Array.from({ length: 6 }, (_, i) => {
                    const date = subMonths(new Date(), 5 - i);
                    return {
                        name: format(date, 'MMM'),
                        monthStart: startOfMonth(date),
                        monthEnd: endOfMonth(date),
                        amount: 0
                    };
                });

                allGuests.forEach(guest => {
                    const checkInDate = parseISO(guest.checkIn);
                    last6Months.forEach(month => {
                        if (isSameMonth(checkInDate, month.monthStart)) {
                            month.amount += (guest.totalAmount || 0);
                        }
                    });
                });

                // 4. Calculate Average Stay
                const previousGuests = allGuests.filter(g => g.checkOut && isBefore(parseISO(g.checkOut), today));
                const totalStayDays = previousGuests.reduce((acc, g) => {
                    return acc + Math.max(1, differenceInDays(parseISO(g.checkOut), parseISO(g.checkIn)));
                }, 0);
                const averageStay = previousGuests.length > 0 ? (totalStayDays / previousGuests.length).toFixed(1) : 0;

                // 5. Room Occupancy % (Last 30 days)
                const thirtyDaysAgo = subMonths(today, 1);
                const occupancyStats = allRooms.map(room => {
                    let occupiedDays = 0;
                    allGuests.forEach(guest => {
                        if (guest.rooms?.some(r => (r.room?._id || r.room) === room._id)) {
                            const start = parseISO(guest.checkIn);
                            const end = guest.checkOut ? parseISO(guest.checkOut) : start;
                            
                            // Overlap between [thirtyDaysAgo, today] and [start, end]
                            const overlapStart = isAfter(start, thirtyDaysAgo) ? start : thirtyDaysAgo;
                            const overlapEnd = isBefore(end, today) ? end : today;
                            
                            if (isBefore(overlapStart, overlapEnd)) {
                                occupiedDays += differenceInDays(overlapEnd, overlapStart);
                            }
                        }
                    });
                    const percentage = Math.round((occupiedDays / 30) * 100);
                    return { 
                        name: room.name, 
                        level: Math.min(100, percentage), 
                        status: percentage > 80 ? 'Full' : percentage > 30 ? 'Active' : 'Available' 
                    };
                });

                setStats({
                    totalGuests: activeGuests,
                    occupiedRooms: occupiedCount,
                    totalRooms: allRooms.length,
                    monthlyIncome: last6Months[5].amount,
                    averageStay: averageStay,
                    activeBookings: activeGuests
                });
                
                setIncomeData(last6Months);
                setRoomStats(occupancyStats);

            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
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
                        title="Today's Guests" 
                        value={stats.totalGuests} 
                        icon={Users} 
                        color="blue" 
                    />
                    <StatCard 
                        title="Room Occupancy" 
                        value={`${stats.occupiedRooms}/${stats.totalRooms || 0}`} 
                        icon={BedDouble} 
                        color="emerald" 
                    />
                    <StatCard 
                        title="Revenue (Month)" 
                        value={`LKR ${stats.monthlyIncome?.toLocaleString()}`} 
                        icon={DollarSign} 
                        color="amber" 
                    />
                    <StatCard 
                        title="Average Stay" 
                        value={`${stats.averageStay} Days`} 
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
                        <h3 className="font-bold text-white mb-6">Occupancy by Room (30d)</h3>
                        <div className="space-y-6">
                            {roomStats.map((room) => (
                                <div key={room.name}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-white font-medium">{room.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
                                                room.status === 'Full' ? 'bg-rose-500/10 text-rose-500' : 
                                                room.status === 'Active' ? 'bg-blue-500/10 text-blue-500' : 
                                                'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                                {room.status}
                                            </span>
                                            <span className="text-slate-400">{room.level}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                room.level > 80 ? 'bg-rose-500' : room.level > 40 ? 'bg-blue-500' : 'bg-emerald-500'
                                            }`} 
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
