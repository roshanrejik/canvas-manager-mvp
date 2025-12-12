'use client';

import { useEffect, useState } from 'react';

// Types for our data
interface Household {
  id: string;
  geography: string;
  count: string;
  zip: string;
  // Optional fields for detailed view
  name?: string;
  spouse?: string;
  phone?: string;
  mobile1?: string;
  mobile2?: string;
  email?: string;
  lastResults?: string;
  notes?: string;
}

export default function Home() {
  const [customerId, setCustomerId] = useState('120957789');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('Sunset');
  const [zip, setZip] = useState('90210');

  const [rawData, setRawData] = useState<string | null>(null);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [totalCount, setTotalCount] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (id: string, hno: string, searchStreet: string, searchZip: string) => {
    try {
      setLoading(true);
      setError(null);
      setHouseholds([]);

      const params = new URLSearchParams();
      params.append('id', id);
      params.append('zip', searchZip);
      if (searchStreet) params.append('street', searchStreet);
      if (hno) params.append('hno', hno);
      params.append('format', 'json');

      const apiUrl = `https://list.melissadata.net/v1/Consumer/rest/Service.svc/get/zip?${params.toString()}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

      const textData = await response.text();
      setRawData(textData);

      // Parse Total Count
      const countMatch = textData.match(/<Count>(\d+)<\/Count>/);
      if (countMatch) setTotalCount(countMatch[1]);

      // Parse List of Streets/Households
      // The API returns multiple <Street> elements
      const householdList: Household[] = [];
      // Regex to find each Street block
      const streetRegex = /<Street>(.*?)<\/Street>/g;
      let match;

      while ((match = streetRegex.exec(textData)) !== null) {
        const content = match[1];
        const geoMatch = content.match(/<Geography>(.*?)<\/Geography>/);
        const cntMatch = content.match(/<Count>(.*?)<\/Count>/);
        const zipMatch = content.match(/<Zip>(.*?)<\/Zip>/);

        // Mock data for demonstration purposes (since API count endpoint lacks PI)
        const hasData = Math.random() > 0.5;

        householdList.push({
          id: Math.random().toString(36).substr(2, 9), // Generate a temp ID for React key
          geography: geoMatch ? geoMatch[1] : 'Unknown Location',
          count: cntMatch ? cntMatch[1] : '0',
          zip: zipMatch ? zipMatch[1] : searchZip,
          // Mock fields
          name: hasData ? 'Yeau Liao' : undefined,
          mobile1: hasData ? '248-528-1777' : undefined,
          lastResults: hasData ? '26 May 2016' : undefined,
          spouse: undefined, // Placeholder as per screenshot
          phone: undefined // Placeholder as per screenshot
        });
      }

      setHouseholds(householdList);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerId.trim() && zip.trim()) {
      fetchData(customerId.trim(), houseNumber.trim(), street.trim(), zip.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Canvas Manager
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Consumer Household Explorer</p>
          </div>

          <div className="flex gap-2">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-800">
              {totalCount} Records Found
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Customer ID</label>
              <input type="text" value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">House #</label>
              <input type="text" value={houseNumber} onChange={e => setHouseNumber(e.target.value)} placeholder="e.g. 100" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Street</label>
              <input type="text" value={street} onChange={e => setStreet(e.target.value)} placeholder="e.g. Sunset" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Zip Code</label>
              <div className="flex gap-2">
                <input type="text" value={zip} onChange={e => setZip(e.target.value)} placeholder="90210" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap">
                  {loading ? '...' : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-8 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Tile Grid View */}
        {!loading && !error && households.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {households.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedHousehold(item)}
                className="group relative bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left flex flex-col justify-between h-32"
              >
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">House #</div>
                  {/* Parsing "90210-6114" to show "6114" as a pseudo house number for display if actual house number is missing */}
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {item.geography.split('-')[1] || item.geography}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{item.count} Residents</span>
                </div>
                {/* Hover Effect decoration */}
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && households.length === 0 && rawData && (
          <div className="text-center py-12 text-slate-500">
            No households found for this search criteria.
          </div>
        )}

      </div>

      {/* Popup Modal */}
      {selectedHousehold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedHousehold(null)}>
          <div
            className="bg-white dark:bg-slate-950 rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 font-sans"
            onClick={e => e.stopPropagation()}
          >
            {/* Header / Top Bar */}
            <div className="h-2 bg-yellow-500 w-full"></div>

            {/* List Content */}
            <div className="flex flex-col">

              {/* Name Row */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 p-4">
                <div className="w-1/3 text-slate-900 dark:text-slate-100 font-medium">Name</div>
                <div className={`w-2/3 ${selectedHousehold.name ? 'text-blue-700 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  {selectedHousehold.name || 'Name'}
                </div>
              </div>

              {/* Spouse Row */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 p-4">
                <div className="w-1/3 text-slate-900 dark:text-slate-100 font-medium">Spouse</div>
                <div className={`w-2/3 ${selectedHousehold.spouse ? 'text-blue-700 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  {selectedHousehold.spouse || 'Spouse'}
                </div>
              </div>

              {/* Phone Row */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 p-4">
                <div className="w-1/3 text-slate-900 dark:text-slate-100 font-medium">Phone</div>
                <div className={`w-2/3 ${selectedHousehold.phone ? 'text-blue-700 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  {selectedHousehold.phone || 'Home Phone'}
                </div>
              </div>

              {/* Mobile #1 Row */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 p-4">
                <div className="w-1/3 text-slate-900 dark:text-slate-100 font-medium whitespace-nowrap">Mobile #1</div>
                <div className={`w-2/3 ${selectedHousehold.mobile1 ? 'text-blue-700 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  {selectedHousehold.mobile1 || 'Mobile #1'}
                </div>
              </div>

              {/* Mobile #2 Row */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 p-4">
                <div className="w-1/3 text-slate-900 dark:text-slate-100 font-medium whitespace-nowrap">Mobile #2</div>
                <div className={`w-2/3 ${selectedHousehold.mobile2 ? 'text-blue-700 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  {selectedHousehold.mobile2 || 'Mobile #2'}
                </div>
              </div>

              {/* Email Row */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 p-4">
                <div className="w-1/3 text-slate-900 dark:text-slate-100 font-medium">Email</div>
                <div className={`w-2/3 ${selectedHousehold.email ? 'text-blue-700 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  {selectedHousehold.email || 'Email'}
                </div>
              </div>

              {/* Last Results Row */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 p-4">
                <div className="w-1/3 text-slate-900 dark:text-slate-100 font-medium whitespace-nowrap">Last Results</div>
                <div className={`w-2/3 ${selectedHousehold.lastResults ? 'text-blue-700 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  {selectedHousehold.lastResults || 'Date'}
                </div>
              </div>

              {/* Notes Row */}
              <div className="flex p-4">
                <div className="w-1/3 text-slate-900 dark:text-slate-100 font-medium">Notes</div>
                <div className="w-2/3 text-slate-300 dark:text-slate-600 italic">
                  Write here
                </div>
              </div>

            </div>

            {/* Footer / Close (Optional, usually clicking outside closes, but keeping a subtle close for usability if needed) */}
            {/* <div className="bg-slate-50 dark:bg-slate-900 p-2 text-center border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setSelectedHousehold(null)} className="text-sm text-slate-500 hover:text-slate-700">Close</button>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}
