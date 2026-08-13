// app/hr/attendance/page.tsx
'use client'

import { useState, useEffect } from 'react'
import NavbarDropdown from '@/app/components/navbar/page'
import { client } from '@/sanity/lib/client'
import ProtectedRoute from '@/components/ProtectedRoute'
import Footer from '@/app/components/footer'
import { format, formatDistanceToNow, isWithinInterval, parseISO } from 'date-fns'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Building,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Loader,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  Globe,
  X
} from 'lucide-react'

// Import Roboto font from Google Fonts using @next/font
import { Roboto } from 'next/font/google'

// Configure Roboto font
const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

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
    phoneNumber: string
  }
  checkIn: AttendanceRecord[]
  checkOut: AttendanceRecord[]
}

export default function HRAttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [fromDate, setFromDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month' | 'all'>('today')
  const [departments, setDepartments] = useState<string[]>([])
  const [showMap, setShowMap] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const query = `
        *[_type == "employee"] {
          _id,
          personalDetails {
            employeeId,
            fullName,
            department,
            position,
            phoneNumber
          },
          checkIn[] {
            _key,
            time,
            location,
            coordinates {
              lat,
              lng
            }
          },
          checkOut[] {
            _key,
            time,
            location,
            coordinates {
              lat,
              lng
            }
          }
        }
      `
      
      const data = await client.fetch(query)
      
      if (!data || data.length === 0) {
        setError('No employees found')
        return
      }

      const depts = data
  .map((emp: any) => emp.personalDetails?.department)
  .filter(Boolean) as string[];
setDepartments([...new Set(depts)]);

      setEmployees(data)
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }

  const filterEmployees = () => {
    let filtered = employees

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => 
        emp.personalDetails?.department === selectedDepartment
      )
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(emp => 
        emp.personalDetails?.fullName?.toLowerCase().includes(term) ||
        emp.personalDetails?.employeeId?.toLowerCase().includes(term) ||
        emp.personalDetails?.position?.toLowerCase().includes(term)
      )
    }

    return filtered
  }

  const getEmployeeAttendance = (employee: Employee) => {
    const records: Array<{
      type: 'check-in' | 'check-out'
      time: string
      location: string
      coordinates?: {lat: number, lng: number}
    }> = []

    const fromDateObj = new Date(fromDate)
    fromDateObj.setHours(0, 0, 0, 0)
    const toDateObj = new Date(toDate)
    toDateObj.setHours(23, 59, 59, 999)

    employee.checkIn?.forEach(record => {
      const recordDate = new Date(record.time)
      if (recordDate >= fromDateObj && recordDate <= toDateObj) {
        records.push({
          type: 'check-in',
          time: record.time,
          location: record.location,
          coordinates: record.coordinates
        })
      }
    })

    employee.checkOut?.forEach(record => {
      const recordDate = new Date(record.time)
      if (recordDate >= fromDateObj && recordDate <= toDateObj) {
        records.push({
          type: 'check-out',
          time: record.time,
          location: record.location,
          coordinates: record.coordinates
        })
      }
    })

    return records.sort((a, b) => 
      new Date(a.time).getTime() - new Date(b.time).getTime()
    )
  }

  const getAttendanceSummary = (employee: Employee) => {
    const checkIns = employee.checkIn || []
    const checkOuts = employee.checkOut || []
    
    const fromDateObj = new Date(fromDate)
    fromDateObj.setHours(0, 0, 0, 0)
    const toDateObj = new Date(toDate)
    toDateObj.setHours(23, 59, 59, 999)

    const rangeCheckIns = checkIns.filter(c => {
      const recordDate = new Date(c.time)
      return recordDate >= fromDateObj && recordDate <= toDateObj
    })
    
    const rangeCheckOuts = checkOuts.filter(c => {
      const recordDate = new Date(c.time)
      return recordDate >= fromDateObj && recordDate <= toDateObj
    })
    
    return {
      totalCheckIns: checkIns.length,
      totalCheckOuts: checkOuts.length,
      rangeCheckIns: rangeCheckIns.length,
      rangeCheckOuts: rangeCheckOuts.length,
      lastCheckIn: rangeCheckIns.length > 0 ? rangeCheckIns[rangeCheckIns.length - 1] : null,
      lastCheckOut: rangeCheckOuts.length > 0 ? rangeCheckOuts[rangeCheckOuts.length - 1] : null,
      hasAttendance: rangeCheckIns.length > 0 || rangeCheckOuts.length > 0
    }
  }

  const toggleEmployee = (employeeId: string) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId)
  }

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'hh:mm a')
  }

  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM dd, yyyy')
  }

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  const getGoogleMapsLink = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`
  }

  const getOpenStreetMapLink = (lat: number, lng: number) => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`
  }

  const parseLocationString = (location: string) => {
    const coordMatch = location.match(/([-+]?\d+\.\d+),\s*([-+]?\d+\.\d+)/)
    if (coordMatch) {
      return {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2])
      }
    }
    return null
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const filteredEmployees = filterEmployees()

  const getDateRangeText = () => {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    if (fromDate === toDate) {
      return format(from, 'MMM dd, yyyy')
    }
    return `${format(from, 'MMM dd')} - ${format(to, 'MMM dd, yyyy')}`
  }

  // Embedded Map Component
  const LocationMap = ({ lat, lng, onClose }: { lat: number, lng: number, onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-sm max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 tracking-wider">Location Map</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="p-4">
            <div className="aspect-video bg-gray-100 overflow-hidden relative">
              <iframe
                src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a
                href={getGoogleMapsLink(lat, lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition text-center flex items-center justify-center gap-2 tracking-wider"
              >
                <Navigation className="w-4 h-4" />
                Open in Google Maps
              </a>
              <a
                href={getOpenStreetMapLink(lat, lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition text-center flex items-center justify-center gap-2 tracking-wider"
              >
                <Globe className="w-4 h-4" />
                Open in OpenStreetMap
              </a>
            </div>
            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 tracking-wide">
              <strong>Coordinates:</strong> {formatCoordinates(lat, lng)}
            </div>
          </div>
        </div>
      </div>
    )
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
        <div className="text-center bg-white shadow-sm p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Error</h3>
          <p className="text-gray-600 mb-4 tracking-wide">{error}</p>
          <button
            onClick={fetchEmployees}
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
    <NavbarDropdown/>
    <div className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
                  Employee Attendance
                </h1>
                <p className="text-sm text-gray-500 tracking-wide mt-1">
                  {filteredEmployees.length} employees • {getDateRangeText()}
                </p>
              </div>
            </div>
            
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-[#0071BD] tracking-wide">Total Employees</div>
            <div className="text-2xl font-bold text-[#0071BD] tracking-wider">{filteredEmployees.length}</div>
          </div>
          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-green-600 tracking-wide">Present in Range</div>
            <div className="text-2xl font-bold text-green-700 tracking-wider">
              {filteredEmployees.filter(e => getAttendanceSummary(e).hasAttendance).length}
            </div>
          </div>
          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-red-600 tracking-wide">Absent in Range</div>
            <div className="text-2xl font-bold text-red-700 tracking-wider">
              {filteredEmployees.filter(e => !getAttendanceSummary(e).hasAttendance).length}
            </div>
          </div>
          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-blue-600 tracking-wide">Total Check-ins</div>
            <div className="text-2xl font-bold text-blue-700 tracking-wider">
              {filteredEmployees.reduce((sum, e) => sum + (e.checkIn?.length || 0), 0)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                />
              </div>
            </div>

            <div>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchEmployees}
                className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center gap-2 tracking-wider"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="space-y-4">
          {filteredEmployees.length === 0 ? (
            <div className="bg-white shadow-sm p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2 tracking-wider">No employees found</h3>
              <p className="text-gray-400 tracking-wide">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            filteredEmployees.map((employee) => {
              const attendance = getEmployeeAttendance(employee)
              const summary = getAttendanceSummary(employee)
              const isExpanded = expandedEmployee === employee._id

              return (
                <div key={employee._id} className="bg-white shadow-sm overflow-hidden hover:shadow-md transition">
                  {/* Employee Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggleEmployee(employee._id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <User className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 truncate tracking-wide">
                            {employee.personalDetails?.fullName || 'Unknown'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 tracking-wide">
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {employee.personalDetails?.department || 'N/A'}
                            </span>
                            <span className="w-1 h-1 bg-gray-300"></span>
                            <span>ID: {employee.personalDetails?.employeeId || 'N/A'}</span>
                            <span className="w-1 h-1 bg-gray-300"></span>
                            <span>{employee.personalDetails?.position || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 text-xs font-medium tracking-wide ${
                          summary.hasAttendance
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {summary.hasAttendance ? 'Present' : 'Absent'}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-gray-800 tracking-wide">{summary.totalCheckIns}</div>
                            <div className="text-xs text-gray-500 tracking-wide">Check-ins</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-800 tracking-wide">{summary.totalCheckOuts}</div>
                            <div className="text-xs text-gray-500 tracking-wide">Check-outs</div>
                          </div>
                        </div>

                        <div className="text-gray-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      <div className="p-4">
                        {/* Date Range Attendance */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider mb-3">
                            <Calendar className="w-4 h-4" />
                            Attendance from {format(new Date(fromDate), 'MMM dd, yyyy')} to {format(new Date(toDate), 'MMM dd, yyyy')}
                          </h4>
                          
                          {attendance.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                              {attendance.map((record, index) => {
                                const coords = record.coordinates || parseLocationString(record.location)
                                
                                return (
                                  <div 
                                    key={index}
                                    className={`p-3 border ${
                                      record.type === 'check-in'
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-blue-200 bg-blue-50'
                                    }`}
                                  >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          {record.type === 'check-in' ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                          ) : (
                                            <XCircle className="w-4 h-4 text-blue-600" />
                                          )}
                                          <span className={`font-medium tracking-wide ${
                                            record.type === 'check-in' ? 'text-green-700' : 'text-blue-700'
                                          }`}>
                                            {record.type === 'check-in' ? 'Check-In' : 'Check-Out'}
                                          </span>
                                          <span className="text-xs text-gray-400 ml-2 tracking-wide">
                                            {formatDistanceToNow(new Date(record.time), { addSuffix: true })}
                                          </span>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-600 tracking-wide">
                                          <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(record.time)}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(record.time)}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {record.location || 'No location specified'}
                                          </span>
                                        </div>

                                        {coords && (
                                          <div className="mt-2 flex flex-wrap items-center gap-3">
                                            <span className="text-xs bg-gray-100 px-2 py-1 flex items-center gap-1 tracking-wide">
                                              <Globe className="w-3 h-3" />
                                              {formatCoordinates(coords.lat, coords.lng)}
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedLocation(coords)
                                                setShowMap(true)
                                              }}
                                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 hover:bg-blue-200 transition flex items-center gap-1 tracking-wide"
                                            >
                                              <Navigation className="w-3 h-3" />
                                              View on Map
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-gray-50">
                              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 tracking-wide">No attendance records in this date range</p>
                            </div>
                          )}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 bg-gray-50">
                            <div className="text-xs text-gray-500 tracking-wide">Total Check-Ins (All Time)</div>
                            <div className="text-lg font-semibold text-gray-800 tracking-wider">{summary.totalCheckIns}</div>
                          </div>
                          <div className="p-3 bg-gray-50">
                            <div className="text-xs text-gray-500 tracking-wide">Total Check-Outs (All Time)</div>
                            <div className="text-lg font-semibold text-gray-800 tracking-wider">{summary.totalCheckOuts}</div>
                          </div>
                          <div className="p-3 bg-gray-50">
                            <div className="text-xs text-gray-500 tracking-wide">Check-ins in Range</div>
                            <div className="text-lg font-semibold text-gray-800 tracking-wider">{summary.rangeCheckIns}</div>
                          </div>
                          <div className="p-3 bg-gray-50">
                            <div className="text-xs text-gray-500 tracking-wide">Check-outs in Range</div>
                            <div className="text-lg font-semibold text-gray-800 tracking-wider">{summary.rangeCheckOuts}</div>
                          </div>
                        </div>

                        {/* View Details Button */}
                        <div className="mt-4 text-right">
                          <button
                            onClick={() => window.location.href = `/employees/${employee._id}/attendance`}
                            className="px-4 py-2 text-sm bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center gap-2 inline-flex tracking-wider"
                          >
                            <Eye className="w-4 h-4" />
                            View Full Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer Stats */}
        {filteredEmployees.length > 0 && (
          <div className="mt-6 bg-white shadow-sm p-4">
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 tracking-wide">
              <div>
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500"></span>
                  <span>Present in Range: {
                    filteredEmployees.filter(e => getAttendanceSummary(e).hasAttendance).length
                  }</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500"></span>
                  <span>Absent in Range: {
                    filteredEmployees.filter(e => !getAttendanceSummary(e).hasAttendance).length
                  }</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Modal */}
      {showMap && selectedLocation && (
        <LocationMap 
          lat={selectedLocation.lat} 
          lng={selectedLocation.lng} 
          onClose={() => {
            setShowMap(false)
            setSelectedLocation(null)
          }}
        />
      )}
    </div>
    <Footer/>
    </ProtectedRoute>
    </>
  )
}