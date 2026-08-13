// app/hr/employees/page.tsx
'use client'

import { useState, useEffect } from 'react'
import NavbarDropdown from '@/app/components/navbar/page'
import Footer from '@/app/components/footer'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { client } from '@/sanity/lib/client'
import {
  Search,
  User,
  Phone,
  Building,
  Briefcase,
  Calendar,
  MapPin,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Users,
  IdCard,
  FileText,
  Heart,
  GraduationCap,
  Clock,
  UserPlus,
  Filter,
  X,
  Save,
  UserCheck,
  UserX,
  File,
  Download,
  ExternalLink
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
    fatherName: string
    cnic: string
    phoneNumber: string
    emergencyContact: string
    dob: string
    maritalStatus: string
    address: string
    joiningDate: string
    department: string
    position: string
    cv?: {
      asset: {
        _ref: string
        url?: string
      }
      description?: string
    }
  }
  qualifications: Array<{
    educationType: string
    institute: string
    year: number
    grade: string
  }>
  experience: Array<{
    companyName: string
    position: string
    startDate: string
    endDate: string
    responsibilities: string
  }>
  checkIn?: Array<{ time: string; location: string }>
  checkOut?: Array<{ time: string; location: string }>
  username: string
  password: string
  _createdAt: string
  _updatedAt: string
}

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [cvLoading, setCvLoading] = useState(false)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [showCvModal, setShowCvModal] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError('')
      
      const query = `*[_type == "employee"] | order(_createdAt desc) {
        _id,
        personalDetails {
          employeeId,
          fullName,
          fatherName,
          cnic,
          phoneNumber,
          emergencyContact,
          dob,
          maritalStatus,
          address,
          joiningDate,
          department,
          position,
          cv {
            asset-> {
              _ref,
              url
            },
            description
          }
        },
        qualifications,
        experience,
        checkIn,
        checkOut,
        username,
        password,
        _createdAt,
        _updatedAt
      }`
      
      const result = await client.fetch(query)
      console.log('Fetched employees:', result)
      
      setEmployees(result)
      setFilteredEmployees(result)
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError('Failed to load employees. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get unique departments for filter
  const departments = ['all', ...new Set(employees.map(emp => emp.personalDetails?.department).filter(Boolean))]

  // Filter and search
  useEffect(() => {
    let filtered = employees
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(emp => 
        emp.personalDetails?.fullName?.toLowerCase().includes(term) ||
        emp.personalDetails?.employeeId?.toLowerCase().includes(term) ||
        emp.personalDetails?.department?.toLowerCase().includes(term) ||
        emp.personalDetails?.position?.toLowerCase().includes(term) ||
        emp.personalDetails?.phoneNumber?.includes(term) ||
        emp.personalDetails?.cnic?.includes(term)
      )
    }
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => 
        emp.personalDetails?.department === selectedDepartment
      )
    }
    
    setFilteredEmployees(filtered)
    setCurrentPage(1)
  }, [searchTerm, selectedDepartment, employees])

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex)

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const getTodayStatus = (employee: Employee) => {
    const today = new Date().toISOString().split('T')[0]
    const hasCheckIn = employee.checkIn?.some(check => 
      new Date(check.time).toISOString().split('T')[0] === today
    )
    const hasCheckOut = employee.checkOut?.some(check => 
      new Date(check.time).toISOString().split('T')[0] === today
    )
    
    if (hasCheckIn && hasCheckOut) return 'Completed'
    if (hasCheckIn) return 'Checked In'
    return 'Absent'
  }

  const getTodayStatusColor = (employee: Employee) => {
    const status = getTodayStatus(employee)
    switch(status) {
      case 'Completed': return 'text-green-600 bg-green-50'
      case 'Checked In': return 'text-blue-600 bg-blue-50'
      case 'Absent': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDetailsModal(true)
  }

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee)
    setShowEditModal(true)
  }

  const handleEditChange = (field: string, value: string) => {
    if (!editingEmployee) return
    setEditingEmployee({
      ...editingEmployee,
      personalDetails: {
        ...editingEmployee.personalDetails,
        [field]: value
      }
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmployee) return

    try {
      setEditLoading(true)
      setError('')
      setSuccess('')

      const response = await fetch(`/api/hr/employees/${editingEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalDetails: editingEmployee.personalDetails
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update employee')
      }

      setSuccess('Employee updated successfully!')
      await fetchEmployees()
      setShowEditModal(false)
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error updating employee:', err)
      setError(err instanceof Error ? err.message : 'Failed to update employee')
      setTimeout(() => setError(''), 3000)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return
    }

    try {
      setDeleteLoading(true)
      setError('')
      setSuccess('')

      const response = await fetch(`/api/hr/employees/${employeeId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete employee')
      }

      setSuccess('Employee deleted successfully!')
      await fetchEmployees()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error deleting employee:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete employee')
      setTimeout(() => setError(''), 3000)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleViewCV = async (employee: Employee) => {
    try {
      setCvLoading(true)
      const cvRef = employee.personalDetails?.cv?.asset?._ref
      
      if (!cvRef) {
        alert('No CV uploaded for this employee')
        return
      }

      // Get the file URL from Sanity
      const url = await client.fetch(`*[_id == "${cvRef}"][0].url`)
      
      if (url) {
        // Open PDF in new tab
        window.open(url, '_blank')
      } else {
        alert('CV file not found')
      }
    } catch (err) {
      console.error('Error fetching CV:', err)
      alert('Failed to open CV. Please try again.')
    } finally {
      setCvLoading(false)
    }
  }

  const handleDownloadCV = async (employee: Employee) => {
    try {
      setCvLoading(true)
      const cvRef = employee.personalDetails?.cv?.asset?._ref
      
      if (!cvRef) {
        alert('No CV uploaded for this employee')
        return
      }

      // Get the file URL from Sanity
      const url = await client.fetch(`*[_id == "${cvRef}"][0].url`)
      
      if (url) {
        // Download the file
        const link = document.createElement('a')
        link.href = url
        link.download = `${employee.personalDetails?.fullName || 'employee'}_CV.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert('CV file not found')
      }
    } catch (err) {
      console.error('Error downloading CV:', err)
      alert('Failed to download CV. Please try again.')
    } finally {
      setCvLoading(false)
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

  return (
    <>
    <ProtectedRoute allowedUser='hr'>
      <NavbarDropdown />
      <div className={`min-h-screen bg-gray-50 p-6 ${roboto.className}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className={`text-3xl font-bold text-[#0071BD] ${roboto.className} tracking-wider`}>
                    Employee Management
                  </h1>
                  <p className={`text-sm text-gray-500 ${roboto.className} tracking-wide mt-1`}>
                    Manage all employees and their details
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchEmployees}
                  className={`px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2 ${roboto.className} tracking-wider`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={() => router.push('/hr/add-employee')}
                  className={`px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center gap-2 ${roboto.className} tracking-wider`}
                >
                  <UserPlus className="w-4 h-4" />
                  Add Employee
                </button>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 flex items-start gap-3 bg-green-50 border border-green-200 rounded">
              <UserCheck className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm text-green-700 ${roboto.className} tracking-wide`}>{success}</p>
              </div>
              <button onClick={() => setSuccess('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm text-red-700 ${roboto.className} tracking-wide`}>{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, department, position, phone, or CNIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className={`px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm min-w-[150px] ${roboto.className} tracking-wide`}
                >
                  <option value="all">All Departments</option>
                  {departments.filter(d => d !== 'all').map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow-sm p-4">
              <div className={`text-sm text-gray-500 ${roboto.className} tracking-wide`}>Total Employees</div>
              <div className={`text-2xl font-bold text-[#0071BD] ${roboto.className} tracking-wider`}>{employees.length}</div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className={`text-sm text-gray-500 ${roboto.className} tracking-wide`}>Present Today</div>
              <div className={`text-2xl font-bold text-green-600 ${roboto.className} tracking-wider`}>
                {employees.filter(emp => {
                  const today = new Date().toISOString().split('T')[0]
                  return emp.checkIn?.some(check => 
                    new Date(check.time).toISOString().split('T')[0] === today
                  )
                }).length}
              </div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className={`text-sm text-gray-500 ${roboto.className} tracking-wide`}>Absent Today</div>
              <div className={`text-2xl font-bold text-red-600 ${roboto.className} tracking-wider`}>
                {employees.filter(emp => {
                  const today = new Date().toISOString().split('T')[0]
                  return !emp.checkIn?.some(check => 
                    new Date(check.time).toISOString().split('T')[0] === today
                  )
                }).length}
              </div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className={`text-sm text-gray-500 ${roboto.className} tracking-wide`}>Departments</div>
              <div className={`text-2xl font-bold text-blue-600 ${roboto.className} tracking-wider`}>
                {new Set(employees.map(emp => emp.personalDetails?.department).filter(Boolean)).size}
              </div>
            </div>
          </div>

          {/* Employees Table */}
          {filteredEmployees.length === 0 ? (
            <div className="bg-white shadow-sm p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className={`text-gray-500 ${roboto.className} tracking-wide`}>No employees found</p>
            </div>
          ) : (
            <div className="bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${roboto.className} tracking-wider`}>Employee</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${roboto.className} tracking-wider`}>ID</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${roboto.className} tracking-wider`}>Department</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${roboto.className} tracking-wider`}>Position</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${roboto.className} tracking-wider`}>Contact</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${roboto.className} tracking-wider`}>CV</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${roboto.className} tracking-wider`}>Status</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${roboto.className} tracking-wider`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentEmployees.map((employee) => (
                      <tr key={employee._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#0071BD]/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-[#0071BD]" />
                            </div>
                            <div>
                              <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>
                                {employee.personalDetails?.fullName || 'N/A'}
                              </p>
                              <p className={`text-xs text-gray-400 ${roboto.className} tracking-wide`}>
                                Joined: {formatDate(employee.personalDetails?.joiningDate)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm text-gray-600 ${roboto.className} tracking-wide`}>
                            {employee.personalDetails?.employeeId || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded ${roboto.className} tracking-wide`}>
                            {employee.personalDetails?.department || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm text-gray-600 ${roboto.className} tracking-wide`}>
                            {employee.personalDetails?.position || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-sm text-gray-600 ${roboto.className} tracking-wide flex items-center gap-1`}>
                              <Phone className="w-3 h-3" />
                              {employee.personalDetails?.phoneNumber || 'N/A'}
                            </span>
                            <span className={`text-xs text-gray-400 ${roboto.className} tracking-wide flex items-center gap-1`}>
                              <FileText className="w-3 h-3" />
                              {employee.personalDetails?.cnic || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {employee.personalDetails?.cv?.asset?._ref ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewCV(employee)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="View CV"
                                disabled={cvLoading}
                              >
                                {cvLoading ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDownloadCV(employee)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                                title="Download CV"
                                disabled={cvLoading}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className={`text-xs text-gray-400 ${roboto.className} tracking-wide`}>No CV</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${roboto.className} tracking-wide ${getTodayStatusColor(employee)}`}>
                            {getTodayStatus(employee)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(employee)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(employee)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee._id)}
                              disabled={deleteLoading}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                              title="Delete"
                            >
                              {deleteLoading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <div className={`text-sm text-gray-500 ${roboto.className} tracking-wide`}>
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className={`px-4 py-2 text-sm text-gray-700 ${roboto.className} tracking-wide`}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-lg">
              <h2 className={`text-xl font-bold text-gray-800 ${roboto.className} tracking-wider`}>
                Employee Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Details */}
              <div>
                <h3 className={`text-lg font-semibold text-gray-800 ${roboto.className} tracking-wider mb-4 flex items-center gap-2`}>
                  <User className="w-5 h-5 text-[#0071BD]" />
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Employee ID</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{selectedEmployee.personalDetails?.employeeId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Full Name</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{selectedEmployee.personalDetails?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Father Name</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{selectedEmployee.personalDetails?.fatherName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>CNIC Number</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{selectedEmployee.personalDetails?.cnic || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Phone Number</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{selectedEmployee.personalDetails?.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Emergency Contact</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{selectedEmployee.personalDetails?.emergencyContact || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Date of Birth</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{formatDate(selectedEmployee.personalDetails?.dob)}</p>
                  </div>
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Marital Status</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{selectedEmployee.personalDetails?.maritalStatus || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Residential Address</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{selectedEmployee.personalDetails?.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Joining Date</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{formatDate(selectedEmployee.personalDetails?.joiningDate)}</p>
                  </div>
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Department</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{selectedEmployee.personalDetails?.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Position</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{selectedEmployee.personalDetails?.position || 'N/A'}</p>
                  </div>
                  {/* CV Section in Details Modal */}
                  <div className="md:col-span-2">
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>CV / Resume</p>
                    {selectedEmployee.personalDetails?.cv?.asset?._ref ? (
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          onClick={() => handleViewCV(selectedEmployee)}
                          className={`px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 text-sm rounded ${roboto.className} tracking-wide`}
                        >
                          <Eye className="w-4 h-4" />
                          View CV
                        </button>
                        <button
                          onClick={() => handleDownloadCV(selectedEmployee)}
                          className={`px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 text-sm rounded ${roboto.className} tracking-wide`}
                        >
                          <Download className="w-4 h-4" />
                          Download CV
                        </button>
                        {selectedEmployee.personalDetails?.cv?.description && (
                          <span className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>
                            {selectedEmployee.personalDetails.cv.description}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className={`text-sm text-gray-400 mt-1 ${roboto.className} tracking-wide`}>No CV uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              {selectedEmployee.qualifications && selectedEmployee.qualifications.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold text-gray-800 ${roboto.className} tracking-wider mb-4 flex items-center gap-2`}>
                    <GraduationCap className="w-5 h-5 text-[#0071BD]" />
                    Qualifications
                  </h3>
                  <div className="space-y-3">
                    {selectedEmployee.qualifications.map((qual, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded">
                        <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{qual.educationType}</p>
                        <p className={`text-sm text-gray-600 ${roboto.className} tracking-wide`}>{qual.institute}</p>
                        <p className={`text-sm text-gray-500 ${roboto.className} tracking-wide`}>
                          {qual.year} {qual.grade ? `• ${qual.grade}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedEmployee.experience && selectedEmployee.experience.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold text-gray-800 ${roboto.className} tracking-wider mb-4 flex items-center gap-2`}>
                    <Briefcase className="w-5 h-5 text-[#0071BD]" />
                    Experience
                  </h3>
                  <div className="space-y-3">
                    {selectedEmployee.experience.map((exp, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded">
                        <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{exp.position}</p>
                        <p className={`text-sm text-gray-600 ${roboto.className} tracking-wide`}>{exp.companyName}</p>
                        <p className={`text-sm text-gray-500 ${roboto.className} tracking-wide`}>
                          {exp.startDate && exp.endDate 
                            ? `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`
                            : 'Date not specified'}
                        </p>
                        {exp.responsibilities && (
                          <p className={`text-sm text-gray-600 mt-1 ${roboto.className} tracking-wide`}>{exp.responsibilities}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Info */}
              <div>
                <h3 className={`text-lg font-semibold text-gray-800 ${roboto.className} tracking-wider mb-4 flex items-center gap-2`}>
                  <Clock className="w-5 h-5 text-[#0071BD]" />
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Created At</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{formatDateTime(selectedEmployee._createdAt)}</p>
                  </div>
                  <div>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>Last Updated</p>
                    <p className={`font-medium text-gray-800 ${roboto.className} tracking-wide`}>{formatDateTime(selectedEmployee._updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-lg">
              <h2 className={`text-xl font-bold text-gray-800 ${roboto.className} tracking-wider`}>
                Edit Employee
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={editingEmployee.personalDetails?.employeeId || ''}
                      onChange={(e) => handleEditChange('employeeId', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editingEmployee.personalDetails?.fullName || ''}
                      onChange={(e) => handleEditChange('fullName', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      Father Name
                    </label>
                    <input
                      type="text"
                      value={editingEmployee.personalDetails?.fatherName || ''}
                      onChange={(e) => handleEditChange('fatherName', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      CNIC Number
                    </label>
                    <input
                      type="text"
                      value={editingEmployee.personalDetails?.cnic || ''}
                      onChange={(e) => handleEditChange('cnic', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editingEmployee.personalDetails?.phoneNumber || ''}
                      onChange={(e) => handleEditChange('phoneNumber', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={editingEmployee.personalDetails?.emergencyContact || ''}
                      onChange={(e) => handleEditChange('emergencyContact', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editingEmployee.personalDetails?.dob || ''}
                      onChange={(e) => handleEditChange('dob', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      Marital Status
                    </label>
                    <select
                      value={editingEmployee.personalDetails?.maritalStatus || ''}
                      onChange={(e) => handleEditChange('maritalStatus', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                    >
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      Residential Address
                    </label>
                    <textarea
                      value={editingEmployee.personalDetails?.address || ''}
                      onChange={(e) => handleEditChange('address', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      Joining Date
                    </label>
                    <input
                      type="date"
                      value={editingEmployee.personalDetails?.joiningDate || ''}
                      onChange={(e) => handleEditChange('joiningDate', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      Department
                    </label>
                    <select
                      value={editingEmployee.personalDetails?.department || ''}
                      onChange={(e) => handleEditChange('department', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                    >
                      <option value="">Select</option>
                      <option value="HR">HR</option>
                      <option value="IT">IT</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Operations">Operations</option>
                      <option value="Engineering">Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${roboto.className} tracking-wide mb-1`}>
                      Position
                    </label>
                    <input
                      type="text"
                      value={editingEmployee.personalDetails?.position || ''}
                      onChange={(e) => handleEditChange('position', e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm ${roboto.className} tracking-wide`}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={`px-6 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition ${roboto.className} tracking-wider`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className={`px-6 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center gap-2 ${roboto.className} tracking-wider disabled:opacity-50`}
                >
                  {editLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      </ProtectedRoute>
    </>
  )
}