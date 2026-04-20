import React, { useState, useEffect } from 'react';
import { 
    X, 
    Plus, 
    Trash2, 
    Upload, 
    Loader2, 
    Calendar, 
    Image as ImageIcon,
    FileCheck,
    MessageSquare
} from 'lucide-react';
import API from '../api/axios';
import { format } from 'date-fns';

const GuestForm = ({ onClose, onSuccess, rooms, initialData = null, isEditing = false }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [photos, setPhotos] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '',
        identityType: 'NIC',
        identityNumber: '',
        phoneNumber: '',
        email: '',
        birthday: '',
        nationality: 'Sri Lankan',
        bookingPlatform: 'Airbnb',
        checkIn: format(new Date(), "yyyy-MM-dd"),
        checkOut: '',
        numberOfAdults: 1,
        numberOfChildren: 0,
        actualPrice: '',
        totalAmount: '',
        paymentStatus: 'pending',
        description: '',
        rating: 5,
        rooms: [
            {
                room: '',
                roomPrice: '',
                guests: [{
                    name: '',
                    identityType: 'NIC',
                    identityNumber: '',
                    birthday: '',
                    email: '',
                    phoneNumber: '',
                    nationality: 'Sri Lankan',
                }]
            }
        ]
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const addRoom = () => {
        setFormData({
            ...formData,
            rooms: [
                ...formData.rooms,
                { room: '', roomPrice: '', guests: [{ name: '', identityType: 'NIC', identityNumber: '', birthday: '', email: '', phoneNumber: '', nationality: 'Sri Lankan' }] }
            ]
        });
    };

    const removeRoom = (index) => {
        const newRooms = formData.rooms.filter((_, i) => i !== index);
        setFormData({ ...formData, rooms: newRooms });
    };

    const addGuestToRoom = (roomIndex) => {
        const newRooms = [...formData.rooms];
        newRooms[roomIndex].guests.push({
            name: '', identityType: 'NIC', identityNumber: '', birthday: '', email: '', phoneNumber: '', nationality: 'Sri Lankan'
        });
        setFormData({ ...formData, rooms: newRooms });
    };

    const removeGuestFromRoom = (roomIndex, guestIndex) => {
        const newRooms = [...formData.rooms];
        newRooms[roomIndex].guests = newRooms[roomIndex].guests.filter((_, i) => i !== guestIndex);
        setFormData({ ...formData, rooms: newRooms });
    };

    const handleRoomChange = (roomIndex, field, value) => {
        const newRooms = [...formData.rooms];
        newRooms[roomIndex][field] = value;
        setFormData({ ...formData, rooms: newRooms });
    };

    const handleNestedGuestChange = (roomIndex, guestIndex, field, value) => {
        const newRooms = [...formData.rooms];
        newRooms[roomIndex].guests[guestIndex][field] = value;
        setFormData({ ...formData, rooms: newRooms });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let response;
            const payload = { ...formData };
            
            if (payload.actualPrice === '') payload.actualPrice = 0;
            if (payload.totalAmount === '') payload.totalAmount = 0;
            if (payload.checkOut === '') payload.checkOut = null;
            if (payload.birthday === '') payload.birthday = null;

            if (photos.length === 0) {
                if (isEditing && initialData?._id) {
                    response = await API.put(`/guests/${initialData._id}`, payload);
                } else {
                    response = await API.post('/guests', payload);
                }
            } else {
                const data = new FormData();
                Object.keys(payload).forEach(key => {
                    let value = payload[key];
                    if (key === 'rooms') {
                        data.append(key, JSON.stringify(value));
                    } else if (value !== '' && value !== null) {
                        data.append(key, value);
                    }
                });
                photos.forEach(photo => data.append('photos', photo));
                
                if (isEditing && initialData?._id) {
                    response = await API.put(`/guests/${initialData._id}`, data);
                } else {
                    response = await API.post('/guests', data);
                }
            }

            onSuccess();
        } catch (err) {
            console.error('Submit error:', err);
            alert(err.response?.data?.message || 'Failed to save guest');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileCheck className="text-blue-500" size={28} />
                        {isEditing ? 'Update Guest Profile' : 'Register New Guest'}
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {/* Section 1: Booking Level */}
                    <div className="bg-slate-950/30 p-6 rounded-2xl border border-slate-800/50 space-y-6">
                        <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs mb-2">
                            <Calendar size={14} /> Global Booking Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Check-in</label>
                                <input required type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-600" value={formData.checkIn} onChange={(e) => setFormData({...formData, checkIn: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Check-out</label>
                                <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-600" value={formData.checkOut} onChange={(e) => setFormData({...formData, checkOut: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Booking Platform</label>
                                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-600" value={formData.bookingPlatform} onChange={(e) => setFormData({...formData, bookingPlatform: e.target.value})}>
                                    <option value="Airbnb">Airbnb</option>
                                    <option value="Booking.com">Booking.com</option>
                                    <option value="Agoda">Agoda</option>
                                    <option value="Direct Booking">Direct Booking</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Main Contact Name</label>
                                <input required type="text" placeholder="Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-600" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Total Stay Price (LKR)</label>
                                <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-emerald-600" value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Payment Status</label>
                                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-600" value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}>
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Rooms & Members */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-xs">
                                <ImageIcon size={14} /> Rooms & Occupants
                            </div>
                            <button 
                                type="button" 
                                onClick={addRoom}
                                className="text-xs font-bold bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-600/30 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
                            >
                                <Plus size={14} /> Add Another Room
                            </button>
                        </div>

                        {formData.rooms.map((roomBlock, roomIndex) => (
                            <div key={roomIndex} className="bg-slate-950/20 border border-slate-800 rounded-2xl overflow-hidden">
                                <div className="bg-slate-800/30 px-6 py-3 flex items-center justify-between border-b border-slate-800">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="bg-blue-600 text-[10px] px-2 py-0.5 rounded font-black uppercase text-white">Room {roomIndex + 1}</div>
                                        <select 
                                            required
                                            className="bg-transparent text-white font-bold outline-none cursor-pointer"
                                            value={roomBlock.room}
                                            onChange={(e) => handleRoomChange(roomIndex, 'room', e.target.value)}
                                        >
                                            <option value="">Select Room...</option>
                                            {rooms.map(r => <option key={r._id} value={r._id}>{r.name} - LKR {r.pricePerNight}</option>)}
                                        </select>
                                        <div className="flex items-center gap-2 ml-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase">Room Price:</label>
                                            <input 
                                                type="number" 
                                                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white outline-none w-24"
                                                value={roomBlock.roomPrice}
                                                onChange={(e) => handleRoomChange(roomIndex, 'roomPrice', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {formData.rooms.length > 1 && (
                                        <button type="button" onClick={() => removeRoom(roomIndex)} className="text-rose-500 hover:text-rose-400 p-1">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Guests in this Room</span>
                                        <button 
                                            type="button" 
                                            onClick={() => addGuestToRoom(roomIndex)}
                                            className="text-[10px] font-bold text-blue-400 hover:text-white flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Add Person
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {roomBlock.guests.map((member, guestIndex) => (
                                            <div key={guestIndex} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Guest Name</label>
                                                        <input 
                                                            required
                                                            type="text" 
                                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-600"
                                                            value={member.name}
                                                            onChange={(e) => handleNestedGuestChange(roomIndex, guestIndex, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="space-y-1.5 col-span-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                                                            <select 
                                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white outline-none"
                                                                value={member.identityType}
                                                                onChange={(e) => handleNestedGuestChange(roomIndex, guestIndex, 'identityType', e.target.value)}
                                                            >
                                                                <option value="NIC">NIC</option>
                                                                <option value="Passport">Passport</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1.5 col-span-2">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">ID Number</label>
                                                            <input 
                                                                type="text" 
                                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-600"
                                                                value={member.identityNumber}
                                                                onChange={(e) => handleNestedGuestChange(roomIndex, guestIndex, 'identityNumber', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nationality</label>
                                                        <input 
                                                            type="text" 
                                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-600"
                                                            placeholder="e.g. Sri Lankan"
                                                            value={member.nationality}
                                                            onChange={(e) => handleNestedGuestChange(roomIndex, guestIndex, 'nationality', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Birthday</label>
                                                        <input 
                                                            type="date" 
                                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-600"
                                                            value={member.birthday ? format(new Date(member.birthday), "yyyy-MM-dd") : ''}
                                                            onChange={(e) => handleNestedGuestChange(roomIndex, guestIndex, 'birthday', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5 flex-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Contact</label>
                                                        <input 
                                                            type="text" 
                                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-600"
                                                            placeholder="Phone/Email"
                                                            value={member.phoneNumber || member.email || ''}
                                                            onChange={(e) => handleNestedGuestChange(roomIndex, guestIndex, 'phoneNumber', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end">
                                                        {roomBlock.guests.length > 1 && (
                                                            <button type="button" onClick={() => removeGuestFromRoom(roomIndex, guestIndex)} className="text-rose-500 hover:text-rose-400 p-2 bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20">
                                                                <Trash2 size={16} className="inline mr-1" /> Remove Person
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 block flex items-center gap-2"><MessageSquare size={14} /> Description & Private Notes</label>
                        <textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none h-24 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1 block">Identity Photos (Min 2)</label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-2xl cursor-pointer hover:bg-slate-950/50 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="text-slate-500 mb-2" size={24} />
                                <p className="text-sm text-slate-500">Upload primary documents</p>
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
                        <button onClick={onClose} type="button" className="px-6 py-3 rounded-xl font-bold text-slate-400">Cancel</button>
                        <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all">
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? 'Update Group Booking' : 'Confirm Group Booking')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GuestForm;
