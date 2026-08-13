// src/components/NavbarDropdown.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import ProtectedEmployeeRoute from '@/components/ProtectedEmployeeRoute'
import { client } from '@/sanity/lib/client'
import {
  LayoutDashboard,
  CalendarClock,
  CalendarDays,
  Wallet,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  LogIn,
  LogOut as LogOutIcon,
  RefreshCw,
  ChevronDown,
  ClipboardCheck,
  History,
  FileText,
  ListChecks,
} from 'lucide-react'

// Import Roboto font
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  children?: NavItem[]
}

interface Notification {
  id: string
  type: 'checkin' | 'checkout' | 'leave_new' | 'leave_approved' | 'leave_rejected' | 'leave_cancelled'
  title: string
  message: string
  time: string
  read: boolean
  status?: string
  employeeName: string
  employeeId: string
  leaveType?: string
  location?: string
  action: 'new' | 'status_change'
}

interface LeaveRequest {
  _key: string
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
}

interface Employee {
  _id: string
  personalDetails: {
    fullName: string
    employeeId: string
    department: string
    position: string
  }
  username: string
  password: string
  checkIn?: Array<{ time: string; location: string }>
  checkOut?: Array<{ time: string; location: string }>
  leaves?: LeaveRequest[]
}

export default function NavbarDropdown() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [employeeId, setEmployeeId] = useState<string>('')
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const attendanceRef = useRef<HTMLDivElement>(null)
  const leavesRef = useRef<HTMLDivElement>(null)

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Get employeeId from localStorage or URL
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId')
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId)
    } else {
      const pathParts = pathname?.split('/') || []
      const idIndex = pathParts.findIndex(part => part === 'dashboard' || part === 'attendance' || part === 'leaves' || part === 'settings')
      if (idIndex !== -1 && pathParts[idIndex + 1]) {
        setEmployeeId(pathParts[idIndex + 1])
        localStorage.setItem('employeeId', pathParts[idIndex + 1])
      }
    }
  }, [pathname])

  // Fetch current employee data
  useEffect(() => {
    const fetchCurrentEmployee = async () => {
      try {
        if (!employeeId) return
        
        const query = `
          *[_type == "employee" && personalDetails.employeeId == $employeeId][0] {
            _id,
            personalDetails {
              fullName,
              employeeId,
              department,
              position
            },
            username,
            password
          }
        `
        const data = await client.fetch(query, { employeeId })
        if (data) {
          setCurrentEmployee(data)
        }
      } catch (error) {
        console.error('Error fetching employee data:', error)
      }
    }
    fetchCurrentEmployee()
  }, [employeeId])

  const navigation: NavItem[] = [
    {
      name: 'DASHBOARD',
      href: employeeId ? `/dashboard/${employeeId}` : '/hr/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      name: 'ATTENDANCE',
      href: '#',
      icon: <CalendarClock className="w-5 h-5" />,
      children: [
        {
          name: 'Mark Attendance',
          href: employeeId ? `/attendance/${employeeId}` : '/hr/attendance',
          icon: <ClipboardCheck className="w-4 h-4" />
        },
        {
          name: 'Attendance History',
          href: employeeId ? `/attendance-history/${employeeId}` : '/hr/attendance-history',
          icon: <History className="w-4 h-4" />
        }
      ]
    },
    {
      name: 'LEAVES',
      href: '#',
      icon: <CalendarDays className="w-5 h-5" />,
      children: [
        {
          name: 'Apply Leave',
          href: employeeId ? `/leaves/${employeeId}` : '/hr/leaves',
          icon: <FileText className="w-4 h-4" />
        },
        {
          name: 'Leave History',
          href: employeeId ? `/leave-history/${employeeId}` : '/hr/leave-history',
          icon: <ListChecks className="w-4 h-4" />
        }
      ]
    },
    {
      name: 'PAYROLL',
      href: employeeId ? `/` : '/',
      icon: <Wallet className="w-5 h-5" />
    },
    {
      name: 'SETTINGS',
      href: employeeId ? `/settings/${employeeId}` : '/hr/settings',
      icon: <Settings className="w-5 h-5" />
    }
  ]

  const isActive = (href: string) => {
    if (href === '#') return false
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const isChildActive = (children?: NavItem[]) => {
    if (!children) return false
    return children.some(child => isActive(child.href))
  }

  // saveNotifications - useCallback
  const saveNotifications = useCallback((updatedNotifications: Notification[]) => {
    try {
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
      setNotifications(updatedNotifications)
      setUnreadCount(updatedNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error saving notifications:', error)
    }
  }, [])

  // loadNotifications - useCallback
  const loadNotifications = useCallback(() => {
    try {
      const saved = localStorage.getItem('notifications')
      if (saved) {
        const parsed = JSON.parse(saved)
        setNotifications(parsed)
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }, [])

  // fetchNotifications - useCallback with notifications dependency
  const fetchNotifications = useCallback(async () => {
    try {
      const query = `
        *[_type == "employee"] {
          _id,
          personalDetails {
            fullName,
            employeeId,
            department,
            position
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
      
      const data: Employee[] = await client.fetch(query)
      const newNotifications: Notification[] = []
      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

      const existingIds = new Set(notifications.map(n => n.id))

      data.forEach(employee => {
        employee.leaves?.forEach(leave => {
          if (leave.status === 'pending' || leave.status === 'approved' || leave.status === 'rejected') {
            const notifId = `leave_${employee._id}_${leave._key}`
            if (existingIds.has(notifId)) return
            
            let title = ''
            let message = ''
            let type: Notification['type'] = 'leave_new'
            let status = leave.status

            if (leave.status === 'pending') {
              title = `📝 New Leave Request - ${leave.leaveType}`
              message = `${leave.employeeName} (${leave.employeeId}) requested ${leave.leaveType} from ${leave.fromDate} to ${leave.toDate}`
              type = 'leave_new'
            } else if (leave.status === 'approved') {
              title = `✅ Leave Approved - ${leave.leaveType}`
              message = `${leave.employeeName}'s (${leave.employeeId}) leave request was APPROVED`
              type = 'leave_approved'
            } else if (leave.status === 'rejected') {
              title = `❌ Leave Rejected - ${leave.leaveType}`
              message = `${leave.employeeName}'s (${leave.employeeId}) leave request was REJECTED`
              type = 'leave_rejected'
            }

            newNotifications.push({
              id: notifId,
              type: type,
              title: title,
              message: message,
              time: leave.appliedOn || new Date().toISOString(),
              read: false,
              status: status,
              employeeName: leave.employeeName,
              employeeId: leave.employeeId,
              leaveType: leave.leaveType,
              action: 'new'
            })
          }
        })
      })

      data.forEach(employee => {
        employee.checkIn?.forEach(checkIn => {
          const checkInTime = new Date(checkIn.time)
          if (checkInTime > fiveMinutesAgo) {
            const notifId = `checkin_${employee._id}_${checkIn.time}`
            if (existingIds.has(notifId)) return
            
            newNotifications.push({
              id: notifId,
              type: 'checkin',
              title: `✅ Check-In`,
              message: `${employee.personalDetails?.fullName} (${employee.personalDetails?.employeeId}) checked in at ${checkIn.location}`,
              time: checkIn.time,
              read: false,
              employeeName: employee.personalDetails?.fullName || 'Unknown',
              employeeId: employee.personalDetails?.employeeId || 'N/A',
              location: checkIn.location,
              action: 'new'
            })
          }
        })

        employee.checkOut?.forEach(checkOut => {
          const checkOutTime = new Date(checkOut.time)
          if (checkOutTime > fiveMinutesAgo) {
            const notifId = `checkout_${employee._id}_${checkOut.time}`
            if (existingIds.has(notifId)) return
            
            newNotifications.push({
              id: notifId,
              type: 'checkout',
              title: `📤 Check-Out`,
              message: `${employee.personalDetails?.fullName} (${employee.personalDetails?.employeeId}) checked out at ${checkOut.location}`,
              time: checkOut.time,
              read: false,
              employeeName: employee.personalDetails?.fullName || 'Unknown',
              employeeId: employee.personalDetails?.employeeId || 'N/A',
              location: checkOut.location,
              action: 'new'
            })
          }
        })
      })

      if (newNotifications.length > 0) {
        const allNotifications = [...newNotifications, ...notifications]
        allNotifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        const limitedNotifications = allNotifications.slice(0, 100)
        saveNotifications(limitedNotifications)
        
        if (newNotifications.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
          newNotifications.forEach(n => {
            new Notification(n.title, {
              body: n.message,
              icon: '/logo.png'
            })
          })
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [notifications, saveNotifications]) // Added dependencies

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
      // Close attendance dropdown
      const attendanceDropdown = document.getElementById('dropdown-ATTENDANCE')
      if (attendanceDropdown && attendanceRef.current && !attendanceRef.current.contains(event.target as Node)) {
        attendanceDropdown.style.display = 'none'
      }
      // Close leaves dropdown
      const leavesDropdown = document.getElementById('dropdown-LEAVES')
      if (leavesDropdown && leavesRef.current && !leavesRef.current.contains(event.target as Node)) {
        leavesDropdown.style.display = 'none'
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Main useEffect with all dependencies
  useEffect(() => {
    loadNotifications()
    fetchNotifications()
    
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [loadNotifications, fetchNotifications]) // Added both dependencies

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await fetchNotifications()
    setIsRefreshing(false)
  }, [fetchNotifications])

  const markAsRead = useCallback((id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    saveNotifications(updated)
  }, [notifications, saveNotifications])

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    saveNotifications(updated)
  }, [notifications, saveNotifications])

  const deleteNotification = useCallback((id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    saveNotifications(updated)
  }, [notifications, saveNotifications])

  const deleteAllNotifications = useCallback(() => {
    if (window.confirm('Delete all notifications?')) {
      saveNotifications([])
    }
  }, [saveNotifications])

  const getTypeIcon = (type: Notification['type']) => {
    switch(type) {
      case 'checkin':
        return <LogIn className="w-4 h-4 text-green-500" />
      case 'checkout':
        return <LogOutIcon className="w-4 h-4 text-orange-500" />
      case 'leave_new':
        return <CalendarDays className="w-4 h-4 text-blue-500" />
      case 'leave_approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'leave_rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'leave_cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (type: Notification['type']) => {
    switch(type) {
      case 'checkin':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Check-In</span>
      case 'checkout':
        return <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Check-Out</span>
      case 'leave_new':
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">New Leave</span>
      case 'leave_approved':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Approved</span>
      case 'leave_rejected':
        return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Rejected</span>
      case 'leave_cancelled':
        return <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Cancelled</span>
      default:
        return null
    }
  }

  const getActionBadge = (action?: string) => {
    if (action === 'new') {
      return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">New</span>
    }
    if (action === 'status_change') {
      return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Updated</span>
    }
    return null
  }

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return 'Unknown'
    }
  }

  // Get display name and designation from employee data
  const displayName = currentEmployee?.personalDetails?.fullName || 'Employee'
  const displayDesignation = currentEmployee?.personalDetails?.position || 'Employee'

  const toggleDropdown = (dropdownId: string) => {
    const dropdown = document.getElementById(dropdownId)
    if (dropdown) {
      const isOpen = dropdown.style.display === 'block'
      // Close all other dropdowns first
      document.querySelectorAll('.nav-dropdown').forEach(el => {
        (el as HTMLElement).style.display = 'none'
      })
      dropdown.style.display = isOpen ? 'none' : 'block'
    }
  }

  // Updated Logout Handler with Custom Modal
  const handleLogoutClick = () => {
    // Close dropdowns
    setIsProfileDropdownOpen(false)
    setIsMobileMenuOpen(false)
    setIsNotificationOpen(false)
    
    // Show custom logout modal
    setShowLogoutModal(true)
  }

  // Confirm Logout
  const confirmLogout = () => {
    // Close modal
    setShowLogoutModal(false)
    
    // Clear all localStorage items
    localStorage.removeItem('employeeData')
    localStorage.removeItem('employeeLogin')
    localStorage.removeItem('employeeId')
    localStorage.removeItem('notifications')
    localStorage.removeItem('hrms_user')
    localStorage.removeItem('userRole')
    
    // Clear session storage if any
    sessionStorage.clear()
    
    // Redirect to main page (login page)
    router.push('/')
  }

  // Cancel Logout
  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLogoutModal) {
        setShowLogoutModal(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [showLogoutModal])

  return (
    <>
    <ProtectedEmployeeRoute allowedRole='employee'>
            {/* Top Navigation Bar - White Background */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left Section - Logo with Vertical Line */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>

            {/* Logo */}
            <Link href={employeeId ? `/dashboard/${employeeId}` : '/hr/dashboard'} className="flex items-center">
              <div className="relative w-32 h-16 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="A to Zee Switchgear Engineering (SMC) Pvt. Ltd."
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Vertical Line After Logo */}
            <div className="hidden lg:block w-px h-10 bg-gray-300"></div>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden lg:flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.children ? (
                  // Dropdown Menu - Same design as profile dropdown
                  <div 
                    ref={item.name === 'ATTENDANCE' ? attendanceRef : leavesRef}
                    className="relative"
                  >
                    <button
                      onClick={() => toggleDropdown(`dropdown-${item.name}`)}
                      className={`
                        flex flex-col items-center gap-0.5 min-w-[65px] relative py-1
                        ${isChildActive(item.children)
                          ? 'text-blue-700'
                          : 'text-gray-500 hover:text-blue-700'
                        }
                      `}
                    >
                      <span className={`
                        transition-colors duration-200
                        ${isChildActive(item.children)
                          ? 'text-blue-700'
                          : 'text-gray-400 hover:text-blue-700'
                        }
                      `}>
                        {item.icon}
                      </span>
                      <span className={`
                        text-[9px] font-medium tracking-wide transition-colors duration-200 flex items-center gap-0.5
                        ${isChildActive(item.children)
                          ? 'text-blue-700'
                          : 'text-gray-500'
                        }
                      `}>
                        {item.name}
                        <ChevronDown className="w-3 h-3" />
                      </span>
                    </button>

                    {/* Dropdown Menu - Same style as profile dropdown */}
                    <div
                      id={`dropdown-${item.name}`}
                      className="nav-dropdown absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 hidden"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`
                            flex items-center gap-3 px-4 py-2.5 transition
                            ${isActive(child.href)
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-200 hover:text-blue-700'
                            }
                          `}
                          onClick={() => {
                            // Close dropdown after clicking
                            const dropdown = document.getElementById(`dropdown-${item.name}`)
                            if (dropdown) dropdown.style.display = 'none'
                          }}
                        >
                          <span className={isActive(child.href) ? 'text-blue-700' : 'text-gray-400'}>
                            {child.icon}
                          </span>
                          <span className={`text-sm font-medium ${roboto.className} tracking-wide`}>
                            {child.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Regular Link
                  <Link
                    href={item.href}
                    className={`
                      flex flex-col items-center gap-0.5 min-w-[65px] relative py-1
                      ${isActive(item.href)
                        ? 'text-blue-700'
                        : 'text-gray-500 hover:text-blue-700'
                      }
                    `}
                  >
                    <span className={`
                      transition-colors duration-200
                      ${isActive(item.href)
                        ? 'text-blue-700'
                        : 'text-gray-400 hover:text-blue-700'
                      }
                    `}>
                      {item.icon}
                    </span>
                    <span className={`
                      text-[9px] font-medium tracking-wide transition-colors duration-200
                      ${isActive(item.href) ? 'text-blue-700' : 'text-gray-500'}
                    `}>
                      {item.name}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1.5">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-lg hover:bg-gray-200 transition text-gray-500 hover:text-blue-700 relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[70vh] overflow-hidden z-50">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className={`font-semibold text-gray-800 ${roboto.className} tracking-wide`}>Notifications</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`p-1.5 rounded-full hover:bg-gray-200 transition text-gray-400 hover:text-blue-600 ${
                          isRefreshing ? 'animate-spin' : ''
                        }`}
                        title="Refresh notifications"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      
                      {notifications.length > 0 && (
                        <>
                          <button
                            onClick={markAllAsRead}
                            className={`text-xs text-blue-600 hover:text-blue-800 hover:underline ${roboto.className} tracking-wide`}
                          >
                            Mark all read
                          </button>
                          <button
                            onClick={deleteAllNotifications}
                            className={`text-xs text-red-600 hover:text-red-800 hover:underline ${roboto.className} tracking-wide`}
                          >
                            Clear all
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setIsNotificationOpen(false)}
                        className="p-1 hover:bg-gray-200 rounded-lg transition text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-[400px]">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 text-gray-500">
                        <Bell className="w-10 h-10 text-gray-300 mb-2" />
                        <p className={`text-sm ${roboto.className} tracking-wide`}>No notifications</p>
                        <p className={`text-xs text-gray-400 mt-1 ${roboto.className} tracking-wide`}>Check-ins, check-outs, and leave updates appear here</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-200 transition group ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getTypeIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-sm font-medium text-gray-800 truncate ${roboto.className} tracking-wide`}>
                                  {notification.title}
                                </p>
                                <span className={`text-xs text-gray-400 flex-shrink-0 ${roboto.className} tracking-wide`}>
                                  {formatTime(notification.time)}
                                </span>
                              </div>
                              <p className={`text-sm text-gray-600 ${roboto.className} tracking-wide`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {getStatusBadge(notification.type)}
                                {getActionBadge(notification.action)}
                                {!notification.read && (
                                  <span className={`text-xs text-blue-600 ${roboto.className} tracking-wide`}>• New</span>
                                )}
                              </div>
                              {notification.location && (
                                <p className={`text-xs text-gray-400 mt-1 ${roboto.className} tracking-wide`}>
                                  📍 {notification.location}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-600 p-1"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                      <span className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>
                        {unreadCount} unread • {notifications.length} total
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete all notifications?')) {
                            deleteAllNotifications()
                          }
                        }}
                        className={`text-xs text-red-600 hover:text-red-800 transition ${roboto.className} tracking-wide`}
                      >
                        Delete All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Vertical Line */}
            <div className="w-px h-6 bg-gray-300 mx-0.5"></div>

            {/* Profile - Same as before */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="p-2 rounded-lg hover:bg-gray-200 transition text-gray-500 hover:text-blue-700"
                title={displayName}
              >
                <User className="w-5 h-5" />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className={`text-sm font-semibold text-gray-800 ${roboto.className} tracking-wide`}>{displayName}</p>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>{displayDesignation}</p>
                  </div>
                  
                  <Link
                    href={employeeId ? `/dashboard/${employeeId}` : '/hr/dashboard'}
                    className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-200 transition text-sm text-gray-700 hover:text-blue-700 ${roboto.className} tracking-wide`}
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <Link
                    href={employeeId ? `/settings/${employeeId}` : '/hr/settings'}
                    className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-200 transition text-sm text-gray-700 hover:text-blue-700 ${roboto.className} tracking-wide`}
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  
                  <hr className="my-1 border-gray-200" />
                  
                  {/* Updated Logout Button with Custom Modal */}
                  <button
                    onClick={handleLogoutClick}
                    className={`flex items-center gap-3 px-4 py-2 hover:bg-red-100 transition text-sm text-red-600 w-full ${roboto.className} tracking-wide`}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`
        fixed inset-0 z-40 transition-transform duration-300 lg:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        <div className="relative w-64 h-full bg-white shadow-lg overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="relative w-24 h-12">
                <Image
                  src="/logo.png"
                  alt="A to Zee Switchgear Engineering (SMC) Pvt. Ltd."
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <nav className="p-3 flex-1 overflow-y-auto">
            <ul className="space-y-0.5">
              {navigation.map((item) => (
                <li key={item.name}>
                  {item.children ? (
                    // Mobile Dropdown
                    <div>
                      <button
                        onClick={() => {
                          const submenu = document.getElementById(`mobile-submenu-${item.name}`)
                          if (submenu) {
                            const isOpen = submenu.style.display === 'block'
                            // Close all other submenus
                            document.querySelectorAll('.mobile-submenu').forEach(el => {
                              (el as HTMLElement).style.display = 'none'
                            })
                            submenu.style.display = isOpen ? 'none' : 'block'
                          }
                        }}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition
                          ${isChildActive(item.children)
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-200 hover:text-blue-700'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isChildActive(item.children) ? 'text-blue-700' : 'text-gray-400'}>
                            {item.icon}
                          </span>
                          <span className={`flex-1 text-sm font-medium ${roboto.className} tracking-wide`}>
                            {item.name}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      <div
                        id={`mobile-submenu-${item.name}`}
                        className="mobile-submenu ml-8 mt-1 space-y-0.5 hidden"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg transition
                              ${isActive(child.href)
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-200 hover:text-blue-700'
                              }
                            `}
                          >
                            <span className={isActive(child.href) ? 'text-blue-700' : 'text-gray-400'}>
                              {child.icon}
                            </span>
                            <span className={`text-sm ${roboto.className} tracking-wide`}>
                              {child.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition
                        ${isActive(item.href)
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-200 hover:text-blue-700'
                        }
                      `}
                    >
                      <span className={isActive(item.href) ? 'text-blue-700' : 'text-gray-400'}>
                        {item.icon}
                      </span>
                      <span className={`flex-1 text-sm font-medium ${roboto.className} tracking-wide`}>
                        {item.name}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer in Mobile Menu */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-gray-800 truncate ${roboto.className} tracking-wide`}>
                  {displayName}
                </p>
                <p className={`text-xs text-gray-500 truncate ${roboto.className} tracking-wide`}>
                  {displayDesignation}
                </p>
              </div>
              {/* Updated Mobile Logout Button with Custom Modal */}
              <button
                onClick={handleLogoutClick}
                className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-400 hover:text-red-600"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className={`text-xs text-gray-500 ${roboto.className} tracking-wide text-center`}>
              <span>Developed By: </span>
              <span className="font-medium text-[#0071BD]">Muhammad Hassan Jaffer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
      </ProtectedEmployeeRoute>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={cancelLogout}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4 animate-scale-up">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h3 className={`text-xl font-bold text-gray-900 ${roboto.className} tracking-wide`}>
                  Confirm Logout
                </h3>
                <p className={`text-sm text-gray-500 ${roboto.className} tracking-wide mt-0.5`}>
                  Are you sure you want to logout?
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="mb-6">
              <p className={`text-sm text-gray-600 ${roboto.className} tracking-wide`}>
                You will be redirected to the login page and will need to sign in again to access your account.
              </p>
              
              {/* User Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium text-gray-800 ${roboto.className} tracking-wide`}>
                      {displayName}
                    </p>
                    <p className={`text-xs text-gray-500 ${roboto.className} tracking-wide`}>
                      {displayDesignation}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={cancelLogout}
                className={`flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium ${roboto.className} tracking-wide`}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className={`flex-1 px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg transition font-medium flex items-center justify-center gap-2 ${roboto.className} tracking-wide`}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animation */}
      <style jsx global>{`
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-scale-up {
          animation: scaleUp 0.2s ease-out forwards;
        }
      `}</style>
    </>
  )
}