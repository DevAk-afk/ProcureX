import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../lib/api.js';
import { Settings, Shield, Lock, User, Building, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', { name, department, phone });
      if (res.data.success) {
        success('Profile Updated', 'Your user profile details have been saved.');
        refreshUser();
      }
    } catch (err: any) {
      error('Update failed', err.response?.data?.message || err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        success('Password Changed', 'Your password has been successfully updated.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      error('Password change failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
          Settings & Enterprise Preferences
        </h1>
        <p className="text-xs sm:text-sm text-procure-muted mt-1">
          Manage your user account profile, security credentials, and organization tax settings.
        </p>
      </div>

      {/* Indian Business & GST Support Banner */}
      <div className="bg-white border border-procure-border rounded-2xl p-6 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-base text-slate-800">
            Indian Business & Statutory Compliance Configuration
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Primary Currency</span>
            <span className="font-bold text-slate-800 text-sm">INR (₹ Indian Rupee)</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-400 block text-[11px]">GST Slabs Configured</span>
            <span className="font-bold text-slate-800 text-sm">CGST 9% + SGST 9% / IGST 18%</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-400 block text-[11px]">MSME Statutory Rule</span>
            <span className="font-bold text-teal-700 text-sm">45-Day Payment Deadline</span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white border border-procure-border rounded-2xl p-6 shadow-card space-y-4">
        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" /> User Profile Information
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Role</label>
            <input
              type="text"
              disabled
              value={user?.role}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-bold text-teal-800 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="bg-white border border-procure-border rounded-2xl p-6 shadow-card space-y-4">
        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
          <Lock className="w-5 h-5 text-teal-600" /> Security & Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
