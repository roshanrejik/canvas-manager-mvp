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
                                {result.neighbors.map((addr: string, i: number) => (
                                    <li key={i} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 font-mono text-sm shadow-sm flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></span>
                                        {addr}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
