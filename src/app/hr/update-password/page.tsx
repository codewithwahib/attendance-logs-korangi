// src/app/hr/update-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Footer from '@/app/components/footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import NavbarDropdown from '@/app/components/navbar/page'
import {
  Lock,
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Save,
  RefreshCw,
  Loader,
  User,
  Shield
} from 'lucide-react'

// Import Roboto font
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

interface Login {
  _id: string
  username: string
  password: string
}

export default function UpdatePasswordPage() {
  const [login, setLogin] = useState<Login | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    adminId: '',
    username: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  useEffect(() => {
    fetchLoginData()
  }, [])

  const fetchLoginData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/hr/update-password', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch login data')
      }

      const loginData = result.data[0]

      if (loginData) {
        setLogin(loginData)
        setFormData({
          adminId: loginData._id,
          username: loginData.username || '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setError('No login found')
      }

    } catch (err) {
      console.error('Error fetching login:', err)
      setError(err instanceof Error ? err.message : 'Failed to load login data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.adminId) {
      setMessage({ type: 'error', text: 'Login ID is missing. Please refresh.' })
      return
    }

    if (!formData.newPassword) {
      setMessage({ type: 'error', text: 'Please enter a new password' })
      return
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    try {
      setUpdating(true)
      setMessage(null)

      const response = await fetch('/api/hr/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: formData.adminId,
          username: formData.username || undefined,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update password')
      }

      setMessage({
        type: 'success',
        text: result.message || 'Password updated successfully!'
      })

      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }))

      if (result.data) {
        setLogin(result.data)
      }

    } catch (err) {
      console.error('Error updating password:', err)
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update password'
      })
    } finally {
      setUpdating(false)
    }
  }

  const clearMessage = () => {
    setMessage(null)
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#0071BD] mx-auto mb-4" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
        <div className="text-center bg-white p-8 shadow-md max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Error</h3>
          <p className="text-gray-600 mb-4 tracking-wide">{error}</p>
          <button
            onClick={fetchLoginData}
            className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
    <ProtectedRoute allowedUser='hr'>
      <NavbarDropdown />
      <div className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header - Settings Page Style */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
                  Update Password
                </h1>
              </div>
              <div className="text-sm text-gray-500 tracking-wide">
                Change your login password
              </div>
            </div>
          </div>

          {/* Login Info Card - Settings Page Style */}
          {/* {login && (
            <div className="bg-white shadow-sm p-4 mb-6 border-l-4 border-[#0071BD]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#0071BD] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {login.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 tracking-wide">
                    {login.username}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 tracking-wide">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {login.username}
                    </span>
                    <span className="w-1 h-1 bg-gray-300"></span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-purple-600" />
                      <span className="text-purple-600 font-medium">Login Account</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Message Alert - Settings Page Style */}
          {message && (
            <div className={`mb-6 p-4 flex items-start gap-3 ${
              message.type === 'success' ? 'bg-green-50 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
              ) : message.type === 'error' ? (
                <X className="w-5 h-5 text-red-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm ${
                  message.type === 'success' ? 'text-green-700' :
                  message.type === 'error' ? 'text-red-700' :
                  'text-blue-700'
                } tracking-wide`}>
                  {message.text}
                </p>
              </div>
              <button
                onClick={clearMessage}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Password Change Form - Settings Page Style */}
          <div className="bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 tracking-wide flex items-center gap-2">
              <Key className="w-5 h-5 text-[#0071BD]" />
              Change Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({
                      ...formData,
                      username: e.target.value
                    })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none tracking-wide"
                    placeholder="Enter username"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 tracking-wide">
                  Leave unchanged if you don&apos;t want to change the username
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({
                      ...formData,
                      newPassword: e.target.value
                    })}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none tracking-wide"
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 tracking-wide">
                  <AlertCircle className="w-3 h-3" />
                  Password must be at least 6 characters long
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({
                      ...formData,
                      confirmPassword: e.target.value
                    })}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none tracking-wide"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Buttons - Settings Page Style */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center justify-center gap-2 disabled:opacity-50 tracking-wider"
                >
                  {updating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {updating ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      newPassword: '',
                      confirmPassword: ''
                    })
                    setMessage(null)
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Footer - Settings Page Style */}
          <div className="mt-6 text-center text-xs text-gray-400 tracking-wide">
            <p>Login password management</p>
          </div>
        </div>
      </div>
      <Footer/>
      </ProtectedRoute>
    </>
  )
}