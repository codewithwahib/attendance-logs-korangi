// // src/app/my-attendance/[employeeId]/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useParams } from 'next/navigation'
// import Footer from '@/app/components/footer'
// import { client } from '@/sanity/lib/client'
// import ProtectedEmployeeRoute from '@/components/ProtectedEmployeeRoute'
// import NavbarDropdown from '@/app/components/navbar/page'
// import {
//   Calendar,
//   Clock,
//   User,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   RefreshCw,
//   Loader,
//   LogIn,
//   LogOut,
//   MapPin,
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
//   FileSpreadsheet
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

// interface LeaveRecord {
//   id: string
//   fromDate: string
//   toDate: string
//   leaveType: string
//   status: 'pending' | 'approved' | 'rejected' | 'cancelled'
//   reason: string
//   totalDays: number
//   appliedOn: string
// }

// export default function MyAttendancePage() {
//   const params = useParams()
//   const employeeId = params.employeeId as string
  
//   const [employee, setEmployee] = useState<Employee | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
//   const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
//   const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([])
//   const [stats, setStats] = useState({
//     totalPresent: 0,
//     totalAbsent: 0,
//     totalLeaves: 0,
//     totalHalfDays: 0,
//     attendanceRate: 0,
//     totalWorkingDays: 0
//   })
//   const [todayStatus, setTodayStatus] = useState<'checked-in' | 'checked-out' | 'not-checked' | 'on-leave'>('not-checked')
//   const [currentTime, setCurrentTime] = useState(new Date())
//   const [showLeaveDetails, setShowLeaveDetails] = useState(false)
//   const [showCheckInModal, setShowCheckInModal] = useState(false)
//   const [showCheckOutModal, setShowCheckOutModal] = useState(false)
//   const [checkInLocation, setCheckInLocation] = useState('')
//   const [checkOutLocation, setCheckOutLocation] = useState('')
//   const [isCheckingIn, setIsCheckingIn] = useState(false)
//   const [isCheckingOut, setIsCheckingOut] = useState(false)
  
//   // Date range filters
//   const [fromDate, setFromDate] = useState('')
//   const [toDate, setToDate] = useState('')
//   const [showFilters, setShowFilters] = useState(false)

//   useEffect(() => {
//     if (employeeId) {
//       fetchEmployeeData()
//     }
//     // Set default dates to current month
//     const now = new Date()
//     const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
//     const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
//     setFromDate(firstDay.toISOString().split('T')[0])
//     setToDate(lastDay.toISOString().split('T')[0])
//   }, [employeeId])

//   useEffect(() => {
//     if (employee) {
//       generateAttendanceData()
//       generateLeaveHistory()
//       calculateStats()
//       checkTodayStatus()
//     }
//   }, [employee])

//   useEffect(() => {
//     // Filter data when date range changes
//     filterDataByDateRange()
//   }, [attendanceData, fromDate, toDate])

//   // Update current time every minute
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date())
//     }, 60000)
//     return () => clearInterval(timer)
//   }, [])

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
//             joiningDate
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

//   const getDayName = (dateStr: string) => {
//     const date = new Date(dateStr)
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
//       const date = new Date(dateStr)
//       return date.toLocaleDateString('en-US', { 
//         year: 'numeric',
//         month: 'short',
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

//   const checkTodayStatus = () => {
//     if (!employee) return
    
//     const today = new Date().toISOString().split('T')[0]
    
//     // Check if on leave today
//     const onLeave = employee.leaves?.some(
//       l => l.fromDate <= today && l.toDate >= today && l.status === 'approved'
//     )
    
//     if (onLeave) {
//       setTodayStatus('on-leave')
//       return
//     }
    
//     // Check if checked in today
//     const hasCheckIn = employee.checkIn?.some(
//       c => c.time.split('T')[0] === today
//     )
    
//     if (hasCheckIn) {
//       const hasCheckOut = employee.checkOut?.some(
//         c => c.time.split('T')[0] === today
//       )
//       setTodayStatus(hasCheckOut ? 'checked-out' : 'checked-in')
//     } else {
//       setTodayStatus('not-checked')
//     }
//   }

//   const generateAttendanceData = () => {
//     if (!employee) return

//     // Get all dates from employee data
//     const allDates = new Set<string>()
    
//     employee.checkIn?.forEach(c => {
//       const date = c.time.split('T')[0]
//       allDates.add(date)
//     })
    
//     employee.checkOut?.forEach(c => {
//       const date = c.time.split('T')[0]
//       allDates.add(date)
//     })

//     // Also include leave dates
//     employee.leaves?.forEach(l => {
//       let current = new Date(l.fromDate)
//       const end = new Date(l.toDate)
//       while (current <= end) {
//         allDates.add(current.toISOString().split('T')[0])
//         current.setDate(current.getDate() + 1)
//       }
//     })

//     const sortedDates = Array.from(allDates).sort()
    
//     const records: AttendanceRecord[] = []

//     sortedDates.forEach(date => {
//       const checkIn = employee.checkIn?.find(c => c.time.split('T')[0] === date)
//       const checkOut = employee.checkOut?.find(c => c.time.split('T')[0] === date)
      
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
//   }

//   const filterDataByDateRange = () => {
//     if (!fromDate || !toDate) {
//       setFilteredData(attendanceData)
//       return
//     }

//     const from = new Date(fromDate)
//     const to = new Date(toDate)
    
//     const filtered = attendanceData.filter(record => {
//       const recordDate = new Date(record.date)
//       return recordDate >= from && recordDate <= to
//     })
    
//     setFilteredData(filtered)
//   }

//   const generateLeaveHistory = () => {
//     if (!employee || !employee.leaves) {
//       setLeaveHistory([])
//       return
//     }

//     const leaves: LeaveRecord[] = employee.leaves.map((leave, index) => ({
//       id: leave._key || `leave_${index}`,
//       fromDate: formatDate(leave.fromDate),
//       toDate: formatDate(leave.toDate),
//       leaveType: leave.leaveType,
//       status: leave.status as 'pending' | 'approved' | 'rejected' | 'cancelled',
//       reason: leave.reason || 'No reason provided',
//       totalDays: leave.totalDays || 0,
//       appliedOn: leave.appliedOn ? formatDate(leave.appliedOn) : formatDate(new Date().toISOString())
//     }))

//     setLeaveHistory(leaves)
//   }

//   const calculateStats = () => {
//     const dataToUse = filteredData.length > 0 ? filteredData : attendanceData
//     const total = dataToUse.length
//     const present = dataToUse.filter(r => r.status === 'Present').length
//     const absent = dataToUse.filter(r => r.status === 'Absent').length
//     const leave = dataToUse.filter(r => r.status === 'Leave').length
//     const halfDay = dataToUse.filter(r => r.status === 'Half Day').length
    
//     const workingDays = total
//     const attendanceRate = workingDays > 0 ? ((present + halfDay * 0.5) / workingDays) * 100 : 0

//     setStats({
//       totalPresent: present,
//       totalAbsent: absent,
//       totalLeaves: leave,
//       totalHalfDays: halfDay,
//       attendanceRate,
//       totalWorkingDays: workingDays
//     })
//   }

//   // Handle Check In
//   const handleCheckIn = async () => {
//     if (!checkInLocation) return
    
//     setIsCheckingIn(true)
//     try {
//       const currentEmployee = await client.fetch(
//         `*[_type == "employee" && personalDetails.employeeId == $employeeId][0]`,
//         { employeeId }
//       )
      
//       const newCheckIn = {
//         time: new Date().toISOString(),
//         location: checkInLocation
//       }
      
//       const updatedCheckIns = [...(currentEmployee.checkIn || []), newCheckIn]
      
//       await client
//         .patch(currentEmployee._id)
//         .set({ checkIn: updatedCheckIns })
//         .commit()
      
//       setShowCheckInModal(false)
//       setCheckInLocation('')
//       fetchEmployeeData()
//     } catch (err) {
//       console.error('Error checking in:', err)
//       alert('Failed to check in. Please try again.')
//     } finally {
//       setIsCheckingIn(false)
//     }
//   }

//   // Handle Check Out
//   const handleCheckOut = async () => {
//     if (!checkOutLocation) return
    
//     setIsCheckingOut(true)
//     try {
//       const currentEmployee = await client.fetch(
//         `*[_type == "employee" && personalDetails.employeeId == $employeeId][0]`,
//         { employeeId }
//       )
      
//       const newCheckOut = {
//         time: new Date().toISOString(),
//         location: checkOutLocation
//       }
      
//       const updatedCheckOuts = [...(currentEmployee.checkOut || []), newCheckOut]
      
//       await client
//         .patch(currentEmployee._id)
//         .set({ checkOut: updatedCheckOuts })
//         .commit()
      
//       setShowCheckOutModal(false)
//       setCheckOutLocation('')
//       fetchEmployeeData()
//     } catch (err) {
//       console.error('Error checking out:', err)
//       alert('Failed to check out. Please try again.')
//     } finally {
//       setIsCheckingOut(false)
//     }
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

//   // Get leave status color
//   const getLeaveStatusColor = (status: string) => {
//     switch(status) {
//       case 'approved': return 'bg-green-100 text-green-700'
//       case 'pending': return 'bg-yellow-100 text-yellow-700'
//       case 'rejected': return 'bg-red-100 text-red-700'
//       case 'cancelled': return 'bg-gray-100 text-gray-700'
//       default: return 'bg-gray-100 text-gray-700'
//     }
//   }

//   if (loading) {
//     return (
//       <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
//         <div className="text-center">
//           <Loader className="w-12 h-12 animate-spin text-[#0071BD] mx-auto mb-4" />
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
//         <div className="text-center bg-white shadow-sm p-8 max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Error</h3>
//           <p className="text-gray-600 mb-4 tracking-wide">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     )
//   }

//   if (!employee) {
//     return (
//       <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
//         <div className="text-center bg-white shadow-sm p-8 max-w-md">
//           <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Employee Not Found</h3>
//           <p className="text-gray-600 tracking-wide">No employee found with ID: {employeeId}</p>
//         </div>
//       </div>
//     )
//   }

//   // Data to display (filtered or all)
//   const displayData = filteredData.length > 0 ? filteredData : attendanceData

//   return (
//     <>
//     <ProtectedEmployeeRoute allowedRole='employee'>
//     <NavbarDropdown/>
//     <div className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}>
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div className="bg-[#0071BD] p-3 rounded-lg">
//                 <User className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
//                   My Attendance
//                 </h1>
//                 <p className="text-sm text-gray-500 tracking-wide mt-1">
//                   {employee.personalDetails?.fullName} • {employee.personalDetails?.employeeId}
//                 </p>
//                 <p className="text-xs text-gray-400 tracking-wide">
//                   {employee.personalDetails?.department} • {employee.personalDetails?.position}
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex gap-3">
//               <button
//                 onClick={() => window.location.reload()}
//                 className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2 tracking-wider"
//               >
//                 <RefreshCw className="w-4 h-4" />
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Today's Status Card */}
//         <div className="bg-white shadow-sm p-6 mb-6">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//             <div className="flex items-center gap-4">
//               <div className={`p-4 rounded-full ${
//                 todayStatus === 'checked-in' ? 'bg-green-100' :
//                 todayStatus === 'checked-out' ? 'bg-blue-100' :
//                 todayStatus === 'on-leave' ? 'bg-yellow-100' :
//                 'bg-gray-100'
//               }`}>
//                 {todayStatus === 'checked-in' && <LogIn className="w-8 h-8 text-green-600" />}
//                 {todayStatus === 'checked-out' && <LogOut className="w-8 h-8 text-blue-600" />}
//                 {todayStatus === 'on-leave' && <Calendar className="w-8 h-8 text-yellow-600" />}
//                 {todayStatus === 'not-checked' && <Clock className="w-8 h-8 text-gray-400" />}
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800 tracking-wide">
//                   Today's Status
//                 </h3>
//                 <p className={`text-sm font-medium tracking-wide ${
//                   todayStatus === 'checked-in' ? 'text-green-600' :
//                   todayStatus === 'checked-out' ? 'text-blue-600' :
//                   todayStatus === 'on-leave' ? 'text-yellow-600' :
//                   'text-gray-500'
//                 }`}>
//                   {todayStatus === 'checked-in' && '✅ Checked In'}
//                   {todayStatus === 'checked-out' && '🔵 Checked Out'}
//                   {todayStatus === 'on-leave' && '📅 On Leave'}
//                   {todayStatus === 'not-checked' && '⏰ Not Checked In Yet'}
//                 </p>
//                 <p className="text-xs text-gray-400 tracking-wide">
//                   {currentTime.toLocaleTimeString('en-US', { 
//                     hour: '2-digit', 
//                     minute: '2-digit',
//                     second: '2-digit',
//                     hour12: true 
//                   })}
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               {todayStatus === 'not-checked' && (
//                 <button
//                   onClick={() => setShowCheckInModal(true)}
//                   className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 tracking-wider"
//                 >
//                   <LogIn className="w-4 h-4" />
//                   Check In
//                 </button>
//               )}
//               {todayStatus === 'checked-in' && (
//                 <button
//                   onClick={() => setShowCheckOutModal(true)}
//                   className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 tracking-wider"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   Check Out
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Date Range Filter */}
//         <div className="bg-white shadow-sm p-4 mb-6">
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className="flex items-center gap-2 text-gray-700 hover:text-[#0071BD] transition tracking-wider"
//           >
//             <Filter className="w-4 h-4" />
//             {showFilters ? 'Hide Filters' : 'Show Filters'}
//             {showFilters ? '▲' : '▼'}
//           </button>

//           {showFilters && (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
//                   From Date
//                 </label>
//                 <div className="relative">
//                   <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="date"
//                     value={fromDate}
//                     onChange={(e) => setFromDate(e.target.value)}
//                     className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
//                   To Date
//                 </label>
//                 <div className="relative">
//                   <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="date"
//                     value={toDate}
//                     onChange={(e) => setToDate(e.target.value)}
//                     className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                   />
//                 </div>
//               </div>

//               <div className="flex items-end gap-2">
//                 <button
//                   onClick={() => {
//                     const now = new Date()
//                     const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
//                     const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
//                     setFromDate(firstDay.toISOString().split('T')[0])
//                     setToDate(lastDay.toISOString().split('T')[0])
//                   }}
//                   className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
//                 >
//                   This Month
//                 </button>
//                 <button
//                   onClick={() => {
//                     const now = new Date()
//                     const firstDay = new Date(now.getFullYear(), 0, 1)
//                     const lastDay = new Date(now.getFullYear(), 11, 31)
//                     setFromDate(firstDay.toISOString().split('T')[0])
//                     setToDate(lastDay.toISOString().split('T')[0])
//                   }}
//                   className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
//                 >
//                   This Year
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
//           <div className="bg-white shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-green-600 tracking-wide">Present</span>
//               <UserCheck className="w-4 h-4 text-green-600" />
//             </div>
//             <div className="text-2xl font-bold text-green-700 tracking-wider mt-1">{stats.totalPresent}</div>
//             <div className="text-xs text-gray-400 tracking-wide">Selected period</div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-red-600 tracking-wide">Absent</span>
//               <UserX className="w-4 h-4 text-red-600" />
//             </div>
//             <div className="text-2xl font-bold text-red-700 tracking-wider mt-1">{stats.totalAbsent}</div>
//             <div className="text-xs text-gray-400 tracking-wide">Selected period</div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-blue-600 tracking-wide">Leaves</span>
//               <UserMinus className="w-4 h-4 text-blue-600" />
//             </div>
//             <div className="text-2xl font-bold text-blue-700 tracking-wider mt-1">{stats.totalLeaves}</div>
//             <div className="text-xs text-gray-400 tracking-wide">Selected period</div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-yellow-600 tracking-wide">Half Days</span>
//               <Activity className="w-4 h-4 text-yellow-600" />
//             </div>
//             <div className="text-2xl font-bold text-yellow-700 tracking-wider mt-1">{stats.totalHalfDays}</div>
//             <div className="text-xs text-gray-400 tracking-wide">Selected period</div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-purple-600 tracking-wide">Attendance Rate</span>
//               {stats.attendanceRate >= 75 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
//             </div>
//             <div className={`text-2xl font-bold tracking-wider mt-1 ${
//               stats.attendanceRate >= 75 ? 'text-green-700' : 'text-red-700'
//             }`}>
//               {stats.attendanceRate.toFixed(1)}%
//             </div>
//             <div className="text-xs text-gray-400 tracking-wide">Selected period</div>
//           </div>
//         </div>

//         {/* Attendance Table */}
//         <div className="bg-white shadow-sm overflow-hidden mb-6">
//           <div className="p-4 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <Calendar className="w-5 h-5 text-[#0071BD]" />
//                 <h3 className="text-sm font-semibold text-gray-800 tracking-wide">
//                   Attendance Records
//                 </h3>
//                 <span className="text-xs text-gray-400 tracking-wide">
//                   {displayData.length} records
//                 </span>
//                 {filteredData.length > 0 && (
//                   <span className="text-xs text-[#0071BD] tracking-wide">
//                     (Filtered: {fromDate} to {toDate})
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-200">
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {displayData.length === 0 ? (
//                   <tr>
//                     <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
//                       <div className="flex flex-col items-center gap-2">
//                         <Calendar className="w-12 h-12 text-gray-300" />
//                         <p className="tracking-wide">No attendance records found</p>
//                         <p className="text-xs text-gray-400">Try adjusting your date range</p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   displayData.map((record, index) => (
//                     <tr key={index} className="hover:bg-gray-50 transition">
//                       <td className="px-4 py-3 text-sm text-gray-500 tracking-wide">{index + 1}</td>
//                       <td className="px-4 py-3 text-sm text-gray-700 tracking-wide">{record.date}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.day}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.checkIn}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.checkOut}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.totalHours}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">
//                         {record.checkInLocation !== '-' && record.checkOutLocation !== '-'
//                           ? `In: ${record.checkInLocation} | Out: ${record.checkOutLocation}`
//                           : record.checkInLocation !== '-'
//                             ? `In: ${record.checkInLocation}`
//                             : record.checkOutLocation !== '-'
//                               ? `Out: ${record.checkOutLocation}`
//                               : '-'
//                         }
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`px-2 py-1 text-xs font-medium tracking-wide rounded ${getStatusColor(record.status)}`}>
//                           {record.status}
//                           {record.leaveType && ` (${record.leaveType})`}
//                         </span>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Leave History */}
//         <div className="bg-white shadow-sm overflow-hidden">
//           <div className="p-4 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <FileText className="w-5 h-5 text-[#0071BD]" />
//                 <h3 className="text-sm font-semibold text-gray-800 tracking-wide">
//                   Leave History
//                 </h3>
//                 <span className="text-xs text-gray-400 tracking-wide">
//                   {leaveHistory.length} leaves
//                 </span>
//               </div>
//               <button
//                 onClick={() => setShowLeaveDetails(!showLeaveDetails)}
//                 className="text-xs text-[#0071BD] hover:underline tracking-wide"
//               >
//                 {showLeaveDetails ? 'Hide Details' : 'Show Details'}
//               </button>
//             </div>
//           </div>

//           {showLeaveDetails && (
//             <div className="overflow-x-auto">
//               {leaveHistory.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
//                   <p className="tracking-wide">No leave records found</p>
//                 </div>
//               ) : (
//                 <table className="w-full">
//                   <thead>
//                     <tr className="bg-gray-50 border-b border-gray-200">
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {leaveHistory.map((leave) => (
//                       <tr key={leave.id} className="hover:bg-gray-50 transition">
//                         <td className="px-4 py-3 text-sm text-gray-700 tracking-wide">{leave.leaveType}</td>
//                         <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{leave.fromDate}</td>
//                         <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{leave.toDate}</td>
//                         <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{leave.totalDays}</td>
//                         <td className="px-4 py-3 text-sm text-gray-600 tracking-wide max-w-xs truncate">
//                           {leave.reason}
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`px-2 py-1 text-xs font-medium tracking-wide rounded ${getLeaveStatusColor(leave.status)}`}>
//                             {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           )}

//           {!showLeaveDetails && leaveHistory.length > 0 && (
//             <div className="p-4">
//               <div className="flex flex-wrap gap-4">
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs text-gray-500 tracking-wide">Pending:</span>
//                   <span className="text-xs font-medium text-yellow-600">{leaveHistory.filter(l => l.status === 'pending').length}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs text-gray-500 tracking-wide">Approved:</span>
//                   <span className="text-xs font-medium text-green-600">{leaveHistory.filter(l => l.status === 'approved').length}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs text-gray-500 tracking-wide">Rejected:</span>
//                   <span className="text-xs font-medium text-red-600">{leaveHistory.filter(l => l.status === 'rejected').length}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs text-gray-500 tracking-wide">Cancelled:</span>
//                   <span className="text-xs font-medium text-gray-600">{leaveHistory.filter(l => l.status === 'cancelled').length}</span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         {displayData.length > 0 && (
//           <div className="mt-6 bg-white shadow-sm p-4">
//             <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 tracking-wide">
//               <div>
//                 Showing {displayData.length} records for {employee.personalDetails?.fullName}
//                 {filteredData.length > 0 && ` (${fromDate} to ${toDate})`}
//               </div>
//               <div className="flex flex-wrap items-center gap-4">
//                 <span className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-green-500 rounded"></span>
//                   Present: {stats.totalPresent}
//                 </span>
//                 <span className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-red-500 rounded"></span>
//                   Absent: {stats.totalAbsent}
//                 </span>
//                 <span className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-blue-500 rounded"></span>
//                   Leaves: {stats.totalLeaves}
//                 </span>
//                 <span className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-yellow-500 rounded"></span>
//                   Half Days: {stats.totalHalfDays}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Check-In Modal */}
//         {showCheckInModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-6 max-w-md w-full">
//               <h3 className="text-lg font-semibold text-gray-800 tracking-wider mb-4">Check In</h3>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
//                     Location
//                   </label>
//                   <div className="relative">
//                     <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                       type="text"
//                       value={checkInLocation}
//                       onChange={(e) => setCheckInLocation(e.target.value)}
//                       placeholder="Enter your location"
//                       className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex gap-3">
//                   <button
//                     onClick={handleCheckIn}
//                     className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
//                     disabled={!checkInLocation || isCheckingIn}
//                   >
//                     {isCheckingIn ? (
//                       <Loader className="w-4 h-4 animate-spin inline mr-2" />
//                     ) : (
//                       <LogIn className="w-4 h-4 inline mr-2" />
//                     )}
//                     {isCheckingIn ? 'Checking In...' : 'Check In'}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowCheckInModal(false)
//                       setCheckInLocation('')
//                     }}
//                     className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Check-Out Modal */}
//         {showCheckOutModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-6 max-w-md w-full">
//               <h3 className="text-lg font-semibold text-gray-800 tracking-wider mb-4">Check Out</h3>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
//                     Location
//                   </label>
//                   <div className="relative">
//                     <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                       type="text"
//                       value={checkOutLocation}
//                       onChange={(e) => setCheckOutLocation(e.target.value)}
//                       placeholder="Enter your location"
//                       className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex gap-3">
//                   <button
//                     onClick={handleCheckOut}
//                     className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
//                     disabled={!checkOutLocation || isCheckingOut}
//                   >
//                     {isCheckingOut ? (
//                       <Loader className="w-4 h-4 animate-spin inline mr-2" />
//                     ) : (
//                       <LogOut className="w-4 h-4 inline mr-2" />
//                     )}
//                     {isCheckingOut ? 'Checking Out...' : 'Check Out'}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowCheckOutModal(false)
//                       setCheckOutLocation('')
//                     }}
//                     className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//     <Footer/>
//     </ProtectedEmployeeRoute>
//     </>
//   )
// }



// src/app/my-attendance/[employeeId]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Footer from '@/app/components/footer'
import { client } from '@/sanity/lib/client'
import ProtectedEmployeeRoute from '@/components/ProtectedEmployeeRoute'
import NavbarDropdown from '@/app/components/navbar/page'
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader,
  LogIn,
  LogOut,
  MapPin,
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
  FileSpreadsheet
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

interface LeaveRecord {
  id: string
  fromDate: string
  toDate: string
  leaveType: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  reason: string
  totalDays: number
  appliedOn: string
}

export default function MyAttendancePage() {
  const params = useParams()
  const employeeId = params.employeeId as string
  
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
  const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([])
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalLeaves: 0,
    totalHalfDays: 0,
    attendanceRate: 0,
    totalWorkingDays: 0
  })
  const [todayStatus, setTodayStatus] = useState<'checked-in' | 'checked-out' | 'not-checked' | 'on-leave'>('not-checked')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showLeaveDetails, setShowLeaveDetails] = useState(false)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [checkInLocation, setCheckInLocation] = useState('')
  const [checkOutLocation, setCheckOutLocation] = useState('')
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  
  // Date range filters
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // fetchEmployeeData - useCallback
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
            joiningDate
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

  // getDayName - useCallback
  const getDayName = useCallback((dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }, [])

  // formatTime - useCallback
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

  // formatDate - useCallback
  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return '-'
    }
  }, [])

  // calculateTotalHours - useCallback
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

  // generateAttendanceData - useCallback
  const generateAttendanceData = useCallback(() => {
    if (!employee) return

    // Get all dates from employee data
    const allDates = new Set<string>()
    
    employee.checkIn?.forEach(c => {
      const date = c.time.split('T')[0]
      allDates.add(date)
    })
    
    employee.checkOut?.forEach(c => {
      const date = c.time.split('T')[0]
      allDates.add(date)
    })

    // Also include leave dates
    employee.leaves?.forEach(l => {
      let current = new Date(l.fromDate)
      const end = new Date(l.toDate)
      while (current <= end) {
        allDates.add(current.toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
      }
    })

    const sortedDates = Array.from(allDates).sort()
    
    const records: AttendanceRecord[] = []

    sortedDates.forEach(date => {
      const checkIn = employee.checkIn?.find(c => c.time.split('T')[0] === date)
      const checkOut = employee.checkOut?.find(c => c.time.split('T')[0] === date)
      
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
  }, [employee, formatDate, getDayName, formatTime, calculateTotalHours])

  // generateLeaveHistory - useCallback
  const generateLeaveHistory = useCallback(() => {
    if (!employee || !employee.leaves) {
      setLeaveHistory([])
      return
    }

    const leaves: LeaveRecord[] = employee.leaves.map((leave, index) => ({
      id: leave._key || `leave_${index}`,
      fromDate: formatDate(leave.fromDate),
      toDate: formatDate(leave.toDate),
      leaveType: leave.leaveType,
      status: leave.status as 'pending' | 'approved' | 'rejected' | 'cancelled',
      reason: leave.reason || 'No reason provided',
      totalDays: leave.totalDays || 0,
      appliedOn: leave.appliedOn ? formatDate(leave.appliedOn) : formatDate(new Date().toISOString())
    }))

    setLeaveHistory(leaves)
  }, [employee, formatDate])

  // calculateStats - useCallback
  const calculateStats = useCallback(() => {
    const dataToUse = filteredData.length > 0 ? filteredData : attendanceData
    const total = dataToUse.length
    const present = dataToUse.filter(r => r.status === 'Present').length
    const absent = dataToUse.filter(r => r.status === 'Absent').length
    const leave = dataToUse.filter(r => r.status === 'Leave').length
    const halfDay = dataToUse.filter(r => r.status === 'Half Day').length
    
    const workingDays = total
    const attendanceRate = workingDays > 0 ? ((present + halfDay * 0.5) / workingDays) * 100 : 0

    setStats({
      totalPresent: present,
      totalAbsent: absent,
      totalLeaves: leave,
      totalHalfDays: halfDay,
      attendanceRate,
      totalWorkingDays: workingDays
    })
  }, [attendanceData, filteredData])

  // checkTodayStatus - useCallback
  const checkTodayStatus = useCallback(() => {
    if (!employee) return
    
    const today = new Date().toISOString().split('T')[0]
    
    // Check if on leave today
    const onLeave = employee.leaves?.some(
      l => l.fromDate <= today && l.toDate >= today && l.status === 'approved'
    )
    
    if (onLeave) {
      setTodayStatus('on-leave')
      return
    }
    
    // Check if checked in today
    const hasCheckIn = employee.checkIn?.some(
      c => c.time.split('T')[0] === today
    )
    
    if (hasCheckIn) {
      const hasCheckOut = employee.checkOut?.some(
        c => c.time.split('T')[0] === today
      )
      setTodayStatus(hasCheckOut ? 'checked-out' : 'checked-in')
    } else {
      setTodayStatus('not-checked')
    }
  }, [employee])

  // filterDataByDateRange - useCallback
  const filterDataByDateRange = useCallback(() => {
    if (!fromDate || !toDate) {
      setFilteredData(attendanceData)
      return
    }

    const from = new Date(fromDate)
    const to = new Date(toDate)
    
    const filtered = attendanceData.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= from && recordDate <= to
    })
    
    setFilteredData(filtered)
  }, [attendanceData, fromDate, toDate])

  // Pehla useEffect - fetchEmployeeData dependency add karo
  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData()
    }
    // Set default dates to current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setFromDate(firstDay.toISOString().split('T')[0])
    setToDate(lastDay.toISOString().split('T')[0])
  }, [employeeId, fetchEmployeeData])

  // Doosra useEffect - saari dependencies add karo
  useEffect(() => {
    if (employee) {
      generateAttendanceData()
      generateLeaveHistory()
      calculateStats()
      checkTodayStatus()
    }
  }, [employee, generateAttendanceData, generateLeaveHistory, calculateStats, checkTodayStatus])

  // Teesra useEffect - filterDataByDateRange dependency add karo
  useEffect(() => {
    // Filter data when date range changes
    filterDataByDateRange()
  }, [attendanceData, fromDate, toDate, filterDataByDateRange])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Handle Check In
  const handleCheckIn = async () => {
    if (!checkInLocation) return
    
    setIsCheckingIn(true)
    try {
      const currentEmployee = await client.fetch(
        `*[_type == "employee" && personalDetails.employeeId == $employeeId][0]`,
        { employeeId }
      )
      
      const newCheckIn = {
        time: new Date().toISOString(),
        location: checkInLocation
      }
      
      const updatedCheckIns = [...(currentEmployee.checkIn || []), newCheckIn]
      
      await client
        .patch(currentEmployee._id)
        .set({ checkIn: updatedCheckIns })
        .commit()
      
      setShowCheckInModal(false)
      setCheckInLocation('')
      fetchEmployeeData()
    } catch (err) {
      console.error('Error checking in:', err)
      alert('Failed to check in. Please try again.')
    } finally {
      setIsCheckingIn(false)
    }
  }

  // Handle Check Out
  const handleCheckOut = async () => {
    if (!checkOutLocation) return
    
    setIsCheckingOut(true)
    try {
      const currentEmployee = await client.fetch(
        `*[_type == "employee" && personalDetails.employeeId == $employeeId][0]`,
        { employeeId }
      )
      
      const newCheckOut = {
        time: new Date().toISOString(),
        location: checkOutLocation
      }
      
      const updatedCheckOuts = [...(currentEmployee.checkOut || []), newCheckOut]
      
      await client
        .patch(currentEmployee._id)
        .set({ checkOut: updatedCheckOuts })
        .commit()
      
      setShowCheckOutModal(false)
      setCheckOutLocation('')
      fetchEmployeeData()
    } catch (err) {
      console.error('Error checking out:', err)
      alert('Failed to check out. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

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

  // Get leave status color
  const getLeaveStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
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

  if (error) {
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
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
        <div className="text-center bg-white shadow-sm p-8 max-w-md">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Employee Not Found</h3>
          <p className="text-gray-600 tracking-wide">No employee found with ID: {employeeId}</p>
        </div>
      </div>
    )
  }

  // Data to display (filtered or all)
  const displayData = filteredData.length > 0 ? filteredData : attendanceData

  return (
    <>
    <ProtectedEmployeeRoute allowedRole='employee'>
    <NavbarDropdown/>
    <div className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#0071BD] p-3 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
                  My Attendance
                </h1>
                <p className="text-sm text-gray-500 tracking-wide mt-1">
                  {employee.personalDetails?.fullName} • {employee.personalDetails?.employeeId}
                </p>
                <p className="text-xs text-gray-400 tracking-wide">
                  {employee.personalDetails?.department} • {employee.personalDetails?.position}
                </p>
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

        {/* Today's Status Card */}
        <div className="bg-white shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${
                todayStatus === 'checked-in' ? 'bg-green-100' :
                todayStatus === 'checked-out' ? 'bg-blue-100' :
                todayStatus === 'on-leave' ? 'bg-yellow-100' :
                'bg-gray-100'
              }`}>
                {todayStatus === 'checked-in' && <LogIn className="w-8 h-8 text-green-600" />}
                {todayStatus === 'checked-out' && <LogOut className="w-8 h-8 text-blue-600" />}
                {todayStatus === 'on-leave' && <Calendar className="w-8 h-8 text-yellow-600" />}
                {todayStatus === 'not-checked' && <Clock className="w-8 h-8 text-gray-400" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 tracking-wide">
                  Today&apos;s Status
                </h3>
                <p className={`text-sm font-medium tracking-wide ${
                  todayStatus === 'checked-in' ? 'text-green-600' :
                  todayStatus === 'checked-out' ? 'text-blue-600' :
                  todayStatus === 'on-leave' ? 'text-yellow-600' :
                  'text-gray-500'
                }`}>
                  {todayStatus === 'checked-in' && '✅ Checked In'}
                  {todayStatus === 'checked-out' && '🔵 Checked Out'}
                  {todayStatus === 'on-leave' && '📅 On Leave'}
                  {todayStatus === 'not-checked' && '⏰ Not Checked In Yet'}
                </p>
                <p className="text-xs text-gray-400 tracking-wide">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true 
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {todayStatus === 'not-checked' && (
                <button
                  onClick={() => setShowCheckInModal(true)}
                  className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 tracking-wider"
                >
                  <LogIn className="w-4 h-4" />
                  Check In
                </button>
              )}
              {todayStatus === 'checked-in' && (
                <button
                  onClick={() => setShowCheckOutModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  Check Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white shadow-sm p-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 hover:text-[#0071BD] transition tracking-wider"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {showFilters ? '▲' : '▼'}
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                  From Date
                </label>
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
                <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                  To Date
                </label>
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

              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    const now = new Date()
                    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
                    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    setFromDate(firstDay.toISOString().split('T')[0])
                    setToDate(lastDay.toISOString().split('T')[0])
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
                >
                  This Month
                </button>
                <button
                  onClick={() => {
                    const now = new Date()
                    const firstDay = new Date(now.getFullYear(), 0, 1)
                    const lastDay = new Date(now.getFullYear(), 11, 31)
                    setFromDate(firstDay.toISOString().split('T')[0])
                    setToDate(lastDay.toISOString().split('T')[0])
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
                >
                  This Year
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 tracking-wide">Present</span>
              <UserCheck className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700 tracking-wider mt-1">{stats.totalPresent}</div>
            <div className="text-xs text-gray-400 tracking-wide">Selected period</div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600 tracking-wide">Absent</span>
              <UserX className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-700 tracking-wider mt-1">{stats.totalAbsent}</div>
            <div className="text-xs text-gray-400 tracking-wide">Selected period</div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600 tracking-wide">Leaves</span>
              <UserMinus className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700 tracking-wider mt-1">{stats.totalLeaves}</div>
            <div className="text-xs text-gray-400 tracking-wide">Selected period</div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-600 tracking-wide">Half Days</span>
              <Activity className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-700 tracking-wider mt-1">{stats.totalHalfDays}</div>
            <div className="text-xs text-gray-400 tracking-wide">Selected period</div>
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
            <div className="text-xs text-gray-400 tracking-wide">Selected period</div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#0071BD]" />
                <h3 className="text-sm font-semibold text-gray-800 tracking-wide">
                  Attendance Records
                </h3>
                <span className="text-xs text-gray-400 tracking-wide">
                  {displayData.length} records
                </span>
                {filteredData.length > 0 && (
                  <span className="text-xs text-[#0071BD] tracking-wide">
                    (Filtered: {fromDate} to {toDate})
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="w-12 h-12 text-gray-300" />
                        <p className="tracking-wide">No attendance records found</p>
                        <p className="text-xs text-gray-400">Try adjusting your date range</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-500 tracking-wide">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 tracking-wide">{record.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.day}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.checkIn}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.checkOut}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.totalHours}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">
                        {record.checkInLocation !== '-' && record.checkOutLocation !== '-'
                          ? `In: ${record.checkInLocation} | Out: ${record.checkOutLocation}`
                          : record.checkInLocation !== '-'
                            ? `In: ${record.checkInLocation}`
                            : record.checkOutLocation !== '-'
                              ? `Out: ${record.checkOutLocation}`
                              : '-'
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium tracking-wide rounded ${getStatusColor(record.status)}`}>
                          {record.status}
                          {record.leaveType && ` (${record.leaveType})`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave History */}
        <div className="bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#0071BD]" />
                <h3 className="text-sm font-semibold text-gray-800 tracking-wide">
                  Leave History
                </h3>
                <span className="text-xs text-gray-400 tracking-wide">
                  {leaveHistory.length} leaves
                </span>
              </div>
              <button
                onClick={() => setShowLeaveDetails(!showLeaveDetails)}
                className="text-xs text-[#0071BD] hover:underline tracking-wide"
              >
                {showLeaveDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>

          {showLeaveDetails && (
            <div className="overflow-x-auto">
              {leaveHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="tracking-wide">No leave records found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leaveHistory.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-700 tracking-wide">{leave.leaveType}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{leave.fromDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{leave.toDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{leave.totalDays}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 tracking-wide max-w-xs truncate">
                          {leave.reason}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium tracking-wide rounded ${getLeaveStatusColor(leave.status)}`}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {!showLeaveDetails && leaveHistory.length > 0 && (
            <div className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 tracking-wide">Pending:</span>
                  <span className="text-xs font-medium text-yellow-600">{leaveHistory.filter(l => l.status === 'pending').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 tracking-wide">Approved:</span>
                  <span className="text-xs font-medium text-green-600">{leaveHistory.filter(l => l.status === 'approved').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 tracking-wide">Rejected:</span>
                  <span className="text-xs font-medium text-red-600">{leaveHistory.filter(l => l.status === 'rejected').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 tracking-wide">Cancelled:</span>
                  <span className="text-xs font-medium text-gray-600">{leaveHistory.filter(l => l.status === 'cancelled').length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {displayData.length > 0 && (
          <div className="mt-6 bg-white shadow-sm p-4">
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 tracking-wide">
              <div>
                Showing {displayData.length} records for {employee.personalDetails?.fullName}
                {filteredData.length > 0 && ` (${fromDate} to ${toDate})`}
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

        {/* Check-In Modal */}
        {showCheckInModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 tracking-wider mb-4">Check In</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={checkInLocation}
                      onChange={(e) => setCheckInLocation(e.target.value)}
                      placeholder="Enter your location"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCheckIn}
                    className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!checkInLocation || isCheckingIn}
                  >
                    {isCheckingIn ? (
                      <Loader className="w-4 h-4 animate-spin inline mr-2" />
                    ) : (
                      <LogIn className="w-4 h-4 inline mr-2" />
                    )}
                    {isCheckingIn ? 'Checking In...' : 'Check In'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCheckInModal(false)
                      setCheckInLocation('')
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Check-Out Modal */}
        {showCheckOutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 tracking-wider mb-4">Check Out</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={checkOutLocation}
                      onChange={(e) => setCheckOutLocation(e.target.value)}
                      placeholder="Enter your location"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCheckOut}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!checkOutLocation || isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <Loader className="w-4 h-4 animate-spin inline mr-2" />
                    ) : (
                      <LogOut className="w-4 h-4 inline mr-2" />
                    )}
                    {isCheckingOut ? 'Checking Out...' : 'Check Out'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCheckOutModal(false)
                      setCheckOutLocation('')
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </ProtectedEmployeeRoute>
    </>
  )
}