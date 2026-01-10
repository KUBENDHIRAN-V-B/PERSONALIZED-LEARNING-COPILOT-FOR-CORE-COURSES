import React, { useState, useEffect, useCallback } from 'react';
import { FiWifi, FiWifiOff, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';

interface ApiKey {
  id: string;
  name: string;
  key: string;
}

const APIStatusIndicator: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadApiKeys = useCallback(() => {
    const savedKeys = localStorage.getItem('api_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys(parsed);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error loading API keys:', error);
        setApiKeys([]);
      }
    } else {
      setApiKeys([]);
    }
  }, []);

  useEffect(() => {
    loadApiKeys();
    // Refresh every 30 seconds
    const interval = setInterval(loadApiKeys, 30000);
    return () => clearInterval(interval);
  }, [loadApiKeys]);

  const getStatusColor = (hasKey: boolean) => {
    return hasKey ? 'bg-green-500' : 'bg-gray-400';
  };

  const getStatusText = (hasKey: boolean) => {
    return hasKey ? 'Ready' : 'No Key';
  };

  const connectedAPIs = apiKeys.filter(key => key.key.trim()).length;
  const totalAPIs = apiKeys.length || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${connectedAPIs > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
            {connectedAPIs > 0 ? (
              <FiWifi className="text-green-600" size={18} />
            ) : (
              <FiWifiOff className="text-gray-600" size={18} />
            )}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">
              AI Services Status
            </div>
            <div className="text-xs text-gray-500">
              {connectedAPIs}/{totalAPIs} APIs configured
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status dots */}
          <div className="flex gap-1">
            {apiKeys.map((key, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${getStatusColor(!!key.key.trim())}`}
                title={`${key.name}: ${getStatusText(!!key.key.trim())}`}
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
              onClick={loadApiKeys}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <FiRefreshCw size={12} />
              Refresh
            </button>
          </div>

          {/* API List */}
          {apiKeys.length > 0 ? (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(!!key.key.trim())}`} />
                    <span className="text-sm font-medium text-gray-800">{key.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${
                      key.key.trim()
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {getStatusText(!!key.key.trim())}
                    </span>
                    <span className="text-gray-500">
                      {key.key.trim() ? 'Configured' : 'Missing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No API keys configured. Add keys in API Settings.
            </div>
          )}

          {/* Legend */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Ready</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span>No Key</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIStatusIndicator;