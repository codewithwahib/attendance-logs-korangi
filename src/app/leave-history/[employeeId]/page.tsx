// src/app/leave-history/[employeeId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import Link from 'next/link';
import Footer from '@/app/components/footer';
import ProtectedEmployeeRoute from '@/components/ProtectedEmployeeRoute';
import NavbarDropdown from '@/app/Navbar/page';
import {
  Calendar,
  Users,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Loader,
  FileText,
  UserCheck,
  UserX,
  UserMinus,
  UserPlus,
  ArrowLeft,
  Download,
  RefreshCw,
  Eye,
  Briefcase,
  Home,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Clock3,
  UserCircle,
  ListChecks,
  ClipboardCheck,
  FileCheck,
  FileX,
  ClockAlert,
  CalendarClock
} from 'lucide-react';

// Import Roboto font
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

// Define types for leave data
interface LeaveRecord {
  _key?: string;
  employeeName?: string;
  employeeId?: string;
  department?: string;
  position?: string;
  leaveType?: string;
  fromDate?: string;
  toDate?: string;
  totalDays?: number;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedOn?: string;
}

interface Employee {
  _id: string;
  personalDetails: {
    employeeId: string;
    fullName: string;
    fatherName?: string;
    cnic?: string;
    phoneNumber?: string;
    emergencyContact?: string;
    dob?: string;
    maritalStatus?: string;
    address?: string;
    joiningDate?: string;
    department?: string;
    position?: string;
    cv?: {
      asset: {
        _ref: string;
        _type: string;
      };
    };
  };
  qualifications?: Array<{
    educationType?: string;
    institute?: string;
    year?: number;
    grade?: string;
  }>;
  experience?: Array<{
    companyName?: string;
    experience?: number;
    position?: string;
    startDate?: string;
    endDate?: string;
    responsibilities?: string;
  }>;
  leaves?: LeaveRecord[];
  checkIn?: Array<{
    time: string;
    location: string;
  }>;
  checkOut?: Array<{
    time: string;
    location: string;
  }>;
}

export default function LeaveHistoryPage() {
  const params = useParams();
  const employeeId = params.employeeId as string;
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('all');
  const [leaveTypes, setLeaveTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'all' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear'>('all');

  useEffect(() => {
    async function fetchEmployeeData() {
      if (!employeeId) return;

      try {
        setLoading(true);
        setError(null);

        // Query to fetch employee with their leaves
        const query = `*[_type == "employee" && personalDetails.employeeId == $employeeId][0]{
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
            cv
          },
          qualifications,
          experience,
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
        }`;

        const data = await client.fetch(query, { employeeId });

        if (data) {
          setEmployee(data);
          // Sort leaves by appliedOn date (newest first)
          const sortedLeaves = (data.leaves || []).sort((a: LeaveRecord, b: LeaveRecord) => {
            return new Date(b.appliedOn || '').getTime() - new Date(a.appliedOn || '').getTime();
          });
          setLeaves(sortedLeaves);
          
          // Extract unique leave types for filter
          const types = [...new Set(
  sortedLeaves
    .map((l: LeaveRecord) => l.leaveType)
    .filter((type: string | undefined | null): type is string => Boolean(type))
)] as string[];
          setLeaveTypes(types);
        } else {
          setError('Employee not found');
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to load employee leave history');
      } finally {
        setLoading(false);
      }
    }

    fetchEmployeeData();
  }, [employeeId]);

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format datetime
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Helper function to get leave type icon
  const getLeaveTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'annual leave':
        return <Calendar className="w-4 h-4" />;
      case 'sick leave':
        return <UserX className="w-4 h-4" />;
      case 'casual leave':
        return <UserMinus className="w-4 h-4" />;
      case 'emergency leave':
        return <AlertCircle className="w-4 h-4" />;
      case 'maternity leave':
        return <UserPlus className="w-4 h-4" />;
      case 'paternity leave':
        return <UserPlus className="w-4 h-4" />;
      default:
        return <CalendarDays className="w-4 h-4" />;
    }
  };

  // Apply filters
  const getFilteredLeaves = () => {
    let filtered = [...leaves];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(leave => leave.status === filterStatus);
    }

    // Filter by leave type
    if (selectedLeaveType !== 'all') {
      filtered = filtered.filter(leave => leave.leaveType === selectedLeaveType);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(leave => 
        leave.leaveType?.toLowerCase().includes(term) ||
        leave.reason?.toLowerCase().includes(term) ||
        leave.status?.toLowerCase().includes(term)
      );
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          filtered = filtered.filter(leave => {
            const from = new Date(leave.fromDate || '');
            return from >= startDate && from <= lastMonthEnd;
          });
          return filtered;
        case 'last3Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      filtered = filtered.filter(leave => {
        const from = new Date(leave.fromDate || '');
        return from >= startDate;
      });
    }

    return filtered;
  };

  const filteredLeaves = getFilteredLeaves();

  // Calculate summary statistics
  const getSummary = () => {
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;
    const cancelled = leaves.filter(l => l.status === 'cancelled').length;
    const totalDays = leaves.reduce((sum, l) => sum + (l.totalDays || 0), 0);

    return { total, pending, approved, rejected, cancelled, totalDays };
  };

  const summary = getSummary();

  if (loading) {
    return (
      <>
        <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-[#0071BD] mx-auto mb-4" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
          <div className="text-center bg-white shadow-sm p-8 max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wider">Error</h3>
            <p className="text-gray-600 mb-4 tracking-wide">{error}</p>
            <Link
              href="/employees"
              className="inline-flex items-center px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
                    Leave History
                  </h1>
                  
                </div>
              </div>
              
              <div className="flex gap-3">
                <Link
                  href={`/employee/${employeeId}`}
                  className="px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center gap-2 tracking-wider"
                >
                  <Eye className="w-4 h-4" />
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Employee Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserCircle className="w-4 h-4 text-[#0071BD]" />
                <span className="font-medium">Employee</span>
              </div>
              <div className="text-lg font-semibold text-gray-800 mt-1 tracking-wide">
                {employee?.personalDetails?.fullName}
              </div>
              <div className="text-sm text-gray-500">ID: {employee?.personalDetails?.employeeId}</div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="w-4 h-4 text-[#0071BD]" />
                <span className="font-medium">Department</span>
              </div>
              <div className="text-lg font-semibold text-gray-800 mt-1 tracking-wide">
                {employee?.personalDetails?.department || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">{employee?.personalDetails?.position || 'N/A'}</div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarClock className="w-4 h-4 text-[#0071BD]" />
                <span className="font-medium">Total Leaves</span>
              </div>
              <div className="text-lg font-semibold text-gray-800 mt-1 tracking-wide">
                {summary.total} Leaves
              </div>
              <div className="text-sm text-gray-500">{summary.totalDays} Total Days</div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-[#0071BD]" />
                <span className="font-medium">Contact</span>
              </div>
              <div className="text-lg font-semibold text-gray-800 mt-1 tracking-wide">
                {employee?.personalDetails?.phoneNumber || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">{employee?.personalDetails?.cnic || 'N/A'}</div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white shadow-sm p-4">
              <div className="text-sm text-[#0071BD] tracking-wide">Total Leaves</div>
              <div className="text-2xl font-bold text-[#0071BD] tracking-wider">{summary.total}</div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className="text-sm text-yellow-600 tracking-wide flex items-center gap-1">
                <Clock className="w-4 h-4" /> Pending
              </div>
              <div className="text-2xl font-bold text-yellow-700 tracking-wider">{summary.pending}</div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className="text-sm text-green-600 tracking-wide flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Approved
              </div>
              <div className="text-2xl font-bold text-green-700 tracking-wider">{summary.approved}</div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className="text-sm text-red-600 tracking-wide flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Rejected
              </div>
              <div className="text-2xl font-bold text-red-700 tracking-wider">{summary.rejected}</div>
            </div>
            <div className="bg-white shadow-sm p-4">
              <div className="text-sm text-gray-600 tracking-wide flex items-center gap-1">
                <FileX className="w-4 h-4" /> Cancelled
              </div>
              <div className="text-2xl font-bold text-gray-700 tracking-wider">{summary.cancelled}</div>
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
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                    Leave Type
                  </label>
                  <select
                    value={selectedLeaveType}
                    onChange={(e) => setSelectedLeaveType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                  >
                    <option value="all">All Types</option>
                    {leaveTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm tracking-wide"
                  >
                    <option value="all">All Time</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="last3Months">Last 3 Months</option>
                    <option value="thisYear">This Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 tracking-wide mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search leaves..."
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ListChecks className="w-5 h-5 text-[#0071BD]" />
                <span className="font-medium text-gray-700 tracking-wide">
                  {filteredLeaves.length} leave records found
                </span>
                {filterStatus !== 'all' && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    Filtered by: {filterStatus}
                  </span>
                )}
                {selectedLeaveType !== 'all' && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {selectedLeaveType}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 tracking-wide">
                Showing {filteredLeaves.length} of {leaves.length} total
              </div>
            </div>
          </div>

          {/* Leave Table */}
          <div className="bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-12 h-12 text-gray-300" />
                          <p className="tracking-wide">No leave records found</p>
                          <p className="text-sm text-gray-400">Try adjusting your filters or search terms</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((leave, index) => (
                      <tr key={leave._key || index} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-500 tracking-wide">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getLeaveTypeIcon(leave.leaveType)}
                            <span className="text-sm font-medium text-gray-800 tracking-wide">
                              {leave.leaveType || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{formatDate(leave.fromDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 tracking-wide">{formatDate(leave.toDate)}</td>
                        <td className="px-4 py-3 text-sm text-center font-medium text-gray-800 tracking-wide">
                          {leave.totalDays || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>
                            {leave.reason || 'No reason provided'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium tracking-wide rounded-full ${getStatusColor(leave.status)}`}>
                            {getStatusIcon(leave.status)}
                            {leave.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 tracking-wide">
                          {formatDateTime(leave.appliedOn)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          {filteredLeaves.length > 0 && (
            <div className="mt-6 bg-white shadow-sm p-4">
              <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 tracking-wide">
                <div>
                  Showing {filteredLeaves.length} records
                  {employee?.personalDetails?.fullName && ` for ${employee.personalDetails.fullName}`}
                </div>
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-yellow-500" />
                    Pending: {summary.pending}
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Approved: {summary.approved}
                  </span>
                  <span className="flex items-center gap-2">
                    <XCircle className="w-3 h-3 text-red-500" />
                    Rejected: {summary.rejected}
                  </span>
                  <span className="flex items-center gap-2">
                    <FileX className="w-3 h-3 text-gray-500" />
                    Cancelled: {summary.cancelled}
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
  );
}