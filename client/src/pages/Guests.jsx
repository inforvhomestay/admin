import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Image as ImageIcon,
    FileCheck,
    Calendar,
    ArrowUpRight,
    X,
    Upload,
    Loader2,
    Trash2,
    Edit3,
    Star,
    MessageSquare,
    Users,
    CreditCard
} from 'lucide-react';
import API from '../api/axios';
import { format } from 'date-fns';
import GuestForm from '../components/GuestForm';

const ActionMenu = ({ guest, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
                <MoreVertical size={20} />
            </button>
            
            {isOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[60] py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <button 
                        onClick={() => { onEdit(guest); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                    >
                        <Edit3 size={16} /> Edit Details
                    </button>
                    <button 
                        onClick={() => { onDelete(guest); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Delete Record
                    </button>
                </div>
            )}
        </div>
    );
};

const Guests = () => {
    const [guests, setGuests] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [guestToDelete, setGuestToDelete] = useState(null);
    const [editingGuest, setEditingGuest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [guestRes, roomRes] = await Promise.all([
                API.get('/guests'),
                API.get('/rooms')
            ]);
            setGuests(guestRes.data.data);
            setRooms(roomRes.data.data);
        } catch (err) {
            console.error('Fetch failed');
        }
    };


    const handleEdit = (guest) => {
        setEditingGuest(guest);
        setModalOpen(true);
    };

    const openDeleteConfirm = (guest) => {
        setGuestToDelete(guest);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!guestToDelete) return;
        setIsDeleting(true);
        try {
            await API.delete(`/guests/${guestToDelete._id}`);
            setConfirmOpen(false);
            setGuestToDelete(null);
            fetchData();
        } catch (err) {
            alert('Failed to delete guest');
        } finally {
            setIsDeleting(false);
        }
    };

    const onSuccess = () => {
        setModalOpen(false);
        setEditingGuest(null);
        fetchData();
    };


    const filteredGuests = guests.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.identityNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Guest Directory</h2>
                        <p className="text-slate-500 mt-1">Detailed stay records and occupancy logs.</p>
                    </div>
                    <button 
                        onClick={() => setModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        Register New Guest
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or ID number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl">
                    <div className="overflow-visible">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Guest & People</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Duration</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Pricing</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Rating</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredGuests.map((guest) => (
                                    <tr key={guest._id} className="hover:bg-blue-600/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold">
                                                    {guest.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">{guest.name}</p>
                                                    <div className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 mt-0.5">
                                                        <span className="text-blue-500">{guest.numberOfAdults || 1} Adults</span>
                                                        {guest.numberOfChildren > 0 && <span className="text-purple-500">• {guest.numberOfChildren} Children</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-slate-300 text-sm">
                                                    <Calendar size={14} className="text-emerald-500" />
                                                    {format(new Date(guest.checkIn), 'MMM dd')}
                                                    <span className="text-slate-600">→</span>
                                                    {guest.checkOut ? format(new Date(guest.checkOut), 'MMM dd') : 'Ongoing'}
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {guest.rooms?.length > 0 ? guest.rooms.map((r, i) => (
                                                        <span key={i} className="text-[10px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                                            {r.room?.name || 'Unknown'}
                                                        </span>
                                                    )) : (
                                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                                                            {guest.currentRoom?.name || 'Manual Log'}
                                                        </p>
                                                    )}
                                                </div>
                                                {guest.bookingPlatform && (
                                                    <p className="text-[9px] font-black text-blue-500/80 uppercase tracking-widest">
                                                        Via {guest.bookingPlatform}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-sm">LKR {guest.totalAmount?.toLocaleString() || guest.actualPrice?.toLocaleString() || 'N/A'}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${guest.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {guest.paymentStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={12} 
                                                        className={i < (guest.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} 
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ActionMenu guest={guest} onEdit={handleEdit} onDelete={openDeleteConfirm} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isModalOpen && (
                    <GuestForm 
                        onClose={() => { setModalOpen(false); setEditingGuest(null); }}
                        onSuccess={onSuccess}
                        rooms={rooms}
                        isEditing={!!editingGuest}
                        initialData={editingGuest ? {
                            ...editingGuest,
                            checkIn: format(new Date(editingGuest.checkIn), "yyyy-MM-dd"),
                            checkOut: editingGuest.checkOut ? format(new Date(editingGuest.checkOut), "yyyy-MM-dd") : '',
                            birthday: editingGuest.birthday ? format(new Date(editingGuest.birthday), "yyyy-MM-dd") : '',
                            rooms: editingGuest.rooms?.length > 0 ? editingGuest.rooms.map(r => ({
                                room: r.room?._id || r.room || '',
                                roomPrice: r.roomPrice || '',
                                guests: r.guests || []
                            })) : [{
                                room: editingGuest.currentRoom?._id || editingGuest.currentRoom || '',
                                roomPrice: editingGuest.actualPrice || '',
                                guests: [{ name: editingGuest.name, identityType: editingGuest.identityType, identityNumber: editingGuest.identityNumber }]
                            }]
                        } : null}
                    />
                )}

                <ConfirmationModal 
                    isOpen={isConfirmOpen}
                    isLoading={isDeleting}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={handleDelete}
                    title="Delete Guest Record"
                    message={`Delete record for ${guestToDelete?.name}?`}
                />
            </div>
        </Layout>
    );
};

export default Guests;
