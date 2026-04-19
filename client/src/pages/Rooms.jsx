import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
    Plus, 
    BedDouble, 
    Home, 
    Settings,
    Shield,
    Trash2,
    Edit3,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Clock,
    X
} from 'lucide-react';
import API from '../api/axios';

const RoomCard = ({ room, onEdit, onDelete }) => {
    const isOccupied = room.status === 'occupied';
    const isMaintenance = room.status === 'maintenance';

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${room.type === 'house' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {room.type === 'house' ? <Home size={28} /> : <BedDouble size={28} />}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(room)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
                        <Edit3 size={16} />
                    </button>
                    <button onClick={() => onDelete(room)} className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-white">{room.name}</h3>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-tighter">{room.type}</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`
                        flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                        ${isOccupied 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                            : isMaintenance
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}
                    `}>
                        {isOccupied ? <Clock size={12} /> : isMaintenance ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                        {room.status}
                    </span>
                    <span className="text-slate-400 text-sm font-bold">LKR {room.pricePerNight?.toLocaleString()} / night</span>
                </div>
            </div>
        </div>
    );
};

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'room',
        pricePerNight: '',
        status: 'available',
        description: ''
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await API.get('/rooms');
            setRooms(res.data.data);
        } catch (err) {
            console.error('Room fetch failed');
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            name: room.name,
            type: room.type,
            pricePerNight: room.pricePerNight,
            status: room.status,
            description: room.description || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingRoom) {
                await API.put(`/rooms/${editingRoom._id}`, formData);
            } else {
                await API.post('/rooms', formData);
            }
            setShowModal(false);
            setEditingRoom(null);
            fetchRooms();
            setFormData({ name: '', type: 'room', pricePerNight: '', status: 'available', description: '' });
        } catch (err) {
            alert('Failed to save room');
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteConfirm = (room) => {
        setRoomToDelete(room);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!roomToDelete) return;
        setIsDeleting(true);
        try {
            await API.delete(`/rooms/${roomToDelete._id}`);
            setConfirmOpen(false);
            setRoomToDelete(null);
            fetchRooms();
        } catch (err) {
            alert('Delete failed');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRoom(null);
        setFormData({ name: '', type: 'room', pricePerNight: '', status: 'available', description: '' });
    };

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Property Management</h2>
                        <p className="text-slate-500 mt-1">Configure room availability and pricing.</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        Add New Unit
                    </button>
                </div>

                {rooms.length === 0 ? (
                    <div className="p-12 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                            <BedDouble size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No units configured yet</h3>
                        <p className="text-slate-500 mb-6">Start by adding your 3 rooms and the separate house.</p>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="text-blue-500 font-bold hover:text-blue-400 transition-colors underline underline-offset-4"
                        >
                            Create first unit
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {rooms.map(room => (
                            <RoomCard 
                                key={room._id} 
                                room={room} 
                                onEdit={handleEdit} 
                                onDelete={openDeleteConfirm} 
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={handleCloseModal}></div>
                    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                            <h3 className="text-xl font-bold text-white">{editingRoom ? 'Edit Unit' : 'Add Property Unit'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Unit Name / Number</label>
                                <input 
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                    placeholder="eg. Room 101"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="room">Standard Room</option>
                                        <option value="house">Separate House</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="available">Available</option>
                                        <option value="occupied">Occupied</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Price (LKR/Night)</label>
                                <input required type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} />
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 font-bold text-slate-400">Cancel</button>
                                <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-8 rounded-xl shadow-lg transition-all">
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (editingRoom ? 'Update Unit' : 'Save Unit')}
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
                title="Delete Property Unit"
                message={`Are you sure you want to delete ${roomToDelete?.name}? This will remove it from the system completely.`}
            />
        </Layout>
    );
};

export default Rooms;
