import { useState } from 'react';

function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');
  const [pincode, setPincode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), pincode.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-purple-300">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Search Input */}
          <div className="flex-1">
            <label className="block text-lg font-black text-gray-800 mb-3">
              🔍 What are you looking for?
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., wireless headphones, laptop, shoes..."
              className="w-full px-6 py-4 border-4 border-purple-300 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 outline-none transition text-lg font-semibold"
              disabled={loading}
            />
          </div>
          
          {/* Pincode Input */}
          <div className="md:w-52">
            <label className="block text-lg font-black text-gray-800 mb-3">
              📍 Pincode (Optional)
            </label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g., 110001"
              className="w-full px-6 py-4 border-4 border-purple-300 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 outline-none transition text-lg font-semibold"
              disabled={loading}
              maxLength={6}
            />
          </div>

          {/* Search Button */}
          <div className="md:self-end">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-black text-lg rounded-2xl hover:from-purple-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              {loading ? '⏳ Searching...' : '🔍 Search Deals'}
            </button>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="text-sm font-bold text-gray-700">✨ Try:</span>
          {['wireless headphones', 'laptop', 'running shoes', 'smartphone'].map(suggestion => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="text-sm px-5 py-2 bg-gradient-to-r from-purple-200 to-pink-200 hover:from-purple-300 hover:to-pink-300 rounded-full text-gray-800 font-bold transition transform hover:scale-110 shadow-lg"
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

export default SearchBar;