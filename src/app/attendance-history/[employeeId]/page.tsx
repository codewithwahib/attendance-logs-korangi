// // src/app/attendance-history/[employeeId]/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useParams } from 'next/navigation'
// import Footer from '@/app/components/footer'
// import ProtectedEmployeeRoute from '@/components/ProtectedEmployeeRoute'
// import { client } from '@/sanity/lib/client'
// import NavbarDropdown from '@/app/Navbar/page'
// import {
//   Calendar,
//   Clock,
//   User,
//   CheckCircle,
//   ChevronUp,
//   XCircle,
//   AlertCircle,
//   RefreshCw,
//   Loader,
//   LogIn,
//   LogOut,
//   MapPin,
//   ChevronDown,
//   TrendingUp,
//   TrendingDown,
//   UserCheck,
//   UserX,
//   UserMinus,
//   Activity,
//   ChevronLeft,
//   ChevronRight,
//   FileText,
//   Briefcase,
//   Building,
//   Users,
//   Filter,
//   Download,
//   FileSpreadsheet,
//   ArrowLeft,
//   Phone,
//   Mail,
//   Home,
//   Eye
// } from 'lucide-react'

// // Import Roboto font
// import { Roboto } from 'next/font/google'

// const roboto = Roboto({
//   weight: ['100', '300', '400', '500', '700', '900'],
//   style: ['normal', 'italic'],
//   subsets: ['latin'],
//   display: 'swap',
// })

// interface Employee {
//   _id: string
//   personalDetails: {
//     employeeId: string
//     fullName: string
//     department: string
//     position: string
//     fatherName?: string
//     cnic?: string
//     phoneNumber?: string
//     email?: string
//     address?: string
//     joiningDate?: string
//     dob?: string
//     maritalStatus?: string
//     emergencyContact?: string
//   }
//   checkIn?: Array<{
//     time: string
//     location: string
//   }>
//   checkOut?: Array<{
//     time: string
//     location: string
//   }>
//   leaves?: Array<{
//     _key?: string
//     fromDate: string
//     toDate: string
//     status: string
//     leaveType: string
//     reason?: string
//     totalDays?: number
//     appliedOn?: string
//   }>
// }

// interface AttendanceRecord {
//   date: string
//   day: string
//   checkIn: string
//   checkOut: string
//   totalHours: string
//   checkInLocation: string
//   checkOutLocation: string
//   status: 'Present' | 'Absent' | 'Leave' | 'Half Day'
//   leaveType?: string
//   leaveReason?: string
// }

// export default function AttendanceHistoryPage() {
//   const params = useParams()
//   const employeeId = params.employeeId as string
  
//   const [employee, setEmployee] = useState<Employee | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
//   const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
//   const [stats, setStats] = useState({
//     totalPresent: 0,
//     totalAbsent: 0,
//     totalLeaves: 0,
//     totalHalfDays: 0,
//     attendanceRate: 0,
//     totalWorkingDays: 0,
//     totalRecords: 0
//   })
  
//   // Date range filters
//   const [fromDate, setFromDate] = useState('')
//   const [toDate, setToDate] = useState('')
//   const [selectedStatus, setSelectedStatus] = useState<string>('all')
//   const [showFilters, setShowFilters] = useState(false)
//   const [searchTerm, setSearchTerm] = useState('')

//   useEffect(() => {
//     if (employeeId) {
//       fetchEmployeeData()
//     }
//     // Set default dates to current month
//     const now = new Date()
//     const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
//     const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
//     setFromDate(formatDateForInput(firstDay))
//     setToDate(formatDateForInput(lastDay))
//   }, [employeeId])

//   useEffect(() => {
//     if (employee && fromDate && toDate) {
//       generateAttendanceData()
//     }
//   }, [employee, fromDate, toDate])

//   useEffect(() => {
//     applyFilters()
//   }, [attendanceData, selectedStatus, searchTerm])

//   const fetchEmployeeData = async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       const query = `
//         *[_type == "employee" && personalDetails.employeeId == $employeeId][0] {
//           _id,
//           personalDetails {
//             employeeId,
//             fullName,
//             department,
//             position,
//             fatherName,
//             cnic,
//             phoneNumber,
//             email,
//             address,
//             joiningDate,
//             dob,
//             maritalStatus,
//             emergencyContact
//           },
//           checkIn[] {
//             time,
//             location
//           },
//           checkOut[] {
//             time,
//             location
//           },
//           leaves[] {
//             _key,
//             fromDate,
//             toDate,
//             status,
//             leaveType,
//             reason,
//             totalDays,
//             appliedOn
//           }
//         }
//       `

//       const data = await client.fetch(query, { employeeId })
      
//       if (!data) {
//         setError('Employee not found')
//         return
//       }

//       setEmployee(data)
//     } catch (err) {
//       console.error('Error fetching employee data:', err)
//       setError('Failed to load employee data')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const formatDateForInput = (date: Date) => {
//     const year = date.getFullYear()
//     const month = String(date.getMonth() + 1).padStart(2, '0')
//     const day = String(date.getDate()).padStart(2, '0')
//     return `${year}-${month}-${day}`
//   }

//   const getDayName = (dateStr: string) => {
//     const date = new Date(dateStr + 'T00:00:00')
//     return date.toLocaleDateString('en-US', { weekday: 'long' })
//   }

//   const formatTime = (timestamp: string) => {
//     if (!timestamp) return '-'
//     try {
//       const date = new Date(timestamp)
//       return date.toLocaleTimeString('en-US', { 
//         hour: '2-digit', 
//         minute: '2-digit',
//         second: '2-digit',
//         hour12: true 
//       })
//     } catch {
//       return '-'
//     }
//   }

//   const formatDate = (dateStr: string) => {
//     if (!dateStr) return '-'
//     try {
//       const date = new Date(dateStr + 'T00:00:00')
//       return date.toLocaleDateString('en-US', { 
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//       })
//     } catch {
//       return '-'
//     }
//   }

//   const formatDateForDisplay = (dateStr: string) => {
//     if (!dateStr) return '-'
//     try {
//       const date = new Date(dateStr + 'T00:00:00')
//       return date.toLocaleDateString('en-US', { 
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       })
//     } catch {
//       return '-'
//     }
//   }

//   const calculateTotalHours = (checkIn: string, checkOut: string) => {
//     if (!checkIn || !checkOut) return '-'
//     try {
//       const inTime = new Date(checkIn)
//       const outTime = new Date(checkOut)
//       const diffMs = outTime.getTime() - inTime.getTime()
//       const diffHours = diffMs / (1000 * 60 * 60)
//       if (diffHours < 0) return '-'
//       return diffHours.toFixed(2) + ' hrs'
//     } catch {
//       return '-'
//     }
//   }

//   const generateAttendanceData = () => {
//     if (!employee || !fromDate || !toDate) return

//     // Generate all dates in the selected range
//     const startDate = new Date(fromDate + 'T00:00:00')
//     const endDate = new Date(toDate + 'T00:00:00')
//     const dateArray: string[] = []

//     const currentDate = new Date(startDate)
//     while (currentDate <= endDate) {
//       const year = currentDate.getFullYear()
//       const month = String(currentDate.getMonth() + 1).padStart(2, '0')
//       const day = String(currentDate.getDate()).padStart(2, '0')
//       dateArray.push(`${year}-${month}-${day}`)
//       currentDate.setDate(currentDate.getDate() + 1)
//     }

//     const records: AttendanceRecord[] = []

//     dateArray.forEach(date => {
//       const checkIn = employee.checkIn?.find(c => {
//         const checkInDate = c.time.split('T')[0]
//         return checkInDate === date
//       })
//       const checkOut = employee.checkOut?.find(c => {
//         const checkOutDate = c.time.split('T')[0]
//         return checkOutDate === date
//       })
      
//       // Check if employee is on leave
//       const leave = employee.leaves?.find(
//         l => l.fromDate <= date && l.toDate >= date && l.status === 'approved'
//       )

//       let status: 'Present' | 'Absent' | 'Leave' | 'Half Day' = 'Absent'
//       let leaveType = ''
//       let leaveReason = ''

//       if (leave) {
//         status = 'Leave'
//         leaveType = leave.leaveType || ''
//         leaveReason = leave.reason || ''
//       } else if (checkIn && checkOut) {
//         status = 'Present'
//       } else if (checkIn && !checkOut) {
//         status = 'Half Day'
//       } else {
//         status = 'Absent'
//       }

//       records.push({
//         date: formatDate(date),
//         day: getDayName(date),
//         checkIn: checkIn ? formatTime(checkIn.time) : '-',
//         checkOut: checkOut ? formatTime(checkOut.time) : '-',
//         totalHours: calculateTotalHours(checkIn?.time || '', checkOut?.time || ''),
//         checkInLocation: checkIn?.location || '-',
//         checkOutLocation: checkOut?.location || '-',
//         status,
//         leaveType,
//         leaveReason
//       })
//     })

//     setAttendanceData(records)
//     calculateStats(records)
//   }

//   const applyFilters = () => {
//     let filtered = [...attendanceData]

//     // Filter by status
//     if (selectedStatus !== 'all') {
//       filtered = filtered.filter(record => {
//         if (selectedStatus === 'present') return record.status === 'Present'
//         if (selectedStatus === 'absent') return record.status === 'Absent'
//         if (selectedStatus === 'leave') return record.status === 'Leave'
//         if (selectedStatus === 'halfday') return record.status === 'Half Day'
//         return true
//       })
//     }

//     // Filter by search term
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase()
//       filtered = filtered.filter(record =>
//         record.date.toLowerCase().includes(term) ||
//         record.day.toLowerCase().includes(term) ||
//         record.status.toLowerCase().includes(term) ||
//         record.checkInLocation.toLowerCase().includes(term) ||
//         record.checkOutLocation.toLowerCase().includes(term)
//       )
//     }

//     setFilteredData(filtered)
//     calculateStats(filtered)
//   }

//   const calculateStats = (data: AttendanceRecord[]) => {
//     const total = data.length
//     const present = data.filter(r => r.status === 'Present').length
//     const absent = data.filter(r => r.status === 'Absent').length
//     const leave = data.filter(r => r.status === 'Leave').length
//     const halfDay = data.filter(r => r.status === 'Half Day').length
    
//     const workingDays = total
//     const attendanceRate = workingDays > 0 ? ((present + halfDay * 0.5) / workingDays) * 100 : 0

//     setStats({
//       totalPresent: present,
//       totalAbsent: absent,
//       totalLeaves: leave,
//       totalHalfDays: halfDay,
//       attendanceRate,
//       totalWorkingDays: workingDays,
//       totalRecords: total
//     })
//   }

//   // Get status color
//   const getStatusColor = (status: string) => {
//     switch(status) {
//       case 'Present': return 'bg-green-100 text-green-700'
//       case 'Absent': return 'bg-red-100 text-red-700'
//       case 'Leave': return 'bg-blue-100 text-blue-700'
//       case 'Half Day': return 'bg-yellow-100 text-yellow-700'
//       default: return 'bg-gray-100 text-gray-700'
//     }
//   }

//   // Get status icon
//   const getStatusIcon = (status: string) => {
//     switch(status) {
//       case 'Present': return <CheckCircle className="w-4 h-4 text-green-600" />
//       case 'Absent': return <XCircle className="w-4 h-4 text-red-600" />
//       case 'Leave': return <Calendar className="w-4 h-4 text-blue-600" />
//       case 'Half Day': return <Clock className="w-4 h-4 text-yellow-600" />
//       default: return <AlertCircle className="w-4 h-4 text-gray-600" />
//     }
//   }

//   if (loading) {
//     return (
//       <>
//         <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
//           <div className="text-center">
//             <Loader className="w-12 h-12 animate-spin text-[#0071BD] mx-auto mb-4" />
//           </div>
//         </div>
//       </>
//     )
//   }

//   if (error) {
//     return (
//       <>
//         <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
//           <div className="text-center bg-white shadow-sm p-8 max-w-md">
//             <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Error</h3>
//             <p className="text-gray-600 mb-4 tracking-wide">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </>
//     )
//   }

//   if (!employee) {
//     return (
//       <>
//         <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
//           <div className="text-center bg-white shadow-sm p-8 max-w-md">
//             <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Employee Not Found</h3>
//             <p className="text-gray-600 tracking-wide">No employee found with ID: {employeeId}</p>
//           </div>
//         </div>
//       </>
//     )
//   }

//   // Data to display (filtered or all)
//   const displayData = filteredData.length > 0 ? filteredData : attendanceData

//   return (
//     <>
//     <ProtectedEmployeeRoute allowedRole='employee'>
//       <NavbarDropdown />
//       <div className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}>
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="mb-6">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div className="flex items-center gap-3">
                
//                 <div>
//                   <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
//                     Attendance History
//                   </h1>
//                 </div>
//               </div>
              
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => window.location.reload()}
//                   className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2 tracking-wider"
//                 >
//                   <RefreshCw className="w-4 h-4" />
//                   Refresh
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Employee Quick Info */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//             <div className="bg-white shadow-sm p-4">
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <User className="w-4 h-4 text-[#0071BD]" />
//                 <span className="font-medium">Employee</span>
//               </div>
//               <div className="text-base font-semibold text-gray-800 mt-1 tracking-wide truncate">
//                 {employee.personalDetails?.fullName}
//               </div>
//               <div className="text-xs text-gray-500">ID: {employee.personalDetails?.employeeId}</div>
//             </div>
//             <div className="bg-white shadow-sm p-4">
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <Building className="w-4 h-4 text-[#0071BD]" />
//                 <span className="font-medium">Department</span>
//               </div>
//               <div className="text-base font-semibold text-gray-800 mt-1 tracking-wide">
//                 {employee.personalDetails?.department || 'N/A'}
//               </div>
//               <div className="text-xs text-gray-500">{employee.personalDetails?.position || 'N/A'}</div>
//             </div>
//             <div className="bg-white shadow-sm p-4">
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <Phone className="w-4 h-4 text-[#0071BD]" />
//                 <span className="font-medium">Contact</span>
//               </div>
//               <div className="text-base font-semibold text-gray-800 mt-1 tracking-wide">
//                 {employee.personalDetails?.phoneNumber || 'N/A'}
//               </div>
//               <div className="text-xs text-gray-500">{employee.personalDetails?.cnic || 'N/A'}</div>
//             </div>
//             <div className="bg-white shadow-sm p-4">
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <Calendar className="w-4 h-4 text-[#0071BD]" />
//                 <span className="font-medium">Joining Date</span>
//               </div>
//               <div className="text-base font-semibold text-gray-800 mt-1 tracking-wide">
//                 {formatDateForDisplay(employee.personalDetails?.joiningDate || '')}
//               </div>
//               <div className="text-xs text-gray-500">Total Records: {stats.totalRecords}</div>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
//             <div className="bg-white shadow-sm p-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-[#0071BD] tracking-wide">Total</span>
//                 <Calendar className="w-4 h-4 text-[#0071BD]" />
//               </div>
//               <div className="text-2xl font-bold text-[#0071BD] tracking-wider mt-1">{stats.totalRecords}</div>
//               <div className="text-xs text-gray-400 tracking-wide">Records</div>
//             </div>

//             <div className="bg-white shadow-sm p-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-green-600 tracking-wide">Present</span>
//                 <UserCheck className="w-4 h-4 text-green-600" />
//               </div>
//               <div className="text-2xl font-bold text-green-700 tracking-wider mt-1">{stats.totalPresent}</div>
//               <div className="text-xs text-gray-400 tracking-wide">Days present</div>
//             </div>

//             <div className="bg-white shadow-sm p-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-red-600 tracking-wide">Absent</span>
//                 <UserX className="w-4 h-4 text-red-600" />
//               </div>
//               <div className="text-2xl font-bold text-red-700 tracking-wider mt-1">{stats.totalAbsent}</div>
//               <div className="text-xs text-gray-400 tracking-wide">Days absent</div>
//             </div>

//             <div className="bg-white shadow-sm p-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-blue-600 tracking-wide">Leaves</span>
//                 <UserMinus className="w-4 h-4 text-blue-600" />
//               </div>
//               <div className="text-2xl font-bold text-blue-700 tracking-wider mt-1">{stats.totalLeaves}</div>
//               <div className="text-xs text-gray-400 tracking-wide">Leave days</div>
//             </div>

//             <div className="bg-white shadow-sm p-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-yellow-600 tracking-wide">Half Days</span>
//                 <Activity className="w-4 h-4 text-yellow-600" />
//               </div>
//               <div className="text-2xl font-bold text-yellow-700 tracking-wider mt-1">{stats.totalHalfDays}</div>
//               <div className="text-xs text-gray-400 tracking-wide">Half days</div>
//             </div>

//             <div className="bg-white shadow-sm p-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-purple-600 tracking-wide">Attendance Rate</span>
//                 {stats.attendanceRate >= 75 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
//               </div>
//               <div className={`text-2xl font-bold tracking-wider mt-1 ${
//                 stats.attendanceRate >= 75 ? 'text-green-700' : 'text-red-700'
//               }`}>
//                 {stats.attendanceRate.toFixed(1)}%
//               </div>
//               <div className="text-xs text-gray-400 tracking-wide">Overall rate</div>
//             </div>
//           </div>

//           {/* Filters */}
//           <div className="bg-white shadow-sm p-4 mb-6">
//             <button
//   onClick={() => setShowFilters(!showFilters)}
//   className="flex items-center gap-2 text-gray-700 hover:text-[#0071BD] transition tracking-wider"
// >
//   <Filter className="w-4 h-4" />
//   {showFilters ? 'Hide Filters' : 'Show Filters'}
//   {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
// </button>

//             {showFilters && (
//               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
//                     From Date
//                   </label>
//                   <div className="relative">
//                     <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                       type="date"
//                       value={fromDate}
//                       onChange={(e) => {
//                         setFromDate(e.target.value)
//                         if (employee) generateAttendanceData()
//                       }}
//                       className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
//                     To Date
//                   </label>
//                   <div className="relative">
//                     <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                       type="date"
//                       value={toDate}
//                       onChange={(e) => {
//                         setToDate(e.target.value)
//                         if (employee) generateAttendanceData()
//                       }}
//                       className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
//                     Status
//                   </label>
//                   <select
//                     value={selectedStatus}
//                     onChange={(e) => setSelectedStatus(e.target.value)}
//                     className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="present">Present</option>
//                     <option value="absent">Absent</option>
//                     <option value="leave">Leave</option>
//                     <option value="halfday">Half Day</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
//                     Search
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Search records..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Results Info */}
//           <div className="bg-white shadow-sm p-4 mb-6">
//             <div className="flex flex-wrap items-center justify-between gap-2">
//               <div className="flex items-center gap-3">
//                 <Clock className="w-5 h-5 text-[#0071BD]" />
//                 <span className="font-medium text-gray-700 tracking-wide">
//                   {displayData.length} attendance records found
//                 </span>
//                 {selectedStatus !== 'all' && (
//                   <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
//                     Status: {selectedStatus}
//                   </span>
//                 )}
//                 {(fromDate || toDate) && (
//                   <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
//                     {formatDateForDisplay(fromDate)} → {formatDateForDisplay(toDate)}
//                   </span>
//                 )}
//               </div>
//               <div className="text-sm text-gray-500 tracking-wide">
//                 Showing {displayData.length} of {attendanceData.length} total
//               </div>
//             </div>
//           </div>

//           {/* Attendance Table */}
//           <div className="bg-white shadow-sm overflow-hidden">
//             <div className="p-4 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <Clock className="w-5 h-5 text-[#0071BD]" />
//                   <h3 className="text-sm font-semibold text-gray-800 tracking-wide">
//                     Attendance Records
//                   </h3>
//                   <span className="text-xs text-gray-400 tracking-wide">
//                     {displayData.length} records
//                   </span>
//                   {(fromDate || toDate) && (
//                     <span className="text-xs text-[#0071BD] tracking-wide">
//                       (Filtered: {formatDateForDisplay(fromDate)} to {formatDateForDisplay(toDate)})
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-gray-50 border-b border-gray-200">
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
//                     <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {displayData.length === 0 ? (
//                     <tr>
//                       <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
//                         <div className="flex flex-col items-center gap-2">
//                           <Clock className="w-12 h-12 text-gray-300" />
//                           <p className="tracking-wide">No attendance records found</p>
//                           <p className="text-xs text-gray-400">Try adjusting your filters or search terms</p>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     displayData.map((record, index) => (
//                       <tr key={index} className="hover:bg-gray-50 transition">
//                         <td className="px-4 py-3 text-sm text-gray-500 tracking-wide">{index + 1}</td>
//                         <td className="px-4 py-3 text-sm text-gray-700 tracking-wide">{record.date}</td>
//                         <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.day}</td>
//                         <td className="px-4 py-3">
//                           <span className="text-sm text-gray-600 tracking-wide">
//                             {record.checkIn}
//                           </span>
//                           {record.checkInLocation !== '-' && (
//                             <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
//                               <MapPin className="w-3 h-3" />
//                               {record.checkInLocation}
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className="text-sm text-gray-600 tracking-wide">
//                             {record.checkOut}
//                           </span>
//                           {record.checkOutLocation !== '-' && (
//                             <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
//                               <MapPin className="w-3 h-3" />
//                               {record.checkOutLocation}
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-4 py-3 text-sm text-center font-medium text-gray-800 tracking-wide">
//                           {record.totalHours}
//                         </td>
//                         <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">
//                           {record.checkInLocation !== '-' && record.checkOutLocation !== '-'
//                             ? `${record.checkInLocation} → ${record.checkOutLocation}`
//                             : record.checkInLocation !== '-'
//                               ? `In: ${record.checkInLocation}`
//                               : record.checkOutLocation !== '-'
//                                 ? `Out: ${record.checkOutLocation}`
//                                 : '-'
//                           }
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium tracking-wide rounded ${getStatusColor(record.status)}`}>
//                             {getStatusIcon(record.status)}
//                             {record.status}
//                             {record.leaveType && ` (${record.leaveType})`}
//                           </span>
//                           {record.leaveReason && record.status === 'Leave' && (
//                             <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
//                               {record.leaveReason}
//                             </div>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Footer */}
//           {displayData.length > 0 && (
//             <div className="mt-6 bg-white shadow-sm p-4">
//               <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 tracking-wide">
//                 <div>
//                   Showing {displayData.length} records for {employee.personalDetails?.fullName}
//                   {(fromDate || toDate) && ` (${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)})`}
//                 </div>
//                 <div className="flex flex-wrap items-center gap-4">
//                   <span className="flex items-center gap-2">
//                     <span className="w-3 h-3 bg-green-500 rounded"></span>
//                     Present: {stats.totalPresent}
//                   </span>
//                   <span className="flex items-center gap-2">
//                     <span className="w-3 h-3 bg-red-500 rounded"></span>
//                     Absent: {stats.totalAbsent}
//                   </span>
//                   <span className="flex items-center gap-2">
//                     <span className="w-3 h-3 bg-blue-500 rounded"></span>
//                     Leaves: {stats.totalLeaves}
//                   </span>
//                   <span className="flex items-center gap-2">
//                     <span className="w-3 h-3 bg-yellow-500 rounded"></span>
//                     Half Days: {stats.totalHalfDays}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//       <Footer />
//       </ProtectedEmployeeRoute>
//     </>
//   )
// }



// src/app/attendance-history/[employeeId]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Footer from '@/app/components/footer'
import ProtectedEmployeeRoute from '@/components/ProtectedEmployeeRoute'
import { client } from '@/sanity/lib/client'
import NavbarDropdown from '@/app/Navbar/page'
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  ChevronUp,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader,
  LogIn,
  LogOut,
  MapPin,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  UserMinus,
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  Briefcase,
  Building,
  Users,
  Filter,
  Download,
  FileSpreadsheet,
  ArrowLeft,
  Phone,
  Mail,
  Home,
  Eye
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
    department: string
    position: string
    fatherName?: string
    cnic?: string
    phoneNumber?: string
    email?: string
    address?: string
    joiningDate?: string
    dob?: string
    maritalStatus?: string
    emergencyContact?: string
  }
  checkIn?: Array<{
    time: string
    location: string
  }>
  checkOut?: Array<{
    time: string
    location: string
  }>
  leaves?: Array<{
    _key?: string
    fromDate: string
    toDate: string
    status: string
    leaveType: string
    reason?: string
    totalDays?: number
    appliedOn?: string
  }>
}

interface AttendanceRecord {
  date: string
  day: string
  checkIn: string
  checkOut: string
  totalHours: string
  checkInLocation: string
  checkOutLocation: string
  status: 'Present' | 'Absent' | 'Leave' | 'Half Day'
  leaveType?: string
  leaveReason?: string
}

export default function AttendanceHistoryPage() {
  const params = useParams()
  const employeeId = params.employeeId as string
  
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalLeaves: 0,
    totalHalfDays: 0,
    attendanceRate: 0,
    totalWorkingDays: 0,
    totalRecords: 0
  })
  
  // Date range filters
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // =====================================================
  // formatDateForInput - useCallback
  // =====================================================

  const formatDateForInput = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  // =====================================================
  // getDayName - useCallback
  // =====================================================

  const getDayName = useCallback((dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }, [])

  // =====================================================
  // formatTime - useCallback
  // =====================================================

  const formatTime = useCallback((timestamp: string) => {
    if (!timestamp) return '-'
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      })
    } catch {
      return '-'
    }
  }, [])

  // =====================================================
  // formatDate - useCallback
  // =====================================================

  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr + 'T00:00:00')
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return '-'
    }
  }, [])

  // =====================================================
  // formatDateForDisplay - useCallback
  // =====================================================

  const formatDateForDisplay = useCallback((dateStr: string) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr + 'T00:00:00')
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return '-'
    }
  }, [])

  // =====================================================
  // calculateTotalHours - useCallback
  // =====================================================

  const calculateTotalHours = useCallback((checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return '-'
    try {
      const inTime = new Date(checkIn)
      const outTime = new Date(checkOut)
      const diffMs = outTime.getTime() - inTime.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      if (diffHours < 0) return '-'
      return diffHours.toFixed(2) + ' hrs'
    } catch {
      return '-'
    }
  }, [])

  // =====================================================
  // calculateStats - useCallback
  // =====================================================

  const calculateStats = useCallback((data: AttendanceRecord[]) => {
    const total = data.length
    const present = data.filter(r => r.status === 'Present').length
    const absent = data.filter(r => r.status === 'Absent').length
    const leave = data.filter(r => r.status === 'Leave').length
    const halfDay = data.filter(r => r.status === 'Half Day').length
    
    const workingDays = total
    const attendanceRate = workingDays > 0 ? ((present + halfDay * 0.5) / workingDays) * 100 : 0

    setStats({
      totalPresent: present,
      totalAbsent: absent,
      totalLeaves: leave,
      totalHalfDays: halfDay,
      attendanceRate,
      totalWorkingDays: workingDays,
      totalRecords: total
    })
  }, [])

  // =====================================================
  // generateAttendanceData - useCallback
  // =====================================================

  const generateAttendanceData = useCallback(() => {
    if (!employee || !fromDate || !toDate) return

    // Generate all dates in the selected range
    const startDate = new Date(fromDate + 'T00:00:00')
    const endDate = new Date(toDate + 'T00:00:00')
    const dateArray: string[] = []

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getDate()).padStart(2, '0')
      dateArray.push(`${year}-${month}-${day}`)
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const records: AttendanceRecord[] = []

    dateArray.forEach(date => {
      const checkIn = employee.checkIn?.find(c => {
        const checkInDate = c.time.split('T')[0]
        return checkInDate === date
      })
      const checkOut = employee.checkOut?.find(c => {
        const checkOutDate = c.time.split('T')[0]
        return checkOutDate === date
      })
      
      // Check if employee is on leave
      const leave = employee.leaves?.find(
        l => l.fromDate <= date && l.toDate >= date && l.status === 'approved'
      )

      let status: 'Present' | 'Absent' | 'Leave' | 'Half Day' = 'Absent'
      let leaveType = ''
      let leaveReason = ''

      if (leave) {
        status = 'Leave'
        leaveType = leave.leaveType || ''
        leaveReason = leave.reason || ''
      } else if (checkIn && checkOut) {
        status = 'Present'
      } else if (checkIn && !checkOut) {
        status = 'Half Day'
      } else {
        status = 'Absent'
      }

      records.push({
        date: formatDate(date),
        day: getDayName(date),
        checkIn: checkIn ? formatTime(checkIn.time) : '-',
        checkOut: checkOut ? formatTime(checkOut.time) : '-',
        totalHours: calculateTotalHours(checkIn?.time || '', checkOut?.time || ''),
        checkInLocation: checkIn?.location || '-',
        checkOutLocation: checkOut?.location || '-',
        status,
        leaveType,
        leaveReason
      })
    })

    setAttendanceData(records)
    calculateStats(records)
  }, [employee, fromDate, toDate, formatDate, getDayName, formatTime, calculateTotalHours, calculateStats])

  // =====================================================
  // applyFilters - useCallback
  // =====================================================

  const applyFilters = useCallback(() => {
    let filtered = [...attendanceData]

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(record => {
        if (selectedStatus === 'present') return record.status === 'Present'
        if (selectedStatus === 'absent') return record.status === 'Absent'
        if (selectedStatus === 'leave') return record.status === 'Leave'
        if (selectedStatus === 'halfday') return record.status === 'Half Day'
        return true
      })
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(record =>
        record.date.toLowerCase().includes(term) ||
        record.day.toLowerCase().includes(term) ||
        record.status.toLowerCase().includes(term) ||
        record.checkInLocation.toLowerCase().includes(term) ||
        record.checkOutLocation.toLowerCase().includes(term)
      )
    }

    setFilteredData(filtered)
    calculateStats(filtered)
  }, [attendanceData, selectedStatus, searchTerm, calculateStats])

  // =====================================================
  // fetchEmployeeData - useCallback
  // =====================================================

  const fetchEmployeeData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const query = `
        *[_type == "employee" && personalDetails.employeeId == $employeeId][0] {
          _id,
          personalDetails {
            employeeId,
            fullName,
            department,
            position,
            fatherName,
            cnic,
            phoneNumber,
            email,
            address,
            joiningDate,
            dob,
            maritalStatus,
            emergencyContact
          },
          checkIn[] {
            time,
            location
          },
          checkOut[] {
            time,
            location
          },
          leaves[] {
            _key,
            fromDate,
            toDate,
            status,
            leaveType,
            reason,
            totalDays,
            appliedOn
          }
        }
      `

      const data = await client.fetch(query, { employeeId })
      
      if (!data) {
        setError('Employee not found')
        return
      }

      setEmployee(data)
    } catch (err) {
      console.error('Error fetching employee data:', err)
      setError('Failed to load employee data')
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  // =====================================================
  // USE EFFECT - fetchEmployeeData dependency add karo
  // =====================================================

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData()
    }
    // Set default dates to current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setFromDate(formatDateForInput(firstDay))
    setToDate(formatDateForInput(lastDay))
  }, [employeeId, fetchEmployeeData, formatDateForInput])

  // =====================================================
  // USE EFFECT - generateAttendanceData dependency add karo
  // =====================================================

  useEffect(() => {
    if (employee && fromDate && toDate) {
      generateAttendanceData()
    }
  }, [employee, fromDate, toDate, generateAttendanceData])

  // =====================================================
  // USE EFFECT - applyFilters dependency add karo
  // =====================================================

  useEffect(() => {
    applyFilters()
  }, [attendanceData, selectedStatus, searchTerm, applyFilters])

  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Present': return 'bg-green-100 text-green-700'
      case 'Absent': return 'bg-red-100 text-red-700'
      case 'Leave': return 'bg-blue-100 text-blue-700'
      case 'Half Day': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Present': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Absent': return <XCircle className="w-4 h-4 text-red-600" />
      case 'Leave': return <Calendar className="w-4 h-4 text-blue-600" />
      case 'Half Day': return <Clock className="w-4 h-4 text-yellow-600" />
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <>
        <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-[#0071BD] mx-auto mb-4" />
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
          <div className="text-center bg-white shadow-sm p-8 max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Error</h3>
            <p className="text-gray-600 mb-4 tracking-wide">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    )
  }

  if (!employee) {
    return (
      <>
        <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
          <div className="text-center bg-white shadow-sm p-8 max-w-md">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Employee Not Found</h3>
            <p className="text-gray-600 tracking-wide">No employee found with ID: {employeeId}</p>
          </div>
        </div>
      </>
    )
  }

  // Data to display (filtered or all)
  const displayData = filteredData.length > 0 ? filteredData : attendanceData

  return (
    <>
    <ProtectedEmployeeRoute allowedRole='employee'>
      <NavbarDropdown />
      <div className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                
                <div>
                  <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
                    Attendance History
                  </h1>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2 tracking-wider"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Employee Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-[#0071BD]" />
                <span className="font-medium">Employee</span>
              </div>
              <div className="text-base font-semibold text-gray-800 mt-1 tracking-wide truncate">
                {employee.personalDetails?.fullName}
              </div>
              <div className="text-xs text-gray-500">ID: {employee.personalDetails?.employeeId}</div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="w-4 h-4 text-[#0071BD]" />
                <span className="font-medium">Department</span>
              </div>
              <div className="text-base font-semibold text-gray-800 mt-1 tracking-wide">
                {employee.personalDetails?.department || 'N/A'}
              </div>
              <div className="text-xs text-gray-500">{employee.personalDetails?.position || 'N/A'}</div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-[#0071BD]" />
                <span className="font-medium">Contact</span>
              </div>
              <div className="text-base font-semibold text-gray-800 mt-1 tracking-wide">
                {employee.personalDetails?.phoneNumber || 'N/A'}
              </div>
              <div className="text-xs text-gray-500">{employee.personalDetails?.cnic || 'N/A'}</div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-[#0071BD]" />
                <span className="font-medium">Joining Date</span>
              </div>
              <div className="text-base font-semibold text-gray-800 mt-1 tracking-wide">
                {formatDateForDisplay(employee.personalDetails?.joiningDate || '')}
              </div>
              <div className="text-xs text-gray-500">Total Records: {stats.totalRecords}</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#0071BD] tracking-wide">Total</span>
                <Calendar className="w-4 h-4 text-[#0071BD]" />
              </div>
              <div className="text-2xl font-bold text-[#0071BD] tracking-wider mt-1">{stats.totalRecords}</div>
              <div className="text-xs text-gray-400 tracking-wide">Records</div>
            </div>

            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 tracking-wide">Present</span>
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700 tracking-wider mt-1">{stats.totalPresent}</div>
              <div className="text-xs text-gray-400 tracking-wide">Days present</div>
            </div>

            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600 tracking-wide">Absent</span>
                <UserX className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-700 tracking-wider mt-1">{stats.totalAbsent}</div>
              <div className="text-xs text-gray-400 tracking-wide">Days absent</div>
            </div>

            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600 tracking-wide">Leaves</span>
                <UserMinus className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700 tracking-wider mt-1">{stats.totalLeaves}</div>
              <div className="text-xs text-gray-400 tracking-wide">Leave days</div>
            </div>

            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-600 tracking-wide">Half Days</span>
                <Activity className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-700 tracking-wider mt-1">{stats.totalHalfDays}</div>
              <div className="text-xs text-gray-400 tracking-wide">Half days</div>
            </div>

            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-600 tracking-wide">Attendance Rate</span>
                {stats.attendanceRate >= 75 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
              </div>
              <div className={`text-2xl font-bold tracking-wider mt-1 ${
                stats.attendanceRate >= 75 ? 'text-green-700' : 'text-red-700'
              }`}>
                {stats.attendanceRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400 tracking-wide">Overall rate</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow-sm p-4 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-[#0071BD] transition tracking-wider"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                    From Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value)
                        if (employee) generateAttendanceData()
                      }}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                    To Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value)
                        if (employee) generateAttendanceData()
                      }}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="leave">Leave</option>
                    <option value="halfday">Half Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Info */}
          <div className="bg-white shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#0071BD]" />
                <span className="font-medium text-gray-700 tracking-wide">
                  {displayData.length} attendance records found
                </span>
                {selectedStatus !== 'all' && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    Status: {selectedStatus}
                  </span>
                )}
                {(fromDate || toDate) && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {formatDateForDisplay(fromDate)} → {formatDateForDisplay(toDate)}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 tracking-wide">
                Showing {displayData.length} of {attendanceData.length} total
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#0071BD]" />
                  <h3 className="text-sm font-semibold text-gray-800 tracking-wide">
                    Attendance Records
                  </h3>
                  <span className="text-xs text-gray-400 tracking-wide">
                    {displayData.length} records
                  </span>
                  {(fromDate || toDate) && (
                    <span className="text-xs text-[#0071BD] tracking-wide">
                      (Filtered: {formatDateForDisplay(fromDate)} to {formatDateForDisplay(toDate)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="w-12 h-12 text-gray-300" />
                          <p className="tracking-wide">No attendance records found</p>
                          <p className="text-xs text-gray-400">Try adjusting your filters or search terms</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayData.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-500 tracking-wide">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 tracking-wide">{record.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.day}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600 tracking-wide">
                            {record.checkIn}
                          </span>
                          {record.checkInLocation !== '-' && (
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {record.checkInLocation}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600 tracking-wide">
                            {record.checkOut}
                          </span>
                          {record.checkOutLocation !== '-' && (
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {record.checkOutLocation}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-medium text-gray-800 tracking-wide">
                          {record.totalHours}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">
                          {record.checkInLocation !== '-' && record.checkOutLocation !== '-'
                            ? `${record.checkInLocation} → ${record.checkOutLocation}`
                            : record.checkInLocation !== '-'
                              ? `In: ${record.checkInLocation}`
                              : record.checkOutLocation !== '-'
                                ? `Out: ${record.checkOutLocation}`
                                : '-'
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium tracking-wide rounded ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            {record.status}
                            {record.leaveType && ` (${record.leaveType})`}
                          </span>
                          {record.leaveReason && record.status === 'Leave' && (
                            <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                              {record.leaveReason}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          {displayData.length > 0 && (
            <div className="mt-6 bg-white shadow-sm p-4">
              <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 tracking-wide">
                <div>
                  Showing {displayData.length} records for {employee.personalDetails?.fullName}
                  {(fromDate || toDate) && ` (${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)})`}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded"></span>
                    Present: {stats.totalPresent}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded"></span>
                    Absent: {stats.totalAbsent}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded"></span>
                    Leaves: {stats.totalLeaves}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded"></span>
                    Half Days: {stats.totalHalfDays}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      </ProtectedEmployeeRoute>
    </>
  )
}