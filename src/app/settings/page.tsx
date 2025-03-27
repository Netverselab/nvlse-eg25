'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiSearch, FiShield, FiGlobe, FiDownload, FiMonitor, FiClock, FiLock, FiKey, FiEye } from 'react-icons/fi';
import { FiTrash2 } from 'react-icons/fi';
import { FiCheck } from 'react-icons/fi';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [activeSection, setActiveSection] = useState('privacy');
  const [cookiesEnabled, setCookiesEnabled] = useState(true);
  const [trackingProtection, setTrackingProtection] = useState(true);
  const [searchHistory, setSearchHistory] = useState(true);
  const [historyRange, setHistoryRange] = useState('5');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [autoTranslate, setAutoTranslate] = useState(true);

  useEffect(() => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/auto-delete-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days: parseInt(historyRange) })
        });

        if (!response.ok) {
          throw new Error('Failed to process auto-delete');
        }
      } catch (error) {
        console.error('Auto-delete check failed:', error);
      }
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(checkInterval);
  }, [historyRange]);

  const renderContent = () => {
    if (activeSection === 'language') {
      return (
        <section>
          <h2 className="text-xl font-semibold mb-6">Language Settings</h2>
          <div className="space-y-4">
            {/* Primary Language Selection */}
            <div className="bg-[#2B2C32] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <FiGlobe className="w-4 h-4" />
                    Display Language
                  </h3>
                  <p className="text-sm text-gray-400">Choose your preferred language for the interface</p>
                  <div className="mt-4">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-[#1E1F24] text-white px-4 py-2 rounded border border-gray-700 focus:outline-none focus:border-purple-500"
                    >
                      <option value="en">English</option>
                      <option value="zh">中文 (Chinese)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="ar">العربية (Arabic)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                      <option value="pt">Português (Portuguese)</option>
                      <option value="ru">Русский (Russian)</option>
                      <option value="ja">日本語 (Japanese)</option>
                      <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                      <option value="de">Deutsch (German)</option>
                      <option value="jv">Basa Jawa (Javanese)</option>
                      <option value="ko">한국어 (Korean)</option>
                      <option value="fr">Français (French)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="mr">मराठी (Marathi)</option>
                      <option value="tr">Türkçe (Turkish)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="vi">Tiếng Việt (Vietnamese)</option>
                      <option value="ur">اردو (Urdu)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-translate Toggle */}
            <div className="bg-[#2B2C32] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <FiCheck className="w-4 h-4" />
                    Auto-translate Search Results
                  </h3>
                  <p className="text-sm text-gray-400">Automatically translate search results to your preferred language</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={autoTranslate}
                    onChange={(e) => setAutoTranslate(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="mt-8 flex justify-end">
              <button 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/save-language-settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        language: selectedLanguage,
                        autoTranslate: autoTranslate
                      })
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to save language settings');
                    }
                    
                    // Update the HTML lang attribute
                    document.documentElement.lang = selectedLanguage;
                    
                    console.log('Language settings saved');
                  } catch (error) {
                    console.error('Failed to save settings:', error);
                  }
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </section>
      );
    }
    if (activeSection === 'privacy') {
      return (
        <section>
          <h2 className="text-xl font-semibold mb-6">Privacy and Security</h2>
          <div className="space-y-4">
            {/* Automatic History Management */}
            <div className="bg-[#2B2C32] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    Automatic History Management
                  </h3>
                  <p className="text-sm text-gray-400">Your search history is automatically deleted after the selected period</p>
                  <div className="mt-4">
                    <select
                      value={historyRange}
                      onChange={(e) => setHistoryRange(e.target.value)}
                      className="bg-[#1E1F24] text-white px-4 py-2 rounded border border-gray-700 focus:outline-none focus:border-purple-500"
                    >
                      <option value="5">5 days</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-purple-400 flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  {historyRange} Days
                </div>
              </div>
            </div>
          
            {/* Save Search History */}
            <div className="bg-[#2B2C32] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <FiKey className="w-4 h-4" />
                    Save Search History
                  </h3>
                  <p className="text-sm text-gray-400">Keep record of your search activities</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={searchHistory}
                    onChange={(e) => setSearchHistory(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          
            <div className="bg-[#2B2C32] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <FiLock className="w-4 h-4" />
                    Cookies and Site Data
                  </h3>
                  <p className="text-sm text-gray-400">Allow sites to save and read cookie data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={cookiesEnabled}
                    onChange={(e) => setCookiesEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
            
            <div className="bg-[#2B2C32] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <FiEye className="w-4 h-4" />
                    Enhanced Tracking Protection
                  </h3>
                  <p className="text-sm text-gray-400">Block trackers and maintain your privacy while browsing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={trackingProtection}
                    onChange={(e) => setTrackingProtection(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
            
            {/* Save Settings Button */}
            <div className="mt-8 flex justify-end">
              <button 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                onClick={() => {
                  // Add your save settings logic here
                  console.log('Settings saved');
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </section>
      );
    }
    // Return notifications section as default
    return (
      <section>
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="bg-[#2B2C32] p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">Email Notifications</h3>
              <p className="text-sm text-gray-400">Receive updates about your search history and preferences</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-[#1E1F24] text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 h-screen bg-[#2B2C32] p-4 fixed left-0">
          <div className="flex items-center gap-2 mb-6">
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          
          <div className="space-y-1">
            <button 
              className={`w-full text-left px-4 py-2 rounded flex items-center gap-3 ${
                activeSection === 'search' ? 'bg-[#34353A] text-white' : 'text-gray-300 hover:bg-[#34353A]'
              }`}
              onClick={() => setActiveSection('search')}
            >
              <FiSearch className="w-5 h-5" />
              <span>Search Settings</span>
            </button>
            <button 
              className={`w-full text-left px-4 py-2 rounded flex items-center gap-3 ${
                activeSection === 'privacy' ? 'bg-[#34353A] text-white' : 'text-gray-300 hover:bg-[#34353A]'
              }`}
              onClick={() => setActiveSection('privacy')}
            >
              <FiShield className="w-5 h-5" />
              <span>Privacy and Security</span>
            </button>
            <button 
              className={`w-full text-left px-4 py-2 rounded flex items-center gap-3 ${
                activeSection === 'language' ? 'bg-[#34353A] text-white' : 'text-gray-300 hover:bg-[#34353A]'
              }`}
              onClick={() => setActiveSection('language')}
            >
              <FiGlobe className="w-5 h-5" />
              <span>Language</span>
            </button>
            <button className="w-full text-left px-4 py-2 rounded flex items-center gap-3 text-gray-300 hover:bg-[#34353A]">
              <FiDownload className="w-5 h-5" />
              <span>Downloads</span>
            </button>
            <button className="w-full text-left px-4 py-2 rounded flex items-center gap-3 text-gray-300 hover:bg-[#34353A]">
              <FiMonitor className="w-5 h-5" />
              <span>Appearance</span>
            </button>
            <button className="w-full text-left px-4 py-2 rounded flex items-center gap-3 text-gray-300 hover:bg-[#34353A]">
              <FiClock className="w-5 h-5" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 p-8 w-full">
          <div className="max-w-3xl">
            <div className="mb-8">
              <Link 
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Search
              </Link>
            </div>

            {/* Dynamic Settings Content */}
            <div className="space-y-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
