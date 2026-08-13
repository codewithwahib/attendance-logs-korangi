'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Roboto } from 'next/font/google'
import { Loader, AlertCircle, User, Lock, Building, ArrowRight, Calendar, Clock, Eye, EyeOff } from 'lucide-react'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const employeeData = localStorage.getItem('employeeData')
    if (employeeData) {
      try {
        const data = JSON.parse(employeeData)
        if (data.employeeId) {
          router.push(`/dashboard/${data.employeeId}`)
        }
      } catch (e) {
        console.error('Error parsing employee data:', e)
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/employee-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError('Invalid username or password')
        setIsLoading(false)
        return
      }

      // Save employee data to localStorage
      localStorage.setItem('employeeData', JSON.stringify({
        employeeId: data.employeeId,
        fullName: data.fullName,
        department: data.department,
        position: data.position,
        role: 'employee',
        loginTime: new Date().toISOString()
      }))

      // Redirect to employee dashboard
      router.push(`/dashboard/${data.employeeId}`)
      
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${roboto.className}`}>
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-56 h-28">
              <Image
                src="/logo.png"
                alt="Company Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
            Employee Login
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 tracking-wide mb-2">
                Username
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field with Eye Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 tracking-wide">{error}</p>
              </div>
            )}

            {/* Submit Button - Now shows loading spinner inside button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center justify-center gap-2 tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Footer */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-xs text-gray-400 tracking-wide">
                © 2026 All rights reserved
              </p>
              <p className="text-[11px] text-gray-400 tracking-wide">
                System and Software generated by{' '}
                <span className="font-medium text-[#0071BD]">Muhammad Hassan Jaffer</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}