'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Mail, User, EyeOff, Phone } from 'lucide-react';
import BindAccountToggle from './BindAccountToggle';
import { account } from '@/app/appwrite';

interface AccountSettingsFormProps {
  user: any;
  userPrefs: any;
}

export default function AccountSettingsForm({ user, userPrefs }: AccountSettingsFormProps) {
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Update form fields when user data is loaded
  useEffect(() => {
    if (user) {
      setFullname(user.name || '');
      setEmail(user.email || '');
    }
    if (userPrefs) {
      setPhone(userPrefs.phone || '');
    }
  }, [user, userPrefs]);

  const handleSave = async () => {
    setLoading(true);
    setSaveMessage('');
    
    try {
      // Update user name and email through Appwrite
      await account.updateName(fullname);
      await account.updateEmail(email, 'current-password'); // Note: This might require password
      
      // Update phone in preferences
      await account.updatePrefs({ 
        ...userPrefs, 
        phone: phone 
      });
      
      setSaveMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fullname
          </label>
          <div className="relative">
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {/* Save message */}
        {saveMessage && (
          <div className={`p-3 rounded-lg text-sm ${
            saveMessage.includes('Error') 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {saveMessage}
          </div>
        )}

        <Button 
          className="w-full mt-4" 
          onClick={handleSave}
          
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {/* Social Bind */}
      <div className="mt-8 space-y-4">
        <h3 className="font-semibold text-lg">Bind Account</h3>
        <BindAccountToggle provider="Facebook" />
        <BindAccountToggle provider="Google" defaultChecked />
      </div>
    </>
  );
}