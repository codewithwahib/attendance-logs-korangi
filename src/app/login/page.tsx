'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import { Roboto } from 'next/font/google'
import { Loader, AlertCircle, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(username, password)
      
      if (success) {
        router.push('/hr/dashboard')
      } else {
        setError('Invalid username or password')
      }
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
          <h1 className={`text-3xl font-bold text-[#0071BD] tracking-wider ${roboto.className}`}>
            HR Login
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 tracking-wide mb-2 ${roboto.className}`}>
                Username
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm bg-white text-gray-900 placeholder-gray-400 ${roboto.className}`}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field with Eye Button */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 tracking-wide mb-2 ${roboto.className}`}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm bg-white text-gray-900 placeholder-gray-400 ${roboto.className}`}
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
              <div className={`bg-red-50 border border-red-200 p-3 flex items-start gap-2 ${roboto.className}`}>
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className={`text-sm text-red-700 tracking-wide ${roboto.className}`}>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center justify-center gap-2 tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${roboto.className}`}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span className={roboto.className}>Signing in...</span>
                </>
              ) : (
                <>
                  <span className={roboto.className}>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Footer */}
            <div className="mt-6 text-center space-y-2">
              <p className={`text-xs text-gray-400 tracking-wide ${roboto.className}`}>
                © 2026 All rights reserved
              </p>
              <p className={`text-[11px] text-gray-400 tracking-widest ${roboto.className}`}>
                System and Software generated by{' '}
                <span className={`font-medium text-[#0071BD] tracking-widest ${roboto.className}`}>
                  Muhammad Hassan Jaffer
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}