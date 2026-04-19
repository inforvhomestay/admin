import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirm Action", 
    message = "Are you sure you want to proceed?", 
    confirmText = "Delete", 
    isLoading = false 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" 
                onClick={onClose}
            ></div>
            
            <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={40} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        {message}
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : confirmText}
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 text-slate-400 font-bold hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
                
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 text-slate-600 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmationModal;
