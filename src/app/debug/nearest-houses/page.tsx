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

    return (
        <div className="p-8 max-w-2xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-6">Nearest Houses Lookup Debug</h1>

            <form onSubmit={handleSubmit} className="space-y-4 border p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">House Number</label>
                        <input
                            name="houseNumber"
                            value={formData.houseNumber}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium mb-1">Street</label>
                        <input
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <input
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Zip</label>
                        <input
                            name="zip"
                            value={formData.zip}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Searching...' : 'Find Neighbors'}
                </button>
            </form>

            {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded border border-red-200">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className="mt-6 space-y-4">
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-lg border border-slate-700 shadow-lg">
                        <h2 className="font-bold text-blue-400 mb-2">Target Address</h2>
                        <div className="flex flex-col gap-1">
                            <p className="text-xl font-mono">{result.validatedAddress}</p>
                            <p className="text-sm text-slate-400 font-mono">{result.zipPlus4}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Neighbors Found
                        </h2>
                        {result.neighbors.length === 0 ? (
                            <p className="text-slate-500 italic">No neighbors found in immediate range.</p>
                        ) : (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {result.neighbors.map((n: { address: string, count: number, name?: string, phone?: string, email?: string }, i: number) => (
                                    <li key={i}>
                                        <button
                                            onClick={() => setSelectedNeighbor(n)}
                                            className="w-full text-left px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 font-mono text-sm shadow-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></span>
                                                {n.address}
                                            </div>
                                            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                                                {n.count} {n.count === 1 ? 'person' : 'people'}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )
            }
            {selectedNeighbor && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedNeighbor(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Household Details</h3>
                                <p className="text-slate-500 font-mono text-sm mt-1">{selectedNeighbor.address}</p>
                            </div>
                            <button onClick={() => setSelectedNeighbor(null)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
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

                            {/* Contact Info Placeholder */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b pb-2">Contact Information</h4>

                                <div className="grid grid-cols-3 gap-y-4 text-sm">
                                    <div className="text-slate-500">Name</div>
                                    <div className="col-span-2 font-medium text-slate-900 dark:text-slate-200">
                                        {selectedNeighbor.name || "--"}
                                    </div>

                                    <div className="text-slate-500">Phone</div>
                                    <div className="col-span-2 font-medium text-slate-900 dark:text-slate-200">
                                        {selectedNeighbor.phone || "--"}
                                    </div>

                                    <div className="text-slate-500">Email</div>
                                    <div className="col-span-2 font-medium text-slate-900 dark:text-slate-200">
                                        {selectedNeighbor.email || "--"}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 italic mt-4 text-center">
                                    * Full contact details require a specific household query.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setSelectedNeighbor(null)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 transition-colors font-medium text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
