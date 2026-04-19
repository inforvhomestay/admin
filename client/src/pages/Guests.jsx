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
    
    const [formData, setFormData] = useState({
        name: '',
        identityType: 'NIC',
        identityNumber: '',
        currentRoom: '',
        checkIn: format(new Date(), "yyyy-MM-dd"),
        checkOut: '',
        numberOfAdults: 1,
        numberOfChildren: 0,
        actualPrice: '',
        totalAmount: '',
        paymentStatus: 'pending',
        description: '',
        rating: 5
    });
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
        setFormData({
            name: guest.name,
            identityType: guest.identityType,
            identityNumber: guest.identityNumber,
            currentRoom: guest.currentRoom?._id || guest.currentRoom || '',
            checkIn: format(new Date(guest.checkIn), "yyyy-MM-dd"),
            checkOut: guest.checkOut ? format(new Date(guest.checkOut), "yyyy-MM-dd") : '',
            numberOfAdults: guest.numberOfAdults || 1,
            numberOfChildren: guest.numberOfChildren || 0,
            actualPrice: guest.actualPrice || '',
            totalAmount: guest.totalAmount || '',
            paymentStatus: guest.paymentStatus || 'pending',
            description: guest.description || '',
            rating: guest.rating || 5
        });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let response;
            
            // If no new photos, send as JSON (more reliable for updates)
            if (photos.length === 0) {
                const payload = { ...formData };
                
                // Convert empty strings to proper nulls/numbers for the database
                if (payload.currentRoom === '') payload.currentRoom = null;
                if (payload.actualPrice === '') payload.actualPrice = 0;
                if (payload.totalAmount === '') payload.totalAmount = 0;
                if (payload.checkOut === '') payload.checkOut = null;
                
                console.log('--- SENDING GUEST UPDATE (JSON) ---');
                console.log(payload);
                
                if (editingGuest) {
                    response = await API.put(`/guests/${editingGuest._id}`, payload);
                } else {
                    response = await API.post('/guests', payload);
                }
            } else {
                // Use FormData if photos are present
                const data = new FormData();
                Object.keys(formData).forEach(key => {
                    let value = formData[key];
                    if (value === '' && (key === 'currentRoom' || key === 'checkOut')) {
                        // Skip or handle as null later in backend if needed
                    } else if (value !== '') {
                        data.append(key, value);
                    }
                });
                photos.forEach(photo => data.append('photos', photo));
                
                if (editingGuest) {
                    response = await API.put(`/guests/${editingGuest._id}`, data);
                } else {
                    response = await API.post('/guests', data);
                }
            }

            setModalOpen(false);
            setEditingGuest(null);
            fetchData();
            resetForm();
        } catch (err) {
            console.error('Submit error:', err);
            alert(err.response?.data?.message || 'Failed to save guest');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', identityType: 'NIC', identityNumber: '', 
            currentRoom: '', checkIn: format(new Date(), "yyyy-MM-dd"),
            checkOut: '', numberOfAdults: 1, numberOfChildren: 0,
            actualPrice: '', totalAmount: '', paymentStatus: 'pending', description: '', rating: 5
        });
        setPhotos([]);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingGuest(null);
        resetForm();
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
                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                                                    {guest.currentRoom?.name || 'Manual Log'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-sm">LKR {guest.actualPrice?.toLocaleString() || 'N/A'}</span>
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={handleCloseModal}></div>
                        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <FileCheck className="text-blue-500" size={28} />
                                    {editingGuest ? 'Update Guest Profile' : 'Register New Guest'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* Column 1 */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 text-left block">Guest Name</label>
                                            <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-600" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 text-left block">ID Type</label>
                                                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none" value={formData.identityType} onChange={(e) => setFormData({...formData, identityType: e.target.value})}>
                                                    <option value="NIC">NIC</option>
                                                    <option value="Passport">Passport</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 text-left block">ID Number</label>
                                                <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none" value={formData.identityNumber} onChange={(e) => setFormData({...formData, identityNumber: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 text-left block flex items-center gap-2"><Users size={14} /> Adults</label>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-600" 
                                                    value={formData.numberOfAdults} 
                                                    onChange={(e) => setFormData({...formData, numberOfAdults: Math.max(1, parseInt(e.target.value) || 1)})} 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 text-left block flex items-center gap-2"><Users size={14} /> Children</label>
                                                <input type="number" min="0" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-600" value={formData.numberOfChildren} onChange={(e) => setFormData({...formData, numberOfChildren: parseInt(e.target.value)})} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 text-left block">Check-in</label>
                                                <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none" value={formData.checkIn} onChange={(e) => setFormData({...formData, checkIn: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 text-left block">Check-out</label>
                                                <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none" value={formData.checkOut} onChange={(e) => setFormData({...formData, checkOut: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 text-left block flex items-center gap-2"><CreditCard size={14} /> Agreed Price (Total Stay)</label>
                                            <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-600" placeholder="eg. 15000" value={formData.actualPrice} onChange={(e) => setFormData({...formData, actualPrice: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 text-left block">Rating</label>
                                            <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})}>
                                                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                                                <option value="4">⭐⭐⭐⭐ Good</option>
                                                <option value="3">⭐⭐⭐ Average</option>
                                                <option value="2">⭐⭐ Poor</option>
                                                <option value="1">⭐ Troublesome</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 text-left block flex items-center gap-2"><MessageSquare size={14} /> Description & Private Notes</label>
                                    <textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none h-24 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 text-left block">Identity Photos</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-2xl cursor-pointer hover:bg-slate-950/50 transition-all">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="text-slate-500 mb-2" size={24} />
                                            <p className="text-sm text-slate-500">Upload documents</p>
                                        </div>
                                        <input type="file" className="hidden" multiple onChange={(e) => setPhotos([...e.target.files])} accept="image/*" />
                                    </label>
                                    {photos.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {photos.map((p, i) => (
                                                <div key={i} className="px-3 py-1 bg-blue-600/20 border border-blue-600/30 rounded-lg text-xs text-blue-400">
                                                    {p.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 border-t border-slate-800 flex justify-end gap-4">
                                    <button onClick={handleCloseModal} type="button" className="px-6 py-3 rounded-xl font-bold text-slate-400">Cancel</button>
                                    <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all">
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (editingGuest ? 'Update Profile' : 'Log Guest')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
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
