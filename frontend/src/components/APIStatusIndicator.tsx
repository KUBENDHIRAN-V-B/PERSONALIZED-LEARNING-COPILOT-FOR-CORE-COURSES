import React, { useState, useEffect, useCallback } from 'react';
import { FiWifi, FiWifiOff, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { statusAPI } from '../services/api';

interface APIInfo {
  connected: boolean;
  code: number;
  name: string;
  limit: string;
  rpm: string;
}

interface APIStatus {
  timestamp: string;
  apis: {
    gemini: APIInfo;
    openRouter: APIInfo;
    groq: APIInfo;
    cerebras: APIInfo;
  };
}

const APIStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<APIStatus | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await statusAPI.getStatus();
      setStatus(response.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch API status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const getConnectedCount = () => {
    if (!status) return 0;
    return Object.values(status.apis).filter(api => api.connected).length;
  };

  const getStatusColor = (api: APIInfo) => {
    if (api.connected) return 'bg-green-500';
    if (api.code === 429) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (api: APIInfo) => {
    if (api.connected) return 'Connected';
    if (api.code === 429) return 'Rate Limited';
    if (api.code === 401) return 'Invalid Key';
    return 'Offline';
  };

  const totalAPIs = status ? Object.keys(status.apis).length : 4;
  const connectedAPIs = getConnectedCount();

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${connectedAPIs > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            {connectedAPIs > 0 ? (
              <FiWifi className="text-green-600" size={18} />
            ) : (
              <FiWifiOff className="text-red-600" size={18} />
            )}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">
              AI Services Status
            </div>
            <div className="text-xs text-gray-500">
              {connectedAPIs}/{totalAPIs} APIs connected
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status dots */}
          <div className="flex gap-1">
            {status && Object.values(status.apis).map((api, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${getStatusColor(api)}`}
                title={`${api.name}: ${getStatusText(api)}`}
              />
            ))}
          </div>
          {expanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          {/* Refresh button */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdate?.toLocaleTimeString() || 'Never'}
            </span>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} size={12} />
              Refresh
            </button>
          </div>

          {/* API List */}
          <div className="space-y-2">
            {status && Object.entries(status.apis).map(([key, api]) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(api)}`} />
                  <span className="text-sm font-medium text-gray-800">{api.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${
                    api.connected 
                      ? 'bg-green-100 text-green-700' 
                      : api.code === 429 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {getStatusText(api)}
                  </span>
                  <span className="text-gray-500" title="Daily limit">
                    {api.limit}
                  </span>
                  <span className="text-gray-400" title="Requests per minute">
                    {api.rpm}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Connected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Rate Limited</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Offline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIStatusIndicator;
