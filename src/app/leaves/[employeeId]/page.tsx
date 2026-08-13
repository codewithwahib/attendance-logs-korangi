// src/app/leave-request/[employeeId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import NavbarDropdown from '@/app/Navbar/page'
import ProtectedEmployeeRoute from '@/components/ProtectedEmployeeRoute'
import Footer from '@/app/components/footer'
import { useParams, useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  User,
  Building,
  FileText,
  MessageCircle,
  AlertCircle,
  Check,
  X,
  Loader,
  ArrowLeft
} from 'lucide-react'

// Import Roboto font
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

interface Employee {
  _id: string
  personalDetails: {
    employeeId: string
    fullName: string
    department?: string
    position?: string
  }
}

export default function LeaveRequestPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = typeof params.employeeId === 'string' ? params.employeeId : ''

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    department: '',
    position: '',
    leaveType: '',
    fromDate: '',
    toDate: '',
    totalDays: 0,
    reason: '',
  })

  useEffect(() => {
    if (!employeeId) {
      setError('Employee ID is missing.')
      setLoading(false)
      return
    }

    const fetchEmployee = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/leaves?employeeId=${encodeURIComponent(employeeId)}`,
          { method: 'GET', cache: 'no-store' }
        )

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to load employee')
        }

        if (!result.data) {
          throw new Error('Employee data not found')
        }

        setEmployee(result.data)
        setFormData((prev) => ({
          ...prev,
          employeeName: result.data?.personalDetails?.fullName || '',
          employeeId: result.data?.personalDetails?.employeeId || employeeId,
          department: result.data?.personalDetails?.department || '',
          position: result.data?.personalDetails?.position || '',
        }))
      } catch (err) {
        console.error('Employee loading error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load employee')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
  }, [employeeId])

  const calculateTotalDays = (from: string, to: string) => {
    if (!from || !to) return 0
    const fromDate = new Date(`${from}T00:00:00`)
    const toDate = new Date(`${to}T00:00:00`)
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return 0
    if (toDate < fromDate) return 0
    const diffTime = toDate.getTime() - fromDate.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      if (name === 'fromDate' || name === 'toDate') {
        const from = name === 'fromDate' ? value : prev.fromDate
        const to = name === 'toDate' ? value : prev.toDate
        newData.totalDays = calculateTotalDays(from, to)
      }
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!formData.employeeId) {
      setError('Employee ID is missing.')
      return
    }
    if (!formData.leaveType) {
      setError('Please select a leave type.')
      return
    }
    if (!formData.fromDate) {
      setError('Please select from date.')
      return
    }
    if (!formData.toDate) {
      setError('Please select to date.')
      return
    }
    if (formData.totalDays <= 0) {
      setError('To date must be equal to or after from date.')
      return
    }
    if (!formData.reason.trim()) {
      setError('Please provide a reason for leave.')
      return
    }
    if (formData.reason.trim().length < 20) {
      setError('Please provide a detailed reason (minimum 20 characters).')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          employeeName: formData.employeeName,
          department: formData.department,
          position: formData.position,
          leaveType: formData.leaveType,
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          totalDays: formData.totalDays,
          reason: formData.reason.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit leave request')
      }

      setSuccess(true)
      setFormData((prev) => ({ ...prev, leaveType: '', fromDate: '', toDate: '', totalDays: 0, reason: '' }))

      setTimeout(() => {
        router.push(`/dashboard/${employeeId}`)
      }, 2000)
    } catch (err) {
      console.error('Leave submit error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit leave request')
    } finally {
      setSubmitting(false)
    }
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

  if (error && !employee) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
        <div className="text-center bg-white shadow-sm p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Error</h3>
          <p className="text-gray-600 mb-4 tracking-wide">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
    <ProtectedEmployeeRoute allowedRole='employee'>
    <NavbarDropdown/>
      <div className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                
                <div>
                  <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
                    Leave Request
                  </h1>
                  
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 flex items-start gap-3 bg-green-50 border border-green-200">
              <Check className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-700 tracking-wide font-semibold">
                  ✅ Leave Request Submitted Successfully!
                </p>
                <p className="text-sm text-green-600 tracking-wide">Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && employee && (
            <div className="mb-6 p-4 flex items-start gap-3 bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700 tracking-wide font-semibold">❌ Error</p>
                <p className="text-sm text-red-600 tracking-wide mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 tracking-wider flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0071BD]" />
                Leave Application
              </h2>
              <p className="text-sm text-gray-500 tracking-wide mt-1">Submit a new leave request</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Employee Information */}
              <div className="bg-gray-50 p-4 border-l-4 border-[#0071BD]">
                <h3 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider mb-4">
                  <User className="w-4 h-4" />
                  Employee Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm tracking-wide">
                  <div>
                    <p className="text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-800 mt-1">{formData.employeeName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Employee ID</p>
                    <p className="font-medium text-gray-800 mt-1">{formData.employeeId || employeeId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p className="font-medium text-gray-800 mt-1 flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {formData.department || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Position</p>
                    <p className="font-medium text-gray-800 mt-1">{formData.position || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div>
                <h3 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider mb-4">
                  <Calendar className="w-4 h-4" />
                  Leave Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                      Leave Type *
                    </label>
                    <select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide disabled:bg-gray-100"
                    >
                      <option value="">Select Leave Type</option>
                      <option value="Annual Leave">Annual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Emergency Leave">Emergency Leave</option>
                      <option value="Maternity Leave">Maternity Leave</option>
                      <option value="Paternity Leave">Paternity Leave</option>
                      <option value="Study Leave">Study Leave</option>
                      <option value="Unpaid Leave">Unpaid Leave</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                      Total Days
                    </label>
                    <input
                      type="number"
                      value={formData.totalDays}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed shadow-sm tracking-wide"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                      From Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="fromDate"
                        value={formData.fromDate}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                      To Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="toDate"
                        value={formData.toDate}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        min={formData.fromDate || undefined}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                  Reason for Leave *
                </label>
                <div className="relative">
                  <MessageCircle className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    rows={4}
                    placeholder="Please provide detailed reason (minimum 20 characters)"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide resize-none disabled:bg-gray-100"
                  />
                </div>
                <p className={`text-xs mt-1 tracking-wide ${formData.reason.length < 20 ? 'text-gray-500' : 'text-green-600'}`}>
                  {formData.reason.length}/20 characters minimum
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center justify-center gap-2 disabled:opacity-50 tracking-wider"
                >
                  {submitting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {submitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => router.push(`/dashboard/${employeeId}`)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-400 tracking-wide">
            <p>Leave request management</p>
          </div>
        </div>
      </div>
      <Footer/>
      </ProtectedEmployeeRoute>
    </>
  )
}