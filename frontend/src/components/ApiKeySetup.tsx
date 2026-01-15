import React, { useState, useEffect } from 'react';
import { FiKey, FiEye, FiEyeOff, FiCheck, FiPlus, FiTrash2, FiDownload, FiUpload } from 'react-icons/fi';

interface ApiKeySetupProps {
  onKeysSet: () => void;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeysSet }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load existing keys from localStorage
    const savedKeys = localStorage.getItem('api_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys(parsed);
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    }
  }, []);

  const addApiKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: '',
      key: ''
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const updateApiKey = (id: string, field: 'name' | 'key', value: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, [field]: value } : key
    ));
  };

  const removeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    const newShowKeys = { ...showKeys };
    delete newShowKeys[id];
    setShowKeys(newShowKeys);
  };

  const toggleShowKey = (id: string) => {
    setShowKeys({ ...showKeys, [id]: !showKeys[id] });
  };

  const handleSave = () => {
    const validKeys = apiKeys.filter(key => key.name.trim() && key.key.trim());
    
    if (validKeys.length === 0) {
      alert('Please add at least one API key');
      return;
    }

    setSaving(true);
    
    // Save to localStorage
    localStorage.setItem('api_keys', JSON.stringify(validKeys));

    setTimeout(() => {
      setSaving(false);
      onKeysSet();
    }, 1000);
  };

  const hasValidKeys = () => {
    return apiKeys.some(key => key.name.trim() && key.key.trim());
  };

  const handleExport = () => {
    const validKeys = apiKeys.filter(key => key.name.trim() && key.key.trim());
    if (validKeys.length === 0) {
      alert('No API keys to export');
      return;
    }

    const dataStr = JSON.stringify(validKeys, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-keys-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported) && imported.length > 0) {
            // Validate structure
            const valid = imported.every((key: any) => 
              typeof key === 'object' && 
              (key.name || key.key) &&
              (key.id || key.name || key.key)
            );
            
            if (valid) {
              // Add IDs if missing
              const withIds = imported.map((key: any, idx: number) => ({
                id: key.id || `${Date.now()}-${idx}`,
                name: key.name || '',
                key: key.key || ''
              }));
              setApiKeys(withIds);
              alert(`Successfully imported ${withIds.length} API key(s)`);
            } else {
              alert('Invalid file format. Please ensure the file contains valid API key data.');
            }
          } else {
            alert('No valid API keys found in the file.');
          }
        } catch (error) {
          alert('Error reading file. Please ensure it is a valid JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiKey className="text-2xl text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup AI API Keys</h1>
          <p className="text-gray-600 text-sm">
            Add your AI API keys to start using the learning features
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900">API Key {apiKeys.indexOf(apiKey) + 1}</h3>
                {apiKeys.length > 1 && (
                  <button
                    onClick={() => removeApiKey(apiKey.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    value={apiKey.name}
                    onChange={(e) => updateApiKey(apiKey.id, 'name', e.target.value)}
                    placeholder="e.g., OpenAI, Gemini, Claude"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys[apiKey.id] ? 'text' : 'password'}
                      value={apiKey.key}
                      onChange={(e) => updateApiKey(apiKey.id, 'key', e.target.value)}
                      placeholder="Enter your API key"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(apiKey.id)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showKeys[apiKey.id] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={addApiKey}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <FiPlus size={16} />
            Add Another API Key
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={!hasValidKeys()}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              title="Export API keys to transfer to another device"
            >
              <FiDownload size={16} />
              Export
            </button>
            <button
              onClick={handleImport}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              title="Import API keys from another device"
            >
              <FiUpload size={16} />
              Import
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={!hasValidKeys() || saving}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiCheck />
                Save & Continue
              </>
            )}
          </button>
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Device-Specific Storage:</strong> API keys are stored locally in your browser and are device-specific. Use the Export/Import buttons above to transfer keys between devices or browsers.
            </p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Privacy & Security:</strong> Your API keys are sent directly to the AI providers and are never stored on our servers. Keep your exported files secure and never share them publicly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetup;