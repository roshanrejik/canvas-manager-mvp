'use client';

import { useEffect, useState } from 'react';

// Types for our data
interface Household {
  id: string;
  geography: string;
  count: string;
  zip: string;
  // Detailed view fields
  name?: string;
  spouse?: string;
  phone?: string;
  mobile1?: string;
  mobile2?: string;
  email?: string;
  lastResults?: string;
  notes?: string;
  // Canvassing fields
  canvassingResult?: 'Flyer' | '1:1 meeting IRT' | 'RNT' | '';
  productsNeeded?: string[]; // Array of selected products
  appointmentDate?: string;
}

export default function Home() {
  const [customerId, setCustomerId] = useState('120957789');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('Sunset');
  const [zip, setZip] = useState('90210');
  const [maxRecords, setMaxRecords] = useState('10');

  const [rawData, setRawData] = useState<string | null>(null);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [totalCount, setTotalCount] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for editing
  const [editForm, setEditForm] = useState<Household | null>(null);

  // When a household is selected, initialize the edit form
  useEffect(() => {
    if (selectedHousehold) {
      setEditForm({ ...selectedHousehold, productsNeeded: selectedHousehold.productsNeeded || [] });
    } else {
      setEditForm(null);
    }
  }, [selectedHousehold]);

  const handleSave = () => {
    if (!editForm) return;

    // Update the main list with the edited data
    setHouseholds(prev => prev.map(h => h.id === editForm.id ? editForm : h));
    setSelectedHousehold(null); // Close modal
  };

  const toggleProduct = (product: string) => {
    if (!editForm) return;
    const current = editForm.productsNeeded || [];
    const updated = current.includes(product)
      ? current.filter(p => p !== product)
      : [...current, product];
    setEditForm({ ...editForm, productsNeeded: updated });
  };

  const fetchData = async (id: string, hno: string, searchStreet: string, searchZip: string, records: string) => {
    try {
      setLoading(true);
      setError(null);
      setHouseholds([]);

      const params = new URLSearchParams();
      params.append('id', id);
      params.append('zip', searchZip);
      if (searchStreet) params.append('street', searchStreet);

      // Re-enable hno and add records param for nearest search
      if (hno) params.append('hno', hno);
      if (records) params.append('records', records);

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

        householdList.push({
          id: Math.random().toString(36).substr(2, 9), // Generate a temp ID for React key
          geography: geoMatch ? geoMatch[1] : 'Unknown Location',
          count: cntMatch ? cntMatch[1] : '0',
          zip: zipMatch ? zipMatch[1] : searchZip,
          // Initialize fields as empty/undefined so user sees blanks
          name: undefined,
          mobile1: undefined,
          lastResults: undefined,
          spouse: undefined,
          phone: undefined,
          mobile2: undefined,
          email: undefined,
          notes: undefined,
          canvassingResult: '',
          productsNeeded: [],
          appointmentDate: ''
        });
      }

      // Sort by proximity if a house number was searched
      // Even with the API returning 'closest' records, sorting them locally is good for display
      if (hno && hno.trim() !== '') {
        const targetNum = parseInt(hno.replace(/\D/g, ''), 10);
        if (!isNaN(targetNum)) {
          householdList.sort((a, b) => {
            // Extract house number from geography (assuming format "Zip-HouseNumber" or just "HouseNumber" somewhere)
            // Based on example "90210-6114", the house number is the suffix after the dash.
            // Or sometimes it might be just the number. Let's try to parse the last numeric segment.

            const getNum = (geo: string) => {
              const parts = geo.split('-');
              const lastPart = parts[parts.length - 1];
              return parseInt(lastPart.replace(/\D/g, ''), 10) || 0;
            };

            const numA = getNum(a.geography);
            const numB = getNum(b.geography);

            const distA = Math.abs(numA - targetNum);
            const distB = Math.abs(numB - targetNum);

            return distA - distB;
          });
        }
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
      fetchData(customerId.trim(), houseNumber.trim(), street.trim(), zip.trim(), maxRecords.trim());
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Max Records</label>
              <input type="number" value={maxRecords} onChange={e => setMaxRecords(e.target.value)} placeholder="10" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
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

      {/* Popup Form Modal */}
      {selectedHousehold && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-sm" onClick={() => setSelectedHousehold(null)}>
          <div
            className="bg-white dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 font-sans flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Household Details</h3>
                <p className="text-slate-500 text-sm mt-1 font-mono">{editForm.geography} • {editForm.zip}</p>
              </div>
              <button onClick={() => setSelectedHousehold(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Contact Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 pb-2 mb-4">Contact Information</h4>

                <div className="space-y-3">
                  {(
                    [
                      { label: 'Name', field: 'name', placeholder: 'Enter Name' },
                      { label: 'Spouse', field: 'spouse', placeholder: 'Spouse Name' },
                      { label: 'Home Phone', field: 'phone', placeholder: 'Home Phone' },
                      { label: 'Mobile #1', field: 'mobile1', placeholder: 'Mobile Number' },
                      { label: 'Mobile #2', field: 'mobile2', placeholder: 'Alt Mobile' },
                      { label: 'Email', field: 'email', placeholder: 'Email Address' },
                    ] as const
                  ).map((input) => (
                    <div key={input.field} className="group">
                      <label className="block text-xs font-medium text-slate-500 mb-1 group-focus-within:text-blue-600 transition-colors">{input.label}</label>
                      <input
                        type="text"
                        value={(editForm[input.field as keyof Household] as string) || ''}
                        onChange={(e) => setEditForm({ ...editForm, [input.field]: e.target.value })}
                        placeholder={input.placeholder}
                        className="w-full text-sm py-1.5 border-b border-slate-200 dark:border-slate-800 bg-transparent focus:border-blue-500 focus:outline-none transition-colors text-slate-900 dark:text-slate-100 placeholder:text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Canvassing Info */}
              <div className="space-y-6">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 pb-2 mb-4">Canvassing Outcome</h4>

                {/* Result Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Canvassing Result</label>
                  <select
                    value={editForm.canvassingResult}
                    onChange={(e) => setEditForm({ ...editForm, canvassingResult: e.target.value as Household['canvassingResult'] })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Result...</option>
                    <option value="Flyer">Flyer</option>
                    <option value="1:1 meeting IRT">1:1 meeting IRT</option>
                    <option value="RNT">RNT</option>
                  </select>
                </div>

                {/* Products Multi-select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Products Needed</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Roofing', 'Door', 'Window', 'Flooring'].map(product => (
                      <button
                        key={product}
                        onClick={() => toggleProduct(product)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all text-left flex items-center gap-2
                                        ${(editForm.productsNeeded || []).includes(product)
                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}
                                    `}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center
                                        ${(editForm.productsNeeded || []).includes(product) ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}
                                    `}>
                          {(editForm.productsNeeded || []).includes(product) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                        {product}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Appointment Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Appointment Date</label>
                  <input
                    type="date"
                    value={editForm.appointmentDate || ''}
                    onChange={(e) => setEditForm({ ...editForm, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Add notes about the visit..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Sticky/Fixed Footer actions */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => setSelectedHousehold(null)}
                className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
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
