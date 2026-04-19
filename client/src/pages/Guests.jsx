import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
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
    Loader2
} from 'lucide-react';
import API from '../api/axios';
import { format } from 'date-fns';

const Guests = () => {
    const [guests, setGuests] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        identityType: 'NIC',
        identityNumber: '',
        currentRoom: '',
        checkIn: format(new Date(), "yyyy-MM-dd"),
        totalAmount: '',
        paymentStatus: 'pending'
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

    const handlePhotoChange = (e) => {
        setPhotos([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        photos.forEach(photo => data.append('photos', photo));

        try {
            await API.post('/guests', data);
            setModalOpen(false);
            fetchData();
            // Reset form
            setFormData({
                name: '', identityType: 'NIC', identityNumber: '', 
                currentRoom: '', checkIn: format(new Date(), "yyyy-MM-dd"),
                totalAmount: '', paymentStatus: 'pending'
            });
            setPhotos([]);
        } catch (err) {
            alert('Failed to save guest');
        } finally {
            setIsLoading(false);
        }
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
                        <p className="text-slate-500 mt-1">Manage guest records and documentation.</p>
                    </div>
                    <button 
                        onClick={() => setModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        Register New Guest
                    </button>
                </div>

                {/* Filters */}
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
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-medium hover:text-white transition-all">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>

                {/* Guest Table */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Guest</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Identity Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Assigned Room</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Check-In</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
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
                                                    <p className="text-xs text-slate-500">{guest.phoneNumber || 'No phone'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-300 font-medium">{guest.identityType}: {guest.identityNumber}</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <ImageIcon size={14} className="text-blue-500" />
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{guest.documents?.length || 0} Photos Attached</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                                                {guest.currentRoom?.name || 'Not assigned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <Calendar size={14} />
                                                {format(new Date(guest.checkIn), 'MMM dd, yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`
                                                px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border
                                                ${guest.paymentStatus === 'paid' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}
                                            `}>
                                                {guest.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                                <MoreVertical size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setModalOpen(false)}></div>
                        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <FileCheck className="text-blue-500" size={28} />
                                    Register New Guest
                                </h3>
                                <button onClick={() => setModalOpen(false)} className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <input 
                                            required
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Identity Type</label>
                                        <select 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                            value={formData.identityType}
                                            onChange={(e) => setFormData({...formData, identityType: e.target.value})}
                                        >
                                            <option value="NIC">NIC</option>
                                            <option value="Passport">Passport</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Identity Number</label>
                                        <input 
                                            required
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                            placeholder="eg. 199012345678"
                                            value={formData.identityNumber}
                                            onChange={(e) => setFormData({...formData, identityNumber: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Assign Room</label>
                                        <select 
                                            required
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                            value={formData.currentRoom}
                                            onChange={(e) => setFormData({...formData, currentRoom: e.target.value})}
                                        >
                                            <option value="">Select a room...</option>
                                            {rooms.map(room => (
                                                <option key={room._id} value={room._id} disabled={room.status !== 'available'}>
                                                    {room.name} ({room.status})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Check-in Date</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                            value={formData.checkIn}
                                            onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Advance Payment (LKR)</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                            placeholder="5000"
                                            value={formData.totalAmount}
                                            onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between">
                                        Identity Documents (Photos)
                                        <span className="text-[10px] text-blue-500 normal-case italic">Upload both sides for NIC</span>
                                    </label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-2xl cursor-pointer hover:bg-slate-950/50 hover:border-slate-700 transition-all">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="text-slate-500 mb-2" size={24} />
                                            <p className="text-sm text-slate-500">
                                                <span className="font-bold text-blue-500">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1">PNG, JPG up to 10MB (Multiple allowed)</p>
                                        </div>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            multiple 
                                            onChange={handlePhotoChange}
                                            accept="image/*"
                                        />
                                    </label>
                                    {photos.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {Array.from(photos).map((p, i) => (
                                                <div key={i} className="px-3 py-1 bg-blue-600/20 border border-blue-600/30 rounded-lg text-xs text-blue-400 flex items-center gap-2">
                                                    <ImageIcon size={12} /> {p.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 border-t border-slate-800 flex justify-end gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setModalOpen(false)}
                                        className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-10 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-3 disabled:opacity-70"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                            <>
                                                Register Guest
                                                <ArrowUpRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Guests;
