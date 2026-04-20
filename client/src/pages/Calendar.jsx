import React, { useState, useEffect } from 'react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon,
    Home,
    BedDouble,
    Clock,
    X,
    Plus,
    CheckCircle2,
    AlertCircle,
    Users
} from 'lucide-react';
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    isSameMonth, 
    isSameDay, 
    addDays, 
    eachDayOfInterval,
    isWithinInterval,
    parseISO,
    isBefore,
    startOfDay,
    subDays
} from 'date-fns';
import Layout from '../components/Layout';
import API from '../api/axios';
import GuestForm from '../components/GuestForm';

const CalendarPage = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modals state
    const [selectedDate, setSelectedDate] = useState(null);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [viewingBooking, setViewingBooking] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [bookingRes, roomRes] = await Promise.all([
                API.get('/guests'),
                API.get('/rooms')
            ]);
            setBookings(bookingRes.data.data);
            setRooms(roomRes.data.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setIsLoading(false);
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <CalendarIcon className="text-blue-500" size={32} />
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <p className="text-slate-500 mt-1">Manage occupancy and group reservations.</p>
                </div>
                <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    <button 
                        onClick={prevMonth}
                        className="p-2 hover:bg-slate-800 hover:text-white text-slate-400 rounded-lg transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white"
                    >
                        Today
                    </button>
                    <button 
                        onClick={nextMonth}
                        className="p-2 hover:bg-slate-800 hover:text-white text-slate-400 rounded-lg transition-all"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 w-full mb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {days.map((day, i) => (
                    <div key={i} className="text-center text-xs font-black text-slate-600 uppercase tracking-widest py-3">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const getOccupancyInfo = (day, roomId) => {
        const targetDay = startOfDay(day);
        const roomBookings = bookings.filter(b => 
            b.rooms?.some(r => (r.room?._id || r.room) === roomId)
        );
        
        const arriving = roomBookings.find(b => isSameDay(targetDay, startOfDay(parseISO(b.checkIn))));
        const departing = roomBookings.find(b => b.checkOut && isSameDay(targetDay, startOfDay(parseISO(b.checkOut))));
        const staying = roomBookings.find(b => {
            const start = startOfDay(parseISO(b.checkIn));
            const end = b.checkOut ? startOfDay(parseISO(b.checkOut)) : start;
            return targetDay >= start && targetDay < end;
        });

        return { arriving, departing, staying };
    };

    const isPastDate = (day) => {
        return isBefore(startOfDay(day), startOfDay(new Date()));
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({
            start: startDate,
            end: endDate
        });

        // Specific rooms we want to track indicators for
        const targetRooms = rooms.filter(r => 
            ['Room 1', 'Room 2', 'Room 3', 'House'].includes(r.name) || 
            ['1', '2', '3'].includes(r.name) // Fallback for shorter names
        );

        const roomColors = {
            'Room 1': { bg: 'bg-blue-600/10', border: 'border-blue-600/20', text: 'text-blue-400', dot: 'bg-blue-600' },
            'Room 2': { bg: 'bg-emerald-600/10', border: 'border-emerald-600/20', text: 'text-emerald-400', dot: 'bg-emerald-600' },
            'Room 3': { bg: 'bg-amber-600/10', border: 'border-amber-600/20', text: 'text-amber-400', dot: 'bg-amber-600' },
            'House': { bg: 'bg-purple-600/10', border: 'border-purple-600/20', text: 'text-purple-400', dot: 'bg-purple-600' },
        };

        return (
            <div className="grid grid-cols-7 h-full w-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr' }}>
                {calendarDays.map((day) => {
                    const formattedDate = format(day, 'd');
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                        <div
                            key={day.toString()}
                            className={`
                                p-2 border-r border-b border-slate-800/30 transition-all cursor-pointer group flex flex-col
                                ${!isCurrentMonth ? 'bg-slate-950/20 text-slate-700' : 'bg-slate-900/20 text-slate-300 hover:bg-blue-600/5'}
                                ${isToday ? 'ring-1 ring-inset ring-blue-600/50 bg-blue-600/5' : ''}
                            `}
                            onClick={() => {
                                setSelectedDate(day);
                                setShowRoomModal(true);
                            }}
                        >
                            <div className="flex justify-between items-start mb-1 shrink-0">
                                <span className={`text-[10px] font-bold ${isToday ? 'text-blue-500' : ''}`}>
                                    {formattedDate}
                                </span>
                            </div>
                            
                            <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
                                {targetRooms.map(room => {
                                    const { arriving, departing, staying } = getOccupancyInfo(day, room._id);
                                    const colors = roomColors[room.name] || { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-500' };
                                    
                                    if (!arriving && !departing && !staying) return null;

                                    return (
                                        <div 
                                            key={room._id}
                                            className={`flex items-center gap-1.5 ${colors.bg} ${colors.border} border rounded px-1.5 py-0.5 shadow-sm relative overflow-hidden`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-sm ${colors.dot} shrink-0`} />
                                            <span className={`text-[8px] font-black uppercase ${colors.text} truncate leading-none`}>
                                                {room.name.replace('Room ', 'R')}
                                            </span>
                                            
                                            {/* Indicators for Turnover */}
                                            <div className="flex gap-0.5 ml-auto">
                                                {departing && (
                                                    <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" title="Departure Today" />
                                                )}
                                                {arriving && (
                                                    <div className="w-1 h-1 rounded-full bg-emerald-500" title="Arrival Today" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleRoomClick = (roomId) => {
        setSelectedRoomId(roomId);
        setShowRoomModal(false);
        setShowGuestForm(true);
    };

    const onBookingSuccess = () => {
        setShowGuestForm(false);
        fetchData();
    };

    return (
        <Layout>
            <div className="w-full h-full flex flex-col">
                <div className="shrink-0 pb-6">
                    {renderHeader()}
                </div>
                <div className="flex-1 flex flex-col min-h-0 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="shrink-0 bg-slate-950/40 border-b border-slate-800 px-2">
                        {renderDays()}
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {renderCells()}
                    </div>
                </div>
            </div>

            {/* Room Selection Modal */}
            {showRoomModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowRoomModal(false)}></div>
                    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                            <div>
                                <h3 className="text-xl font-bold text-white">Select Room for Booking</h3>
                                <p className="text-sm text-slate-500">{format(selectedDate, 'EEEE, MMMM do yyyy')}</p>
                            </div>
                            <button onClick={() => setShowRoomModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {['Room 1', 'Room 2', 'Room 3', 'House'].map(name => {
                                const room = rooms.find(r => r.name === name);
                                if (!room) return null;
                                
                                const { arriving, departing, staying } = getOccupancyInfo(selectedDate, room._id);
                                const isPast = isPastDate(selectedDate);
                                
                                // A room is ONLY blocked for new check-in if someone is staying the night OR arriving today
                                const isBlockedValue = staying || arriving;
                                
                                return (
                                    <div
                                        key={room._id}
                                        className={`
                                            flex flex-col p-5 rounded-2xl border transition-all text-left relative
                                            ${(arriving && departing)
                                                ? 'bg-amber-500/5 border-amber-500/20 ring-1 ring-amber-500/20' 
                                                : isBlockedValue
                                                ? 'bg-rose-500/5 border-rose-500/20' 
                                                : departing
                                                ? 'bg-emerald-500/5 border-emerald-500/20 shadow-inner'
                                                : isPast
                                                ? 'bg-slate-900/50 border-slate-800 opacity-50'
                                                : 'bg-slate-800/30 border-slate-800 hover:border-blue-600/50 hover:bg-blue-600/5'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-xl ${room.type === 'house' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                {room.type === 'house' ? <Home size={24} /> : <BedDouble size={24} />}
                                            </div>
                                            
                                            <div className="flex flex-col items-end gap-1">
                                                {arriving && (
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        <Plus size={12} /> Arriving Today
                                                    </span>
                                                )}
                                                {staying && !arriving && (
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                                        <Clock size={12} /> Occupied
                                                    </span>
                                                )}
                                                {departing && (
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                        <X size={12} className="rotate-45" /> Exiting Today
                                                    </span>
                                                )}
                                                {!arriving && !staying && !departing && (
                                                    isPast ? (
                                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-500 border border-slate-800">
                                                            <AlertCircle size={12} /> Past
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                            <CheckCircle2 size={12} /> Available
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold text-white uppercase tracking-tight">{room.name}</h4>
                                        
                                        <div className="mt-2 space-y-2">
                                            {departing && (
                                                <button 
                                                    onClick={() => {
                                                        setViewingBooking(departing);
                                                        setShowDetailsModal(true);
                                                        setShowRoomModal(false);
                                                    }}
                                                    className="w-full text-left p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all group/item"
                                                >
                                                    <p className="text-amber-500/80 text-xs font-medium flex items-center justify-between">
                                                        <span>👋 Departure: <span className="font-bold text-amber-400">{departing.name}</span></span>
                                                        <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                    </p>
                                                </button>
                                            )}
                                            {(arriving || staying) && (
                                                <button 
                                                    onClick={() => {
                                                        setViewingBooking(arriving || staying);
                                                        setShowDetailsModal(true);
                                                        setShowRoomModal(false);
                                                    }}
                                                    className="w-full text-left p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all group/item"
                                                >
                                                    <p className="text-emerald-500/80 text-xs font-medium flex items-center justify-between">
                                                        <span>🔑 {arriving ? 'Arrival' : 'Staying'}: <span className="font-bold text-emerald-400">{(arriving || staying).name}</span></span>
                                                        <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                    </p>
                                                </button>
                                            )}
                                            {!arriving && !staying && !departing && (
                                                <p className="text-slate-500 text-sm mt-1">LKR {room.pricePerNight?.toLocaleString()} / night</p>
                                            )}
                                        </div>
                                        
                                        {!isBlockedValue && !isPast && (
                                            <button 
                                                onClick={() => handleRoomClick(room._id)}
                                                className="mt-4 flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all w-full text-[10px] font-black uppercase"
                                            >
                                                <span>Click to Start New Booking</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        )}
                                        {isBlockedValue && !departing && (
                                            <button 
                                                onClick={() => {
                                                    setViewingBooking(arriving || staying);
                                                    setShowDetailsModal(true);
                                                    setShowRoomModal(false);
                                                }}
                                                className="mt-4 flex items-center justify-between p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all w-full text-[10px] font-black uppercase"
                                            >
                                                <span>Click to View Details</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Guest Registration Modal */}
            {showGuestForm && (
                <GuestForm 
                    onClose={() => setShowGuestForm(false)}
                    onSuccess={onBookingSuccess}
                    rooms={rooms}
                    initialData={{
                        checkIn: format(selectedDate, "yyyy-MM-dd"),
                        rooms: [{
                            room: selectedRoomId,
                            roomPrice: rooms.find(r => r._id === selectedRoomId)?.pricePerNight || '',
                            guests: [{ name: '', identityType: 'NIC', identityNumber: '' }]
                        }]
                    }}
                />
            )}

            {/* Booking Details Modal */}
            {showDetailsModal && viewingBooking && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowDetailsModal(false)}></div>
                    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setShowRoomModal(true);
                                    }}
                                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-800"
                                    title="Back to Room Selection"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Booking Details</h3>
                                    <p className="text-sm text-slate-500">Scheduled Reservation</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailsModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                    <Users size={32} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-white leading-tight">{viewingBooking.name}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase border border-blue-500/20">
                                            {viewingBooking.bookingPlatform}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                                            viewingBooking.paymentStatus === 'paid' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            Payment: {viewingBooking.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-in</p>
                                    <p className="text-lg font-bold text-white">{format(parseISO(viewingBooking.checkIn), 'MMM dd, yyyy')}</p>
                                </div>
                                <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-out</p>
                                    <p className="text-lg font-bold text-white">
                                        {viewingBooking.checkOut ? format(parseISO(viewingBooking.checkOut), 'MMM dd, yyyy') : 'Not Set'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reserved Rooms</p>
                                <div className="flex flex-wrap gap-2">
                                    {viewingBooking.rooms?.map((r, i) => (
                                        <div key={i} className="bg-slate-800/50 border border-slate-700 px-3 py-2 rounded-xl flex items-center gap-2">
                                            <BedDouble size={14} className="text-blue-400" />
                                            <span className="text-sm font-bold text-white">{r.room?.name || 'Room'}</span>
                                            <span className="text-xs text-slate-500">({r.guests?.length || 0} Guests)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {viewingBooking.description && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notes</p>
                                    <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50 text-sm text-slate-300 italic">
                                        "{viewingBooking.description}"
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Price</span>
                                    <span className="text-xl font-black text-emerald-400">LKR {viewingBooking.totalAmount?.toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={() => setShowDetailsModal(false)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default CalendarPage;
