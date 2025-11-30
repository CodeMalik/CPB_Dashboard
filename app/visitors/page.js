'use client';
import { useState, useEffect } from 'react';

const VisitorsDashboard = () => {
  const [visitors, setVisitors] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    withEmail: 0,
    cookiesAccepted: 0
  });
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    fetchVisitors();
    fetchCountries();
    fetchStats();
  }, [selectedCountry]);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setApiError('');
      const url = selectedCountry === 'all' 
        ? '/api/visitors' 
        : `/api/visitors?country=${selectedCountry}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch visitors');
      }
      
      setVisitors(data.visitors || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setApiError(error.message);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/visitors/countries');
      const data = await response.json();
      setCountries(data.countries || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/visitors/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getCountryStats = () => {
    const countryStats = {};
    visitors.forEach(visitor => {
      const country = visitor.country || 'Unknown';
      countryStats[country] = (countryStats[country] || 0) + 1;
    });
    return countryStats;
  };

  const countryStats = getCountryStats();

  const refreshData = () => {
    fetchVisitors();
    fetchStats();
    fetchCountries();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 ">
      {/* Remove max-w-7xl mx-auto to make it full width */}
      <div className="w-[1650] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Visitors Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor visitors to custompackwebsite.com
          </p>
          <button
            onClick={refreshData}
            className="mt-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Refresh Data
          </button>
        </div>

        {apiError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>API Error: </strong>{apiError}
          </div>
        )}

        {/* Overall Statistics */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-900">Total Visitors</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-900">With Email</h3>
            <p className="text-3xl font-bold text-green-600">{stats.withEmail}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-900">Cookies Accepted</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.cookiesAccepted}</p>
          </div>
        </div>

        {/* Country Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Country:
              </label>
              <select
                id="country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing: <span className="font-semibold">{visitors.length}</span> visitors
              {selectedCountry !== 'all' && ` from ${selectedCountry}`}
            </div>
          </div>
        </div>

        {/* Country Statistics - Full width */}
        {selectedCountry === 'all' && Object.keys(countryStats).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Visitors by Country</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(countryStats)
                .sort(([,a], [,b]) => b - a)
                .map(([country, count]) => (
                  <div key={country} className="bg-white p-3 rounded-lg shadow-sm border">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{country}</h4>
                    <p className="text-lg font-bold text-blue-600">{count}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Visitors Table - Full width */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {selectedCountry === 'all' ? 'All Visitors' : `Visitors from ${selectedCountry}`}
            </h2>
            {loading && (
              <div className="text-sm text-gray-500">Loading...</div>
            )}
          </div>
          
          {visitors.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              No visitors found{selectedCountry !== 'all' ? ` from ${selectedCountry}` : ''}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cookies
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visitors.map((visitor, index) => (
                    <tr key={visitor._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {visitor.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(visitor.visitedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {visitor.email ? (
                          <span className="text-blue-600 font-medium">{visitor.email}</span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          visitor.cookiesAccepted 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {visitor.cookiesAccepted ? 'Accepted' : 'Declined'}
                        </span>
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
  );
};

export default VisitorsDashboard;