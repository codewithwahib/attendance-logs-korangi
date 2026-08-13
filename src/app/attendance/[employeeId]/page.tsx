// src/app/attendance/[employeeId]/page.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Footer from '@/app/components/footer'
import NavbarDropdown from '@/app/Navbar/page'
import ProtectedEmployeeRoute from '@/components/ProtectedEmployeeRoute'
import { useParams, useRouter } from 'next/navigation'
import {
  LogIn,
  LogOut,
  Clock,
  Calendar,
  MapPin,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

// Import Roboto font
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

type AttendanceType = 'check-in' | 'check-out'

interface AttendanceRecord {
  _key: string
  time: string
  location: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface Employee {
  _id: string
  personalDetails: {
    employeeId: string
    fullName: string
    department: string
    position: string
  }
  checkIn?: AttendanceRecord[]
  checkOut?: AttendanceRecord[]
}

export default function AttendancePage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.employeeId as string

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState<AttendanceType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [todaysCheckIn, setTodaysCheckIn] = useState<AttendanceRecord | null>(null)
  const [todaysCheckOut, setTodaysCheckOut] = useState<AttendanceRecord | null>(null)
  const [fetchingEmployee, setFetchingEmployee] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Client-side only state for hydration
  const [isClient, setIsClient] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  // Set client flag and update time
  useEffect(() => {
    setIsClient(true)
    
    // Update date and time
    const updateDateTime = () => {
      const now = new Date()
      setCurrentDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      }))
    }
    
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    const savedCheckIn = localStorage.getItem(`checkIn_${employeeId}`)
    const savedCheckOut = localStorage.getItem(`checkOut_${employeeId}`)
    const savedDate = localStorage.getItem(`attendanceDate_${employeeId}`)
    const savedElapsedTime = localStorage.getItem(`elapsedTime_${employeeId}`)
    const savedTimerStartedAt = localStorage.getItem(`timerStartedAt_${employeeId}`)
    const today = new Date().toISOString().split('T')[0]

    // Only restore if the saved date matches today
    if (savedDate === today) {
      if (savedCheckIn) {
        try {
          const checkIn = JSON.parse(savedCheckIn)
          setTodaysCheckIn(checkIn)
        } catch (e) {
          console.error('Error parsing saved check-in:', e)
        }
      }
      if (savedCheckOut) {
        try {
          const checkOut = JSON.parse(savedCheckOut)
          setTodaysCheckOut(checkOut)
        } catch (e) {
          console.error('Error parsing saved check-out:', e)
        }
      }
      
      // Restore timer state
      if (savedTimerStartedAt) {
        const startedAt = parseInt(savedTimerStartedAt)
        setTimerStartedAt(startedAt)
        const now = Date.now()
        const elapsed = Math.floor((now - startedAt) / 1000)
        setElapsedTime(elapsed)
      } else if (savedElapsedTime) {
        setElapsedTime(parseInt(savedElapsedTime))
      }
    } else {
      // Clear old data if date changed
      localStorage.removeItem(`checkIn_${employeeId}`)
      localStorage.removeItem(`checkOut_${employeeId}`)
      localStorage.removeItem(`attendanceDate_${employeeId}`)
      localStorage.removeItem(`elapsedTime_${employeeId}`)
      localStorage.removeItem(`timerStartedAt_${employeeId}`)
    }
  }, [employeeId])

  // =====================================================
  // fetchEmployeeData - useCallback
  // =====================================================

  const fetchEmployeeData = useCallback(async () => {
    if (!employeeId) return

    try {
      setFetchingEmployee(true)
      const response = await fetch(`/api/employee/${employeeId}`)
      const data = await response.json()

      if (data.success && data.data) {
        setEmployee(data.data)
        
        // Check today's attendance from API
        const today = new Date().toISOString().split('T')[0]
        
        const todayCheckIn = data.data.checkIn?.find((record: AttendanceRecord) => 
          record.time.split('T')[0] === today
        )
        const todayCheckOut = data.data.checkOut?.find((record: AttendanceRecord) => 
          record.time.split('T')[0] === today
        )

        // Only update if localStorage doesn't have data or API has newer data
        const savedCheckIn = localStorage.getItem(`checkIn_${employeeId}`)
        const savedCheckOut = localStorage.getItem(`checkOut_${employeeId}`)
        const savedDate = localStorage.getItem(`attendanceDate_${employeeId}`)

        if (savedDate === today && savedCheckIn) {
          try {
            const parsed = JSON.parse(savedCheckIn)
            if (!todaysCheckIn) {
              setTodaysCheckIn(parsed)
            }
          } catch (e) {}
        } else if (todayCheckIn) {
          setTodaysCheckIn(todayCheckIn)
          localStorage.setItem(`checkIn_${employeeId}`, JSON.stringify(todayCheckIn))
          localStorage.setItem(`attendanceDate_${employeeId}`, today)
        }

        if (savedDate === today && savedCheckOut) {
          try {
            const parsed = JSON.parse(savedCheckOut)
            if (!todaysCheckOut) {
              setTodaysCheckOut(parsed)
            }
          } catch (e) {}
        } else if (todayCheckOut) {
          setTodaysCheckOut(todayCheckOut)
          localStorage.setItem(`checkOut_${employeeId}`, JSON.stringify(todayCheckOut))
          localStorage.setItem(`attendanceDate_${employeeId}`, today)
        }

        // Start timer if checked in but not checked out
        const checkIn = todayCheckIn || (savedCheckIn ? JSON.parse(savedCheckIn) : null)
        const checkOut = todayCheckOut || (savedCheckOut ? JSON.parse(savedCheckOut) : null)
        
        if (checkIn && !checkOut) {
          const savedStartedAt = localStorage.getItem(`timerStartedAt_${employeeId}`)
          if (savedStartedAt) {
            const startedAt = parseInt(savedStartedAt)
            setTimerStartedAt(startedAt)
            const now = Date.now()
            setElapsedTime(Math.floor((now - startedAt) / 1000))
          } else {
            const checkInTime = new Date(checkIn.time).getTime()
            const now = Date.now()
            const elapsed = Math.floor((now - checkInTime) / 1000)
            setElapsedTime(elapsed)
            setTimerStartedAt(checkInTime)
            localStorage.setItem(`timerStartedAt_${employeeId}`, String(checkInTime))
          }
        } else if (checkIn && checkOut) {
          const checkInTime = new Date(checkIn.time).getTime()
          const checkOutTime = new Date(checkOut.time).getTime()
          setElapsedTime(Math.floor((checkOutTime - checkInTime) / 1000))
          localStorage.removeItem(`timerStartedAt_${employeeId}`)
        }
      }
    } catch (error) {
      console.error('Error fetching employee:', error)
    } finally {
      setFetchingEmployee(false)
    }
  }, [employeeId])

  // =====================================================
  // useEffect - fetchEmployeeData
  // =====================================================

  useEffect(() => {
    fetchEmployeeData()
  }, [fetchEmployeeData])

  // Timer effect - persists across refresh
  useEffect(() => {
    if (todaysCheckIn && !todaysCheckOut) {
      // If timerStartedAt is not set, set it now
      if (!timerStartedAt) {
        const now = Date.now()
        const checkInTime = new Date(todaysCheckIn.time).getTime()
        const startTime = Math.max(now, checkInTime)
        setTimerStartedAt(startTime)
        localStorage.setItem(`timerStartedAt_${employeeId}`, String(startTime))
      }

      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1
          // Save to localStorage every second
          localStorage.setItem(`elapsedTime_${employeeId}`, String(newTime))
          return newTime
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      // Clear timer data when checked out
      if (todaysCheckOut) {
        localStorage.removeItem(`timerStartedAt_${employeeId}`)
        localStorage.removeItem(`elapsedTime_${employeeId}`)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [todaysCheckIn, todaysCheckOut, timerStartedAt, employeeId])

  // Save timer state on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (todaysCheckIn && !todaysCheckOut) {
        localStorage.setItem(`elapsedTime_${employeeId}`, String(elapsedTime))
        if (timerStartedAt) {
          localStorage.setItem(`timerStartedAt_${employeeId}`, String(timerStartedAt))
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [todaysCheckIn, todaysCheckOut, elapsedTime, timerStartedAt, employeeId])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleAttendance = (type: AttendanceType) => {
    if (!employeeId) {
      alert('Employee ID missing')
      return
    }

    // Check if already checked in/out today
    if (type === 'check-in' && todaysCheckIn) {
      alert('You have already checked in today!')
      return
    }

    if (type === 'check-out' && todaysCheckOut) {
      alert('You have already checked out today!')
      return
    }

    if (type === 'check-out' && !todaysCheckIn) {
      alert('Please check in first before checking out!')
      return
    }

    if (!navigator.geolocation) {
      alert('Location is not supported by this browser.')
      return
    }

    setLoading(type)
    setError(null)
    setSuccess(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          const location = `${latitude}, ${longitude}`

          const apiUrl = type === 'check-in' 
            ? '/api/attendance/check-in' 
            : '/api/attendance/check-out'

          console.log(`📤 Sending ${type} request to:`, apiUrl)
          console.log('📦 Request body:', { employeeId, location, latitude, longitude })

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              employeeId,
              location,
              latitude,
              longitude,
            }),
          })

          console.log(`📥 Response status:`, response.status)

          const contentType = response.headers.get('content-type') || ''

          if (!contentType.includes('application/json')) {
            const text = await response.text()
            console.error('❌ NON JSON RESPONSE:', text)
            throw new Error(`API returned ${response.status}: ${text.substring(0, 100)}`)
          }

          const data = await response.json()
          console.log('📥 Response data:', data)

          if (!response.ok || !data.success) {
            throw new Error(data.error || `${type} failed`)
          }

          // Update local state
          const now = new Date()
          const today = new Date().toISOString().split('T')[0]
          const newRecord = {
            _key: Date.now().toString(),
            time: now.toISOString(),
            location: location,
            coordinates: {
              lat: latitude,
              lng: longitude
            }
          }

          if (type === 'check-in') {
            setTodaysCheckIn(newRecord)
            setElapsedTime(0)
            const startTime = now.getTime()
            setTimerStartedAt(startTime)
            localStorage.setItem(`timerStartedAt_${employeeId}`, String(startTime))
            localStorage.setItem(`elapsedTime_${employeeId}`, '0')
            setSuccess('✅ Check In Successful!')
            localStorage.setItem(`checkIn_${employeeId}`, JSON.stringify(newRecord))
            localStorage.setItem(`attendanceDate_${employeeId}`, today)
          } else {
            setTodaysCheckOut(newRecord)
            if (todaysCheckIn) {
              const checkInTime = new Date(todaysCheckIn.time).getTime()
              const checkOutTime = now.getTime()
              const totalElapsed = Math.floor((checkOutTime - checkInTime) / 1000)
              setElapsedTime(totalElapsed)
              localStorage.setItem(`elapsedTime_${employeeId}`, String(totalElapsed))
            }
            setSuccess('✅ Check Out Successful!')
            localStorage.setItem(`checkOut_${employeeId}`, JSON.stringify(newRecord))
            localStorage.removeItem(`timerStartedAt_${employeeId}`)
          }

          setTimeout(() => {
            setSuccess(null)
          }, 3000)

        } catch (error) {
          console.error('❌ ATTENDANCE ERROR:', error)
          
          let errorMessage = 'Something went wrong'
          if (error instanceof Error) {
            errorMessage = error.message
          }
          
          setError(errorMessage)
          setTimeout(() => {
            setError(null)
          }, 5000)
        } finally {
          setLoading(null)
        }
      },
      (error) => {
        console.error('❌ LOCATION ERROR:', error)
        const errorMsg = error.code === 1
          ? 'Location permission denied. Please allow location access.'
          : error.code === 2
          ? 'Location is unavailable.'
          : error.code === 3
          ? 'Location request timed out.'
          : 'Unable to get your location.'
        setError(errorMsg)
        setTimeout(() => {
          setError(null)
        }, 3000)
        setLoading(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchEmployeeData()
    setIsRefreshing(false)
  }

  const getTimeDisplay = (timestamp: string) => {
    if (!timestamp) return '--:--:--'
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      })
    } catch {
      return '--:--:--'
    }
  }

  if (fetchingEmployee) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#0071BD] mx-auto mb-4" />
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
              <div>
                <h1 className="text-2xl font-bold text-[#0071BD] tracking-wider">
                  Mark Attendance
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {isClient && (
                  <div className="text-sm text-gray-500 tracking-wide flex items-center gap-2" suppressHydrationWarning>
                    <Calendar className="w-4 h-4" />
                    {currentDate}
                  </div>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-[#0071BD] ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-green-700 tracking-wide font-semibold">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700 tracking-wide font-semibold">Error</p>
                <p className="text-sm text-red-600 tracking-wide mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main Content */}
          <div className=" shadow-sm rounded-lg p-8">
            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="w-5 h-5 text-[#0071BD] flex-shrink-0" />
                <span className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                  {formatTime(elapsedTime)}
                </span>
                <span className="text-xs text-gray-500 tracking-wide">
                  {todaysCheckIn && !todaysCheckOut ? '⏱️ Working...' : todaysCheckOut ? '✅ Completed' : '⏸️ Not Started'}
                </span>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Check In Status */}
              <div className={`p-4 border-l-4 rounded-r-lg ${todaysCheckIn ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 tracking-wide">Check In Status</p>
                    <p className={`text-lg font-semibold tracking-wider ${todaysCheckIn ? 'text-green-700' : 'text-gray-500'}`}>
                      {todaysCheckIn ? '✅ Checked In' : 'Not Checked In'}
                    </p>
                    {todaysCheckIn && (
                      <p className="text-sm text-gray-600 tracking-wide mt-1">
                        Time: {getTimeDisplay(todaysCheckIn.time)}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${todaysCheckIn ? 'bg-green-100' : 'bg-gray-200'} flex-shrink-0`}>
                    <LogIn className={`w-6 h-6 ${todaysCheckIn ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                </div>
              </div>

              {/* Check Out Status */}
              <div className={`p-4 border-l-4 rounded-r-lg ${todaysCheckOut ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 tracking-wide">Check Out Status</p>
                    <p className={`text-lg font-semibold tracking-wider ${todaysCheckOut ? 'text-red-700' : 'text-gray-500'}`}>
                      {todaysCheckOut ? '✅ Checked Out' : 'Not Checked Out'}
                    </p>
                    {todaysCheckOut && (
                      <p className="text-sm text-gray-600 tracking-wide mt-1">
                        Time: {getTimeDisplay(todaysCheckOut.time)}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${todaysCheckOut ? 'bg-red-100' : 'bg-gray-200'} flex-shrink-0`}>
                    <LogOut className={`w-6 h-6 ${todaysCheckOut ? 'text-red-600' : 'text-gray-400'}`} />
                  </div>
                </div>
              </div>
            </div>

            
            {/* Check In/Out Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              {/* Check In Button */}
              <button
                onClick={() => handleAttendance('check-in')}
                disabled={loading !== null || !!todaysCheckIn}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                  todaysCheckIn
                    ? 'bg-green-100 cursor-not-allowed border-4 border-green-500'
                    : loading === 'check-in'
                    ? 'bg-green-300 cursor-wait'
                    : 'bg-gradient-to-br from-green-500 to-green-600 hover:shadow-xl text-white'
                }`}
              >
                {loading === 'check-in' ? (
                  <Loader className="w-8 h-8 text-white animate-spin" />
                ) : todaysCheckIn ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <span className="text-xs font-medium text-green-700 mt-1 tracking-wide">Done</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-8 h-8" />
                    <span className="text-sm font-semibold mt-1 tracking-wide">Check In</span>
                  </>
                )}
              </button>

              {/* Check Out Button */}
              <button
                onClick={() => handleAttendance('check-out')}
                disabled={loading !== null || !!todaysCheckOut || !todaysCheckIn}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                  todaysCheckOut
                    ? 'bg-red-100 cursor-not-allowed border-4 border-red-500'
                    : !todaysCheckIn
                    ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                    : loading === 'check-out'
                    ? 'bg-red-300 cursor-wait'
                    : 'bg-gradient-to-br from-red-500 to-red-600 hover:shadow-xl text-white'
                }`}
              >
                {loading === 'check-out' ? (
                  <Loader className="w-8 h-8 text-white animate-spin" />
                ) : todaysCheckOut ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-red-600" />
                    <span className="text-xs font-medium text-red-700 mt-1 tracking-wide">Done</span>
                  </>
                ) : !todaysCheckIn ? (
                  <>
                    <LogOut className="w-8 h-8" />
                    <span className="text-xs font-medium mt-1 tracking-wide">Check In First</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-8 h-8" />
                    <span className="text-sm font-semibold mt-1 tracking-wide">Check Out</span>
                  </>
                )}
              </button>
            </div>

            {/* Time Display */}
            {isClient && (
              <div className="mt-8 text-center" suppressHydrationWarning>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 tracking-wide">
                    Current Time: {currentTime}
                  </span>
                </div>
              </div>
            )}
          </div>

          
        </div>
      </div>
      <Footer/>
      </ProtectedEmployeeRoute>
    </>
  )
}