'use client';

import { useState } from 'react';

export default function NearestHousesDebug() {
    const [formData, setFormData] = useState({
        houseNumber: '',
        street: '',
        city: '',
        state: '',
        zip: ''
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedNeighbor, setSelectedNeighbor] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/nearest-houses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch');
            }
            setResult(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        } finally {
            setLoading(false);
        }
    };

    // Local state for editing form
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editForm, setEditForm] = useState<any>(null);

    const handleSelectNeighbor = (n: any) => {
        setEditForm({
            ...n,
            spouse: n.spouse || '',
            notes: n.notes || '',
            date: n.date || ''
        });
        setSelectedNeighbor(n);
    };

    const handleSave = () => {
        if (!editForm || !result) return;

        // Update the neighbor in the result list locally
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedNeighbors = result.neighbors.map((n: any) =>
            n.address === editForm.address ? editForm : n
        );

        setResult({ ...result, neighbors: updatedNeighbors });
        setSelectedNeighbor(null);
        setEditForm(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Nearest Houses
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Consumer Lookup Debugger</p>
                    </div>
                </div>

                {/* Search Form */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Address Block */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Address Details</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Number</label>
                                        <input
                                            name="houseNumber"
                                            value={formData.houseNumber}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Street</label>
                                        <input
                                            name="street"
                                            value={formData.street}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Region Block */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Region</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">City</label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">State</label>
                                        <input
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Zip</label>
                                        <input
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium shadow-sm transition-all"
                            >
                                {loading ? 'Searching...' : 'Find Neighbors'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-8 border border-red-200 dark:border-red-800">
                        <p className="font-bold text-sm">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Target Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-slate-900 text-slate-100 rounded-xl p-6 shadow-lg sticky top-8">
                                <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4">Target Address</h2>
                                <div className="space-y-1">
                                    <p className="text-2xl font-bold font-mono">{result.validatedAddress}</p>
                                    <p className="text-sm text-slate-400 font-mono">{result.zipPlus4}</p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-800">
                                    <div className="text-center">
                                        <span className="text-3xl font-bold text-white">{result.neighbors.length}</span>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Neighbors Found</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Neighbors Grid */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                                    Neighbors
                                </h2>
                                {result.neighbors.length === 0 ? (
                                    <p className="text-slate-500 italic text-center py-8">No neighbors found in immediate range.</p>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {result.neighbors.map((n: { address: string, count: number, name?: string, phone?: string, email?: string }, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSelectNeighbor(n)}
                                                className="group text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all relative overflow-hidden active:scale-95 touch-manipulation"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                                                        {i + 1}
                                                    </div>
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${n.count > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                        {n.count > 0 ? 'Occupied' : 'Unknown'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mb-1">
                                                    <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                                                    <div className="font-sans font-semibold text-slate-900 dark:text-white text-base truncate">
                                                        {n.address.split(' ')[0]}
                                                    </div>
                                                </div>

                                                <div className="text-sm text-slate-600 dark:text-slate-400 truncate pl-6">
                                                    {n.address.substring(n.address.indexOf(' ') + 1)}
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {n.count} Residents
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedNeighbor && editForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => { setSelectedNeighbor(null); setEditForm(null); }}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Household Details</h3>
                                <p className="text-slate-500 font-mono text-sm mt-1">{selectedNeighbor.address}</p>
                            </div>
                            <button onClick={() => { setSelectedNeighbor(null); setEditForm(null); }} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Stats */}
                            <div className="flex gap-4">
                                <div className="flex-1 bg-blue-50 dark:bg-slate-800 p-4 rounded-lg border border-blue-100 dark:border-slate-700">
                                    <div className="text-xs uppercase text-slate-500 mb-1 font-bold">Residents</div>
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedNeighbor.count}</div>
                                </div>
                                <div className="flex-1 bg-green-50 dark:bg-slate-800 p-4 rounded-lg border border-green-100 dark:border-slate-700">
                                    <div className="text-xs uppercase text-slate-500 mb-1 font-bold">Status</div>
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">Occupied</div>
                                </div>
                            </div>

                            {/* Editable Form */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b pb-2">Edit Information</h4>

                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                                        <input
                                            value={editForm.name || ''}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Enter Name"
                                        />
                                    </div>

                                    {/* Spouse */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Spouse Name</label>
                                        <input
                                            value={editForm.spouse || ''}
                                            onChange={e => setEditForm({ ...editForm, spouse: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Enter Spouse Name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Phone */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                                            <input
                                                value={editForm.phone || ''}
                                                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Phone Number"
                                            />
                                        </div>
                                        {/* Email */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                                            <input
                                                value={editForm.email || ''}
                                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Email Address"
                                            />
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={editForm.date || ''}
                                            onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</label>
                                        <textarea
                                            value={editForm.notes || ''}
                                            onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            placeholder="Add notes..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0">
                            <button
                                onClick={() => { setSelectedNeighbor(null); setEditForm(null); }}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all font-medium text-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
