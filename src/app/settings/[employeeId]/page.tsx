// src/app/settings/[employeeId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Footer from '@/app/components/footer';
import ProtectedEmployeeRoute from '@/components/ProtectedEmployeeRoute';
import NavbarDropdown from '@/app/Navbar/page';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Save,
  Loader,
  ArrowLeft,
  Building,
  UserCheck,
  Shield
} from 'lucide-react';

// Import Roboto font from Google Fonts using @next/font
import { Roboto } from 'next/font/google';

// Configure Roboto font
const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

interface Employee {
  _id: string;
  personalDetails?: {
    employeeId?: string;
    fullName?: string;
    department?: string;
    position?: string;
  };
  username?: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: Employee;
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = typeof params.employeeId === 'string' ? params.employeeId : '';

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      setError('Employee ID is missing.');
      return;
    }

    const loadEmployee = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccess('');

        const response = await fetch(
          `/api/settings?employeeId=${encodeURIComponent(employeeId)}`,
          { method: 'GET', cache: 'no-store' }
        );

        const text = await response.text();
        let result: ApiResponse = {};

        try {
          result = text ? JSON.parse(text) : {};
        } catch {
          console.error('Invalid GET response:', text);
          throw new Error(`Invalid server response (${response.status})`);
        }

        if (!response.ok) {
          throw new Error(result.error || `Failed to load settings (${response.status})`);
        }

        if (!result.data) {
          throw new Error('Employee data not found');
        }

        setEmployee(result.data);
        setUsername(result.data.username || '');
      } catch (error) {
        console.error('Load settings error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [employeeId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!employeeId) {
      setError('Employee ID is missing.');
      return;
    }
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!newPassword) {
      setError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (!confirmPassword) {
      setError('Please confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          employeeId,
          username: username.trim(),
          newPassword,
        }),
      });

      const text = await response.text();
      let result: ApiResponse = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        console.error('Invalid PUT response:', text);
        throw new Error(`Invalid server response (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(result.error || `Failed to update credentials (${response.status})`);
      }

      setSuccess(result.message || 'Username and password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');

      if (result.data) {
        setEmployee(result.data);
        setUsername(result.data.username || username.trim());
      }

      setTimeout(() => {
        router.push(`/dashboard/${employeeId}`);
      }, 1500);
    } catch (error) {
      console.error('Update credentials error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update credentials');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#0071BD] mx-auto mb-4" />
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center px-6 ${roboto.className}`}>
        <div className="bg-white shadow-sm p-8 max-w-lg w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Unable to Load Settings</h3>
          <p className="text-gray-600 mb-6 tracking-wide">{error || 'Employee not found'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              type="button" 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
            >
              Try Again
            </button>
            <button 
              type="button" 
              onClick={() => router.push(`/dashboard/${employeeId}`)} 
              className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <ProtectedEmployeeRoute allowedRole='employee'>
    <NavbarDropdown/>
    <div className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header - Same as Settings Page */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
                Account Settings
              </h1>
            </div>
            <div className="text-sm text-gray-500 tracking-wide">
              Update login credentials
            </div>
          </div>
        </div>

        {/* Message Alert - Same as Settings Page */}
        {success && (
          <div className="mb-6 p-4 flex items-start gap-3 bg-green-50 border border-green-200">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-700 tracking-wide">
                {success}
              </p>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 flex items-start gap-3 bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700 tracking-wide">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Settings Form - Same as Settings Page */}
        <div className="bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 tracking-wider">Login Credentials</h2>
            <p className="text-sm text-gray-500 tracking-wide mt-1">Update username and password</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Employee Information - Same as Settings Page */}
            <div className="bg-gray-50 p-4 border-l-4 border-[#0071BD]">
              <h3 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider mb-4">
                <User className="w-4 h-4" />
                Employee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm tracking-wide">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-800 mt-1">{employee.personalDetails?.fullName || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Employee ID</p>
                  <p className="font-medium text-gray-800 mt-1">{employee.personalDetails?.employeeId || employeeId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Department</p>
                  <p className="font-medium text-gray-800 mt-1 flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {employee.personalDetails?.department || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Username - Same as Settings Page */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                Username
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={saving}
                  autoComplete="username"
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide disabled:bg-gray-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 tracking-wide">
                Leave unchanged if you don&apos;t want to change the username
              </p>
            </div>

            {/* New Password - Same as Settings Page */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={saving}
                  autoComplete="new-password"
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full pl-10 pr-20 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={saving}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 tracking-wide">
                <AlertCircle className="w-3 h-3" />
                Password must contain at least 6 characters
              </div>
            </div>

            {/* Confirm Password - Same as Settings Page */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={saving}
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-20 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={saving}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Buttons - Same as Settings Page */}
            <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center justify-center gap-2 disabled:opacity-50 tracking-wider"
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Updating...' : 'Update Credentials'}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => router.push(`/dashboard/${employeeId}`)}
                className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Footer - Same as Settings Page */}
        <div className="mt-6 text-center text-xs text-gray-400 tracking-wide">
          <p>Employee account settings</p>
        </div>
      </div>
    </div>
    <Footer/>
    </ProtectedEmployeeRoute>
    </>
  );
}