// // app/hr/leaves/page.tsx

// 'use client'

// import { useState, useEffect } from 'react'
// import NavbarDropdown from '@/app/components/navbar/page'
// import { format, parseISO } from 'date-fns'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import {
//   Calendar,
//   Clock,
//   User,
//   Building,
//   Search,
//   ChevronDown,
//   ChevronUp,
//   RefreshCw,
//   CheckCircle,
//   Loader,
//   XCircle,
//   AlertCircle,
//   Trash2,
//   MessageCircle,
//   FileText,
//   Clock as ClockIcon,
//   Check,
//   X
// } from 'lucide-react'

// import { Roboto } from 'next/font/google'

// const roboto = Roboto({
//   weight: ['100', '300', '400', '500', '700', '900'],
//   style: ['normal', 'italic'],
//   subsets: ['latin'],
//   display: 'swap',
// })

// // =====================================================
// // TYPES
// // =====================================================

// interface LeaveRecord {
//   _key: string
//   leaveKey: string

//   employeeName: string
//   employeeId: string
//   department: string
//   position: string

//   leaveType: string
//   fromDate: string
//   toDate: string
//   totalDays: number

//   reason: string
//   status: 'pending' | 'approved' | 'rejected' | 'cancelled'

//   appliedOn: string
//   adminRemarks?: string
//   updatedOn?: string

//   employeeRef: string
// }

// interface FilterOptions {
//   status: string
//   department: string
//   leaveType: string
//   search: string
//   fromDate: string
//   toDate: string
// }

// // =====================================================
// // PAGE
// // =====================================================

// export default function HRLeaveManagementPage() {
//   const [leaves, setLeaves] = useState<LeaveRecord[]>([])
//   const [filteredLeaves, setFilteredLeaves] = useState<LeaveRecord[]>([])

//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const [expandedLeave, setExpandedLeave] = useState<string | null>(null)

//   const [departments, setDepartments] = useState<string[]>([])
//   const [leaveTypes, setLeaveTypes] = useState<string[]>([])

//   const [stats, setStats] = useState({
//     total: 0,
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//     cancelled: 0
//   })

//   const [filters, setFilters] = useState<FilterOptions>({
//     status: 'all',
//     department: 'all',
//     leaveType: 'all',
//     search: '',
//     fromDate: '',
//     toDate: ''
//   })

//   const [showActionModal, setShowActionModal] = useState(false)

//   const [selectedLeave, setSelectedLeave] =
//     useState<LeaveRecord | null>(null)

//   const [actionType, setActionType] =
//     useState<'approve' | 'reject' | 'delete'>('approve')

//   const [adminRemarks, setAdminRemarks] = useState('')

//   const [updating, setUpdating] = useState(false)

//   const [modalError, setModalError] = useState('')

//   // =====================================================
//   // LOAD DATA
//   // =====================================================

//   useEffect(() => {
//     fetchLeaves()
//   }, [])

//   useEffect(() => {
//     applyFilters()
//   }, [leaves, filters])

//   // =====================================================
//   // GET LEAVES
//   // =====================================================

//   const fetchLeaves = async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       const params = new URLSearchParams()

//       if (filters.status !== 'all') {
//         params.append('status', filters.status)
//       }

//       if (filters.department !== 'all') {
//         params.append('department', filters.department)
//       }

//       if (filters.fromDate) {
//         params.append('fromDate', filters.fromDate)
//       }

//       if (filters.toDate) {
//         params.append('toDate', filters.toDate)
//       }

//       const response = await fetch(
//         `/api/hr/leaves?${params.toString()}`,
//         {
//           method: 'GET',
//           headers: {
//             Accept: 'application/json'
//           },
//           cache: 'no-store'
//         }
//       )

//       const result = await response.json()

//       console.log('API leave response:', result)

//       if (!response.ok || !result.success) {
//         throw new Error(
//           result.error || 'Failed to fetch leaves'
//         )
//       }

//       // =====================================================
//       // NORMALIZE DATA
//       // =====================================================

//       const normalizedLeaves: LeaveRecord[] =
//         Array.isArray(result.data)
//           ? result.data
//               .map((leave: any) => {
//                 const key =
//                   leave.leaveKey ||
//                   leave._key ||
//                   ''

//                 return {
//                   _key: key,
//                   leaveKey: key,

//                   employeeName:
//                     leave.employeeName || '',

//                   employeeId:
//                     leave.employeeId || '',

//                   department:
//                     leave.department || '',

//                   position:
//                     leave.position || '',

//                   leaveType:
//                     leave.leaveType || '',

//                   fromDate:
//                     leave.fromDate || '',

//                   toDate:
//                     leave.toDate || '',

//                   totalDays:
//                     Number(leave.totalDays) || 0,

//                   reason:
//                     leave.reason || '',

//                   status:
//                     leave.status || 'pending',

//                   appliedOn:
//                     leave.appliedOn || '',

//                   adminRemarks:
//                     leave.adminRemarks || '',

//                   updatedOn:
//                     leave.updatedOn || '',

//                   employeeRef:
//                     leave.employeeRef || ''
//                 }
//               })
//               .filter(
//                 (leave: LeaveRecord) =>
//                   Boolean(leave.leaveKey)
//               )
//           : []

//       console.log(
//         'Normalized leaves:',
//         normalizedLeaves
//       )

//       console.log(
//         'Leave keys:',
//         normalizedLeaves.map((leave) => ({
//           leaveKey: leave.leaveKey,
//           _key: leave._key,
//           employeeRef: leave.employeeRef,
//           employeeName: leave.employeeName
//         }))
//       )

//       setLeaves(normalizedLeaves)

//       // =====================================================
//       // DEPARTMENTS
//       // =====================================================

//       const depts = [
//         ...new Set(
//           normalizedLeaves
//             .map((leave) => leave.department)
//             .filter(Boolean)
//         )
//       ]

//       setDepartments(depts)

//       // =====================================================
//       // LEAVE TYPES
//       // =====================================================

//       const types = [
//         ...new Set(
//           normalizedLeaves
//             .map((leave) => leave.leaveType)
//             .filter(Boolean)
//         )
//       ]

//       setLeaveTypes(types)

//       // =====================================================
//       // STATS
//       // =====================================================

//       updateStats(normalizedLeaves)
//     } catch (err) {
//       console.error(
//         'Error fetching leaves:',
//         err
//       )

//       setError(
//         err instanceof Error
//           ? err.message
//           : 'Failed to load leave data'
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   // =====================================================
//   // STATS
//   // =====================================================

//   const updateStats = (
//     data: LeaveRecord[]
//   ) => {
//     setStats({
//       total: data.length,

//       pending: data.filter(
//         (leave) =>
//           leave.status === 'pending'
//       ).length,

//       approved: data.filter(
//         (leave) =>
//           leave.status === 'approved'
//       ).length,

//       rejected: data.filter(
//         (leave) =>
//           leave.status === 'rejected'
//       ).length,

//       cancelled: data.filter(
//         (leave) =>
//           leave.status === 'cancelled'
//       ).length
//     })
//   }

//   // =====================================================
//   // FILTERS
//   // =====================================================

//   const applyFilters = () => {
//     let filtered = [...leaves]

//     if (filters.search) {
//       const search =
//         filters.search.toLowerCase()

//       filtered = filtered.filter(
//         (leave) =>
//           leave.employeeName
//             ?.toLowerCase()
//             .includes(search) ||

//           leave.employeeId
//             ?.toLowerCase()
//             .includes(search) ||

//           leave.leaveType
//             ?.toLowerCase()
//             .includes(search) ||

//           leave.department
//             ?.toLowerCase()
//             .includes(search)
//       )
//     }

//     if (filters.status !== 'all') {
//       filtered = filtered.filter(
//         (leave) =>
//           leave.status === filters.status
//       )
//     }

//     if (filters.department !== 'all') {
//       filtered = filtered.filter(
//         (leave) =>
//           leave.department ===
//           filters.department
//       )
//     }

//     if (filters.leaveType !== 'all') {
//       filtered = filtered.filter(
//         (leave) =>
//           leave.leaveType ===
//           filters.leaveType
//       )
//     }

//     if (filters.fromDate) {
//       filtered = filtered.filter(
//         (leave) =>
//           leave.fromDate >=
//           filters.fromDate
//       )
//     }

//     if (filters.toDate) {
//       filtered = filtered.filter(
//         (leave) =>
//           leave.toDate <=
//           filters.toDate
//       )
//     }

//     setFilteredLeaves(filtered)
//   }

//   // =====================================================
//   // APPROVE / REJECT
//   // =====================================================

//   const handleStatusUpdate = async (
//     leave: LeaveRecord,
//     status: 'approved' | 'rejected'
//   ) => {
//     console.log(
//       'Handle status update:',
//       leave,
//       status
//     )

//     const leaveKey =
//       leave.leaveKey ||
//       leave._key

//     const employeeRef =
//       leave.employeeRef

//     // IMPORTANT
//     // This is the error you were getting.
//     if (!leaveKey) {
//       console.error(
//         'Leave key missing:',
//         leave
//       )

//       setModalError(
//         'Leave key is missing. Please refresh the page.'
//       )

//       return
//     }

//     if (!employeeRef) {
//       console.error(
//         'Employee reference missing:',
//         leave
//       )

//       setModalError(
//         'Employee reference is missing. Please refresh the page.'
//       )

//       return
//     }

//     try {
//       setUpdating(true)
//       setModalError('')

//       const payload = {
//         leaveKey,
//         employeeId: employeeRef,
//         status,
//         reason: adminRemarks || ''
//       }

//       console.log(
//         'Sending PUT payload:',
//         payload
//       )

//       const response = await fetch(
//         '/api/hr/leaves',
//         {
//           method: 'PUT',
//           headers: {
//             'Content-Type':
//               'application/json',

//             Accept:
//               'application/json'
//           },
//           body: JSON.stringify(payload)
//         }
//       )

//       const result =
//         await response.json()

//       console.log(
//         'PUT response:',
//         result
//       )

//       if (
//         !response.ok ||
//         !result.success
//       ) {
//         throw new Error(
//           result.error ||
//             'Failed to update leave status'
//         )
//       }

//       // =====================================================
//       // UPDATE LOCAL STATE
//       // =====================================================

//       const updatedLeaves =
//         leaves.map((item) => {
//           const itemKey =
//             item.leaveKey ||
//             item._key

//           if (itemKey === leaveKey) {
//             return {
//               ...item,
//               status,
//               adminRemarks:
//                 adminRemarks ||
//                 item.adminRemarks
//             }
//           }

//           return item
//         })

//       setLeaves(updatedLeaves)

//       updateStats(updatedLeaves)

//       setShowActionModal(false)
//       setAdminRemarks('')
//       setSelectedLeave(null)
//       setModalError('')

//       alert(
//         `Leave ${status} successfully!`
//       )
//     } catch (err) {
//       console.error(
//         'Error updating leave:',
//         err
//       )

//       setModalError(
//         err instanceof Error
//           ? err.message
//           : 'Failed to update leave status'
//       )
//     } finally {
//       setUpdating(false)
//     }
//   }

//   // =====================================================
//   // DELETE
//   // =====================================================

//   const handleDeleteLeave = async (
//     leave: LeaveRecord
//   ) => {
//     console.log(
//       'Handle delete:',
//       leave
//     )

//     const leaveKey =
//       leave.leaveKey ||
//       leave._key

//     const employeeRef =
//       leave.employeeRef

//     if (!leaveKey) {
//       setModalError(
//         'Leave key is missing. Please refresh the page.'
//       )

//       return
//     }

//     if (!employeeRef) {
//       setModalError(
//         'Employee reference is missing. Please refresh the page.'
//       )

//       return
//     }

//     try {
//       setUpdating(true)
//       setModalError('')

//       const params =
//         new URLSearchParams({
//           leaveKey,
//           employeeId: employeeRef
//         })

//       console.log(
//         'Deleting leave:',
//         {
//           leaveKey,
//           employeeId: employeeRef
//         }
//       )

//       const response = await fetch(
//         `/api/hr/leaves?${params.toString()}`,
//         {
//           method: 'DELETE',
//           headers: {
//             Accept:
//               'application/json'
//           }
//         }
//       )

//       const result =
//         await response.json()

//       console.log(
//         'DELETE response:',
//         result
//       )

//       if (
//         !response.ok ||
//         !result.success
//       ) {
//         throw new Error(
//           result.error ||
//             'Failed to delete leave'
//         )
//       }

//       // =====================================================
//       // REMOVE FROM LOCAL STATE
//       // =====================================================

//       const updatedLeaves =
//         leaves.filter((item) => {
//           const itemKey =
//             item.leaveKey ||
//             item._key

//           return itemKey !== leaveKey
//         })

//       setLeaves(updatedLeaves)

//       updateStats(updatedLeaves)

//       setShowActionModal(false)
//       setSelectedLeave(null)
//       setModalError('')

//       alert(
//         'Leave request deleted successfully!'
//       )
//     } catch (err) {
//       console.error(
//         'Error deleting leave:',
//         err
//       )

//       setModalError(
//         err instanceof Error
//           ? err.message
//           : 'Failed to delete leave'
//       )
//     } finally {
//       setUpdating(false)
//     }
//   }

//   // =====================================================
//   // STATUS COLOR
//   // =====================================================

//   const getStatusColor = (
//     status: string
//   ) => {
//     switch (status) {
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-700'

//       case 'approved':
//         return 'bg-green-100 text-green-700'

//       case 'rejected':
//         return 'bg-red-100 text-red-700'

//       case 'cancelled':
//         return 'bg-gray-100 text-gray-700'

//       default:
//         return 'bg-gray-100 text-gray-700'
//     }
//   }

//   // =====================================================
//   // STATUS ICON
//   // =====================================================

//   const getStatusIcon = (
//     status: string
//   ) => {
//     switch (status) {
//       case 'pending':
//         return (
//           <ClockIcon className="w-4 h-4" />
//         )

//       case 'approved':
//         return (
//           <CheckCircle className="w-4 h-4" />
//         )

//       case 'rejected':
//         return (
//           <XCircle className="w-4 h-4" />
//         )

//       case 'cancelled':
//         return (
//           <XCircle className="w-4 h-4" />
//         )

//       default:
//         return null
//     }
//   }

//   // =====================================================
//   // DATE FORMAT
//   // =====================================================

//   const formatDate = (
//     date: string
//   ) => {
//     if (!date) return 'N/A'

//     try {
//       return format(
//         parseISO(date),
//         'MMM dd, yyyy'
//       )
//     } catch {
//       return date
//     }
//   }

//   const formatDateTime = (
//     date: string
//   ) => {
//     if (!date) return 'N/A'

//     try {
//       return format(
//         parseISO(date),
//         'MMM dd, yyyy hh:mm a'
//       )
//     } catch {
//       return date
//     }
//   }

//   // =====================================================
//   // DAYS BETWEEN
//   // =====================================================

//   const getDaysBetween = (
//     fromDate: string,
//     toDate: string
//   ) => {
//     if (!fromDate || !toDate) {
//       return 0
//     }

//     try {
//       const from = parseISO(fromDate)
//       const to = parseISO(toDate)

//       const diffTime =
//         Math.abs(
//           to.getTime() -
//             from.getTime()
//         )

//       return (
//         Math.ceil(
//           diffTime /
//             (1000 * 60 * 60 * 24)
//         ) + 1
//       )
//     } catch {
//       return 0
//     }
//   }

//   // =====================================================
//   // EXPAND
//   // =====================================================

//   const toggleExpand = (
//     key: string
//   ) => {
//     setExpandedLeave(
//       expandedLeave === key
//         ? null
//         : key
//     )
//   }

//   // =====================================================
//   // MODAL
//   // =====================================================

//   const openActionModal = (
//     leave: LeaveRecord,
//     action:
//       | 'approve'
//       | 'reject'
//       | 'delete'
//   ) => {
//     console.log(
//       'Opening modal:',
//       leave
//     )

//     console.log(
//       'Leave key:',
//       leave.leaveKey ||
//         leave._key
//     )

//     console.log(
//       'Employee ref:',
//       leave.employeeRef
//     )

//     setSelectedLeave(leave)
//     setActionType(action)
//     setAdminRemarks('')
//     setModalError('')
//     setShowActionModal(true)
//   }

//   // =====================================================
//   // SEARCH CLEAR
//   // =====================================================

//   const clearSearch = () => {
//     setFilters({
//       ...filters,
//       search: ''
//     })
//   }

//   // =====================================================
//   // LOADING
//   // =====================================================

//   if (loading) {
//     return (
//       <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
//         <div className="text-center">
//           <Loader className="w-12 h-12 animate-spin text-[#0071BD] mx-auto mb-4" />
//         </div>
//       </div>
//     )
//   }


//   // =====================================================
//   // ERROR
//   // =====================================================

//   if (error) {
//     return (
//       <div
//         className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}
//       >
//         <div className="text-center bg-white shadow-sm p-8 max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />

//           <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">
//             Error
//           </h3>

//           <p className="text-gray-600 mb-4 tracking-wide">
//             {error}
//           </p>

//           <button
//             onClick={fetchLeaves}
//             className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     )
//   }

//   // =====================================================
//   // UI
//   // =====================================================

//   return (
//     <>
//     <ProtectedRoute allowedUser='hr'>
//     <NavbarDropdown/>
//     <div
//       className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}
//     >
//       <div className="max-w-7xl mx-auto">

//         {/* =====================================================
//             HEADER
//         ===================================================== */}

//         <div className="mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

//             <div className="flex items-center gap-3">

//               <div>
//                 <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
//                   Leave Management
//                 </h1>

//                 <p className="text-sm text-gray-500 tracking-wide mt-1">
//                   {filteredLeaves.length} leave requests •{' '}
//                   {stats.pending} pending
//                 </p>
//               </div>
//             </div>

//             <div className="relative flex-1 max-w-md">
//               <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

//               <input
//                 type="text"
//                 placeholder="Search by name, ID, or type..."
//                 value={filters.search}
//                 onChange={(e) =>
//                   setFilters({
//                     ...filters,
//                     search: e.target.value
//                   })
//                 }
//                 className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//               />

//               {filters.search && (
//                 <button
//                   onClick={clearSearch}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
//                   aria-label="Clear search"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* =====================================================
//             STATS
//         ===================================================== */}

//         <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-[#0071BD] tracking-wide">
//               Total
//             </div>

//             <div className="text-2xl font-bold text-[#0071BD] tracking-wider">
//               {stats.total}
//             </div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-yellow-600 tracking-wide">
//               Pending
//             </div>

//             <div className="text-2xl font-bold text-yellow-700 tracking-wider">
//               {stats.pending}
//             </div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-green-600 tracking-wide">
//               Approved
//             </div>

//             <div className="text-2xl font-bold text-green-700 tracking-wider">
//               {stats.approved}
//             </div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-red-600 tracking-wide">
//               Rejected
//             </div>

//             <div className="text-2xl font-bold text-red-700 tracking-wider">
//               {stats.rejected}
//             </div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-gray-600 tracking-wide">
//               Cancelled
//             </div>

//             <div className="text-2xl font-bold text-gray-700 tracking-wider">
//               {stats.cancelled}
//             </div>
//           </div>

//         </div>

//         {/* =====================================================
//             FILTERS
//         ===================================================== */}

//         <div className="bg-white shadow-sm p-4 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

//             {/* Status */}
//             <div>
//               <select
//                 value={filters.status}
//                 onChange={(e) =>
//                   setFilters({
//                     ...filters,
//                     status: e.target.value
//                   })
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//               >
//                 <option value="all">
//                   All Status
//                 </option>

//                 <option value="pending">
//                   Pending
//                 </option>

//                 <option value="approved">
//                   Approved
//                 </option>

//                 <option value="rejected">
//                   Rejected
//                 </option>

//                 <option value="cancelled">
//                   Cancelled
//                 </option>
//               </select>
//             </div>

//             {/* Department */}
//             <div>
//               <select
//                 value={filters.department}
//                 onChange={(e) =>
//                   setFilters({
//                     ...filters,
//                     department:
//                       e.target.value
//                   })
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//               >
//                 <option value="all">
//                   All Departments
//                 </option>

//                 {departments.map(
//                   (dept) => (
//                     <option
//                       key={dept}
//                       value={dept}
//                     >
//                       {dept}
//                     </option>
//                   )
//                 )}
//               </select>
//             </div>

//             {/* Leave Type */}
//             <div>
//               <select
//                 value={filters.leaveType}
//                 onChange={(e) =>
//                   setFilters({
//                     ...filters,
//                     leaveType:
//                       e.target.value
//                   })
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//               >
//                 <option value="all">
//                   All Leave Types
//                 </option>

//                 {leaveTypes.map(
//                   (type) => (
//                     <option
//                       key={type}
//                       value={type}
//                     >
//                       {type}
//                     </option>
//                   )
//                 )}
//               </select>
//             </div>

//             {/* From Date */}
//             <div>
//               <div className="relative">
//                 <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="date"
//                   value={filters.fromDate}
//                   onChange={(e) =>
//                     setFilters({
//                       ...filters,
//                       fromDate:
//                         e.target.value
//                     })
//                   }
//                   className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                 />
//               </div>
//             </div>

//             {/* To Date */}
//             <div>
//               <div className="relative">
//                 <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="date"
//                   value={filters.toDate}
//                   onChange={(e) =>
//                     setFilters({
//                       ...filters,
//                       toDate:
//                         e.target.value
//                     })
//                   }
//                   className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                 />
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* =====================================================
//             LEAVE LIST
//         ===================================================== */}

//         <div className="space-y-4">

//           {filteredLeaves.length === 0 ? (

//             <div className="bg-white shadow-sm p-12 text-center">

//               <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />

//               <h3 className="text-xl font-semibold text-gray-600 mb-2 tracking-wider">
//                 No leave requests found
//               </h3>

//               <p className="text-gray-400 tracking-wide">
//                 Try adjusting your filters or search terms
//               </p>

//             </div>

//           ) : (

//             filteredLeaves.map(
//               (leave) => {

//                 const leaveKey =
//                   leave.leaveKey ||
//                   leave._key

//                 const isExpanded =
//                   expandedLeave ===
//                   leaveKey

//                 const days =
//                   getDaysBetween(
//                     leave.fromDate,
//                     leave.toDate
//                   )

//                 return (
//                   <div
//                     key={
//                       leaveKey ||
//                       `${leave.employeeRef}-${leave.appliedOn}`
//                     }
//                     className="bg-white shadow-sm overflow-hidden hover:shadow-md transition"
//                   >

//                     {/* =====================================================
//                         HEADER
//                     ===================================================== */}

//                     <div
//                       className="p-4 cursor-pointer hover:bg-gray-50 transition"
//                       onClick={() =>
//                         leaveKey &&
//                         toggleExpand(
//                           leaveKey
//                         )
//                       }
//                     >

//                       <div className="flex flex-wrap items-center justify-between gap-4">

//                         <div className="flex items-center gap-4 flex-1 min-w-0">

//                           <div className="w-10 h-10 flex items-center justify-center text-gray-400 flex-shrink-0">
//                             <User className="w-8 h-8" />
//                           </div>

//                           <div className="min-w-0">

//                             <h3 className="font-semibold text-gray-800 truncate tracking-wide">
//                               {leave.employeeName ||
//                                 'Unknown'}
//                             </h3>

//                             <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 tracking-wide">

//                               <span>
//                                 ID:{' '}
//                                 {leave.employeeId ||
//                                   'N/A'}
//                               </span>

//                               <span className="w-1 h-1 bg-gray-300"></span>

//                               <span className="flex items-center gap-1">
//                                 <Building className="w-3 h-3" />

//                                 {leave.department ||
//                                   'N/A'}
//                               </span>

//                               <span className="w-1 h-1 bg-gray-300"></span>

//                               <span>
//                                 {leave.position ||
//                                   'N/A'}
//                               </span>

//                             </div>

//                           </div>
//                         </div>

//                         <div className="flex items-center gap-4 flex-shrink-0">

//                           <span className="text-sm text-gray-500 tracking-wide">
//                             {formatDate(
//                               leave.fromDate
//                             )}{' '}
//                             -{' '}
//                             {formatDate(
//                               leave.toDate
//                             )}
//                           </span>

//                           <span className="text-sm font-medium text-gray-700 tracking-wide">
//                             {days} day
//                             {days > 1
//                               ? 's'
//                               : ''}
//                           </span>

//                           <div
//                             className={`px-3 py-1 text-xs font-medium flex items-center gap-1 ${getStatusColor(
//                               leave.status
//                             )} tracking-wide`}
//                           >
//                             {getStatusIcon(
//                               leave.status
//                             )}

//                             {leave.status
//                               .charAt(0)
//                               .toUpperCase() +
//                               leave.status.slice(
//                                 1
//                               )}
//                           </div>

//                           <div className="text-gray-400">
//                             {isExpanded ? (
//                               <ChevronUp className="w-5 h-5" />
//                             ) : (
//                               <ChevronDown className="w-5 h-5" />
//                             )}
//                           </div>

//                         </div>

//                       </div>
//                     </div>

//                     {/* =====================================================
//                         DETAILS
//                     ===================================================== */}

//                     {isExpanded && (
//                       <div className="border-t border-gray-100 p-4">

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                           {/* Leave Details */}
//                           <div>

//                             <h4 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider mb-3">
//                               <Calendar className="w-4 h-4" />
//                               Leave Details
//                             </h4>

//                             <div className="space-y-2 text-sm tracking-wide">

//                               <div className="flex justify-between">
//                                 <span className="text-gray-500">
//                                   Leave Type:
//                                 </span>

//                                 <span className="font-medium">
//                                   {leave.leaveType ||
//                                     'N/A'}
//                                 </span>
//                               </div>

//                               <div className="flex justify-between">
//                                 <span className="text-gray-500">
//                                   From:
//                                 </span>

//                                 <span>
//                                   {formatDate(
//                                     leave.fromDate
//                                   )}
//                                 </span>
//                               </div>

//                               <div className="flex justify-between">
//                                 <span className="text-gray-500">
//                                   To:
//                                 </span>

//                                 <span>
//                                   {formatDate(
//                                     leave.toDate
//                                   )}
//                                 </span>
//                               </div>

//                               <div className="flex justify-between">
//                                 <span className="text-gray-500">
//                                   Total Days:
//                                 </span>

//                                 <span className="font-medium">
//                                   {days}
//                                 </span>
//                               </div>

//                               <div className="flex justify-between">
//                                 <span className="text-gray-500">
//                                   Applied On:
//                                 </span>

//                                 <span className="text-xs text-gray-400">
//                                   {formatDateTime(
//                                     leave.appliedOn
//                                   )}
//                                 </span>
//                               </div>

//                             </div>
//                           </div>

//                           {/* Reason */}
//                           <div>

//                             <h4 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider mb-3">
//                               <MessageCircle className="w-4 h-4" />
//                               Reason
//                             </h4>

//                             <div className="bg-gray-50 p-3 text-sm text-gray-700 min-h-[60px] tracking-wide">
//                               {leave.reason ||
//                                 'No reason provided'}
//                             </div>

//                             {leave.adminRemarks && (
//                               <div className="mt-3">

//                                 <h4 className="font-medium text-gray-700 mb-1 tracking-wider">
//                                   Admin Remarks
//                                 </h4>

//                                 <div className="bg-blue-50 p-3 text-sm text-blue-700 tracking-wide">
//                                   {
//                                     leave.adminRemarks
//                                   }
//                                 </div>

//                               </div>
//                             )}

//                           </div>

//                         </div>

//                         {/* =====================================================
//                             ACTION BUTTONS
//                         ===================================================== */}

//                         {leave.status ===
//                           'pending' && (
//                           <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">

//                             <button
//                               onClick={() =>
//                                 openActionModal(
//                                   leave,
//                                   'approve'
//                                 )
//                               }
//                               className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 tracking-wider"
//                             >
//                               <Check className="w-4 h-4" />
//                               Approve
//                             </button>

//                             <button
//                               onClick={() =>
//                                 openActionModal(
//                                   leave,
//                                   'reject'
//                                 )
//                               }
//                               className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2 tracking-wider"
//                             >
//                               <X className="w-4 h-4" />
//                               Reject
//                             </button>

//                             <button
//                               onClick={() =>
//                                 openActionModal(
//                                   leave,
//                                   'delete'
//                                 )
//                               }
//                               className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition flex items-center gap-2 tracking-wider"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                               Delete
//                             </button>

//                           </div>
//                         )}

//                         {leave.status !==
//                           'pending' && (
//                           <div className="mt-4 border-t pt-4 flex justify-end">

//                             <button
//                               onClick={() =>
//                                 openActionModal(
//                                   leave,
//                                   'delete'
//                                 )
//                               }
//                               className="px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center gap-2 tracking-wider"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                               Delete Request
//                             </button>

//                           </div>
//                         )}

//                       </div>
//                     )}

//                   </div>
//                 )
//               }
//             )

//           )}

//         </div>

//         {/* =====================================================
//             FOOTER STATS
//         ===================================================== */}

//         {filteredLeaves.length > 0 && (
//           <div className="mt-6 bg-white shadow-sm p-4">

//             <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 tracking-wide">

//               <div>
//                 Showing{' '}
//                 {filteredLeaves.length} of{' '}
//                 {leaves.length} leave requests
//               </div>

//               <div className="flex items-center gap-6">

//                 <span className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-yellow-500"></span>
//                   Pending: {stats.pending}
//                 </span>

//                 <span className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-green-500"></span>
//                   Approved: {stats.approved}
//                 </span>

//                 <span className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-red-500"></span>
//                   Rejected: {stats.rejected}
//                 </span>

//               </div>

//             </div>

//           </div>
//         )}

//       </div>

//       {/* =====================================================
//           ACTION MODAL
//       ===================================================== */}

//       {showActionModal &&
//         selectedLeave && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">

//             <div className="bg-white shadow-sm max-w-md w-full p-6">

//               <h3 className="text-xl font-bold text-gray-800 tracking-wider mb-2">

//                 {actionType ===
//                 'approve'
//                   ? 'Approve Leave'
//                   : actionType ===
//                     'reject'
//                   ? 'Reject Leave'
//                   : 'Delete Leave'}

//               </h3>

//               <p className="text-gray-600 tracking-wide mb-4">

//                 {actionType ===
//                 'approve'
//                   ? `Approve leave request for ${selectedLeave.employeeName}`

//                   : actionType ===
//                     'reject'
//                   ? `Reject leave request for ${selectedLeave.employeeName}`

//                   : `Delete leave request for ${selectedLeave.employeeName}`}

//               </p>

//               {/* Error */}
//               {modalError && (
//                 <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm tracking-wide">

//                   <p className="font-semibold">
//                     ❌ Error
//                   </p>

//                   <p className="mt-1">
//                     {modalError}
//                   </p>

//                 </div>
//               )}

//               {/* Input */}
//               <div className="mb-4">

//                 <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">

//                   {actionType ===
//                   'approve'
//                     ? 'Approval Remarks (Optional)'

//                     : actionType ===
//                       'reject'
//                     ? 'Rejection Reason'

//                     : 'Delete Confirmation'}

//                 </label>

//                 {actionType ===
//                 'delete' ? (

//                   <p className="text-sm text-red-600 tracking-wide">
//                     Are you sure you want to delete this leave request? This action cannot be undone.
//                   </p>

//                 ) : (

//                   <textarea
//                     value={adminRemarks}
//                     onChange={(e) =>
//                       setAdminRemarks(
//                         e.target.value
//                       )
//                     }
//                     className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                     rows={3}
//                     placeholder={
//                       actionType ===
//                       'approve'
//                         ? 'Add approval remarks...'
//                         : 'Provide rejection reason...'
//                     }
//                   />

//                 )}

//               </div>

//               {/* Buttons */}
//               <div className="flex gap-3">

//                 {actionType !==
//                   'delete' && (
//                   <button
//                     onClick={() =>
//                       handleStatusUpdate(
//                         selectedLeave,
//                         actionType ===
//                           'approve'
//                           ? 'approved'
//                           : 'rejected'
//                       )
//                     }
//                     disabled={updating}
//                     className={`flex-1 px-4 py-2 text-white transition flex items-center justify-center gap-2 tracking-wider disabled:opacity-50 ${
//                       actionType ===
//                       'approve'
//                         ? 'bg-green-600 hover:bg-green-700'
//                         : 'bg-red-600 hover:bg-red-700'
//                     }`}
//                   >

//                     {updating ? (
//                       <RefreshCw className="w-4 h-4 animate-spin" />
//                     ) : actionType ===
//                       'approve' ? (
//                       <Check className="w-4 h-4" />
//                     ) : (
//                       <X className="w-4 h-4" />
//                     )}

//                     {actionType ===
//                     'approve'
//                       ? 'Approve'
//                       : 'Reject'}

//                   </button>
//                 )}

//                 {actionType ===
//                   'delete' && (
//                   <button
//                     onClick={() =>
//                       handleDeleteLeave(
//                         selectedLeave
//                       )
//                     }
//                     disabled={updating}
//                     className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center gap-2 tracking-wider disabled:opacity-50"
//                   >

//                     {updating ? (
//                       <RefreshCw className="w-4 h-4 animate-spin" />
//                     ) : (
//                       <Trash2 className="w-4 h-4" />
//                     )}

//                     Delete

//                   </button>
//                 )}

//                 <button
//                   onClick={() => {
//                     setShowActionModal(
//                       false
//                     )
//                     setSelectedLeave(
//                       null
//                     )
//                     setAdminRemarks('')
//                     setModalError('')
//                   }}
//                   className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
//                 >
//                   Cancel
//                 </button>

//               </div>

//             </div>

//           </div>
//         )}

//     </div>
//     </ProtectedRoute>
//     </>
//   )
// }



// app/hr/leaves/page.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import NavbarDropdown from '@/app/components/navbar/page'
import { format, parseISO } from 'date-fns'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  Calendar,
  Clock,
  User,
  Building,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle,
  Loader,
  XCircle,
  AlertCircle,
  Trash2,
  MessageCircle,
  FileText,
  Clock as ClockIcon,
  Check,
  X
} from 'lucide-react'

import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

// =====================================================
// TYPES
// =====================================================

interface LeaveRecord {
  _key: string
  leaveKey: string

  employeeName: string
  employeeId: string
  department: string
  position: string

  leaveType: string
  fromDate: string
  toDate: string
  totalDays: number

  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'

  appliedOn: string
  adminRemarks?: string
  updatedOn?: string

  employeeRef: string
}

interface FilterOptions {
  status: string
  department: string
  leaveType: string
  search: string
  fromDate: string
  toDate: string
}

// =====================================================
// PAGE
// =====================================================

export default function HRLeaveManagementPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([])
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRecord[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [expandedLeave, setExpandedLeave] = useState<string | null>(null)

  const [departments, setDepartments] = useState<string[]>([])
  const [leaveTypes, setLeaveTypes] = useState<string[]>([])

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  })

  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    department: 'all',
    leaveType: 'all',
    search: '',
    fromDate: '',
    toDate: ''
  })

  const [showActionModal, setShowActionModal] = useState(false)

  const [selectedLeave, setSelectedLeave] =
    useState<LeaveRecord | null>(null)

  const [actionType, setActionType] =
    useState<'approve' | 'reject' | 'delete'>('approve')

  const [adminRemarks, setAdminRemarks] = useState('')

  const [updating, setUpdating] = useState(false)

  const [modalError, setModalError] = useState('')

  // =====================================================
  // UPDATE STATS - useCallback
  // =====================================================

  const updateStats = useCallback((data: LeaveRecord[]) => {
    setStats({
      total: data.length,
      pending: data.filter((leave) => leave.status === 'pending').length,
      approved: data.filter((leave) => leave.status === 'approved').length,
      rejected: data.filter((leave) => leave.status === 'rejected').length,
      cancelled: data.filter((leave) => leave.status === 'cancelled').length
    })
  }, [])

  // =====================================================
  // APPLY FILTERS - useCallback
  // =====================================================

  const applyFilters = useCallback(() => {
    let filtered = [...leaves]

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (leave) =>
          leave.employeeName?.toLowerCase().includes(search) ||
          leave.employeeId?.toLowerCase().includes(search) ||
          leave.leaveType?.toLowerCase().includes(search) ||
          leave.department?.toLowerCase().includes(search)
      )
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((leave) => leave.status === filters.status)
    }

    if (filters.department !== 'all') {
      filtered = filtered.filter((leave) => leave.department === filters.department)
    }

    if (filters.leaveType !== 'all') {
      filtered = filtered.filter((leave) => leave.leaveType === filters.leaveType)
    }

    if (filters.fromDate) {
      filtered = filtered.filter((leave) => leave.fromDate >= filters.fromDate)
    }

    if (filters.toDate) {
      filtered = filtered.filter((leave) => leave.toDate <= filters.toDate)
    }

    setFilteredLeaves(filtered)
  }, [leaves, filters])

  // =====================================================
  // FETCH LEAVES - useCallback
  // =====================================================

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()

      if (filters.status !== 'all') {
        params.append('status', filters.status)
      }

      if (filters.department !== 'all') {
        params.append('department', filters.department)
      }

      if (filters.fromDate) {
        params.append('fromDate', filters.fromDate)
      }

      if (filters.toDate) {
        params.append('toDate', filters.toDate)
      }

      const response = await fetch(
        `/api/hr/leaves?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json'
          },
          cache: 'no-store'
        }
      )

      const result = await response.json()

      console.log('API leave response:', result)

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch leaves')
      }

      // =====================================================
      // NORMALIZE DATA
      // =====================================================

      const normalizedLeaves: LeaveRecord[] = Array.isArray(result.data)
        ? result.data
            .map((leave: any) => {
              const key = leave.leaveKey || leave._key || ''

              return {
                _key: key,
                leaveKey: key,
                employeeName: leave.employeeName || '',
                employeeId: leave.employeeId || '',
                department: leave.department || '',
                position: leave.position || '',
                leaveType: leave.leaveType || '',
                fromDate: leave.fromDate || '',
                toDate: leave.toDate || '',
                totalDays: Number(leave.totalDays) || 0,
                reason: leave.reason || '',
                status: leave.status || 'pending',
                appliedOn: leave.appliedOn || '',
                adminRemarks: leave.adminRemarks || '',
                updatedOn: leave.updatedOn || '',
                employeeRef: leave.employeeRef || ''
              }
            })
            .filter((leave: LeaveRecord) => Boolean(leave.leaveKey))
          : []

      console.log('Normalized leaves:', normalizedLeaves)

      setLeaves(normalizedLeaves)

      // =====================================================
      // DEPARTMENTS
      // =====================================================

      const depts = [
        ...new Set(
          normalizedLeaves
            .map((leave) => leave.department)
            .filter(Boolean)
        )
      ]

      setDepartments(depts)

      // =====================================================
      // LEAVE TYPES
      // =====================================================

      const types = [
        ...new Set(
          normalizedLeaves
            .map((leave) => leave.leaveType)
            .filter(Boolean)
        )
      ]

      setLeaveTypes(types)

      // =====================================================
      // STATS
      // =====================================================

      updateStats(normalizedLeaves)
    } catch (err) {
      console.error('Error fetching leaves:', err)
      setError(err instanceof Error ? err.message : 'Failed to load leave data')
    } finally {
      setLoading(false)
    }
  }, [filters, updateStats])

  // =====================================================
  // USE EFFECT - fetchLeaves dependency add karo
  // =====================================================

  useEffect(() => {
    fetchLeaves()
  }, [fetchLeaves])

  // =====================================================
  // USE EFFECT - applyFilters dependency add karo
  // =====================================================

  useEffect(() => {
    applyFilters()
  }, [leaves, filters, applyFilters])

  // =====================================================
  // HANDLE STATUS UPDATE
  // =====================================================

  const handleStatusUpdate = async (
    leave: LeaveRecord,
    status: 'approved' | 'rejected'
  ) => {
    console.log('Handle status update:', leave, status)

    const leaveKey = leave.leaveKey || leave._key
    const employeeRef = leave.employeeRef

    if (!leaveKey) {
      console.error('Leave key missing:', leave)
      setModalError('Leave key is missing. Please refresh the page.')
      return
    }

    if (!employeeRef) {
      console.error('Employee reference missing:', leave)
      setModalError('Employee reference is missing. Please refresh the page.')
      return
    }

    try {
      setUpdating(true)
      setModalError('')

      const payload = {
        leaveKey,
        employeeId: employeeRef,
        status,
        reason: adminRemarks || ''
      }

      console.log('Sending PUT payload:', payload)

      const response = await fetch('/api/hr/leaves', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      console.log('PUT response:', result)

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update leave status')
      }

      // =====================================================
      // UPDATE LOCAL STATE
      // =====================================================

      const updatedLeaves = leaves.map((item) => {
        const itemKey = item.leaveKey || item._key

        if (itemKey === leaveKey) {
          return {
            ...item,
            status,
            adminRemarks: adminRemarks || item.adminRemarks
          }
        }

        return item
      })

      setLeaves(updatedLeaves)
      updateStats(updatedLeaves)

      setShowActionModal(false)
      setAdminRemarks('')
      setSelectedLeave(null)
      setModalError('')

      alert(`Leave ${status} successfully!`)
    } catch (err) {
      console.error('Error updating leave:', err)
      setModalError(err instanceof Error ? err.message : 'Failed to update leave status')
    } finally {
      setUpdating(false)
    }
  }

  // =====================================================
  // HANDLE DELETE LEAVE
  // =====================================================

  const handleDeleteLeave = async (leave: LeaveRecord) => {
    console.log('Handle delete:', leave)

    const leaveKey = leave.leaveKey || leave._key
    const employeeRef = leave.employeeRef

    if (!leaveKey) {
      setModalError('Leave key is missing. Please refresh the page.')
      return
    }

    if (!employeeRef) {
      setModalError('Employee reference is missing. Please refresh the page.')
      return
    }

    try {
      setUpdating(true)
      setModalError('')

      const params = new URLSearchParams({
        leaveKey,
        employeeId: employeeRef
      })

      console.log('Deleting leave:', { leaveKey, employeeId: employeeRef })

      const response = await fetch(`/api/hr/leaves?${params.toString()}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      })

      const result = await response.json()

      console.log('DELETE response:', result)

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete leave')
      }

      // =====================================================
      // REMOVE FROM LOCAL STATE
      // =====================================================

      const updatedLeaves = leaves.filter((item) => {
        const itemKey = item.leaveKey || item._key
        return itemKey !== leaveKey
      })

      setLeaves(updatedLeaves)
      updateStats(updatedLeaves)

      setShowActionModal(false)
      setSelectedLeave(null)
      setModalError('')

      alert('Leave request deleted successfully!')
    } catch (err) {
      console.error('Error deleting leave:', err)
      setModalError(err instanceof Error ? err.message : 'Failed to delete leave')
    } finally {
      setUpdating(false)
    }
  }

  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      case 'cancelled':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // =====================================================
  // STATUS ICON
  // =====================================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date: string) => {
    if (!date) return 'N/A'
    try {
      return format(parseISO(date), 'MMM dd, yyyy')
    } catch {
      return date
    }
  }

  const formatDateTime = (date: string) => {
    if (!date) return 'N/A'
    try {
      return format(parseISO(date), 'MMM dd, yyyy hh:mm a')
    } catch {
      return date
    }
  }

  // =====================================================
  // DAYS BETWEEN
  // =====================================================

  const getDaysBetween = (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) {
      return 0
    }

    try {
      const from = parseISO(fromDate)
      const to = parseISO(toDate)

      const diffTime = Math.abs(to.getTime() - from.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    } catch {
      return 0
    }
  }

  // =====================================================
  // EXPAND
  // =====================================================

  const toggleExpand = (key: string) => {
    setExpandedLeave(expandedLeave === key ? null : key)
  }

  // =====================================================
  // MODAL
  // =====================================================

  const openActionModal = (leave: LeaveRecord, action: 'approve' | 'reject' | 'delete') => {
    console.log('Opening modal:', leave)
    console.log('Leave key:', leave.leaveKey || leave._key)
    console.log('Employee ref:', leave.employeeRef)

    setSelectedLeave(leave)
    setActionType(action)
    setAdminRemarks('')
    setModalError('')
    setShowActionModal(true)
  }

  // =====================================================
  // SEARCH CLEAR
  // =====================================================

  const clearSearch = () => {
    setFilters({
      ...filters,
      search: ''
    })
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#0071BD] mx-auto mb-4" />
        </div>
      </div>
    )
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}
      >
        <div className="text-center bg-white shadow-sm p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />

          <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">
            Error
          </h3>

          <p className="text-gray-600 mb-4 tracking-wide">
            {error}
          </p>

          <button
            onClick={fetchLeaves}
            className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
    <ProtectedRoute allowedUser='hr'>
    <NavbarDropdown/>
    <div
      className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}
    >
      <div className="max-w-7xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div>
                <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
                  Leave Management
                </h1>

                <p className="text-sm text-gray-500 tracking-wide mt-1">
                  {filteredLeaves.length} leave requests •{' '}
                  {stats.pending} pending
                </p>
              </div>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Search by name, ID, or type..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    search: e.target.value
                  })
                }
                className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
              />

              {filters.search && (
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

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-[#0071BD] tracking-wide">
              Total
            </div>

            <div className="text-2xl font-bold text-[#0071BD] tracking-wider">
              {stats.total}
            </div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-yellow-600 tracking-wide">
              Pending
            </div>

            <div className="text-2xl font-bold text-yellow-700 tracking-wider">
              {stats.pending}
            </div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-green-600 tracking-wide">
              Approved
            </div>

            <div className="text-2xl font-bold text-green-700 tracking-wider">
              {stats.approved}
            </div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-red-600 tracking-wide">
              Rejected
            </div>

            <div className="text-2xl font-bold text-red-700 tracking-wider">
              {stats.rejected}
            </div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-gray-600 tracking-wide">
              Cancelled
            </div>

            <div className="text-2xl font-bold text-gray-700 tracking-wider">
              {stats.cancelled}
            </div>
          </div>

        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="bg-white shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

            {/* Status */}
            <div>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
              >
                <option value="all">
                  All Status
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            {/* Department */}
            <div>
              <select
                value={filters.department}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    department: e.target.value
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
              >
                <option value="all">
                  All Departments
                </option>

                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Leave Type */}
            <div>
              <select
                value={filters.leaveType}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    leaveType: e.target.value
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
              >
                <option value="all">
                  All Leave Types
                </option>

                {leaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      fromDate: e.target.value
                    })
                  }
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                />
              </div>
            </div>

            {/* To Date */}
            <div>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      toDate: e.target.value
                    })
                  }
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                />
              </div>
            </div>

          </div>
        </div>

        {/* =====================================================
            LEAVE LIST
        ===================================================== */}

        <div className="space-y-4">

          {filteredLeaves.length === 0 ? (

            <div className="bg-white shadow-sm p-12 text-center">

              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />

              <h3 className="text-xl font-semibold text-gray-600 mb-2 tracking-wider">
                No leave requests found
              </h3>

              <p className="text-gray-400 tracking-wide">
                Try adjusting your filters or search terms
              </p>

            </div>

          ) : (

            filteredLeaves.map((leave) => {

              const leaveKey = leave.leaveKey || leave._key

              const isExpanded = expandedLeave === leaveKey

              const days = getDaysBetween(leave.fromDate, leave.toDate)

              return (
                <div
                  key={leaveKey || `${leave.employeeRef}-${leave.appliedOn}`}
                  className="bg-white shadow-sm overflow-hidden hover:shadow-md transition"
                >

                  {/* =====================================================
                      HEADER
                  ===================================================== */}

                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => leaveKey && toggleExpand(leaveKey)}
                  >

                    <div className="flex flex-wrap items-center justify-between gap-4">

                      <div className="flex items-center gap-4 flex-1 min-w-0">

                        <div className="w-10 h-10 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <User className="w-8 h-8" />
                        </div>

                        <div className="min-w-0">

                          <h3 className="font-semibold text-gray-800 truncate tracking-wide">
                            {leave.employeeName || 'Unknown'}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 tracking-wide">

                            <span>
                              ID: {leave.employeeId || 'N/A'}
                            </span>

                            <span className="w-1 h-1 bg-gray-300"></span>

                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {leave.department || 'N/A'}
                            </span>

                            <span className="w-1 h-1 bg-gray-300"></span>

                            <span>
                              {leave.position || 'N/A'}
                            </span>

                          </div>

                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">

                        <span className="text-sm text-gray-500 tracking-wide">
                          {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                        </span>

                        <span className="text-sm font-medium text-gray-700 tracking-wide">
                          {days} day{days > 1 ? 's' : ''}
                        </span>

                        <div
                          className={`px-3 py-1 text-xs font-medium flex items-center gap-1 ${getStatusColor(leave.status)} tracking-wide`}
                        >
                          {getStatusIcon(leave.status)}

                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </div>

                        <div className="text-gray-400">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>

                      </div>

                    </div>
                  </div>

                  {/* =====================================================
                      DETAILS
                  ===================================================== */}

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4">

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Leave Details */}
                        <div>

                          <h4 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider mb-3">
                            <Calendar className="w-4 h-4" />
                            Leave Details
                          </h4>

                          <div className="space-y-2 text-sm tracking-wide">

                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Leave Type:
                              </span>

                              <span className="font-medium">
                                {leave.leaveType || 'N/A'}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                From:
                              </span>

                              <span>
                                {formatDate(leave.fromDate)}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                To:
                              </span>

                              <span>
                                {formatDate(leave.toDate)}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Total Days:
                              </span>

                              <span className="font-medium">
                                {days}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Applied On:
                              </span>

                              <span className="text-xs text-gray-400">
                                {formatDateTime(leave.appliedOn)}
                              </span>
                            </div>

                          </div>
                        </div>

                        {/* Reason */}
                        <div>

                          <h4 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider mb-3">
                            <MessageCircle className="w-4 h-4" />
                            Reason
                          </h4>

                          <div className="bg-gray-50 p-3 text-sm text-gray-700 min-h-[60px] tracking-wide">
                            {leave.reason || 'No reason provided'}
                          </div>

                          {leave.adminRemarks && (
                            <div className="mt-3">

                              <h4 className="font-medium text-gray-700 mb-1 tracking-wider">
                                Admin Remarks
                              </h4>

                              <div className="bg-blue-50 p-3 text-sm text-blue-700 tracking-wide">
                                {leave.adminRemarks}
                              </div>

                            </div>
                          )}

                        </div>

                      </div>

                      {/* =====================================================
                          ACTION BUTTONS
                      ===================================================== */}

                      {leave.status === 'pending' && (
                        <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">

                          <button
                            onClick={() => openActionModal(leave, 'approve')}
                            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 tracking-wider"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>

                          <button
                            onClick={() => openActionModal(leave, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2 tracking-wider"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>

                          <button
                            onClick={() => openActionModal(leave, 'delete')}
                            className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition flex items-center gap-2 tracking-wider"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>

                        </div>
                      )}

                      {leave.status !== 'pending' && (
                        <div className="mt-4 border-t pt-4 flex justify-end">

                          <button
                            onClick={() => openActionModal(leave, 'delete')}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center gap-2 tracking-wider"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Request
                          </button>

                        </div>
                      )}

                    </div>
                  )}

                </div>
              )
            })

          )}

        </div>

        {/* =====================================================
            FOOTER STATS
        ===================================================== */}

        {filteredLeaves.length > 0 && (
          <div className="mt-6 bg-white shadow-sm p-4">

            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 tracking-wide">

              <div>
                Showing {filteredLeaves.length} of {leaves.length} leave requests
              </div>

              <div className="flex items-center gap-6">

                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500"></span>
                  Pending: {stats.pending}
                </span>

                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500"></span>
                  Approved: {stats.approved}
                </span>

                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500"></span>
                  Rejected: {stats.rejected}
                </span>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* =====================================================
          ACTION MODAL
      ===================================================== */}

      {showActionModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">

          <div className="bg-white shadow-sm max-w-md w-full p-6">

            <h3 className="text-xl font-bold text-gray-800 tracking-wider mb-2">

              {actionType === 'approve'
                ? 'Approve Leave'
                : actionType === 'reject'
                ? 'Reject Leave'
                : 'Delete Leave'}

            </h3>

            <p className="text-gray-600 tracking-wide mb-4">

              {actionType === 'approve'
                ? `Approve leave request for ${selectedLeave.employeeName}`
                : actionType === 'reject'
                ? `Reject leave request for ${selectedLeave.employeeName}`
                : `Delete leave request for ${selectedLeave.employeeName}`}

            </p>

            {/* Error */}
            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm tracking-wide">

                <p className="font-semibold">
                  ❌ Error
                </p>

                <p className="mt-1">
                  {modalError}
                </p>

              </div>
            )}

            {/* Input */}
            <div className="mb-4">

              <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">

                {actionType === 'approve'
                  ? 'Approval Remarks (Optional)'
                  : actionType === 'reject'
                  ? 'Rejection Reason'
                  : 'Delete Confirmation'}

              </label>

              {actionType === 'delete' ? (

                <p className="text-sm text-red-600 tracking-wide">
                  Are you sure you want to delete this leave request? This action cannot be undone.
                </p>

              ) : (

                <textarea
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                  rows={3}
                  placeholder={
                    actionType === 'approve'
                      ? 'Add approval remarks...'
                      : 'Provide rejection reason...'
                  }
                />

              )}

            </div>

            {/* Buttons */}
            <div className="flex gap-3">

              {actionType !== 'delete' && (
                <button
                  onClick={() =>
                    handleStatusUpdate(
                      selectedLeave,
                      actionType === 'approve' ? 'approved' : 'rejected'
                    )
                  }
                  disabled={updating}
                  className={`flex-1 px-4 py-2 text-white transition flex items-center justify-center gap-2 tracking-wider disabled:opacity-50 ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >

                  {updating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : actionType === 'approve' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}

                  {actionType === 'approve' ? 'Approve' : 'Reject'}

                </button>
              )}

              {actionType === 'delete' && (
                <button
                  onClick={() => handleDeleteLeave(selectedLeave)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center gap-2 tracking-wider disabled:opacity-50"
                >

                  {updating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}

                  Delete

                </button>
              )}

              <button
                onClick={() => {
                  setShowActionModal(false)
                  setSelectedLeave(null)
                  setAdminRemarks('')
                  setModalError('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
    </ProtectedRoute>
    </>
  )
}