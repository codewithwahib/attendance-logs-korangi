// // app/hr/get-sheet/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import Footer from '@/app/components/footer'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import { client } from '@/sanity/lib/client'
// import NavbarDropdown from '@/app/components/navbar/page'
// import {
//   RefreshCw,
//   Calendar,
//   Users,
//   Building,
//   Filter,
//   ChevronDown,
//   ChevronUp,
//   User,
//   Loader,
//   UserCheck,
//   UserX,
//   UserMinus,
//   UserPlus,
//   Printer,
//   MapPin,
//   AlertCircle
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
//     emergencyContact?: string
//     dob?: string
//     maritalStatus?: string
//     address?: string
//     joiningDate?: string
//   }
//   qualifications?: Array<{
//     educationType: string
//     institute: string
//     year: number
//     grade: string
//   }>
//   experience?: Array<{
//     companyName: string
//     experience: number
//     position: string
//     startDate: string
//     endDate: string
//     responsibilities: string
//   }>
//   checkIn?: Array<{
//     time: string
//     location: string
//   }>
//   checkOut?: Array<{
//     time: string
//     location: string
//   }>
//   leaves?: Array<{
//     fromDate: string
//     toDate: string
//     status: string
//     leaveType: string
//     reason?: string
//     totalDays?: number
//   }>
// }

// interface AttendanceRecord {
//   employeeId: string
//   name: string
//   fatherName: string
//   cnic: string
//   phoneNumber: string
//   emergencyContact: string
//   dob: string
//   maritalStatus: string
//   address: string
//   department: string
//   designation: string
//   joiningDate: string
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
//   qualifications: string
//   experience: string
// }

// export default function GetSheetPage() {
//   const [employees, setEmployees] = useState<Employee[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [fromDate, setFromDate] = useState('')
//   const [toDate, setToDate] = useState('')
//   const [selectedDepartment, setSelectedDepartment] = useState('all')
//   const [departments, setDepartments] = useState<string[]>([])
//   const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
//   const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
//   const [expandedFilters, setExpandedFilters] = useState(false)
//   const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
//   const [employeeNames, setEmployeeNames] = useState<{id: string, name: string, department: string}[]>([])
//   const [searchTerm, setSearchTerm] = useState('')
//   const [showEmployeeList, setShowEmployeeList] = useState(false)
//   const [selectedEmployeeData, setSelectedEmployeeData] = useState<Employee | null>(null)

//   useEffect(() => {
//     fetchEmployees()
//     // Set default dates to current month
//     const now = new Date()
//     const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
//     const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
//     setFromDate(firstDay.toISOString().split('T')[0])
//     setToDate(lastDay.toISOString().split('T')[0])
//   }, [])

//   useEffect(() => {
//     if (employees.length > 0 && fromDate && toDate) {
//       generateAttendanceSheet()
//     }
//   }, [employees, fromDate, toDate, selectedDepartment, selectedEmployee])

//   const fetchEmployees = async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       const query = `
//         *[_type == "employee"] {
//           _id,
//           personalDetails {
//             employeeId,
//             fullName,
//             department,
//             position,
//             fatherName,
//             cnic,
//             phoneNumber,
//             emergencyContact,
//             dob,
//             maritalStatus,
//             address,
//             joiningDate
//           },
//           qualifications[] {
//             educationType,
//             institute,
//             year,
//             grade
//           },
//           experience[] {
//             companyName,
//             experience,
//             position,
//             startDate,
//             endDate,
//             responsibilities
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
//             fromDate,
//             toDate,
//             status,
//             leaveType,
//             reason,
//             totalDays
//           }
//         }
//       `

//       const data = await client.fetch(query)
      
//       if (!data || data.length === 0) {
//         setError('No employees found')
//         return
//       }

//       // Extract departments
//       const depts = data
//   .map((emp: any) => emp.personalDetails?.department)
//   .filter(Boolean) as string[];
// setDepartments([...new Set(depts)]);

//       const names = data
//   .map((emp: any) => ({
//     id: emp.personalDetails?.employeeId || '',
//     name: emp.personalDetails?.fullName || '',
//     department: emp.personalDetails?.department || ''
//   }))
//   .filter((n: { id: string; name: string; department: string }) => n.id && n.name);
// setEmployeeNames(names);

//       setEmployees(data)
//     } catch (err) {
//       console.error('Error fetching employees:', err)
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
      
//       if (diffMs < 0) return '-'
      
//       // Calculate hours, minutes, seconds
//       const totalSeconds = Math.floor(diffMs / 1000)
//       const hours = Math.floor(totalSeconds / 3600)
//       const minutes = Math.floor((totalSeconds % 3600) / 60)
//       const seconds = totalSeconds % 60
      
//       // Format as HH:MM:SS with leading zeros
//       const formattedHours = String(hours).padStart(2, '0')
//       const formattedMinutes = String(minutes).padStart(2, '0')
//       const formattedSeconds = String(seconds).padStart(2, '0')
      
//       return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
//     } catch {
//       return '-'
//     }
//   }

//   const getQualificationsString = (qualifications: any[] = []) => {
//     if (!qualifications || qualifications.length === 0) return '-'
//     return qualifications.map(q => 
//       `${q.educationType} (${q.institute}, ${q.year}) - ${q.grade}`
//     ).join('; ')
//   }

//   const getExperienceString = (experience: any[] = []) => {
//     if (!experience || experience.length === 0) return '-'
//     return experience.map(exp => 
//       `${exp.position} at ${exp.companyName} (${exp.experience} years)`
//     ).join('; ')
//   }

//   // Helper function to check if location is a valid coordinate string
//   const isValidCoordinate = (location: string): boolean => {
//     if (!location || location === '-') return false
//     // Check if location contains coordinates format like "latitude, longitude"
//     const parts = location.split(',').map(s => s.trim())
//     if (parts.length !== 2) return false
//     const lat = parseFloat(parts[0])
//     const lng = parseFloat(parts[1])
//     return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
//   }

//   // Helper function to extract coordinates from location string
//   const parseCoordinates = (location: string): { lat: number; lng: number } | null => {
//     if (!location || location === '-') return null
//     const parts = location.split(',').map(s => s.trim())
//     if (parts.length !== 2) return null
//     const lat = parseFloat(parts[0])
//     const lng = parseFloat(parts[1])
//     if (isNaN(lat) || isNaN(lng)) return null
//     return { lat, lng }
//   }

//   // Function to open Google Maps with coordinates
//   const openGoogleMaps = (location: string) => {
//     const coords = parseCoordinates(location)
//     if (!coords) {
//       // If not coordinates, try to search as address
//       const searchQuery = encodeURIComponent(location)
//       window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank')
//       return
//     }
//     window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank')
//   }

//   // Component for rendering clickable location
//   const LocationDisplay = ({ location, label }: { location: string; label: string }) => {
//     if (!location || location === '-') {
//       return <span className="text-gray-400">-</span>
//     }

//     const hasCoords = isValidCoordinate(location)
//     const displayText = hasCoords ? '📍 View Location' : location.length > 30 ? location.substring(0, 30) + '...' : location

//     return (
//       <div className="flex items-center gap-1">
//         <button
//           onClick={() => openGoogleMaps(location)}
//           className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-sm transition-colors"
//           title={hasCoords ? 'Click to view on map' : 'Click to search on Google Maps'}
//         >
//           <MapPin className="w-3 h-3" />
//           <span>{displayText}</span>
//         </button>
//         {hasCoords && (
//           <span className="text-xs text-gray-400 ml-1" title="Coordinates">
//             ({location})
//           </span>
//         )}
//       </div>
//     )
//   }

//   const getEmployeeAttendance = (employee: Employee, date: string): AttendanceRecord => {
//     const dateStr = date
//     const checkIn = employee.checkIn?.find(c => c.time.split('T')[0] === dateStr)
//     const checkOut = employee.checkOut?.find(c => c.time.split('T')[0] === dateStr)
    
//     // Check if employee is on leave
//     const leave = employee.leaves?.find(
//       l => l.fromDate <= dateStr && l.toDate >= dateStr && l.status === 'approved'
//     )

//     let status: 'Present' | 'Absent' | 'Leave' | 'Half Day' = 'Absent'
//     let leaveType = ''
//     let leaveReason = ''

//     if (leave) {
//       status = 'Leave'
//       leaveType = leave.leaveType || ''
//       leaveReason = leave.reason || ''
//     } else if (checkIn && checkOut) {
//       status = 'Present'
//     } else if (checkIn && !checkOut) {
//       status = 'Half Day'
//     }

//     const personal = employee.personalDetails

//     return {
//       employeeId: personal?.employeeId || '',
//       name: personal?.fullName || '',
//       fatherName: personal?.fatherName || '-',
//       cnic: personal?.cnic || '-',
//       phoneNumber: personal?.phoneNumber || '-',
//       emergencyContact: personal?.emergencyContact || '-',
//       dob: formatDate(personal?.dob || ''),
//       maritalStatus: personal?.maritalStatus || '-',
//       address: personal?.address || '-',
//       department: personal?.department || '',
//       designation: personal?.position || '',
//       joiningDate: formatDate(personal?.joiningDate || ''),
//       date: dateStr,
//       day: getDayName(dateStr),
//       checkIn: checkIn ? formatTime(checkIn.time) : '-',
//       checkOut: checkOut ? formatTime(checkOut.time) : '-',
//       totalHours: calculateTotalHours(checkIn?.time || '', checkOut?.time || ''),
//       checkInLocation: checkIn?.location || '-',
//       checkOutLocation: checkOut?.location || '-',
//       status,
//       leaveType,
//       leaveReason,
//       qualifications: getQualificationsString(employee.qualifications),
//       experience: getExperienceString(employee.experience)
//     }
//   }

//   const generateAttendanceSheet = () => {
//     if (!fromDate || !toDate) return

//     const startDate = new Date(fromDate)
//     const endDate = new Date(toDate)
//     const dateArray: string[] = []

//     // Generate all dates in range
//     const currentDate = new Date(startDate)
//     while (currentDate <= endDate) {
//       dateArray.push(currentDate.toISOString().split('T')[0])
//       currentDate.setDate(currentDate.getDate() + 1)
//     }

//     let allRecords: AttendanceRecord[] = []

//     // Filter employees by department and employee
//     let filteredEmployees = employees
//     if (selectedDepartment !== 'all') {
//       filteredEmployees = filteredEmployees.filter(
//         emp => emp.personalDetails?.department === selectedDepartment
//       )
//     }
//     if (selectedEmployee !== 'all') {
//       filteredEmployees = filteredEmployees.filter(
//         emp => emp.personalDetails?.employeeId === selectedEmployee
//       )
//     }

//     // Generate attendance for each employee for each date
//     filteredEmployees.forEach(employee => {
//       dateArray.forEach(date => {
//         const record = getEmployeeAttendance(employee, date)
//         allRecords.push(record)
//       })
//     })

//     setAttendanceData(allRecords)
//     setFilteredData(allRecords)
//   }

//   // Print functionality - Opens in new tab with PDF format matching the exact design
//   const handlePrint = () => {
//     // Get the current data
//     const data = filteredData
//     const employeeName = selectedEmployee === 'all' ? 'All Employees' : getSelectedEmployeeName()
//     const deptName = selectedDepartment !== 'all' ? selectedDepartment : 'All Departments'

//     // Function to get row color based on check-in time
//     const getRowColor = (checkInTime: string) => {
//       if (!checkInTime || checkInTime === '-') return 'transparent'
      
//       try {
//         // Parse the time string (format: "09:40 AM" or "10:00 AM")
//         const timeStr = checkInTime.replace(/\s/g, '')
//         const isPM = timeStr.includes('PM')
//         let hours = parseInt(timeStr.split(':')[0])
//         const minutes = parseInt(timeStr.split(':')[1]?.replace(/[AP]M/g, ''))
        
//         // Convert to 24-hour format
//         if (isPM && hours !== 12) hours += 12
//         if (!isPM && hours === 12) hours = 0
        
//         const totalMinutes = hours * 60 + (minutes || 0)
        
//         // Color coding based on time ranges
//         if (totalMinutes < 600) {
//           return '#4A90D9' // Blue - Before 10:00 AM (including 9:40 AM and earlier)
//         } else if (totalMinutes >= 600 && totalMinutes < 630) {
//           return '#27AE60' // Green - 10:00 AM to 10:30 AM
//         } else if (totalMinutes >= 630 && totalMinutes < 690) {
//           return '#F1C40F' // Yellow - 10:30 AM to 11:30 AM
//         } else if (totalMinutes >= 690) {
//           return '#E74C3C' // Red - 11:30 AM and onwards (including 12:00 PM and after)
//         }
        
//         return 'transparent'
//       } catch {
//         return 'transparent'
//       }
//     }

//     // Create print content with exact format matching the PDF design
//     let tableRows = ''
//     data.forEach((record, index) => {
//       // Check if the day is Sunday
//       const isSunday = record.day === 'Sunday'
//       // Get row color based on check-in time (only if not Sunday)
//       const checkInColor = !isSunday ? getRowColor(record.checkIn) : 'transparent'
//       // If Sunday, use light red, otherwise use check-in color
//       const rowBgColor = isSunday ? '#FFCCCC' : (checkInColor || 'transparent')
      
//       if (isSunday) {
//         // Sunday row - only show "Sunday" in Day column, everything else empty
//         tableRows += `
//           <tr style="background-color: ${rowBgColor};">
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center; font-weight: bold; color: #FF0000;">Sunday</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
//           </tr>
//         `
//       } else {
//         // Normal row - show all data with color based on check-in time
//         tableRows += `
//           <tr style="background-color: ${rowBgColor};">
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${index + 1}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.employeeId}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.name}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.department}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.designation}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.date}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.day}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.checkIn}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.checkOut}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.totalHours}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.status}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.leaveType || '-'}</td>
//             <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.leaveReason || '-'}</td>
//           </tr>
//         `
//       }
//     })

//     // Create HTML for print with exact PDF format matching the design
//     const printHTML = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Attendance Sheet - ${employeeName}</title>
//           <style>
//             @page {
//               size: A4 landscape;
//               margin: 10mm 8mm;
//             }
            
//             * {
//               box-sizing: border-box;
//               margin: 0;
//               padding: 0;
//             }
            
//             body {
//               font-family: Arial, Helvetica, sans-serif;
//               background: white;
//               color: #000000;
//               padding: 0;
//               margin: 0;
//             }
            
//             .print-container {
//               width: 100%;
//               padding: 0;
//             }
            
//             .print-header {
//               text-align: center;
//               margin-bottom: 10px;
//               padding-bottom: 8px;
//               border-bottom: 2px solid #000000;
//             }
            
//             .print-header .company-name {
//               font-size: 14px;
//               font-weight: 700;
//               color: #000000;
//               letter-spacing: 0.5px;
//               text-transform: uppercase;
//             }
            
//             .print-header .title {
//               font-size: 12px;
//               font-weight: 700;
//               color: #000000;
//               margin-top: 2px;
//               letter-spacing: 0.5px;
//             }
            
//             .print-header .sub-info {
//               font-size: 9px;
//               color: #000000;
//               margin-top: 4px;
//               font-weight: 500;
//             }
            
//             .print-header .date-range {
//               font-size: 9px;
//               color: #000000;
//               margin-top: 2px;
//               font-weight: 400;
//             }
            
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               font-size: 8px;
//               margin-top: 2px;
//             }
            
//             table thead th {
//               background: #C4BD97;
//               font-weight: 700;
//               text-align: center;
//               padding: 5px 4px;
//               border: 1px solid #000000;
//               text-transform: uppercase;
//               font-size: 7px;
//               letter-spacing: 0.3px;
//               color: #000000;
//               white-space: nowrap;
//             }
            
//             table tbody td {
//               padding: 4px 6px;
//               border: 1px solid #000000;
//               color: #000000;
//               vertical-align: middle;
//               text-align: center;
//               font-size: 8px;
//             }
            
//             .print-footer {
//               margin-top: 12px;
//               padding-top: 8px;
//               border-top: 1px solid #000000;
//               text-align: center;
//               font-size: 8px;
//               color: #000000;
//               letter-spacing: 0.3px;
//             }
            
//             .print-footer .footer-text {
//               font-weight: 400;
//             }
            
//             @media print {
//               body { 
//                 padding: 0; 
//                 margin: 0;
//               }
//               .print-container {
//                 padding: 0;
//               }
//               table thead th {
//                 background: #C4BD97 !important;
//                 -webkit-print-color-adjust: exact !important;
//                 print-color-adjust: exact !important;
//               }
//               tr[style*="background-color"] td {
//                 -webkit-print-color-adjust: exact !important;
//                 print-color-adjust: exact !important;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="print-container">
            
//             <!-- Table -->
//             <table>
//               <thead>
//                 <tr>
//                   <th style="width:3%">#</th>
//                   <th style="width:9%">Employee ID</th>
//                   <th style="width:12%">Name</th>
//                   <th style="width:9%">Department</th>
//                   <th style="width:9%">Designation</th>
//                   <th style="width:8%">Date</th>
//                   <th style="width:8%">Day</th>
//                   <th style="width:8%">Check In</th>
//                   <th style="width:8%">Check Out</th>
//                   <th style="width:8%">Total Hours</th>
//                   <th style="width:8%">Status</th>
//                   <th style="width:8%">Leave Type</th>
//                   <th style="width:12%">Leave Reason</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${tableRows}
//               </tbody>
//             </table>
            
//             <!-- Footer -->
//             <div class="print-footer">
//               <span class="footer-text">This sheet is generated by system software | A to Zee Switchgear Engineering (SMC) Pvt. Ltd.</span>
//             </div>
//           </div>
          
//           <script>
//             // Auto-print when page loads
//             window.onload = function() {
//               setTimeout(function() {
//                 window.print();
//               }, 500);
//             }
//           </script>
//         </body>
//       </html>
//     `

//     // Open in a new tab
//     const printWindow = window.open('', '_blank')
//     if (!printWindow) {
//       alert('Please allow popups for printing')
//       return
//     }

//     printWindow.document.write(printHTML)
//     printWindow.document.close()
//   }

//   // Calculate summary statistics
//   const getSummary = () => {
//     const total = filteredData.length
//     const present = filteredData.filter(r => r.status === 'Present').length
//     const absent = filteredData.filter(r => r.status === 'Absent').length
//     const leave = filteredData.filter(r => r.status === 'Leave').length
//     const halfDay = filteredData.filter(r => r.status === 'Half Day').length

//     return { total, present, absent, leave, halfDay }
//   }

//   const summary = getSummary()

//   // Get selected employee name for display
//   const getSelectedEmployeeName = () => {
//     if (selectedEmployee === 'all') return 'All Employees'
//     const emp = employees.find(e => e.personalDetails?.employeeId === selectedEmployee)
//     return emp?.personalDetails?.fullName || 'Selected Employee'
//   }

//   // Filter employees for search
//   const filteredEmployees = employeeNames.filter(emp => 
//     emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     emp.id.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   if (loading) {
//       return (
//         <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
//           <div className="text-center">
//             <Loader className="w-12 h-12 animate-spin text-[#0071BD] mx-auto mb-4" />
//           </div>
//         </div>
//       )
//     }

//   if (error) {
//     return (
//       <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
//         <div className="text-center bg-white shadow-sm p-8 max-w-md">
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
//                   Employee Attendance Sheet
//                 </h1>
//                 <p className="text-sm text-gray-500 tracking-wide mt-1">
//                   {selectedEmployee === 'all' 
//                     ? 'Generate attendance report for all employees' 
//                     : `Generate attendance report for ${getSelectedEmployeeName()}`
//                   }
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex gap-3 flex-wrap">
//               <button
//                 onClick={fetchEmployees}
//                 className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2 tracking-wider"
//               >
//                 <RefreshCw className="w-4 h-4" />
//                 Refresh
//               </button>
//               <button
//                 onClick={handlePrint}
//                 className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 tracking-wider"
//               >
//                 <Printer className="w-4 h-4" />
//                 Print
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-[#0071BD] tracking-wide">Total Records</div>
//             <div className="text-2xl font-bold text-[#0071BD] tracking-wider">{summary.total}</div>
//           </div>
//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-green-600 tracking-wide flex items-center gap-1">
//               <UserCheck className="w-4 h-4" /> Present
//             </div>
//             <div className="text-2xl font-bold text-green-700 tracking-wider">{summary.present}</div>
//           </div>
//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-red-600 tracking-wide flex items-center gap-1">
//               <UserX className="w-4 h-4" /> Absent
//             </div>
//             <div className="text-2xl font-bold text-red-700 tracking-wider">{summary.absent}</div>
//           </div>
//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-blue-600 tracking-wide flex items-center gap-1">
//               <UserMinus className="w-4 h-4" /> Leave
//             </div>
//             <div className="text-2xl font-bold text-blue-700 tracking-wider">{summary.leave}</div>
//           </div>
//           <div className="bg-white shadow-sm p-4">
//             <div className="text-sm text-yellow-600 tracking-wide flex items-center gap-1">
//               <UserPlus className="w-4 h-4" /> Half Day
//             </div>
//             <div className="text-2xl font-bold text-yellow-700 tracking-wider">{summary.halfDay}</div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white shadow-sm p-4 mb-6">
//           <button
//             onClick={() => setExpandedFilters(!expandedFilters)}
//             className="flex items-center gap-2 text-gray-700 hover:text-[#0071BD] transition tracking-wider"
//           >
//             <Filter className="w-4 h-4" />
//             {expandedFilters ? 'Hide Filters' : 'Show Filters'}
//             {expandedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//           </button>

//           {expandedFilters && (
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
//                   Department
//                 </label>
//                 <div className="relative">
//                   <Building className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <select
//                     value={selectedDepartment}
//                     onChange={(e) => setSelectedDepartment(e.target.value)}
//                     className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                   >
//                     <option value="all">All Departments</option>
//                     {departments.map(dept => (
//                       <option key={dept} value={dept}>{dept}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
//                   Select Employee
//                 </label>
//                 <div className="relative">
//                   <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <select
//                     value={selectedEmployee}
//                     onChange={(e) => setSelectedEmployee(e.target.value)}
//                     className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
//                   >
//                     <option value="all">All Employees</option>
//                     {employeeNames.map(emp => (
//                       <option key={emp.id} value={emp.id}>
//                         {emp.name} ({emp.id})
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Employee Selection Quick View */}
//         <div className="bg-white shadow-sm p-4 mb-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Users className="w-5 h-5 text-[#0071BD]" />
//               <span className="font-medium text-gray-700 tracking-wide">
//                 {selectedEmployee === 'all' 
//                   ? `Showing all ${employees.length} employees` 
//                   : `Selected: ${getSelectedEmployeeName()}`
//                 }
//               </span>
//               {selectedEmployee !== 'all' && (
//                 <button
//                   onClick={() => setSelectedEmployee('all')}
//                   className="text-sm text-[#0071BD] hover:underline tracking-wide"
//                 >
//                   Clear Selection
//                 </button>
//               )}
//             </div>
//             <div className="text-sm text-gray-500 tracking-wide">
//               {filteredData.length} records found
//             </div>
//           </div>
//         </div>

//         {/* Data Table */}
//         <div className="bg-white shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-200">
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Reason</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredData.length === 0 ? (
//                   <tr>
//                     <td colSpan={14} className="px-4 py-8 text-center text-gray-500">
//                       <div className="flex flex-col items-center gap-2">
//                         <Users className="w-12 h-12 text-gray-300" />
//                         <p className="tracking-wide">No attendance data found for the selected period</p>
//                         <p className="text-sm text-gray-400">Try adjusting your date range or filters</p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredData.map((record, index) => (
//                     <tr key={index} className="hover:bg-gray-50 transition">
//                       <td className="px-4 py-3 text-sm text-gray-500 tracking-wide">{index + 1}</td>
//                       <td className="px-4 py-3 text-sm font-medium text-gray-800 tracking-wide">{record.employeeId}</td>
//                       <td className="px-4 py-3 text-sm text-gray-700 tracking-wide">{record.name}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.department}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.designation}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.date}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.day}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.checkIn}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.checkOut}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.totalHours}</td>
//                       <td className="px-4 py-3 text-sm">
//                         {record.checkInLocation !== '-' && record.checkOutLocation !== '-' ? (
//                           <div className="space-y-1">
//                             <LocationDisplay location={record.checkInLocation} label="In" />
//                             <LocationDisplay location={record.checkOutLocation} label="Out" />
//                           </div>
//                         ) : record.checkInLocation !== '-' ? (
//                           <LocationDisplay location={record.checkInLocation} label="In" />
//                         ) : record.checkOutLocation !== '-' ? (
//                           <LocationDisplay location={record.checkOutLocation} label="Out" />
//                         ) : (
//                           <span className="text-gray-400">-</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`px-2 py-1 text-xs font-medium tracking-wide ${
//                           record.status === 'Present' ? 'bg-green-100 text-green-700' :
//                           record.status === 'Absent' ? 'bg-red-100 text-red-700' :
//                           record.status === 'Leave' ? 'bg-blue-100 text-blue-700' :
//                           'bg-yellow-100 text-yellow-700'
//                         }`}>
//                           {record.status}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.leaveType || '-'}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.leaveReason || '-'}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Footer */}
//         {filteredData.length > 0 && (
//           <div className="mt-6 bg-white shadow-sm p-4">
//             <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 tracking-wide">
//               <div>
//                 Showing {filteredData.length} records
//                 {selectedEmployee !== 'all' && ` for ${getSelectedEmployeeName()}`}
//               </div>
//               <div className="flex items-center gap-6">
//                 <span className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-green-500"></span>
//                   Present: {summary.present}
//                 </span>
//                 <span className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-red-500"></span>
//                   Absent: {summary.absent}
//                 </span>
//                 <span className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-blue-500"></span>
//                   Leave: {summary.leave}
//                 </span>
//                 <span className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-yellow-500"></span>
//                   Half Day: {summary.halfDay}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Quick Stats */}
//         <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="bg-white shadow-sm p-4">
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <Users className="w-4 h-4 text-[#0071BD]" />
//               <span className="font-medium">Total Employees</span>
//             </div>
//             <div className="text-2xl font-bold text-[#0071BD] mt-1">{employees.length}</div>
//           </div>
//           <div className="bg-white shadow-sm p-4">
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <Calendar className="w-4 h-4 text-[#0071BD]" />
//               <span className="font-medium">Date Range</span>
//             </div>
//             <div className="text-sm font-medium text-gray-700 mt-1">
//               {formatDate(fromDate)} - {formatDate(toDate)}
//             </div>
//           </div>
//           <div className="bg-white shadow-sm p-4">
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <Building className="w-4 h-4 text-[#0071BD]" />
//               <span className="font-medium">Departments</span>
//             </div>
//             <div className="text-sm font-medium text-gray-700 mt-1">
//               {departments.length} departments
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//     <Footer/>
//     </ProtectedRoute>
//     </>
//   )
// }





// app/hr/get-sheet/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Footer from '@/app/components/footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { client } from '@/sanity/lib/client'
import NavbarDropdown from '@/app/components/navbar/page'
import {
  RefreshCw,
  Calendar,
  Users,
  Building,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Loader,
  UserCheck,
  UserX,
  UserMinus,
  UserPlus,
  Printer,
  MapPin,
  AlertCircle
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
    emergencyContact?: string
    dob?: string
    maritalStatus?: string
    address?: string
    joiningDate?: string
  }
  qualifications?: Array<{
    educationType: string
    institute: string
    year: number
    grade: string
  }>
  experience?: Array<{
    companyName: string
    experience: number
    position: string
    startDate: string
    endDate: string
    responsibilities: string
  }>
  checkIn?: Array<{
    time: string
    location: string
  }>
  checkOut?: Array<{
    time: string
    location: string
  }>
  leaves?: Array<{
    fromDate: string
    toDate: string
    status: string
    leaveType: string
    reason?: string
    totalDays?: number
  }>
}

interface AttendanceRecord {
  employeeId: string
  name: string
  fatherName: string
  cnic: string
  phoneNumber: string
  emergencyContact: string
  dob: string
  maritalStatus: string
  address: string
  department: string
  designation: string
  joiningDate: string
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
  qualifications: string
  experience: string
}

export default function GetSheetPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [departments, setDepartments] = useState<string[]>([])
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
  const [expandedFilters, setExpandedFilters] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [employeeNames, setEmployeeNames] = useState<{id: string, name: string, department: string}[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showEmployeeList, setShowEmployeeList] = useState(false)
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<Employee | null>(null)

  // =====================================================
  // Helper Functions - Moved BEFORE useCallback dependencies
  // =====================================================

  const getDayName = useCallback((dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }, [])

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

  const calculateTotalHours = useCallback((checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return '-'
    try {
      const inTime = new Date(checkIn)
      const outTime = new Date(checkOut)
      const diffMs = outTime.getTime() - inTime.getTime()
      
      if (diffMs < 0) return '-'
      
      const totalSeconds = Math.floor(diffMs / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      
      const formattedHours = String(hours).padStart(2, '0')
      const formattedMinutes = String(minutes).padStart(2, '0')
      const formattedSeconds = String(seconds).padStart(2, '0')
      
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    } catch {
      return '-'
    }
  }, [])

  const getQualificationsString = useCallback((qualifications: any[] = []) => {
    if (!qualifications || qualifications.length === 0) return '-'
    return qualifications.map(q => 
      `${q.educationType} (${q.institute}, ${q.year}) - ${q.grade}`
    ).join('; ')
  }, [])

  const getExperienceString = useCallback((experience: any[] = []) => {
    if (!experience || experience.length === 0) return '-'
    return experience.map(exp => 
      `${exp.position} at ${exp.companyName} (${exp.experience} years)`
    ).join('; ')
  }, [])

  const isValidCoordinate = useCallback((location: string): boolean => {
    if (!location || location === '-') return false
    const parts = location.split(',').map(s => s.trim())
    if (parts.length !== 2) return false
    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  }, [])

  const parseCoordinates = useCallback((location: string): { lat: number; lng: number } | null => {
    if (!location || location === '-') return null
    const parts = location.split(',').map(s => s.trim())
    if (parts.length !== 2) return null
    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])
    if (isNaN(lat) || isNaN(lng)) return null
    return { lat, lng }
  }, [])

  const openGoogleMaps = useCallback((location: string) => {
    const coords = parseCoordinates(location)
    if (!coords) {
      const searchQuery = encodeURIComponent(location)
      window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank')
      return
    }
    window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank')
  }, [parseCoordinates])

  // =====================================================
  // getEmployeeAttendance - Defined BEFORE it's used
  // =====================================================

  const getEmployeeAttendance = useCallback((employee: Employee, date: string): AttendanceRecord => {
    const dateStr = date
    const checkIn = employee.checkIn?.find(c => c.time.split('T')[0] === dateStr)
    const checkOut = employee.checkOut?.find(c => c.time.split('T')[0] === dateStr)
    
    const leave = employee.leaves?.find(
      l => l.fromDate <= dateStr && l.toDate >= dateStr && l.status === 'approved'
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
    }

    const personal = employee.personalDetails

    return {
      employeeId: personal?.employeeId || '',
      name: personal?.fullName || '',
      fatherName: personal?.fatherName || '-',
      cnic: personal?.cnic || '-',
      phoneNumber: personal?.phoneNumber || '-',
      emergencyContact: personal?.emergencyContact || '-',
      dob: formatDate(personal?.dob || ''),
      maritalStatus: personal?.maritalStatus || '-',
      address: personal?.address || '-',
      department: personal?.department || '',
      designation: personal?.position || '',
      joiningDate: formatDate(personal?.joiningDate || ''),
      date: dateStr,
      day: getDayName(dateStr),
      checkIn: checkIn ? formatTime(checkIn.time) : '-',
      checkOut: checkOut ? formatTime(checkOut.time) : '-',
      totalHours: calculateTotalHours(checkIn?.time || '', checkOut?.time || ''),
      checkInLocation: checkIn?.location || '-',
      checkOutLocation: checkOut?.location || '-',
      status,
      leaveType,
      leaveReason,
      qualifications: getQualificationsString(employee.qualifications),
      experience: getExperienceString(employee.experience)
    }
  }, [formatDate, getDayName, formatTime, calculateTotalHours, getQualificationsString, getExperienceString])

  // =====================================================
  // getSelectedEmployeeName - Defined BEFORE it's used
  // =====================================================

  const getSelectedEmployeeName = useCallback(() => {
    if (selectedEmployee === 'all') return 'All Employees'
    const emp = employees.find(e => e.personalDetails?.employeeId === selectedEmployee)
    return emp?.personalDetails?.fullName || 'Selected Employee'
  }, [employees, selectedEmployee])

  // =====================================================
  // fetchEmployees - useCallback with proper dependencies
  // =====================================================

  const fetchEmployees = useCallback(async () => {
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
            fatherName,
            cnic,
            phoneNumber,
            emergencyContact,
            dob,
            maritalStatus,
            address,
            joiningDate
          },
          qualifications[] {
            educationType,
            institute,
            year,
            grade
          },
          experience[] {
            companyName,
            experience,
            position,
            startDate,
            endDate,
            responsibilities
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
            fromDate,
            toDate,
            status,
            leaveType,
            reason,
            totalDays
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
        .filter(Boolean) as string[]
      setDepartments([...new Set(depts)])

      const names = data
        .map((emp: any) => ({
          id: emp.personalDetails?.employeeId || '',
          name: emp.personalDetails?.fullName || '',
          department: emp.personalDetails?.department || ''
        }))
        .filter((n: { id: string; name: string; department: string }) => n.id && n.name)
      setEmployeeNames(names)

      setEmployees(data)
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError('Failed to load employee data')
    } finally {
      setLoading(false)
    }
  }, []) // No dependencies needed

  // =====================================================
  // generateAttendanceSheet - WITH getEmployeeAttendance dependency
  // =====================================================

  const generateAttendanceSheet = useCallback(() => {
    if (!fromDate || !toDate) return

    const startDate = new Date(fromDate)
    const endDate = new Date(toDate)
    const dateArray: string[] = []

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      dateArray.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    let allRecords: AttendanceRecord[] = []

    let filteredEmployees = employees
    if (selectedDepartment !== 'all') {
      filteredEmployees = filteredEmployees.filter(
        emp => emp.personalDetails?.department === selectedDepartment
      )
    }
    if (selectedEmployee !== 'all') {
      filteredEmployees = filteredEmployees.filter(
        emp => emp.personalDetails?.employeeId === selectedEmployee
      )
    }

    filteredEmployees.forEach(employee => {
      dateArray.forEach(date => {
        const record = getEmployeeAttendance(employee, date)
        allRecords.push(record)
      })
    })

    setAttendanceData(allRecords)
    setFilteredData(allRecords)
  }, [employees, fromDate, toDate, selectedDepartment, selectedEmployee, getEmployeeAttendance]) // Added getEmployeeAttendance

  // =====================================================
  // LocationDisplay - WITH proper dependencies
  // =====================================================

  const LocationDisplay = useCallback(({ location, label }: { location: string; label: string }) => {
    if (!location || location === '-') {
      return <span className="text-gray-400">-</span>
    }

    const hasCoords = isValidCoordinate(location)
    const displayText = hasCoords ? '📍 View Location' : location.length > 30 ? location.substring(0, 30) + '...' : location

    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => openGoogleMaps(location)}
          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-sm transition-colors"
          title={hasCoords ? 'Click to view on map' : 'Click to search on Google Maps'}
        >
          <MapPin className="w-3 h-3" />
          <span>{displayText}</span>
        </button>
        {hasCoords && (
          <span className="text-xs text-gray-400 ml-1" title="Coordinates">
            ({location})
          </span>
        )}
      </div>
    )
  }, [isValidCoordinate, openGoogleMaps])

  // =====================================================
  // getSummary - WITH proper dependencies
  // =====================================================

  const getSummary = useCallback(() => {
    const total = filteredData.length
    const present = filteredData.filter(r => r.status === 'Present').length
    const absent = filteredData.filter(r => r.status === 'Absent').length
    const leave = filteredData.filter(r => r.status === 'Leave').length
    const halfDay = filteredData.filter(r => r.status === 'Half Day').length

    return { total, present, absent, leave, halfDay }
  }, [filteredData])

  // =====================================================
  // handlePrint - WITH getSelectedEmployeeName dependency
  // =====================================================

  const handlePrint = useCallback(() => {
    const data = filteredData
    const employeeName = selectedEmployee === 'all' ? 'All Employees' : getSelectedEmployeeName()
    const deptName = selectedDepartment !== 'all' ? selectedDepartment : 'All Departments'

    const getRowColor = (checkInTime: string) => {
      if (!checkInTime || checkInTime === '-') return 'transparent'
      
      try {
        const timeStr = checkInTime.replace(/\s/g, '')
        const isPM = timeStr.includes('PM')
        let hours = parseInt(timeStr.split(':')[0])
        const minutes = parseInt(timeStr.split(':')[1]?.replace(/[AP]M/g, ''))
        
        if (isPM && hours !== 12) hours += 12
        if (!isPM && hours === 12) hours = 0
        
        const totalMinutes = hours * 60 + (minutes || 0)
        
        if (totalMinutes < 600) {
          return '#4A90D9'
        } else if (totalMinutes >= 600 && totalMinutes < 630) {
          return '#27AE60'
        } else if (totalMinutes >= 630 && totalMinutes < 690) {
          return '#F1C40F'
        } else if (totalMinutes >= 690) {
          return '#E74C3C'
        }
        
        return 'transparent'
      } catch {
        return 'transparent'
      }
    }

    let tableRows = ''
    data.forEach((record, index) => {
      const isSunday = record.day === 'Sunday'
      const checkInColor = !isSunday ? getRowColor(record.checkIn) : 'transparent'
      const rowBgColor = isSunday ? '#FFCCCC' : (checkInColor || 'transparent')
      
      if (isSunday) {
        tableRows += `
          <tr style="background-color: ${rowBgColor};">
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center; font-weight: bold; color: #FF0000;">Sunday</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;"></td>
          </tr>
        `
      } else {
        tableRows += `
          <tr style="background-color: ${rowBgColor};">
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${index + 1}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.employeeId}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.name}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.department}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.designation}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.date}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.day}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.checkIn}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.checkOut}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.totalHours}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.status}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.leaveType || '-'}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 8px; text-align: center;">${record.leaveReason || '-'}</td>
          </tr>
        `
      }
    })

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Sheet - ${employeeName}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm 8mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              background: white;
              color: #000000;
              padding: 0;
              margin: 0;
            }
            .print-container {
              width: 100%;
              padding: 0;
            }
            .print-header {
              text-align: center;
              margin-bottom: 10px;
              padding-bottom: 8px;
              border-bottom: 2px solid #000000;
            }
            .print-header .company-name {
              font-size: 14px;
              font-weight: 700;
              color: #000000;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .print-header .title {
              font-size: 12px;
              font-weight: 700;
              color: #000000;
              margin-top: 2px;
              letter-spacing: 0.5px;
            }
            .print-header .sub-info {
              font-size: 9px;
              color: #000000;
              margin-top: 4px;
              font-weight: 500;
            }
            .print-header .date-range {
              font-size: 9px;
              color: #000000;
              margin-top: 2px;
              font-weight: 400;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 8px;
              margin-top: 2px;
            }
            table thead th {
              background: #C4BD97;
              font-weight: 700;
              text-align: center;
              padding: 5px 4px;
              border: 1px solid #000000;
              text-transform: uppercase;
              font-size: 7px;
              letter-spacing: 0.3px;
              color: #000000;
              white-space: nowrap;
            }
            table tbody td {
              padding: 4px 6px;
              border: 1px solid #000000;
              color: #000000;
              vertical-align: middle;
              text-align: center;
              font-size: 8px;
            }
            .print-footer {
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #000000;
              text-align: center;
              font-size: 8px;
              color: #000000;
              letter-spacing: 0.3px;
            }
            .print-footer .footer-text {
              font-weight: 400;
            }
            @media print {
              body { 
                padding: 0; 
                margin: 0;
              }
              .print-container {
                padding: 0;
              }
              table thead th {
                background: #C4BD97 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              tr[style*="background-color"] td {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <table>
              <thead>
                <tr>
                  <th style="width:3%">#</th>
                  <th style="width:9%">Employee ID</th>
                  <th style="width:12%">Name</th>
                  <th style="width:9%">Department</th>
                  <th style="width:9%">Designation</th>
                  <th style="width:8%">Date</th>
                  <th style="width:8%">Day</th>
                  <th style="width:8%">Check In</th>
                  <th style="width:8%">Check Out</th>
                  <th style="width:8%">Total Hours</th>
                  <th style="width:8%">Status</th>
                  <th style="width:8%">Leave Type</th>
                  <th style="width:12%">Leave Reason</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="print-footer">
              <span class="footer-text">This sheet is generated by system software | A to Zee Switchgear Engineering (SMC) Pvt. Ltd.</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups for printing')
      return
    }

    printWindow.document.write(printHTML)
    printWindow.document.close()
  }, [filteredData, selectedEmployee, selectedDepartment, getSelectedEmployeeName]) // Added getSelectedEmployeeName

  // =====================================================
  // USE EFFECTS
  // =====================================================

  useEffect(() => {
    fetchEmployees()
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setFromDate(firstDay.toISOString().split('T')[0])
    setToDate(lastDay.toISOString().split('T')[0])
  }, [fetchEmployees])

  useEffect(() => {
    if (employees.length > 0 && fromDate && toDate) {
      generateAttendanceSheet()
    }
  }, [employees, fromDate, toDate, selectedDepartment, selectedEmployee, generateAttendanceSheet])

  // =====================================================
  // Component Render
  // =====================================================

  const summary = getSummary()

  const filteredEmployees = employeeNames.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                  Employee Attendance Sheet
                </h1>
                <p className="text-sm text-gray-500 tracking-wide mt-1">
                  {selectedEmployee === 'all' 
                    ? 'Generate attendance report for all employees' 
                    : `Generate attendance report for ${getSelectedEmployeeName()}`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={fetchEmployees}
                className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2 tracking-wider"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 tracking-wider"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-[#0071BD] tracking-wide">Total Records</div>
            <div className="text-2xl font-bold text-[#0071BD] tracking-wider">{summary.total}</div>
          </div>
          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-green-600 tracking-wide flex items-center gap-1">
              <UserCheck className="w-4 h-4" /> Present
            </div>
            <div className="text-2xl font-bold text-green-700 tracking-wider">{summary.present}</div>
          </div>
          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-red-600 tracking-wide flex items-center gap-1">
              <UserX className="w-4 h-4" /> Absent
            </div>
            <div className="text-2xl font-bold text-red-700 tracking-wider">{summary.absent}</div>
          </div>
          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-blue-600 tracking-wide flex items-center gap-1">
              <UserMinus className="w-4 h-4" /> Leave
            </div>
            <div className="text-2xl font-bold text-blue-700 tracking-wider">{summary.leave}</div>
          </div>
          <div className="bg-white shadow-sm p-4">
            <div className="text-sm text-yellow-600 tracking-wide flex items-center gap-1">
              <UserPlus className="w-4 h-4" /> Half Day
            </div>
            <div className="text-2xl font-bold text-yellow-700 tracking-wider">{summary.halfDay}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm p-4 mb-6">
          <button
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="flex items-center gap-2 text-gray-700 hover:text-[#0071BD] transition tracking-wider"
          >
            <Filter className="w-4 h-4" />
            {expandedFilters ? 'Hide Filters' : 'Show Filters'}
            {expandedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                  Select Employee
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                  >
                    <option value="all">All Employees</option>
                    {employeeNames.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Employee Selection Quick View */}
        <div className="bg-white shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[#0071BD]" />
              <span className="font-medium text-gray-700 tracking-wide">
                {selectedEmployee === 'all' 
                  ? `Showing all ${employees.length} employees` 
                  : `Selected: ${getSelectedEmployeeName()}`
                }
              </span>
              {selectedEmployee !== 'all' && (
                <button
                  onClick={() => setSelectedEmployee('all')}
                  className="text-sm text-[#0071BD] hover:underline tracking-wide"
                >
                  Clear Selection
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500 tracking-wide">
              {filteredData.length} records found
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-12 h-12 text-gray-300" />
                        <p className="tracking-wide">No attendance data found for the selected period</p>
                        <p className="text-sm text-gray-400">Try adjusting your date range or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-500 tracking-wide">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 tracking-wide">{record.employeeId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 tracking-wide">{record.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.designation}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.day}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.checkIn}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.checkOut}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.totalHours}</td>
                      <td className="px-4 py-3 text-sm">
                        {record.checkInLocation !== '-' && record.checkOutLocation !== '-' ? (
                          <div className="space-y-1">
                            <LocationDisplay location={record.checkInLocation} label="In" />
                            <LocationDisplay location={record.checkOutLocation} label="Out" />
                          </div>
                        ) : record.checkInLocation !== '-' ? (
                          <LocationDisplay location={record.checkInLocation} label="In" />
                        ) : record.checkOutLocation !== '-' ? (
                          <LocationDisplay location={record.checkOutLocation} label="Out" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium tracking-wide ${
                          record.status === 'Present' ? 'bg-green-100 text-green-700' :
                          record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                          record.status === 'Leave' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.leaveType || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{record.leaveReason || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        {filteredData.length > 0 && (
          <div className="mt-6 bg-white shadow-sm p-4">
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 tracking-wide">
              <div>
                Showing {filteredData.length} records
                {selectedEmployee !== 'all' && ` for ${getSelectedEmployeeName()}`}
              </div>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500"></span>
                  Present: {summary.present}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500"></span>
                  Absent: {summary.absent}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500"></span>
                  Leave: {summary.leave}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500"></span>
                  Half Day: {summary.halfDay}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-[#0071BD]" />
              <span className="font-medium">Total Employees</span>
            </div>
            <div className="text-2xl font-bold text-[#0071BD] mt-1">{employees.length}</div>
          </div>
          <div className="bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-[#0071BD]" />
              <span className="font-medium">Date Range</span>
            </div>
            <div className="text-sm font-medium text-gray-700 mt-1">
              {formatDate(fromDate)} - {formatDate(toDate)}
            </div>
          </div>
          <div className="bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="w-4 h-4 text-[#0071BD]" />
              <span className="font-medium">Departments</span>
            </div>
            <div className="text-sm font-medium text-gray-700 mt-1">
              {departments.length} departments
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </ProtectedRoute>
    </>
  )
}