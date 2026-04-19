import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
    Download, 
    FileText, 
    Calendar, 
    ChevronRight,
    TrendingUp,
    PieChart,
    Search,
    Loader2
} from 'lucide-react';
import API from '../api/axios';
import { format } from 'date-fns';

const Reports = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchReport();
    }, [month, year]);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const res = await API.get(`/reports/summary?month=${month}&year=${year}`);
            setSummary(res.data.data.summary);
            setTransactions(res.data.data.transactions);
        } catch (err) {
            console.error('Report fetch failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await API.get(`/reports/download-pdf?month=${month}&year=${year}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Monthly_Summary_${month}_${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('PDF download failed');
        }
    };

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Financial Reports</h2>
                        <p className="text-slate-500 mt-1">Generate and download monthly income statements.</p>
                    </div>
                    <button 
                        onClick={handleDownload}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Download size={20} />
                        Download PDF Statement
                    </button>
                </div>

                {/* Selectors */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Reporting Month</label>
                        <select 
                            className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-white min-w-[200px]"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{format(new Date(2024, i), 'MMMM')}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Year</label>
                        <select 
                            className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-white min-w-[120px]"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>
                    </div>
                    <button 
                        onClick={fetchReport}
                        className="p-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
                    >
                        <Search size={22} />
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
                            <TrendingUp size={32} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-medium mb-1">Total Gross Income</p>
                            <p className="text-3xl font-black text-white">LKR {summary?.totalIncome?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 flex items-center gap-6">
                        <div className="w-16 h-16 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center">
                            <PieChart size={32} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-medium mb-1">Stay Transactions</p>
                            <p className="text-3xl font-black text-white">{summary?.count || 0} Records</p>
                        </div>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText size={22} className="text-blue-500" />
                        Transactions for {format(new Date(2024, month - 1), 'MMMM')} {year}
                    </h3>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                        {isLoading ? (
                            <div className="p-20 flex justify-center">
                                <Loader2 className="animate-spin text-blue-500" size={40} />
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-20 text-center">
                                <FileText className="mx-auto text-slate-700 mb-4" size={48} />
                                <p className="text-slate-500 font-medium">No financial records found for this period.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-950/50">
                                        <tr>
                                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Guest / Room</th>
                                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Description</th>
                                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {transactions.map(t => (
                                            <tr key={t._id} className="hover:bg-blue-600/5 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3 text-slate-300 font-medium">
                                                        <Calendar size={16} className="text-slate-500" />
                                                        {format(new Date(t.date), 'MMM dd, yyyy')}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div>
                                                        <p className="text-white font-bold">{t.guest?.name || 'N/A'}</p>
                                                        <p className="text-[10px] text-blue-500 font-black uppercase">{t.room?.name || 'Unknown'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-slate-400 text-sm italic">
                                                    {t.description || 'No description provided'}
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-white">
                                                    LKR {t.amount?.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Reports;
