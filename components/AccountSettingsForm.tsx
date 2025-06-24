'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Mail, User, EyeOff } from 'lucide-react';
import BindAccountToggle from './BindAccountToggle';

export default function AccountSettingsForm() {
  const [fullname, setFullname] = useState('Rita');
  const [phone, setPhone] = useState('+234804894838');
  const [email, setEmail] = useState('ritasteven90@gmail.com');

  const handleSave = () => {
    // TODO: send to Appwrite or your backend
    console.log({ fullname, phone, email });
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <label>Fullname</label>
          <div className="relative">
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="pl-10"
            />
            <User className="absolute left-2 top-2.5 text-gray-400 h-5 w-5" />
          </div>
        </div>

        <div>
          <label>Phone Number</label>
          <div className="relative">
            <input
              value={phone}
              disabled
              className="pl-10 bg-gray-100 cursor-not-allowed"
            />
            <EyeOff className="absolute left-2 top-2.5 text-gray-400 h-5 w-5" />
          </div>
        </div>

        <div>
          <label>Email</label>
          <div className="relative">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
            <Mail className="absolute left-2 top-2.5 text-gray-400 h-5 w-5" />
          </div>
        </div>

        <Button className="w-full mt-2" onClick={handleSave}>
          Save
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
