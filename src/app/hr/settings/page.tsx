// // src/app/hr/settings/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import Footer from '@/app/components/footer'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import NavbarDropdown from '@/app/components/navbar/page'
// import {
//   Settings as SettingsIcon,
//   User,
//   Search,
//   RefreshCw,
//   Users,
//   Building,
//   Lock,
//   Key,
//   Eye,
//   EyeOff,
//   Check,
//   X,
//   AlertCircle,
//   Shield,
//   Save,
//   ChevronDown,
//   ChevronUp,
//   Loader,
//   UserCheck
// } from 'lucide-react'

// // Import Roboto font from Google Fonts using @next/font
// import { Roboto } from 'next/font/google'

// // Configure Roboto font
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
//     phoneNumber: string
//     email?: string
//   }
//   username: string
//   password: string
// }

// interface PasswordFormData {
//   employeeId: string
//   currentUsername: string
//   newUsername: string
//   newPassword: string
//   confirmPassword: string
// }

// export default function HRSettingsPage() {
//   const [employees, setEmployees] = useState<Employee[]>([])
//   const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedDepartment, setSelectedDepartment] = useState('all')
//   const [departments, setDepartments] = useState<string[]>([])
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  
//   const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)
//   const [editingEmployee, setEditingEmployee] = useState<string | null>(null)
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
//   const [formData, setFormData] = useState<PasswordFormData>({
//     employeeId: '',
//     currentUsername: '',
//     newUsername: '',
//     newPassword: '',
//     confirmPassword: ''
//   })

//   const [message, setMessage] = useState<{
//     type: 'success' | 'error' | 'info'
//     text: string
//   } | null>(null)
  
//   const [updating, setUpdating] = useState(false)

//   useEffect(() => {
//     fetchEmployees()
//   }, [])

//   useEffect(() => {
//     applyFilters()
//   }, [employees, searchTerm, selectedDepartment])

//   const fetchEmployees = async () => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       console.log('Fetching employees from API...')
      
//       const response = await fetch('/api/hr/settings', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         cache: 'no-store'
//       })

//       console.log('Response status:', response.status)

//       if (!response.ok) {
//         const text = await response.text()
//         console.error('Response error:', text)
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const result = await response.json()
//       console.log('API Response:', result)

//       if (!result.success) {
//         throw new Error(result.error || 'Failed to fetch employees')
//       }

//       setEmployees(result.data || [])
      
//       // Extract departments
//       const depts = [...new Set(result.data
//         ?.map((emp: Employee) => emp.personalDetails?.department)
//         .filter(Boolean))] as string[]
//       setDepartments(depts)

//       // Select first employee by default if available
//       if (result.data && result.data.length > 0) {
//         setSelectedEmployeeId(result.data[0]._id)
//       }

//     } catch (err) {
//       console.error('Error fetching employees:', err)
//       setError(err instanceof Error ? err.message : 'Failed to load employee data')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const applyFilters = () => {
//     let filtered = [...employees]

//     if (searchTerm) {
//       const search = searchTerm.toLowerCase()
//       filtered = filtered.filter(emp =>
//         emp.personalDetails?.fullName?.toLowerCase().includes(search) ||
//         emp.personalDetails?.employeeId?.toLowerCase().includes(search) ||
//         emp.username?.toLowerCase().includes(search)
//       )
//     }

//     if (selectedDepartment !== 'all') {
//       filtered = filtered.filter(emp =>
//         emp.personalDetails?.department === selectedDepartment
//       )
//     }

//     setFilteredEmployees(filtered)
//   }

//   const handleEditEmployee = (employee: Employee) => {
//     setEditingEmployee(employee._id)
//     setSelectedEmployeeId(employee._id)
//     setFormData({
//       employeeId: employee._id,
//       currentUsername: employee.username || '',
//       newUsername: employee.username || '',
//       newPassword: '',
//       confirmPassword: ''
//     })
//     setMessage(null)
//   }

//   const handleCancelEdit = () => {
//     setEditingEmployee(null)
//     setFormData({
//       employeeId: '',
//       currentUsername: '',
//       newUsername: '',
//       newPassword: '',
//       confirmPassword: ''
//     })
//     setMessage(null)
//   }

//   const handleUpdatePassword = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!formData.newPassword) {
//       setMessage({ type: 'error', text: 'Please enter a new password' })
//       return
//     }

//     if (formData.newPassword !== formData.confirmPassword) {
//       setMessage({ type: 'error', text: 'Passwords do not match' })
//       return
//     }

//     if (formData.newPassword.length < 6) {
//       setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
//       return
//     }

//     try {
//       setUpdating(true)
//       setMessage(null)

//       const response = await fetch('/api/hr/settings', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           employeeId: formData.employeeId,
//           username: formData.newUsername || undefined,
//           newPassword: formData.newPassword,
//           confirmPassword: formData.confirmPassword
//         })
//       })

//       if (!response.ok) {
//         const errorText = await response.text()
//         throw new Error(errorText || 'Failed to update password')
//       }

//       const result = await response.json()

//       if (!result.success) {
//         throw new Error(result.error || 'Failed to update password')
//       }

//       setMessage({ 
//         type: 'success', 
//         text: `Password updated successfully for ${result.data?.username || 'employee'}` 
//       })

//       // Update local state
//       const updatedEmployees = employees.map(emp => {
//         if (emp._id === formData.employeeId) {
//           return {
//             ...emp,
//             username: result.data?.username || emp.username,
//             password: formData.newPassword
//           }
//         }
//         return emp
//       })
//       setEmployees(updatedEmployees)

//       setEditingEmployee(null)
//       setFormData({
//         employeeId: '',
//         currentUsername: '',
//         newUsername: '',
//         newPassword: '',
//         confirmPassword: ''
//       })

//     } catch (err) {
//       console.error('Error updating password:', err)
//       setMessage({ 
//         type: 'error', 
//         text: err instanceof Error ? err.message : 'Failed to update password' 
//       })
//     } finally {
//       setUpdating(false)
//     }
//   }

//   const toggleEmployee = (employeeId: string) => {
//     setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId)
//   }

//   const getInitials = (name: string) => {
//     if (!name) return 'U'
//     return name.split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2)
//   }

//   const getStatusColor = (hasPassword: boolean) => {
//     return hasPassword ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//   }

//   const clearSearch = () => {
//     setSearchTerm('')
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
//         <div className="text-center bg-white p-8 shadow-md max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Error</h3>
//           <p className="text-gray-600 mb-4 tracking-wide">{error}</p>
//           <button
//             onClick={fetchEmployees}
//             className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     )
//   }

//   return (
//   <>

//   <ProtectedRoute allowedUser='hr'>
//     <NavbarDropdown/>
//     <div className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}>
//       <div className="max-w-7xl mx-auto">
//         {/* Header - Only Heading and Search - No White Background */}
//         <div className="mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
//                 System Settings
//               </h1>
//             </div>
            
//             <div className="relative flex-1 max-w-md">
//               <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by name, ID, or username..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//               />
//               {searchTerm && (
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

//         {/* Message Alert */}
//         {message && (
//           <div className={`mb-6 p-4 flex items-start gap-3 ${
//             message.type === 'success' ? 'bg-green-50 border border-green-200' :
//             message.type === 'error' ? 'bg-red-50 border border-red-200' :
//             'bg-blue-50 border border-blue-200'
//           }`}>
//             {message.type === 'success' ? (
//               <Check className="w-5 h-5 text-green-500 mt-0.5" />
//             ) : message.type === 'error' ? (
//               <X className="w-5 h-5 text-red-500 mt-0.5" />
//             ) : (
//               <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
//             )}
//             <div className="flex-1">
//               <p className={`text-sm ${
//                 message.type === 'success' ? 'text-green-700' :
//                 message.type === 'error' ? 'text-red-700' :
//                 'text-blue-700'
//               } tracking-wide`}>
//                 {message.text}
//               </p>
//             </div>
//             <button
//               onClick={() => setMessage(null)}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         )}

//         {/* Employee List */}
//         <div className="space-y-4">
//           {filteredEmployees.length === 0 ? (
//             <div className="bg-white shadow-sm p-12 text-center">
//               <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-600 mb-2 tracking-wider">No employees found</h3>
//               <p className="text-gray-400 tracking-wide">Try adjusting your search terms</p>
//             </div>
//           ) : (
//             filteredEmployees.map((employee) => {
//               const isExpanded = expandedEmployee === employee._id
//               const isEditing = editingEmployee === employee._id
//               const hasPassword = !!employee.password

//               return (
//                 <div key={employee._id} className="bg-white shadow-sm overflow-hidden hover:shadow-md transition">
//                   {/* Employee Header */}
//                   <div 
//                     className="p-4 cursor-pointer hover:bg-gray-50 transition"
//                     onClick={() => toggleEmployee(employee._id)}
//                   >
//                     <div className="flex flex-wrap items-center justify-between gap-4">
//                       <div className="flex items-center gap-4 flex-1 min-w-0">
//                         <div className="w-10 h-10 flex items-center justify-center text-gray-400 flex-shrink-0">
//                           <User className="w-8 h-8" />
//                         </div>
//                         <div className="min-w-0">
//                           <h3 className="font-semibold text-gray-800 truncate tracking-wide">
//                             {employee.personalDetails?.fullName || 'Unknown Employee'}
//                           </h3>
//                           <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 tracking-wide">
//                             <span>ID: {employee.personalDetails?.employeeId || 'N/A'}</span>
//                             <span className="w-1 h-1 bg-gray-300"></span>
//                             <span className="flex items-center gap-1">
//                               <Building className="w-3 h-3" />
//                               {employee.personalDetails?.department || 'N/A'}
//                             </span>
//                             <span className="w-1 h-1 bg-gray-300"></span>
//                             <span className="flex items-center gap-1">
//                               <User className="w-3 h-3" />
//                               {employee.username || 'No username'}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-4 flex-shrink-0">
//                         <div className={`px-3 py-1 text-xs font-medium flex items-center gap-1 ${getStatusColor(hasPassword)} tracking-wide`}>
//                           <Lock className="w-3 h-3" />
//                           {hasPassword ? 'Password Set' : 'No Password'}
//                         </div>
//                         <div className="text-gray-400">
//                           {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Expanded Details */}
//                   {isExpanded && (
//                     <div className="border-t border-gray-100">
//                       <div className="p-4">
//                         {!isEditing ? (
//                           // View Mode
//                           <div>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                               <div className="space-y-2">
//                                 <h4 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider">
//                                   <User className="w-4 h-4" />
//                                   Personal Information
//                                 </h4>
//                                 <div className="bg-gray-50 p-3 space-y-2 text-sm tracking-wide">
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-500">Employee ID:</span>
//                                     <span className="font-medium">{employee.personalDetails?.employeeId || 'N/A'}</span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-500">Full Name:</span>
//                                     <span className="font-medium">{employee.personalDetails?.fullName || 'N/A'}</span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-500">Department:</span>
//                                     <span className="font-medium">{employee.personalDetails?.department || 'N/A'}</span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-500">Position:</span>
//                                     <span className="font-medium">{employee.personalDetails?.position || 'N/A'}</span>
//                                   </div>
//                                   {employee.personalDetails?.phoneNumber && (
//                                     <div className="flex justify-between">
//                                       <span className="text-gray-500">Phone:</span>
//                                       <span className="font-medium">{employee.personalDetails.phoneNumber}</span>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>

//                               <div className="space-y-2">
//                                 <h4 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider">
//                                   <Lock className="w-4 h-4" />
//                                   Account Information
//                                 </h4>
//                                 <div className="bg-gray-50 p-3 space-y-2 text-sm tracking-wide">
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-500">Username:</span>
//                                     <span className="font-medium">{employee.username || 'Not set'}</span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-500">Password:</span>
//                                     <span className="font-medium flex items-center gap-2">
//                                       {hasPassword ? (
//                                         <>
//                                           <span className="text-green-600">••••••••</span>
//                                           <span className="text-xs text-green-600">(Set)</span>
//                                         </>
//                                       ) : (
//                                         <span className="text-red-600">Not set</span>
//                                       )}
//                                     </span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-500">Account Status:</span>
//                                     <span className={`font-medium ${hasPassword ? 'text-green-600' : 'text-red-600'}`}>
//                                       {hasPassword ? 'Active' : 'Inactive'}
//                                     </span>
//                                   </div>
//                                 </div>

//                                 <button
//                                   onClick={() => handleEditEmployee(employee)}
//                                   className="w-full mt-3 px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center justify-center gap-2 tracking-wider"
//                                 >
//                                   <Key className="w-4 h-4" />
//                                   Change Password
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         ) : (
//                           // Edit Mode - Password Change Form
//                           <div>
//                             <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2 tracking-wider">
//                               <Key className="w-4 h-4" />
//                               Change Password - {employee.personalDetails?.fullName}
//                             </h4>
                            
//                             <form onSubmit={handleUpdatePassword} className="space-y-4">
//                               <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
//                                   Employee ID
//                                 </label>
//                                 <div className="relative">
//                                   <UserCheck className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                                   <input
//                                     type="text"
//                                     value={employee.personalDetails?.employeeId || ''}
//                                     disabled
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed tracking-wide"
//                                   />
//                                 </div>
//                               </div>

//                               <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
//                                   Username
//                                 </label>
//                                 <div className="relative">
//                                   <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                                   <input
//                                     type="text"
//                                     value={formData.newUsername}
//                                     onChange={(e) => setFormData({ 
//                                       ...formData, 
//                                       newUsername: e.target.value 
//                                     })}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none tracking-wide"
//                                     placeholder="Enter username"
//                                   />
//                                 </div>
//                                 <p className="text-xs text-gray-500 mt-1 tracking-wide">
//                                   Leave unchanged if you don&apos;t want to change the username
//                                 </p>
//                               </div>

//                               <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
//                                   New Password
//                                 </label>
//                                 <div className="relative">
//                                   <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                                   <input
//                                     type={showPassword ? 'text' : 'password'}
//                                     value={formData.newPassword}
//                                     onChange={(e) => setFormData({ 
//                                       ...formData, 
//                                       newPassword: e.target.value 
//                                     })}
//                                     className="w-full pl-10 pr-10 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none tracking-wide"
//                                     placeholder="Enter new password (min 6 characters)"
//                                     required
//                                   />
//                                   <button
//                                     type="button"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                                   >
//                                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                                   </button>
//                                 </div>
//                               </div>

//                               <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
//                                   Confirm Password
//                                 </label>
//                                 <div className="relative">
//                                   <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                                   <input
//                                     type={showConfirmPassword ? 'text' : 'password'}
//                                     value={formData.confirmPassword}
//                                     onChange={(e) => setFormData({ 
//                                       ...formData, 
//                                       confirmPassword: e.target.value 
//                                     })}
//                                     className="w-full pl-10 pr-10 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none tracking-wide"
//                                     placeholder="Confirm new password"
//                                     required
//                                   />
//                                   <button
//                                     type="button"
//                                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                                   >
//                                     {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                                   </button>
//                                 </div>
//                               </div>

//                               <div className="flex gap-3">
//                                 <button
//                                   type="submit"
//                                   disabled={updating}
//                                   className="flex-1 px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center justify-center gap-2 disabled:opacity-50 tracking-wider"
//                                 >
//                                   {updating ? (
//                                     <RefreshCw className="w-4 h-4 animate-spin" />
//                                   ) : (
//                                     <Save className="w-4 h-4" />
//                                   )}
//                                   {updating ? 'Updating...' : 'Update Password'}
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={handleCancelEdit}
//                                   className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
//                                 >
//                                   Cancel
//                                 </button>
//                               </div>

//                               <div className="text-xs text-gray-500 flex items-center gap-1 tracking-wide">
//                                 <AlertCircle className="w-3 h-3" />
//                                 Password must be at least 6 characters long
//                               </div>
//                             </form>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )
//             })
//           )}
//         </div>

//         {/* Footer Stats */}
//         {filteredEmployees.length > 0 && (
//           <div className="mt-6 bg-white shadow-sm p-4">
//             <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 tracking-wide">
//               <div>
//                 Showing {filteredEmployees.length} of {employees.length} employees
//               </div>
//               <div className="flex items-center gap-6">
//                 <div className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-green-500"></span>
//                   <span>With Password: {
//                     filteredEmployees.filter(e => e.password).length
//                   }</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-red-500"></span>
//                   <span>Without Password: {
//                     filteredEmployees.filter(e => !e.password).length
//                   }</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//     <Footer/>
//     </ProtectedRoute>
//     </>
//   )
// }



// src/app/hr/settings/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Footer from '@/app/components/footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import NavbarDropdown from '@/app/components/navbar/page'
import {
  Settings as SettingsIcon,
  User,
  Search,
  RefreshCw,
  Users,
  Building,
  Lock,
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Shield,
  Save,
  ChevronDown,
  ChevronUp,
  Loader,
  UserCheck
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

interface Employee {
  _id: string
  personalDetails: {
    employeeId: string
    fullName: string
    department: string
    position: string
    phoneNumber: string
    email?: string
  }
  username: string
  password: string
}

interface PasswordFormData {
  employeeId: string
  currentUsername: string
  newUsername: string
  newPassword: string
  confirmPassword: string
}

export default function HRSettingsPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [departments, setDepartments] = useState<string[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState<PasswordFormData>({
    employeeId: '',
    currentUsername: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)
  
  const [updating, setUpdating] = useState(false)

  // applyFilters - useCallback
  const applyFilters = useCallback(() => {
    let filtered = [...employees]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(emp =>
        emp.personalDetails?.fullName?.toLowerCase().includes(search) ||
        emp.personalDetails?.employeeId?.toLowerCase().includes(search) ||
        emp.username?.toLowerCase().includes(search)
      )
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp =>
        emp.personalDetails?.department === selectedDepartment
      )
    }

    setFilteredEmployees(filtered)
  }, [employees, searchTerm, selectedDepartment])

  // fetchEmployees - useCallback
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching employees from API...')
      
      const response = await fetch('/api/hr/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const text = await response.text()
        console.error('Response error:', text)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('API Response:', result)

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch employees')
      }

      setEmployees(result.data || [])
      
      // Extract departments
      const depts = [...new Set(result.data
        ?.map((emp: Employee) => emp.personalDetails?.department)
        .filter(Boolean))] as string[]
      setDepartments(depts)

      // Select first employee by default if available
      if (result.data && result.data.length > 0) {
        setSelectedEmployeeId(result.data[0]._id)
      }

    } catch (err) {
      console.error('Error fetching employees:', err)
      setError(err instanceof Error ? err.message : 'Failed to load employee data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Pehla useEffect - fetchEmployees dependency add karo
  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Doosra useEffect - applyFilters dependency add karo
  useEffect(() => {
    applyFilters()
  }, [employees, searchTerm, selectedDepartment, applyFilters])

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee._id)
    setSelectedEmployeeId(employee._id)
    setFormData({
      employeeId: employee._id,
      currentUsername: employee.username || '',
      newUsername: employee.username || '',
      newPassword: '',
      confirmPassword: ''
    })
    setMessage(null)
  }

  const handleCancelEdit = () => {
    setEditingEmployee(null)
    setFormData({
      employeeId: '',
      currentUsername: '',
      newUsername: '',
      newPassword: '',
      confirmPassword: ''
    })
    setMessage(null)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.newPassword) {
      setMessage({ type: 'error', text: 'Please enter a new password' })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    try {
      setUpdating(true)
      setMessage(null)

      const response = await fetch('/api/hr/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          username: formData.newUsername || undefined,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to update password')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update password')
      }

      setMessage({ 
        type: 'success', 
        text: `Password updated successfully for ${result.data?.username || 'employee'}` 
      })

      // Update local state
      const updatedEmployees = employees.map(emp => {
        if (emp._id === formData.employeeId) {
          return {
            ...emp,
            username: result.data?.username || emp.username,
            password: formData.newPassword
          }
        }
        return emp
      })
      setEmployees(updatedEmployees)

      setEditingEmployee(null)
      setFormData({
        employeeId: '',
        currentUsername: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: ''
      })

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

  const toggleEmployee = (employeeId: string) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId)
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (hasPassword: boolean) => {
    return hasPassword ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  }

  const clearSearch = () => {
    setSearchTerm('')
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
        {/* Header - Only Heading and Search - No White Background */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
                System Settings
              </h1>
            </div>
            
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or username..."
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

        {/* Message Alert */}
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
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Employee List */}
        <div className="space-y-4">
          {filteredEmployees.length === 0 ? (
            <div className="bg-white shadow-sm p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2 tracking-wider">No employees found</h3>
              <p className="text-gray-400 tracking-wide">Try adjusting your search terms</p>
            </div>
          ) : (
            filteredEmployees.map((employee) => {
              const isExpanded = expandedEmployee === employee._id
              const isEditing = editingEmployee === employee._id
              const hasPassword = !!employee.password

              return (
                <div key={employee._id} className="bg-white shadow-sm overflow-hidden hover:shadow-md transition">
                  {/* Employee Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggleEmployee(employee._id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <User className="w-8 h-8" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate tracking-wide">
                            {employee.personalDetails?.fullName || 'Unknown Employee'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 tracking-wide">
                            <span>ID: {employee.personalDetails?.employeeId || 'N/A'}</span>
                            <span className="w-1 h-1 bg-gray-300"></span>
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {employee.personalDetails?.department || 'N/A'}
                            </span>
                            <span className="w-1 h-1 bg-gray-300"></span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {employee.username || 'No username'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className={`px-3 py-1 text-xs font-medium flex items-center gap-1 ${getStatusColor(hasPassword)} tracking-wide`}>
                          <Lock className="w-3 h-3" />
                          {hasPassword ? 'Password Set' : 'No Password'}
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
                        {!isEditing ? (
                          // View Mode
                          <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider">
                                  <User className="w-4 h-4" />
                                  Personal Information
                                </h4>
                                <div className="bg-gray-50 p-3 space-y-2 text-sm tracking-wide">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Employee ID:</span>
                                    <span className="font-medium">{employee.personalDetails?.employeeId || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Full Name:</span>
                                    <span className="font-medium">{employee.personalDetails?.fullName || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Department:</span>
                                    <span className="font-medium">{employee.personalDetails?.department || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Position:</span>
                                    <span className="font-medium">{employee.personalDetails?.position || 'N/A'}</span>
                                  </div>
                                  {employee.personalDetails?.phoneNumber && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Phone:</span>
                                      <span className="font-medium">{employee.personalDetails.phoneNumber}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-700 flex items-center gap-2 tracking-wider">
                                  <Lock className="w-4 h-4" />
                                  Account Information
                                </h4>
                                <div className="bg-gray-50 p-3 space-y-2 text-sm tracking-wide">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Username:</span>
                                    <span className="font-medium">{employee.username || 'Not set'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Password:</span>
                                    <span className="font-medium flex items-center gap-2">
                                      {hasPassword ? (
                                        <>
                                          <span className="text-green-600">••••••••</span>
                                          <span className="text-xs text-green-600">(Set)</span>
                                        </>
                                      ) : (
                                        <span className="text-red-600">Not set</span>
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Account Status:</span>
                                    <span className={`font-medium ${hasPassword ? 'text-green-600' : 'text-red-600'}`}>
                                      {hasPassword ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleEditEmployee(employee)}
                                  className="w-full mt-3 px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center justify-center gap-2 tracking-wider"
                                >
                                  <Key className="w-4 h-4" />
                                  Change Password
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Edit Mode - Password Change Form
                          <div>
                            <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2 tracking-wider">
                              <Key className="w-4 h-4" />
                              Change Password - {employee.personalDetails?.fullName}
                            </h4>
                            
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                                  Employee ID
                                </label>
                                <div className="relative">
                                  <UserCheck className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <input
                                    type="text"
                                    value={employee.personalDetails?.employeeId || ''}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed tracking-wide"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                                  Username
                                </label>
                                <div className="relative">
                                  <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <input
                                    type="text"
                                    value={formData.newUsername}
                                    onChange={(e) => setFormData({ 
                                      ...formData, 
                                      newUsername: e.target.value 
                                    })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none tracking-wide"
                                    placeholder="Enter username"
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 tracking-wide">
                                  Leave unchanged if you don&apos;t want to change the username
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wide">
                                  New Password
                                </label>
                                <div className="relative">
                                  <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <input
                                    type={showPassword ? 'text' : 'password'}
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
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

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

                              <div className="flex gap-3">
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
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition tracking-wider"
                                >
                                  Cancel
                                </button>
                              </div>

                              <div className="text-xs text-gray-500 flex items-center gap-1 tracking-wide">
                                <AlertCircle className="w-3 h-3" />
                                Password must be at least 6 characters long
                              </div>
                            </form>
                          </div>
                        )}
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
                  <span>With Password: {
                    filteredEmployees.filter(e => e.password).length
                  }</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500"></span>
                  <span>Without Password: {
                    filteredEmployees.filter(e => !e.password).length
                  }</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </ProtectedRoute>
    </>
  )
}