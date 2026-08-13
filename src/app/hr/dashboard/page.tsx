// // src/app/hr/dashboard/page.tsx
// 'use client'

// import { useState, useEffect, useMemo } from 'react'
// import NavbarDropdown from '@/app/components/navbar/page'
// import Footer from '@/app/components/footer'
// import { client } from '@/sanity/lib/client'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import {
//   Users,
//   UserCheck,
//   UserX,
//   Calendar,
//   Clock,
//   Building,
//   TrendingUp,
//   TrendingDown,
//   RefreshCw,
//   AlertCircle,
//   Loader,
//   CheckCircle,
//   XCircle,
//   Clock as ClockIcon,
//   Eye,
//   UserPlus,
//   Briefcase,
//   UserMinus,
//   User as UserIcon,
//   FileSpreadsheet,
//   LogIn,
//   LogOut as LogOutIcon,
//   Activity
// } from 'lucide-react'
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   RadialBarChart,
//   RadialBar,
//   PolarGrid,
//   PolarRadiusAxis,
//   Label
// } from 'recharts'

// // Import Roboto font
// import { Roboto } from 'next/font/google'

// const roboto = Roboto({
//   weight: ['100', '300', '400', '500', '700', '900'],
//   style: ['normal', 'italic'],
//   subsets: ['latin'],
//   display: 'swap',
// })

// interface DashboardData {
//   employees: any[]
//   leaveRequests: any[]
// }

// interface Stats {
//   totalEmployees: number
//   presentToday: number
//   absentToday: number
//   onLeave: number
//   pendingLeaves: number
//   approvedLeaves: number
//   rejectedLeaves: number
//   departments: string[]
//   departmentCount: { [key: string]: number }
//   attendanceRate: number
// }

// interface RecentActivity {
//   id: string
//   employeeName: string
//   employeeId: string
//   type: 'check-in' | 'check-out'
//   time: string
//   location: string
//   department: string
// }

// export default function HRDashboardPage() {
//   const [data, setData] = useState<DashboardData>({ employees: [], leaveRequests: [] })
//   const [stats, setStats] = useState<Stats>({
//     totalEmployees: 0,
//     presentToday: 0,
//     absentToday: 0,
//     onLeave: 0,
//     pendingLeaves: 0,
//     approvedLeaves: 0,
//     rejectedLeaves: 0,
//     departments: [],
//     departmentCount: {},
//     attendanceRate: 0
//   })
//   const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [selectedDepartment, setSelectedDepartment] = useState('all')
//   const [activeChart, setActiveChart] = useState<'present' | 'absent'>('present')

//   useEffect(() => {
//     fetchDashboardData()
//   }, [])

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       const query = `
//         {
//           "employees": *[_type == "employee"] {
//             _id,
//             personalDetails {
//               fullName,
//               employeeId,
//               department,
//               position,
//               phoneNumber
//             },
//             checkIn[] {
//               time,
//               location
//             },
//             checkOut[] {
//               time,
//               location
//             }
//           },
//           "leaveRequests": *[_type == "employee"].leaves[] {
//             _key,
//             employeeName,
//             employeeId,
//             department,
//             position,
//             leaveType,
//             fromDate,
//             toDate,
//             totalDays,
//             reason,
//             status,
//             appliedOn
//           }
//         }
//       `
      
//       const result = await client.fetch(query)
//       console.log('Dashboard Data:', result)

//       // Ensure arrays exist and handle null values
//       const safeResult = {
//         employees: result?.employees || [],
//         leaveRequests: result?.leaveRequests || []
//       }

//       setData(safeResult)
//       calculateStats(safeResult)
//       getRecentActivities(safeResult)

//     } catch (err) {
//       console.error('Error fetching dashboard data:', err)
//       setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const calculateStats = (dashboardData: DashboardData) => {
//     const employees = dashboardData.employees || []
//     const leaves = dashboardData.leaveRequests || []

//     const totalEmployees = employees.length
//     const today = new Date().toISOString().split('T')[0]

//     let presentToday = 0
//     let absentToday = 0

//     employees.forEach(emp => {
//       // Add null check for checkIn
//       const hasCheckIn = emp.checkIn?.some((check: any) => {
//         if (!check || !check.time) return false
//         const checkDate = new Date(check.time).toISOString().split('T')[0]
//         return checkDate === today
//       })
      
//       if (hasCheckIn) {
//         presentToday++
//       } else {
//         absentToday++
//       }
//     })

//     // Add null checks for leave status
//     const pendingLeaves = leaves.filter((l: any) => l?.status === 'pending').length
//     const approvedLeaves = leaves.filter((l: any) => l?.status === 'approved').length
//     const rejectedLeaves = leaves.filter((l: any) => l?.status === 'rejected').length
    
//     const onLeave = leaves.filter((l: any) => {
//       if (!l || !l.fromDate || !l.toDate || l.status !== 'approved') return false
//       const todayDate = new Date(today)
//       const fromDate = new Date(l.fromDate)
//       const toDate = new Date(l.toDate)
//       return fromDate <= todayDate && toDate >= todayDate
//     }).length

//     const deptMap: { [key: string]: number } = {}
//     employees.forEach(emp => {
//       const dept = emp?.personalDetails?.department || 'Unknown'
//       deptMap[dept] = (deptMap[dept] || 0) + 1
//     })

//     const departments = Object.keys(deptMap)
//     const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0

//     setStats({
//       totalEmployees,
//       presentToday,
//       absentToday,
//       onLeave,
//       pendingLeaves,
//       approvedLeaves,
//       rejectedLeaves,
//       departments,
//       departmentCount: deptMap,
//       attendanceRate
//     })
//   }

//   const getRecentActivities = (dashboardData: DashboardData) => {
//     const activities: RecentActivity[] = []
//     const now = new Date()
//     const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

//     dashboardData.employees.forEach(emp => {
//       // Add null checks for checkIn and checkOut
//       if (emp.checkIn && Array.isArray(emp.checkIn)) {
//         emp.checkIn.forEach((check: any) => {
//           if (!check || !check.time) return
//           const checkTime = new Date(check.time)
//           if (checkTime > oneHourAgo) {
//             activities.push({
//               id: `in_${emp._id}_${check.time}`,
//               employeeName: emp?.personalDetails?.fullName || 'Unknown',
//               employeeId: emp?.personalDetails?.employeeId || 'N/A',
//               type: 'check-in',
//               time: check.time,
//               location: check.location || 'Unknown location',
//               department: emp?.personalDetails?.department || 'N/A'
//             })
//           }
//         })
//       }

//       if (emp.checkOut && Array.isArray(emp.checkOut)) {
//         emp.checkOut.forEach((check: any) => {
//           if (!check || !check.time) return
//           const checkTime = new Date(check.time)
//           if (checkTime > oneHourAgo) {
//             activities.push({
//               id: `out_${emp._id}_${check.time}`,
//               employeeName: emp?.personalDetails?.fullName || 'Unknown',
//               employeeId: emp?.personalDetails?.employeeId || 'N/A',
//               type: 'check-out',
//               time: check.time,
//               location: check.location || 'Unknown location',
//               department: emp?.personalDetails?.department || 'N/A'
//             })
//           }
//         })
//       }
//     })

//     activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
//     setRecentActivities(activities.slice(0, 20))
//   }

//   // Prepare data for charts
//   const getDepartmentData = () => {
//     const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6B7280']
//     return Object.entries(stats.departmentCount).map(([name, value], index) => ({
//       department: name,
//       employees: value,
//       fill: colors[index % colors.length]
//     }))
//   }

//   // Attendance Data for Line Chart (Last 30 Days)
//   const getAttendanceLineData = () => {
//     const last30Days = []
//     for (let i = 29; i >= 0; i--) {
//       const date = new Date()
//       date.setDate(date.getDate() - i)
//       const dateStr = date.toISOString().split('T')[0]
      
//       let present = 0
//       let absent = 0
      
//       data.employees.forEach(emp => {
//         const hasCheckIn = emp.checkIn?.some((check: any) => {
//           if (!check || !check.time) return false
//           const checkDate = new Date(check.time).toISOString().split('T')[0]
//           return checkDate === dateStr
//         })
        
//         if (hasCheckIn) {
//           present++
//         } else {
//           absent++
//         }
//       })
      
//       last30Days.push({
//         date: dateStr,
//         present,
//         absent,
//         total: data.employees.length || 0
//       })
//     }
//     return last30Days
//   }

//   // Monthly Attendance Data
//   const getMonthlyAttendanceData = () => {
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
//     const currentYear = new Date().getFullYear()
//     const monthlyData = []

//     for (let i = 0; i < 6; i++) {
//       const monthIndex = new Date().getMonth() - i
//       const year = monthIndex >= 0 ? currentYear : currentYear - 1
//       const adjustedMonth = monthIndex >= 0 ? monthIndex : monthIndex + 12
      
//       let present = 0
//       let total = 0

//       data.employees.forEach(emp => {
//         const empCheckIns = emp.checkIn || []
//         if (Array.isArray(empCheckIns)) {
//           empCheckIns.forEach((check: any) => {
//             if (!check || !check.time) return
//             const checkDate = new Date(check.time)
//             if (checkDate.getMonth() === adjustedMonth && checkDate.getFullYear() === year) {
//               present++
//               total++
//             }
//           })
//         }
//       })

//       monthlyData.push({
//         month: months[adjustedMonth],
//         present,
//         total: data.employees.length || 1,
//         absent: (data.employees.length || 1) - present
//       })
//     }

//     return monthlyData.reverse()
//   }

//   const getLeaveStatusData = () => {
//     const statuses = ['pending', 'approved', 'rejected', 'cancelled']
//     return statuses.map(status => {
//       const count = data.leaveRequests.filter((l: any) => l?.status === status).length
//       return { name: status, value: count }
//     }).filter(item => item.value > 0)
//   }

//   const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444']

//   const formatTime = (timestamp: string) => {
//     try {
//       const date = new Date(timestamp)
//       const now = new Date()
//       const diffMs = now.getTime() - date.getTime()
//       const diffMins = Math.floor(diffMs / 60000)
//       const diffHours = Math.floor(diffMs / 3600000)

//       if (diffMins < 1) return 'Just now'
//       if (diffMins < 60) return `${diffMins}m ago`
//       if (diffHours < 24) return `${diffHours}h ago`
//       return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
//     } catch {
//       return 'Unknown'
//     }
//   }

//   // Custom Tooltip with Roboto font and tracking wider
//   const CustomTooltip = ({ active, payload, label }: any) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className={`${roboto.className} bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 text-xs tracking-wide`}>
//           <p className="font-medium text-gray-800 tracking-wide">{label}</p>
//           {payload.map((item: any, index: number) => (
//             <p key={index} className="text-gray-600 tracking-wide" style={{ color: item.color }}>
//               {item.name}: {item.value}
//             </p>
//           ))}
//         </div>
//       )
//     }
//     return null
//   }

//   const lineChartData = getAttendanceLineData()
//   const totalPresent = useMemo(() => lineChartData.reduce((acc, curr) => acc + curr.present, 0), [lineChartData])
//   const totalAbsent = useMemo(() => lineChartData.reduce((acc, curr) => acc + curr.absent, 0), [lineChartData])

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
//             onClick={fetchDashboardData}
//             className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     )
//   }

//   const monthlyData = getMonthlyAttendanceData()
//   const departmentData = getDepartmentData()

//   // Prepare data for individual radial charts
//   const pendingData = [{ name: 'Pending', value: stats.pendingLeaves || 0, fill: '#F59E0B' }]
//   const approvedData = [{ name: 'Approved', value: stats.approvedLeaves || 0, fill: '#10B981' }]
//   const rejectedData = [{ name: 'Rejected', value: stats.rejectedLeaves || 0, fill: '#EF4444' }]

//   // Radial Chart Component - Completely merged
//   const LeaveRadialChart = ({ data, title, color, valueColor }: { data: any[], title: string, color: string, valueColor: string }) => {
//     const value = data[0]?.value || 0
    
//     return (
//       <div className="flex-1">
//         <div className="h-24">
//           <ResponsiveContainer width="100%" height="100%">
//             <RadialBarChart
//               data={data}
//               endAngle={100}
//               innerRadius={30}
//               outerRadius={44}
//               barSize={8}
//               margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
//             >
//               <PolarGrid
//                 gridType="circle"
//                 radialLines={false}
//                 stroke="#e5e7eb"
//                 polarRadius={[36, 30]}
//               />
//               <RadialBar 
//   dataKey="value" 
//   background 
//   cornerRadius={3}
//   fill={color}
// />
//               <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
//                 <Label
//                   content={({ viewBox }) => {
//                     if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                       return (
//                         <text
//                           x={viewBox.cx}
//                           y={viewBox.cy}
//                           textAnchor="middle"
//                           dominantBaseline="middle"
//                           className={`${roboto.className}`}
//                         >
//                           <tspan
//                             x={viewBox.cx}
//                             y={viewBox.cy}
//                             className={`${valueColor} text-base font-bold tracking-wide`}
//                           >
//                             {value}
//                           </tspan>
//                           <tspan
//                             x={viewBox.cx}
//                             y={(viewBox.cy || 0) + 14}
//                             className="fill-gray-500 text-[6px] tracking-wide"
//                           >
//                             {title}
//                           </tspan>
//                         </text>
//                       )
//                     }
//                   }}
//                 />
//               </PolarRadiusAxis>
//             </RadialBarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     )
//   }

//   // Add a safe check for employee data before rendering
//   const safeEmployees = data.employees || []
//   const safeLeaveRequests = data.leaveRequests || []

//   return (
//     <>
//     <ProtectedRoute allowedUser='hr'>
//     <NavbarDropdown/>
//     <div className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}>
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div>
//                 <h1 className="text-3xl font-bold text-[#0071BD] tracking-wider">
//                   HR Dashboard
//                 </h1>
//                 <p className="text-sm text-gray-500 tracking-wide mt-1">
//                   Overview of employee attendance and leave management
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex gap-3">
//               <button
//                 onClick={fetchDashboardData}
//                 className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2 tracking-wider"
//               >
//                 <RefreshCw className="w-4 h-4" />
//                 Refresh
//               </button>
//               <button
//                 onClick={() => window.location.href = '/hr/get-sheet'}
//                 className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center gap-2 tracking-wider"
//               >
//                 <FileSpreadsheet className="w-4 h-4" />
//                 Get Sheet
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-[#0071BD] tracking-wide">Total Employees</div>
//             <div className="text-2xl font-bold text-[#0071BD] tracking-wider">{stats.totalEmployees}</div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-green-600 tracking-wide flex items-center gap-1">
//               <UserCheck className="w-4 h-4" /> Present
//             </div>
//             <div className="text-2xl font-bold text-green-700 tracking-wider">{stats.presentToday}</div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-red-600 tracking-wide flex items-center gap-1">
//               <UserX className="w-4 h-4" /> Absent
//             </div>
//             <div className="text-2xl font-bold text-red-700 tracking-wider">{stats.absentToday}</div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-yellow-600 tracking-wide flex items-center gap-1">
//               <UserMinus className="w-4 h-4" /> On Leave
//             </div>
//             <div className="text-2xl font-bold text-yellow-700 tracking-wider">{stats.onLeave}</div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-orange-600 tracking-wide flex items-center gap-1">
//               <ClockIcon className="w-4 h-4" /> Pending
//             </div>
//             <div className="text-2xl font-bold text-orange-700 tracking-wider">{stats.pendingLeaves}</div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-blue-600 tracking-wide flex items-center gap-1">
//               <Building className="w-4 h-4" /> Depts
//             </div>
//             <div className="text-2xl font-bold text-blue-700 tracking-wider">{stats.departments.length}</div>
//           </div>

//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-indigo-600 tracking-wide flex items-center gap-1">
//               {stats.attendanceRate > 70 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
//               Rate
//             </div>
//             <div className={`text-2xl font-bold tracking-wider ${
//               stats.attendanceRate > 70 ? 'text-green-700' : 'text-red-700'
//             }`}>
//               {stats.attendanceRate.toFixed(1)}%
//             </div>
//           </div>
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           {/* Department Distribution - Radial Bar Chart */}
//           <div className="shadow-sm p-4">
//             <h3 className="text-sm font-semibold text-gray-800 mb-3 tracking-wide">Department Distribution</h3>
//             <div className="h-48">
//               <ResponsiveContainer width="100%" height="100%">
//                 <RadialBarChart 
//                   data={departmentData} 
//                   innerRadius={18} 
//                   outerRadius={80}
//                   startAngle={180}
//                   endAngle={0}
//                 >
//                   <PolarGrid gridType="circle" stroke="#e5e7eb" />
//                   <RadialBar 
//   dataKey="employees" 
//   cornerRadius={4}
//   label={{ 
//     position: 'insideStart', 
//     fill: '#fff',
//     fontSize: 9,
//     fontWeight: 500,
//     fontFamily: 'Roboto, sans-serif',
//     letterSpacing: '0.05em'
//   }}
// />
//                   <Tooltip content={<CustomTooltip />} />
//                 </RadialBarChart>
//               </ResponsiveContainer>
//             </div>
//             <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[10px]">
//               {departmentData.map((item, index) => (
//                 <span key={index} className="flex items-center gap-1 tracking-wide">
//                   <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.fill }}></span>
//                   {item.department}: {item.employees}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Monthly Attendance Bar Chart */}
//           <div className="shadow-sm p-4">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-sm font-semibold text-gray-800 tracking-wide">Monthly Attendance</h3>
//               <div className="flex items-center gap-2 text-[10px]">
//                 <span className="flex items-center gap-1 tracking-wide">
//                   <span className="w-1.5 h-1.5 bg-green-500 rounded"></span>
//                   Present
//                 </span>
//                 <span className="flex items-center gap-1 tracking-wide">
//                   <span className="w-1.5 h-1.5 bg-red-500 rounded"></span>
//                   Absent
//                 </span>
//               </div>
//             </div>
//             <div className="h-48">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={monthlyData} barGap={3}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
//                   <XAxis 
//                     dataKey="month" 
//                     tickLine={false}
//                     tickMargin={4}
//                     axisLine={false}
//                     fontSize={9}
//                     tick={{ className: `text-[9px] ${roboto.className} tracking-wide` }}
//                   />
//                   <YAxis 
//                     fontSize={9} 
//                     axisLine={false} 
//                     tickLine={false}
//                     tick={{ className: `text-[9px] ${roboto.className} tracking-wide` }}
//                   />
//                   <Tooltip content={<CustomTooltip />} />
//                   <Bar dataKey="present" fill="#10B981" radius={[3, 3, 0, 0]} />
//                   <Bar dataKey="absent" fill="#EF4444" radius={[3, 3, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//             <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500 tracking-wide">
//               <span>Last 6 months</span>
//               <span className="flex items-center gap-1 text-green-600 tracking-wide">
//                 <TrendingUp className="w-3 h-3" />
//                 {monthlyData.length > 0 && monthlyData[monthlyData.length - 1].present > 0 
//                   ? `${((monthlyData[monthlyData.length - 1].present / stats.totalEmployees) * 100).toFixed(1)}% this month`
//                   : 'No data'}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Leave Status Distribution - 3 Charts COMPLETELY MERGED */}
//         <div className="shadow-sm p-2 mb-6">
//           <h3 className="text-xs font-semibold text-gray-800 mb-0.5 tracking-wide text-center">Leave Status Distribution</h3>
//           <div className="flex">
//             <div className="flex-1">
//               <LeaveRadialChart 
//                 data={pendingData} 
//                 title="Pending" 
//                 color="#F59E0B"
//                 valueColor="text-yellow-600"
//               />
//             </div>
//             <div className="flex-1">
//               <LeaveRadialChart 
//                 data={approvedData} 
//                 title="Approved" 
//                 color="#10B981"
//                 valueColor="text-green-600"
//               />
//             </div>
//             <div className="flex-1">
//               <LeaveRadialChart 
//                 data={rejectedData} 
//                 title="Rejected" 
//                 color="#EF4444"
//                 valueColor="text-red-600"
//               />
//             </div>
//           </div>
//           <div className="mt-0.5 flex flex-wrap items-center justify-center gap-2 text-[9px]">
//             <span className="flex items-center gap-1 tracking-wide">
//               <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
//               Pending: {stats.pendingLeaves}
//             </span>
//             <span className="flex items-center gap-1 tracking-wide">
//               <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
//               Approved: {stats.approvedLeaves}
//             </span>
//             <span className="flex items-center gap-1 tracking-wide">
//               <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
//               Rejected: {stats.rejectedLeaves}
//             </span>
//           </div>
//         </div>

//         {/* Attendance Trends - Interactive Line Chart */}
//         <div className="shadow-sm p-4 mb-6">
//           <div className="flex flex-col items-stretch border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h3 className="text-sm font-semibold text-gray-800 tracking-wide">Attendance Trends</h3>
//               <p className="text-[10px] text-gray-500 tracking-wide mt-0.5">Showing daily attendance for the last 30 days</p>
//             </div>
//             <div className="flex mt-2 sm:mt-0">
//               <button
//                 data-active={activeChart === 'present'}
//                 className={`flex flex-col px-3 py-1.5 text-left border rounded-l-lg ${
//                   activeChart === 'present' 
//                     ? 'bg-blue-50 border-blue-500' 
//                     : 'bg-white border-gray-200 hover:bg-gray-50'
//                 }`}
//                 onClick={() => setActiveChart('present')}
//               >
//                 <span className="text-[9px] text-gray-500 tracking-wide">Present</span>
//                 <span className="text-xs font-bold text-green-600 tracking-wider">{totalPresent.toLocaleString()}</span>
//               </button>
//               <button
//                 data-active={activeChart === 'absent'}
//                 className={`flex flex-col px-3 py-1.5 text-left border rounded-r-lg ${
//                   activeChart === 'absent' 
//                     ? 'bg-blue-50 border-blue-500' 
//                     : 'bg-white border-gray-200 hover:bg-gray-50'
//                 }`}
//                 onClick={() => setActiveChart('absent')}
//               >
//                 <span className="text-[9px] text-gray-500 tracking-wide">Absent</span>
//                 <span className="text-xs font-bold text-red-600 tracking-wider">{totalAbsent.toLocaleString()}</span>
//               </button>
//             </div>
//           </div>
//           <div className="h-56 mt-2">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart
//                 data={lineChartData}
//                 margin={{ left: 0, right: 0, top: 5, bottom: 5 }}
//               >
//                 <CartesianGrid vertical={false} stroke="#e5e7eb" />
//                 <XAxis
//                   dataKey="date"
//                   tickLine={false}
//                   axisLine={false}
//                   tickMargin={6}
//                   minTickGap={32}
//                   fontSize={9}
//                   tick={{ className: `${roboto.className} tracking-wide` }}
//                   tickFormatter={(value) => {
//                     const date = new Date(value)
//                     return date.toLocaleDateString("en-US", {
//                       month: "short",
//                       day: "numeric",
//                     })
//                   }}
//                 />
//                 <YAxis 
//                   fontSize={9} 
//                   axisLine={false} 
//                   tickLine={false}
//                   tick={{ className: `${roboto.className} tracking-wide` }}
//                 />
//                 <Tooltip 
//                   content={({ active, payload, label }) => {
//                     if (active && payload && payload.length) {
//                       return (
//                         <div className={`${roboto.className} bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-2 text-[10px] tracking-wide`}>
//                           <p className="font-medium text-gray-800 tracking-wide">
//   {new Date(label || '').toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   })}
// </p>
//                           {payload.map((item: any, index: number) => (
//                             <p key={index} className="text-gray-600 tracking-wide" style={{ color: item.color }}>
//                               {item.name}: {item.value}
//                             </p>
//                           ))}
//                         </div>
//                       )
//                     }
//                     return null
//                   }}
//                 />
//                 <Line
//                   dataKey={activeChart}
//                   type="monotone"
//                   stroke="#3B82F6"
//                   strokeWidth={2}
//                   dot={false}
//                   activeDot={{ r: 3, fill: '#3B82F6' }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Recent Activity Section */}
//         <div className="bg-white shadow-sm rounded-lg mb-6 overflow-hidden">
//           <div className="p-2.5 border-b border-gray-200 bg-gray-50">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Activity className="w-4 h-4 text-[#0071BD]" />
//                 <h3 className="font-semibold text-gray-800 tracking-wide text-xs">Recent Activity</h3>
//                 <span className="text-[10px] text-gray-400 tracking-wide">(Last Hour)</span>
//               </div>
//               <span className="text-[10px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 tracking-wide">
//                 {recentActivities.length} activities
//               </span>
//             </div>
//           </div>

//           {recentActivities.length > 0 ? (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-gray-50 border-b border-gray-200">
//                     <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Employee</th>
//                     <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                     <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Dept</th>
//                     <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Type</th>
//                     <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Location</th>
//                     <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Time</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {recentActivities.slice(0, 5).map((activity) => (
//                     <tr key={activity.id} className="hover:bg-gray-50 transition">
//                       <td className="px-2.5 py-1.5">
//                         <div className="flex items-center gap-1.5">
//                           <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
//                             activity.type === 'check-in' ? 'bg-green-100' : 'bg-orange-100'
//                           }`}>
//                             <UserIcon className={`w-3 h-3 ${
//                               activity.type === 'check-in' ? 'text-green-600' : 'text-orange-600'
//                             }`} />
//                           </div>
//                           <span className="text-xs font-medium text-gray-800 tracking-wide">
//                             {activity.employeeName}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-2.5 py-1.5 text-[10px] text-gray-600 tracking-wide">
//                         {activity.employeeId}
//                       </td>
//                       <td className="px-2.5 py-1.5 text-[10px] text-gray-600 tracking-wide">
//                         <span className="px-1 py-0.5 bg-gray-100 rounded text-[9px] tracking-wide">
//                           {activity.department}
//                         </span>
//                       </td>
//                       <td className="px-2.5 py-1.5">
//                         <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium tracking-wide ${
//                           activity.type === 'check-in' 
//                             ? 'bg-green-100 text-green-700' 
//                             : 'bg-orange-100 text-orange-700'
//                         }`}>
//                           {activity.type === 'check-in' ? (
//                             <LogIn className="w-2.5 h-2.5" />
//                           ) : (
//                             <LogOutIcon className="w-2.5 h-2.5" />
//                           )}
//                           {activity.type === 'check-in' ? 'In' : 'Out'}
//                         </span>
//                       </td>
//                       <td className="px-2.5 py-1.5 text-[10px] text-gray-600 max-w-[100px] truncate tracking-wide">
//                         {activity.location}
//                       </td>
//                       <td className="px-2.5 py-1.5 text-[10px] text-gray-500 tracking-wide">
//                         {formatTime(activity.time)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <div className="text-center py-3 text-gray-500">
//               <Activity className="w-6 h-6 text-gray-300 mx-auto mb-0.5" />
//               <p className="text-[10px] tracking-wide">No recent activity in the last hour</p>
//             </div>
//           )}
//         </div>

//         {/* Recent Employees */}
//         <div className="bg-white shadow-sm overflow-hidden">
//           <div className="p-3 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <h3 className="text-xs font-semibold text-gray-800 tracking-wide">Recent Employees</h3>
//               <button
//                 onClick={() => window.location.href = '/hr/attendance'}
//                 className="text-[10px] text-[#0071BD] hover:text-[#005a96] font-medium tracking-wide"
//               >
//                 View All
//               </button>
//             </div>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-200">
//                   <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Employee</th>
//                   <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                   <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Department</th>
//                   <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Position</th>
//                   <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {safeEmployees.slice(0, 5).map((employee) => {
//                   const today = new Date().toISOString().split('T')[0]
//                   const hasCheckIn = employee.checkIn?.some((check: any) => {
//                     if (!check || !check.time) return false
//                     const checkDate = new Date(check.time).toISOString().split('T')[0]
//                     return checkDate === today
//                   })
                  
//                   const isOnLeave = safeLeaveRequests.some((leave: any) => {
//                     if (!leave || !leave.fromDate || !leave.toDate || leave.status !== 'approved') return false
//                     const todayDate = new Date(today)
//                     const fromDate = new Date(leave.fromDate)
//                     const toDate = new Date(leave.toDate)
//                     return leave.employeeName === employee?.personalDetails?.fullName &&
//                            fromDate <= todayDate && toDate >= todayDate
//                   })

//                   let status = 'Absent'
//                   let statusColor = 'bg-red-100 text-red-700'
//                   let statusIcon = <XCircle className="w-2.5 h-2.5" />
                  
//                   if (isOnLeave) {
//                     status = 'On Leave'
//                     statusColor = 'bg-yellow-100 text-yellow-700'
//                     statusIcon = <Calendar className="w-2.5 h-2.5" />
//                   } else if (hasCheckIn) {
//                     status = 'Present'
//                     statusColor = 'bg-green-100 text-green-700'
//                     statusIcon = <CheckCircle className="w-2.5 h-2.5" />
//                   }

//                   return (
//                     <tr key={employee._id} className="hover:bg-gray-50 transition">
//                       <td className="px-2.5 py-1.5">
//                         <div className="flex items-center gap-1.5">
//                           <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
//                             <UserIcon className="w-3 h-3 text-gray-500" />
//                           </div>
//                           <span className="font-medium text-gray-800 text-xs tracking-wide">
//                             {employee?.personalDetails?.fullName || 'Unknown'}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-2.5 py-1.5 text-[10px] text-gray-600 tracking-wide">
//                         {employee?.personalDetails?.employeeId || 'N/A'}
//                       </td>
//                       <td className="px-2.5 py-1.5 text-[10px] text-gray-600 tracking-wide">
//                         {employee?.personalDetails?.department || 'N/A'}
//                       </td>
//                       <td className="px-2.5 py-1.5 text-[10px] text-gray-600 tracking-wide">
//                         {employee?.personalDetails?.position || 'N/A'}
//                       </td>
//                       <td className="px-2.5 py-1.5">
//                         <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide ${statusColor}`}>
//                           {statusIcon}
//                           {status}
//                         </span>
//                       </td>
//                       <td className="px-2.5 py-1.5">
//                         <button
//                           onClick={() => window.location.href = `/hr/attendance?id=${employee._id}`}
//                           className="text-[#0071BD] hover:text-[#005a96]"
//                         >
//                           <Eye className="w-3 h-3" />
//                         </button>
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//           </div>
          
//           {safeEmployees.length === 0 && (
//             <div className="text-center py-4 text-gray-500">
//               <Users className="w-8 h-8 text-gray-300 mx-auto mb-1" />
//               <p className="text-[10px] tracking-wide">No employees found</p>
//             </div>
//           )}
//         </div>

//         {/* Footer Stats */}
//         {safeEmployees.length > 0 && (
//           <div className="mt-6 bg-white shadow-sm p-2.5">
//             <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-600 tracking-wide">
//               <div className="tracking-wide">
//                 Showing {Math.min(5, safeEmployees.length)} of {safeEmployees.length} employees
//               </div>
//               <div className="flex items-center gap-3">
//                 <span className="flex items-center gap-1 tracking-wide">
//                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
//                   Present: {stats.presentToday}
//                 </span>
//                 <span className="flex items-center gap-1 tracking-wide">
//                   <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
//                   Absent: {stats.absentToday}
//                 </span>
//                 <span className="flex items-center gap-1 tracking-wide">
//                   <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
//                   On Leave: {stats.onLeave}
//                 </span>
//                 <span className="flex items-center gap-1 tracking-wide">
//                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                   Recent: {recentActivities.length}
//                 </span>
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



// src/app/hr/dashboard/page.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import NavbarDropdown from '@/app/components/navbar/page'
import Footer from '@/app/components/footer'
import { client } from '@/sanity/lib/client'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  Building,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Loader,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Eye,
  UserPlus,
  Briefcase,
  UserMinus,
  User as UserIcon,
  FileSpreadsheet,
  LogIn,
  LogOut as LogOutIcon,
  Activity
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label
} from 'recharts'

// Import Roboto font
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

interface DashboardData {
  employees: any[]
  leaveRequests: any[]
}

interface Stats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  onLeave: number
  pendingLeaves: number
  approvedLeaves: number
  rejectedLeaves: number
  departments: string[]
  departmentCount: { [key: string]: number }
  attendanceRate: number
}

interface RecentActivity {
  id: string
  employeeName: string
  employeeId: string
  type: 'check-in' | 'check-out'
  time: string
  location: string
  department: string
}

export default function HRDashboardPage() {
  const [data, setData] = useState<DashboardData>({ employees: [], leaveRequests: [] })
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onLeave: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    departments: [],
    departmentCount: {},
    attendanceRate: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [activeChart, setActiveChart] = useState<'present' | 'absent'>('present')

  // =====================================================
  // calculateStats - useCallback
  // =====================================================

  const calculateStats = useCallback((dashboardData: DashboardData) => {
    const employees = dashboardData.employees || []
    const leaves = dashboardData.leaveRequests || []

    const totalEmployees = employees.length
    const today = new Date().toISOString().split('T')[0]

    let presentToday = 0
    let absentToday = 0

    employees.forEach(emp => {
      const hasCheckIn = emp.checkIn?.some((check: any) => {
        if (!check || !check.time) return false
        const checkDate = new Date(check.time).toISOString().split('T')[0]
        return checkDate === today
      })
      
      if (hasCheckIn) {
        presentToday++
      } else {
        absentToday++
      }
    })

    const pendingLeaves = leaves.filter((l: any) => l?.status === 'pending').length
    const approvedLeaves = leaves.filter((l: any) => l?.status === 'approved').length
    const rejectedLeaves = leaves.filter((l: any) => l?.status === 'rejected').length
    
    const onLeave = leaves.filter((l: any) => {
      if (!l || !l.fromDate || !l.toDate || l.status !== 'approved') return false
      const todayDate = new Date(today)
      const fromDate = new Date(l.fromDate)
      const toDate = new Date(l.toDate)
      return fromDate <= todayDate && toDate >= todayDate
    }).length

    const deptMap: { [key: string]: number } = {}
    employees.forEach(emp => {
      const dept = emp?.personalDetails?.department || 'Unknown'
      deptMap[dept] = (deptMap[dept] || 0) + 1
    })

    const departments = Object.keys(deptMap)
    const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0

    setStats({
      totalEmployees,
      presentToday,
      absentToday,
      onLeave,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      departments,
      departmentCount: deptMap,
      attendanceRate
    })
  }, [])

  // =====================================================
  // getRecentActivities - useCallback
  // =====================================================

  const getRecentActivities = useCallback((dashboardData: DashboardData) => {
    const activities: RecentActivity[] = []
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    dashboardData.employees.forEach(emp => {
      if (emp.checkIn && Array.isArray(emp.checkIn)) {
        emp.checkIn.forEach((check: any) => {
          if (!check || !check.time) return
          const checkTime = new Date(check.time)
          if (checkTime > oneHourAgo) {
            activities.push({
              id: `in_${emp._id}_${check.time}`,
              employeeName: emp?.personalDetails?.fullName || 'Unknown',
              employeeId: emp?.personalDetails?.employeeId || 'N/A',
              type: 'check-in',
              time: check.time,
              location: check.location || 'Unknown location',
              department: emp?.personalDetails?.department || 'N/A'
            })
          }
        })
      }

      if (emp.checkOut && Array.isArray(emp.checkOut)) {
        emp.checkOut.forEach((check: any) => {
          if (!check || !check.time) return
          const checkTime = new Date(check.time)
          if (checkTime > oneHourAgo) {
            activities.push({
              id: `out_${emp._id}_${check.time}`,
              employeeName: emp?.personalDetails?.fullName || 'Unknown',
              employeeId: emp?.personalDetails?.employeeId || 'N/A',
              type: 'check-out',
              time: check.time,
              location: check.location || 'Unknown location',
              department: emp?.personalDetails?.department || 'N/A'
            })
          }
        })
      }
    })

    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    setRecentActivities(activities.slice(0, 20))
  }, [])

  // =====================================================
  // fetchDashboardData - useCallback
  // =====================================================

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const query = `
        {
          "employees": *[_type == "employee"] {
            _id,
            personalDetails {
              fullName,
              employeeId,
              department,
              position,
              phoneNumber
            },
            checkIn[] {
              time,
              location
            },
            checkOut[] {
              time,
              location
            }
          },
          "leaveRequests": *[_type == "employee"].leaves[] {
            _key,
            employeeName,
            employeeId,
            department,
            position,
            leaveType,
            fromDate,
            toDate,
            totalDays,
            reason,
            status,
            appliedOn
          }
        }
      `
      
      const result = await client.fetch(query)
      console.log('Dashboard Data:', result)

      const safeResult = {
        employees: result?.employees || [],
        leaveRequests: result?.leaveRequests || []
      }

      setData(safeResult)
      calculateStats(safeResult)
      getRecentActivities(safeResult)

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [calculateStats, getRecentActivities])

  // =====================================================
  // USE EFFECT - fetchDashboardData dependency add karo
  // =====================================================

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Prepare data for charts
  const getDepartmentData = useCallback(() => {
    const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6B7280']
    return Object.entries(stats.departmentCount).map(([name, value], index) => ({
      department: name,
      employees: value,
      fill: colors[index % colors.length]
    }))
  }, [stats.departmentCount])

  // Attendance Data for Line Chart (Last 30 Days)
  const getAttendanceLineData = useCallback(() => {
    const last30Days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      let present = 0
      let absent = 0
      
      data.employees.forEach(emp => {
        const hasCheckIn = emp.checkIn?.some((check: any) => {
          if (!check || !check.time) return false
          const checkDate = new Date(check.time).toISOString().split('T')[0]
          return checkDate === dateStr
        })
        
        if (hasCheckIn) {
          present++
        } else {
          absent++
        }
      })
      
      last30Days.push({
        date: dateStr,
        present,
        absent,
        total: data.employees.length || 0
      })
    }
    return last30Days
  }, [data.employees])

  // Monthly Attendance Data
  const getMonthlyAttendanceData = useCallback(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentYear = new Date().getFullYear()
    const monthlyData = []

    for (let i = 0; i < 6; i++) {
      const monthIndex = new Date().getMonth() - i
      const year = monthIndex >= 0 ? currentYear : currentYear - 1
      const adjustedMonth = monthIndex >= 0 ? monthIndex : monthIndex + 12
      
      let present = 0
      let total = 0

      data.employees.forEach(emp => {
        const empCheckIns = emp.checkIn || []
        if (Array.isArray(empCheckIns)) {
          empCheckIns.forEach((check: any) => {
            if (!check || !check.time) return
            const checkDate = new Date(check.time)
            if (checkDate.getMonth() === adjustedMonth && checkDate.getFullYear() === year) {
              present++
              total++
            }
          })
        }
      })

      monthlyData.push({
        month: months[adjustedMonth],
        present,
        total: data.employees.length || 1,
        absent: (data.employees.length || 1) - present
      })
    }

    return monthlyData.reverse()
  }, [data.employees])

  const getLeaveStatusData = useCallback(() => {
    const statuses = ['pending', 'approved', 'rejected', 'cancelled']
    return statuses.map(status => {
      const count = data.leaveRequests.filter((l: any) => l?.status === status).length
      return { name: status, value: count }
    }).filter(item => item.value > 0)
  }, [data.leaveRequests])

  const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444']

  const formatTime = useCallback((timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'Unknown'
    }
  }, [])

  // Custom Tooltip with Roboto font and tracking wider
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${roboto.className} bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 text-xs tracking-wide`}>
          <p className="font-medium text-gray-800 tracking-wide">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-gray-600 tracking-wide" style={{ color: item.color }}>
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const lineChartData = getAttendanceLineData()
  const totalPresent = useMemo(() => lineChartData.reduce((acc, curr) => acc + curr.present, 0), [lineChartData])
  const totalAbsent = useMemo(() => lineChartData.reduce((acc, curr) => acc + curr.absent, 0), [lineChartData])

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
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const monthlyData = getMonthlyAttendanceData()
  const departmentData = getDepartmentData()

  // Prepare data for individual radial charts
  const pendingData = [{ name: 'Pending', value: stats.pendingLeaves || 0, fill: '#F59E0B' }]
  const approvedData = [{ name: 'Approved', value: stats.approvedLeaves || 0, fill: '#10B981' }]
  const rejectedData = [{ name: 'Rejected', value: stats.rejectedLeaves || 0, fill: '#EF4444' }]

  // Radial Chart Component - Completely merged
  const LeaveRadialChart = ({ data, title, color, valueColor }: { data: any[], title: string, color: string, valueColor: string }) => {
    const value = data[0]?.value || 0
    
    return (
      <div className="flex-1">
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={data}
              endAngle={100}
              innerRadius={30}
              outerRadius={44}
              barSize={8}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="#e5e7eb"
                polarRadius={[36, 30]}
              />
              <RadialBar 
                dataKey="value" 
                background 
                cornerRadius={3}
                fill={color}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={`${roboto.className}`}
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className={`${valueColor} text-base font-bold tracking-wide`}
                          >
                            {value}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 14}
                            className="fill-gray-500 text-[6px] tracking-wide"
                          >
                            {title}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  // Add a safe check for employee data before rendering
  const safeEmployees = data.employees || []
  const safeLeaveRequests = data.leaveRequests || []

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
                  HR Dashboard
                </h1>
                <p className="text-sm text-gray-500 tracking-wide mt-1">
                  Overview of employee attendance and leave management
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2 tracking-wider"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => window.location.href = '/hr/get-sheet'}
                className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center gap-2 tracking-wider"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Get Sheet
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-[#0071BD] tracking-wide">Total Employees</div>
            <div className="text-2xl font-bold text-[#0071BD] tracking-wider">{stats.totalEmployees}</div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-green-600 tracking-wide flex items-center gap-1">
              <UserCheck className="w-4 h-4" /> Present
            </div>
            <div className="text-2xl font-bold text-green-700 tracking-wider">{stats.presentToday}</div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-red-600 tracking-wide flex items-center gap-1">
              <UserX className="w-4 h-4" /> Absent
            </div>
            <div className="text-2xl font-bold text-red-700 tracking-wider">{stats.absentToday}</div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-yellow-600 tracking-wide flex items-center gap-1">
              <UserMinus className="w-4 h-4" /> On Leave
            </div>
            <div className="text-2xl font-bold text-yellow-700 tracking-wider">{stats.onLeave}</div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-orange-600 tracking-wide flex items-center gap-1">
              <ClockIcon className="w-4 h-4" /> Pending
            </div>
            <div className="text-2xl font-bold text-orange-700 tracking-wider">{stats.pendingLeaves}</div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-blue-600 tracking-wide flex items-center gap-1">
              <Building className="w-4 h-4" /> Depts
            </div>
            <div className="text-2xl font-bold text-blue-700 tracking-wider">{stats.departments.length}</div>
          </div>

          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-indigo-600 tracking-wide flex items-center gap-1">
              {stats.attendanceRate > 70 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              Rate
            </div>
            <div className={`text-2xl font-bold tracking-wider ${
              stats.attendanceRate > 70 ? 'text-green-700' : 'text-red-700'
            }`}>
              {stats.attendanceRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Department Distribution - Radial Bar Chart */}
          <div className="shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 tracking-wide">Department Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  data={departmentData} 
                  innerRadius={18} 
                  outerRadius={80}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarGrid gridType="circle" stroke="#e5e7eb" />
                  <RadialBar 
                    dataKey="employees" 
                    cornerRadius={4}
                    label={{ 
                      position: 'insideStart', 
                      fill: '#fff',
                      fontSize: 9,
                      fontWeight: 500,
                      fontFamily: 'Roboto, sans-serif',
                      letterSpacing: '0.05em'
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[10px]">
              {departmentData.map((item, index) => (
                <span key={index} className="flex items-center gap-1 tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.fill }}></span>
                  {item.department}: {item.employees}
                </span>
              ))}
            </div>
          </div>

          {/* Monthly Attendance Bar Chart */}
          <div className="shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800 tracking-wide">Monthly Attendance</h3>
              <div className="flex text-black items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 tracking-wide">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded"></span>
                  Present
                </span>
                <span className="flex items-center gap-1 tracking-wide">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded"></span>
                  Absent
                </span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false}
                    tickMargin={4}
                    axisLine={false}
                    fontSize={9}
                    tick={{ className: `text-[9px] ${roboto.className} tracking-wide` }}
                  />
                  <YAxis 
                    fontSize={9} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ className: `text-[9px] ${roboto.className} tracking-wide` }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="present" fill="#10B981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="absent" fill="#EF4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500 tracking-wide">
              <span>Last 6 months</span>
              <span className="flex items-center gap-1 text-green-600 tracking-wide">
                <TrendingUp className="w-3 h-3" />
                {monthlyData.length > 0 && monthlyData[monthlyData.length - 1].present > 0 
                  ? `${((monthlyData[monthlyData.length - 1].present / stats.totalEmployees) * 100).toFixed(1)}% this month`
                  : 'No data'}
              </span>
            </div>
          </div>
        </div>

        {/* Leave Status Distribution - 3 Charts COMPLETELY MERGED */}
        <div className="shadow-sm p-2 mb-6">
          <h3 className="text-xs font-semibold text-gray-800 mb-0.5 tracking-wide text-center">Leave Status Distribution</h3>
          <div className="flex">
            <div className="flex-1">
              <LeaveRadialChart 
                data={pendingData} 
                title="Pending" 
                color="#F59E0B"
                valueColor="text-yellow-600"
              />
            </div>
            <div className="flex-1">
              <LeaveRadialChart 
                data={approvedData} 
                title="Approved" 
                color="#10B981"
                valueColor="text-green-600"
              />
            </div>
            <div className="flex-1">
              <LeaveRadialChart 
                data={rejectedData} 
                title="Rejected" 
                color="#EF4444"
                valueColor="text-red-600"
              />
            </div>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center justify-center gap-2 text-[9px]">
            <span className="flex items-center gap-1 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              Pending: {stats.pendingLeaves}
            </span>
            <span className="flex items-center gap-1 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Approved: {stats.approvedLeaves}
            </span>
            <span className="flex items-center gap-1 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Rejected: {stats.rejectedLeaves}
            </span>
          </div>
        </div>

        {/* Attendance Trends - Interactive Line Chart */}
        <div className="shadow-sm p-4 mb-6">
          <div className="flex flex-col items-stretch border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 tracking-wide">Attendance Trends</h3>
              <p className="text-[10px] text-gray-500 tracking-wide mt-0.5">Showing daily attendance for the last 30 days</p>
            </div>
            <div className="flex mt-2 sm:mt-0">
              <button
                data-active={activeChart === 'present'}
                className={`flex flex-col px-3 py-1.5 text-left border rounded-l-lg ${
                  activeChart === 'present' 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setActiveChart('present')}
              >
                <span className="text-[9px] text-gray-500 tracking-wide">Present</span>
                <span className="text-xs font-bold text-green-600 tracking-wider">{totalPresent.toLocaleString()}</span>
              </button>
              <button
                data-active={activeChart === 'absent'}
                className={`flex flex-col px-3 py-1.5 text-left border rounded-r-lg ${
                  activeChart === 'absent' 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setActiveChart('absent')}
              >
                <span className="text-[9px] text-gray-500 tracking-wide">Absent</span>
                <span className="text-xs font-bold text-red-600 tracking-wider">{totalAbsent.toLocaleString()}</span>
              </button>
            </div>
          </div>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineChartData}
                margin={{ left: 0, right: 0, top: 5, bottom: 5 }}
              >
                <CartesianGrid vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  minTickGap={32}
                  fontSize={9}
                  tick={{ className: `${roboto.className} tracking-wide` }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
                <YAxis 
                  fontSize={9} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ className: `${roboto.className} tracking-wide` }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className={`${roboto.className} bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-2 text-[10px] tracking-wide`}>
                          <p className="font-medium text-gray-800 tracking-wide">
                            {new Date(label || '').toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          {payload.map((item: any, index: number) => (
                            <p key={index} className="text-gray-600 tracking-wide" style={{ color: item.color }}>
                              {item.name}: {item.value}
                            </p>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  dataKey={activeChart}
                  type="monotone"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white shadow-sm rounded-lg mb-6 overflow-hidden">
          <div className="p-2.5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0071BD]" />
                <h3 className="font-semibold text-gray-800 tracking-wide text-xs">Recent Activity</h3>
                <span className="text-[10px] text-gray-400 tracking-wide">(Last Hour)</span>
              </div>
              <span className="text-[10px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 tracking-wide">
                {recentActivities.length} activities
              </span>
            </div>
          </div>

          {recentActivities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Dept</th>
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentActivities.slice(0, 5).map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50 transition">
                      <td className="px-2.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            activity.type === 'check-in' ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            <UserIcon className={`w-3 h-3 ${
                              activity.type === 'check-in' ? 'text-green-600' : 'text-orange-600'
                            }`} />
                          </div>
                          <span className="text-xs font-medium text-gray-800 tracking-wide">
                            {activity.employeeName}
                          </span>
                        </div>
                      </td>
                      <td className="px-2.5 py-1.5 text-[10px] text-gray-600 tracking-wide">
                        {activity.employeeId}
                      </td>
                      <td className="px-2.5 py-1.5 text-[10px] text-gray-600 tracking-wide">
                        <span className="px-1 py-0.5 bg-gray-100 rounded text-[9px] tracking-wide">
                          {activity.department}
                        </span>
                      </td>
                      <td className="px-2.5 py-1.5">
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium tracking-wide ${
                          activity.type === 'check-in' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {activity.type === 'check-in' ? (
                            <LogIn className="w-2.5 h-2.5" />
                          ) : (
                            <LogOutIcon className="w-2.5 h-2.5" />
                          )}
                          {activity.type === 'check-in' ? 'In' : 'Out'}
                        </span>
                      </td>
                      <td className="px-2.5 py-1.5 text-[10px] text-gray-600 max-w-[100px] truncate tracking-wide">
                        {activity.location}
                      </td>
                      <td className="px-2.5 py-1.5 text-[10px] text-gray-500 tracking-wide">
                        {formatTime(activity.time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-3 text-gray-500">
              <Activity className="w-6 h-6 text-gray-300 mx-auto mb-0.5" />
              <p className="text-[10px] tracking-wide">No recent activity in the last hour</p>
            </div>
          )}
        </div>

        {/* Recent Employees */}
        <div className="bg-white shadow-sm overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-800 tracking-wide">Recent Employees</h3>
              <button
                onClick={() => window.location.href = '/hr/attendance'}
                className="text-[10px] text-[#0071BD] hover:text-[#005a96] font-medium tracking-wide"
              >
                View All
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {safeEmployees.slice(0, 5).map((employee) => {
                  const today = new Date().toISOString().split('T')[0]
                  const hasCheckIn = employee.checkIn?.some((check: any) => {
                    if (!check || !check.time) return false
                    const checkDate = new Date(check.time).toISOString().split('T')[0]
                    return checkDate === today
                  })
                  
                  const isOnLeave = safeLeaveRequests.some((leave: any) => {
                    if (!leave || !leave.fromDate || !leave.toDate || leave.status !== 'approved') return false
                    const todayDate = new Date(today)
                    const fromDate = new Date(leave.fromDate)
                    const toDate = new Date(leave.toDate)
                    return leave.employeeName === employee?.personalDetails?.fullName &&
                           fromDate <= todayDate && toDate >= todayDate
                  })

                  let status = 'Absent'
                  let statusColor = 'bg-red-100 text-red-700'
                  let statusIcon = <XCircle className="w-2.5 h-2.5" />
                  
                  if (isOnLeave) {
                    status = 'On Leave'
                    statusColor = 'bg-yellow-100 text-yellow-700'
                    statusIcon = <Calendar className="w-2.5 h-2.5" />
                  } else if (hasCheckIn) {
                    status = 'Present'
                    statusColor = 'bg-green-100 text-green-700'
                    statusIcon = <CheckCircle className="w-2.5 h-2.5" />
                  }

                  return (
                    <tr key={employee._id} className="hover:bg-gray-50 transition">
                      <td className="px-2.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-3 h-3 text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-800 text-xs tracking-wide">
                            {employee?.personalDetails?.fullName || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-2.5 py-1.5 text-[10px] text-gray-600 tracking-wide">
                        {employee?.personalDetails?.employeeId || 'N/A'}
                      </td>
                      <td className="px-2.5 py-1.5 text-[10px] text-gray-600 tracking-wide">
                        {employee?.personalDetails?.department || 'N/A'}
                      </td>
                      <td className="px-2.5 py-1.5 text-[10px] text-gray-600 tracking-wide">
                        {employee?.personalDetails?.position || 'N/A'}
                      </td>
                      <td className="px-2.5 py-1.5">
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide ${statusColor}`}>
                          {statusIcon}
                          {status}
                        </span>
                      </td>
                      <td className="px-2.5 py-1.5">
                        <button
                          onClick={() => window.location.href = `/hr/attendance?id=${employee._id}`}
                          className="text-[#0071BD] hover:text-[#005a96]"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {safeEmployees.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-1" />
              <p className="text-[10px] tracking-wide">No employees found</p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {safeEmployees.length > 0 && (
          <div className="mt-6 bg-white shadow-sm p-2.5">
            <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-600 tracking-wide">
              <div className="tracking-wide">
                Showing {Math.min(5, safeEmployees.length)} of {safeEmployees.length} employees
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 tracking-wide">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Present: {stats.presentToday}
                </span>
                <span className="flex items-center gap-1 tracking-wide">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Absent: {stats.absentToday}
                </span>
                <span className="flex items-center gap-1 tracking-wide">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  On Leave: {stats.onLeave}
                </span>
                <span className="flex items-center gap-1 tracking-wide">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Recent: {recentActivities.length}
                </span>
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