'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
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
  Printer,
  MapPin,
  AlertCircle,
  Palette,
  FileText,
  Database,
  LogOut,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  X
} from 'lucide-react'
import { Roboto } from 'next/font/google'
import Image from 'next/image'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

// =====================================================
// SUPABASE CLIENT
// =====================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// =====================================================
// TYPES
// =====================================================

interface AttendanceLog {
  id: number
  user_id: string
  employee_name: string | null
  timestamp: string
  punch_type: 'CHECK_IN' | 'CHECK_OUT'
  device_id: string | null
  branch_code: string | null
  raw_log_key: string
  created_at: string
}

interface AttendanceRecord {
  employeeId: string
  name: string
  date: string
  day: string

  // FIRST TIMESTAMP = CHECK IN
  checkIn: string
  checkInTime: string

  // LAST TIMESTAMP = CHECK OUT
  checkOut: string
  checkOutTime: string

  totalHours: string

  checkInLocation: string
  checkOutLocation: string

  status: 'Present' | 'Absent' | 'Half Day'

  branch_code: string | null
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AttendanceSheetPage() {

  // =====================================================
  // AUTH STATE
  // =====================================================

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // =====================================================
  // ATTENDANCE STATE
  // =====================================================

  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const [selectedBranch, setSelectedBranch] = useState('all')
  const [branches, setBranches] = useState<string[]>([])

  const [selectedEmployee, setSelectedEmployee] = useState('all')

  const [employeeNames, setEmployeeNames] = useState<
    { id: string; name: string }[]
  >([])

  const [expandedFilters, setExpandedFilters] = useState(false)
  const [showPrintOptions, setShowPrintOptions] = useState(false)

  // =====================================================
  // CHECK LOGIN
  // =====================================================

  useEffect(() => {
    const userData = localStorage.getItem('hrms_user')

    if (userData) {
      try {
        const data = JSON.parse(userData)

        if (data.username && data.role === 'hr') {
          setIsAuthenticated(true)
        }
      } catch {
        localStorage.removeItem('hrms_user')
      }
    }
  }, [])

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setAuthError('')
    setIsLoading(true)

    try {

      if (username === 'hr' && password === '098098') {

        localStorage.setItem(
          'hrms_user',
          JSON.stringify({
            username: 'hr',
            role: 'hr',
            loginTime: new Date().toISOString()
          })
        )

        setIsAuthenticated(true)
        setUsername('')
        setPassword('')

      } else {

        setAuthError('Invalid username or password')

      }

    } catch (err) {

      console.error(err)
      setAuthError('An error occurred. Please try again.')

    } finally {

      setIsLoading(false)

    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem('hrms_user')

    setIsAuthenticated(false)

  }

  // =====================================================
  // DAY NAME
  // =====================================================

  const getDayName = useCallback((dateStr: string) => {

    const date = new Date(`${dateStr}T00:00:00`)

    return date.toLocaleDateString('en-US', {
      weekday: 'long'
    })

  }, [])

  // =====================================================
  // FORMAT TIME
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
  // FORMAT DATE
  // =====================================================

  const formatDate = useCallback((dateStr: string) => {

    if (!dateStr) return '-'

    try {

      const date = new Date(`${dateStr}T00:00:00`)

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
  // TOTAL HOURS (FIRST TIMESTAMP -> LAST TIMESTAMP)
  // =====================================================

  const calculateTotalHours = useCallback(
    (firstTime: string, lastTime: string) => {

      if (!firstTime || !lastTime) return '-'

      try {

        const inTime = new Date(firstTime)
        const outTime = new Date(lastTime)

        const diffMs =
          outTime.getTime() - inTime.getTime()

        if (diffMs < 0) return '-'

        const totalSeconds =
          Math.floor(diffMs / 1000)

        const hours =
          Math.floor(totalSeconds / 3600)

        const minutes =
          Math.floor(
            (totalSeconds % 3600) / 60
          )

        const seconds =
          totalSeconds % 60

        return `${String(hours).padStart(2, '0')}:${String(
          minutes
        ).padStart(2, '0')}:${String(seconds).padStart(
          2,
          '0'
        )}`

      } catch {

        return '-'

      }

    },
    []
  )

  // =====================================================
  // VALIDATE COORDINATES
  // =====================================================

  const isValidCoordinate = useCallback(
    (location: string) => {

      if (!location || location === '-') {
        return false
      }

      const parts = location
        .split(',')
        .map(s => s.trim())

      if (parts.length !== 2) {
        return false
      }

      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])

      return (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      )
    },
    []
  )

  // =====================================================
  // PARSE COORDINATES
  // =====================================================

  const parseCoordinates = useCallback(
    (
      location: string
    ): { lat: number; lng: number } | null => {

      if (!location || location === '-') {
        return null
      }

      const parts = location
        .split(',')
        .map(s => s.trim())

      if (parts.length !== 2) {
        return null
      }

      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])

      if (isNaN(lat) || isNaN(lng)) {
        return null
      }

      return {
        lat,
        lng
      }
    },
    []
  )

  // =====================================================
  // GOOGLE MAPS
  // =====================================================

  const openGoogleMaps = useCallback(
    (location: string) => {

      const coords = parseCoordinates(location)

      if (!coords) {

        const searchQuery =
          encodeURIComponent(location)

        window.open(
          `https://www.google.com/maps/search/?api=1&query=${searchQuery}`,
          '_blank'
        )

        return
      }

      window.open(
        `https://www.google.com/maps?q=${coords.lat},${coords.lng}`,
        '_blank'
      )
    },
    [parseCoordinates]
  )

  // =====================================================
  // ROW COLOR - Only for print, NOT for web
  // =====================================================

  const getRowColorForPrint = useCallback(
    (
      checkInTime: string,
      day: string
    ) => {

      if (day === 'Sunday') {
        return '#FFCCCC'
      }

      if (!checkInTime || checkInTime === '-') {
        return 'transparent'
      }

      try {

        const timeStr =
          checkInTime.replace(/\s/g, '')

        const isPM =
          timeStr.includes('PM')

        let hours =
          parseInt(timeStr.split(':')[0])

        const minutes =
          parseInt(
            timeStr
              .split(':')[1]
              ?.replace(/[AP]M/g, '')
          )

        if (isPM && hours !== 12) {
          hours += 12
        }

        if (!isPM && hours === 12) {
          hours = 0
        }

        const totalMinutes =
          hours * 60 + (minutes || 0)

        // Before 9 AM - Blue
        if (totalMinutes < 540) {
          return '#4A90D9'
        }

        // 9 - 9:30 AM - Green
        if (
          totalMinutes >= 540 &&
          totalMinutes < 570
        ) {
          return '#27AE60'
        }

        // 9:30 - 10:30 AM - Yellow
        if (
          totalMinutes >= 570 &&
          totalMinutes < 630
        ) {
          return '#F1C40F'
        }

        // After 10:30 AM - Red
        if (totalMinutes >= 630) {
          return '#E74C3C'
        }

        return 'transparent'

      } catch {

        return 'transparent'

      }

    },
    []
  )

  // =====================================================
  // SELECTED EMPLOYEE NAME
  // =====================================================

  const getSelectedEmployeeName = useCallback(
    () => {

      if (selectedEmployee === 'all') {
        return 'All Employees'
      }

      const employee =
        employeeNames.find(
          e => e.id === selectedEmployee
        )

      return (
        employee?.name ||
        'Selected Employee'
      )

    },
    [
      employeeNames,
      selectedEmployee
    ]
  )

  // =====================================================
  // GENERATE ATTENDANCE RECORDS
  //
  // RULE:
  // FIRST TIMESTAMP  = CHECK IN
  // LAST TIMESTAMP   = CHECK OUT
  // MIDDLE LOGS      = IGNORED
  // =====================================================

  const generateAttendanceRecords = useCallback(
    (logsData: AttendanceLog[]) => {

      const groupedLogs: {
        [userId: string]: {
          [date: string]: AttendanceLog[]
        }
      } = {}

      // =================================================
      // GROUP BY EMPLOYEE + DATE
      // =================================================

      logsData.forEach(log => {

        const date =
          log.timestamp.split('T')[0]

        if (!groupedLogs[log.user_id]) {
          groupedLogs[log.user_id] = {}
        }

        if (!groupedLogs[log.user_id][date]) {
          groupedLogs[log.user_id][date] = []
        }

        groupedLogs[log.user_id][date].push(log)

      })

      const records: AttendanceRecord[] = []

      // =================================================
      // CREATE DAILY RECORD
      // =================================================

      Object.keys(groupedLogs).forEach(
        userId => {

          const dates =
            Object.keys(
              groupedLogs[userId]
            )

          dates.forEach(date => {

            const dayLogs =
              groupedLogs[userId][date]

            // ===========================================
            // SORT ALL RECORDS BY TIME (Ascending)
            // ===========================================

            const sortedLogs =
              [...dayLogs].sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              )

            if (sortedLogs.length === 0) {
              return
            }

            // ===========================================
            // ✅ FIRST TIMESTAMP = CHECK IN
            // ===========================================

            const firstLog = sortedLogs[0]

            // ===========================================
            // ✅ LAST TIMESTAMP = CHECK OUT
            // ===========================================

            const lastLog =
              sortedLogs[sortedLogs.length - 1]

            // ===========================================
            // EMPLOYEE INFO
            // ===========================================

            const employeeName =
              firstLog.employee_name ||
              lastLog?.employee_name ||
              userId

            const branchCode =
              firstLog.branch_code ||
              lastLog?.branch_code ||
              null

            // ===========================================
            // FIRST / LAST TIMESTAMP
            // ===========================================

            const firstTime =
              firstLog.timestamp

            const lastTime =
              lastLog.timestamp

            const firstFormatted =
              formatTime(firstTime)

            const lastFormatted =
              lastLog && lastLog !== firstLog
                ? formatTime(lastTime)
                : '-'

            // ===========================================
            // STATUS
            // ===========================================

            let status:
              | 'Present'
              | 'Absent'
              | 'Half Day' = 'Absent'

            if (sortedLogs.length >= 2) {

              // ✅ At least 2 logs → Present
              status = 'Present'

            } else if (
              sortedLogs.length === 1
            ) {

              // ✅ Only 1 log → Half Day
              status = 'Half Day'

            }

            // ===========================================
            // PUSH RECORD
            // ===========================================

            records.push({

              employeeId: userId,

              name: employeeName,

              date,

              day: getDayName(date),

              // ✅ FIRST TIMESTAMP = CHECK IN
              checkIn: firstFormatted,
              checkInTime: firstTime,

              // ✅ LAST TIMESTAMP = CHECK OUT
              checkOut: lastFormatted,
              checkOutTime: lastTime,

              // FIRST -> LAST
              totalHours:
                calculateTotalHours(
                  firstTime,
                  lastTime
                ),

              checkInLocation:
                firstLog.device_id || '-',

              checkOutLocation:
                lastLog.device_id || '-',

              status,

              branch_code: branchCode

            })

          })

        }
      )

      // =================================================
      // SORT RECORDS
      // =================================================

      records.sort((a, b) => {

        if (a.date !== b.date) {
          return a.date.localeCompare(b.date)
        }

        return a.name.localeCompare(b.name)

      })

      setFilteredData(records)

    },
    [
      getDayName,
      formatTime,
      calculateTotalHours
    ]
  )

  // =====================================================
  // FETCH ATTENDANCE LOGS
  // =====================================================

  const fetchAttendanceLogs = useCallback(
    async () => {

      try {

        setLoading(true)
        setError(null)

        let query = supabase
          .from('attendance_logs')
          .select('*')
          .order('timestamp', {
            ascending: true
          })

        // ===============================================
        // DATE FILTER
        // ===============================================

        if (fromDate) {

          const fromDateObj =
            new Date(fromDate)

          fromDateObj.setHours(
            0,
            0,
            0,
            0
          )

          query = query.gte(
            'timestamp',
            fromDateObj.toISOString()
          )
        }

        if (toDate) {

          const toDateObj =
            new Date(toDate)

          toDateObj.setHours(
            23,
            59,
            59,
            999
          )

          query = query.lte(
            'timestamp',
            toDateObj.toISOString()
          )
        }

        // ===============================================
        // BRANCH FILTER
        // ===============================================

        if (
          selectedBranch !== 'all'
        ) {

          query = query.eq(
            'branch_code',
            selectedBranch
          )
        }

        // ===============================================
        // EMPLOYEE FILTER
        // ===============================================

        if (
          selectedEmployee !== 'all'
        ) {

          query = query.eq(
            'user_id',
            selectedEmployee
          )
        }

        const {
          data,
          error: fetchError
        } = await query

        if (fetchError) {
          throw new Error(
            fetchError.message
          )
        }

        if (
          !data ||
          data.length === 0
        ) {

          setLogs([])
          setFilteredData([])
          setLoading(false)

          return
        }

        // ===============================================
        // MAP DATABASE DATA
        // ===============================================

        const mappedLogs: AttendanceLog[] =
          data.map((item: any) => ({

            id: item.id,

            user_id: item.user_id,

            employee_name:
              item.employee_name,

            timestamp:
              item.timestamp,

            punch_type:
              item.punch_type,

            device_id:
              item.device_id,

            branch_code:
              item.branch_code,

            raw_log_key:
              item.raw_log_key,

            created_at:
              item.created_at

          }))

        setLogs(mappedLogs)

        // ===============================================
        // UNIQUE BRANCHES
        // ===============================================

        const uniqueBranches =
          [
            ...new Set(
              mappedLogs
                .map(log => log.branch_code)
                .filter(Boolean)
            )
          ] as string[]

        setBranches(uniqueBranches)

        // ===============================================
        // UNIQUE EMPLOYEES
        // ===============================================

        const employeeMap =
          new Map<
            string,
            string
          >()

        mappedLogs.forEach(log => {

          if (
            !employeeMap.has(
              log.user_id
            )
          ) {

            employeeMap.set(
              log.user_id,
              log.employee_name ||
              log.user_id
            )

          }

        })

        const uniqueEmployees =
          Array.from(
            employeeMap.entries()
          ).map(
            ([id, name]) => ({
              id,
              name
            })
          )

        setEmployeeNames(
          uniqueEmployees
        )

        // ===============================================
        // GENERATE ATTENDANCE
        // ===============================================

        generateAttendanceRecords(
          mappedLogs
        )

      } catch (err) {

        console.error(
          'Error fetching attendance logs:',
          err
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch logs'
        )

        setLogs([])
        setFilteredData([])

      } finally {

        setLoading(false)

      }

    },
    [
      fromDate,
      toDate,
      selectedBranch,
      selectedEmployee,
      generateAttendanceRecords
    ]
  )

  // =====================================================
  // LOCATION DISPLAY
  // =====================================================

  const LocationDisplay = useCallback(
    ({
      location
    }: {
      location: string
    }) => {

      if (
        !location ||
        location === '-'
      ) {

        return (
          <span className="text-gray-400 tracking-wide">
            -
          </span>
        )
      }

      const hasCoords =
        isValidCoordinate(location)

      const displayText =
        hasCoords
          ? '📍'
          : location.length > 15
            ? location.substring(0, 15) + '...'
            : location

      return (
        <button
          onClick={() =>
            openGoogleMaps(location)
          }
          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 text-[10px] transition-colors tracking-wide"
          title={location}
        >
          <MapPin className="w-2.5 h-2.5" />
          <span>
            {displayText}
          </span>
        </button>
      )

    },
    [
      isValidCoordinate,
      openGoogleMaps
    ]
  )

  // =====================================================
  // SUMMARY
  // =====================================================

  const getSummary = useCallback(
    () => {

      const total =
        filteredData.length

      const present =
        filteredData.filter(
          r =>
            r.status === 'Present'
        ).length

      const absent =
        filteredData.filter(
          r =>
            r.status === 'Absent'
        ).length

      const halfDay =
        filteredData.filter(
          r =>
            r.status === 'Half Day'
        ).length

      return {
        total,
        present,
        absent,
        halfDay
      }

    },
    [filteredData]
  )

  // =====================================================
  // PRINT - With Colors, Roboto Font, Tracking Wider
  // =====================================================

  const handlePrintWithColor =
    useCallback(
      (withColor: boolean) => {

        setShowPrintOptions(false)

        const data =
          filteredData

        const employeeName =
          selectedEmployee === 'all'
            ? 'All Employees'
            : getSelectedEmployeeName()

        let tableRows = ''

        data.forEach(
          (
            record,
            index
          ) => {

            const isSunday =
              record.day === 'Sunday'

            // ✅ Only apply colors if withColor is true
            const rowColor =
              withColor
                ? getRowColorForPrint(
                    record.checkIn,
                    record.day
                  )
                : 'transparent'

            const bgStyle =
              rowColor !== 'transparent'
                ? `background-color: ${rowColor};`
                : ''

            tableRows += `
              <tr style="${bgStyle}">
                <td style="padding:2px 3px;border:1px solid #000;font-size:7px;text-align:center;font-family:'Roboto',Arial,sans-serif;letter-spacing:0.3px;">
                  ${index + 1}
                </td>

                <td style="padding:2px 3px;border:1px solid #000;font-size:7px;text-align:center;font-family:'Roboto',Arial,sans-serif;letter-spacing:0.3px;">
                  ${record.employeeId}
                </td>

                <td style="padding:2px 3px;border:1px solid #000;font-size:7px;text-align:center;font-family:'Roboto',Arial,sans-serif;letter-spacing:0.3px;">
                  ${record.name}
                </td>

                <td style="padding:2px 3px;border:1px solid #000;font-size:7px;text-align:center;font-family:'Roboto',Arial,sans-serif;letter-spacing:0.3px;">
                  ${record.branch_code || '-'}
                </td>

                <td style="padding:2px 3px;border:1px solid #000;font-size:7px;text-align:center;font-family:'Roboto',Arial,sans-serif;letter-spacing:0.3px;">
                  ${record.date}
                </td>

                <td style="padding:2px 3px;border:1px solid #000;font-size:7px;text-align:center;font-family:'Roboto',Arial,sans-serif;letter-spacing:0.3px;${isSunday ? 'font-weight:bold;color:#FF0000;' : ''}">
                  ${record.day}
                </td>

                <td style="padding:2px 3px;border:1px solid #000;font-size:7px;text-align:center;font-family:'Roboto',Arial,sans-serif;letter-spacing:0.3px;">
                  ${record.checkIn}
                </td>

                <td style="padding:2px 3px;border:1px solid #000;font-size:7px;text-align:center;font-family:'Roboto',Arial,sans-serif;letter-spacing:0.3px;">
                  ${record.checkOut}
                </td>

                <td style="padding:2px 3px;border:1px solid #000;font-size:7px;text-align:center;font-family:'Roboto',Arial,sans-serif;letter-spacing:0.3px;">
                  ${record.totalHours}
                </td>

                <td style="padding:2px 3px;border:1px solid #000;font-size:7px;text-align:center;font-family:'Roboto',Arial,sans-serif;letter-spacing:0.3px;">
                  ${record.status}
                </td>
              </tr>
            `
          }
        )

        const printHTML = `
          <!DOCTYPE html>

          <html>

            <head>

              <title>
                Attendance Sheet - ${employeeName}
              </title>

              <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap" rel="stylesheet">

              <style>

                @page {
                  size: A4 landscape;
                  margin: 5mm 4mm;
                }

                * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }

                body {
                  font-family: 'Roboto', Arial, sans-serif;
                  background: white;
                  color: #000;
                  letter-spacing: 0.3px;
                }

                .print-container {
                  width: 100%;
                }

                .print-header {
                  text-align: center;
                  margin-bottom: 6px;
                  padding-bottom: 5px;
                  border-bottom: 2px solid #000;
                }

                .company-name {
                  font-size: 11px;
                  font-weight: 700;
                  letter-spacing: 0.5px;
                  text-transform: uppercase;
                  font-family: 'Roboto', Arial, sans-serif;
                }

                .title {
                  font-size: 10px;
                  font-weight: 700;
                  margin-top: 1px;
                  letter-spacing: 0.5px;
                  font-family: 'Roboto', Arial, sans-serif;
                }

                .date-range {
                  font-size: 7px;
                  margin-top: 1px;
                  letter-spacing: 0.3px;
                  font-family: 'Roboto', Arial, sans-serif;
                }

                table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 7px;
                  font-family: 'Roboto', Arial, sans-serif;
                }

                thead th {
                  background: #C4BD97;
                  font-weight: 700;
                  text-align: center;
                  padding: 3px 2px;
                  border: 1px solid #000;
                  text-transform: uppercase;
                  font-size: 6px;
                  letter-spacing: 0.5px;
                  font-family: 'Roboto', Arial, sans-serif;
                }

                tbody td {
                  padding: 2px 3px;
                  border: 1px solid #000;
                  text-align: center;
                  font-size: 7px;
                  font-family: 'Roboto', Arial, sans-serif;
                  letter-spacing: 0.3px;
                }

                .print-footer {
                  margin-top: 6px;
                  padding-top: 4px;
                  border-top: 1px solid #000;
                  text-align: center;
                  font-size: 6px;
                  letter-spacing: 0.3px;
                  font-family: 'Roboto', Arial, sans-serif;
                }

                @media print {

                  thead th {
                    background: #C4BD97 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }

                  tr {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }

                }

              </style>

            </head>

            <body>

              <div class="print-container">

                <div class="print-header">

                  <div class="company-name">
                    A to Zee Switchgear Engineering (SMC) Pvt. Ltd.
                  </div>

                  <div class="title">
                    EMPLOYEE ATTENDANCE SHEET
                  </div>

                  <div class="date-range">
                    ${formatDate(fromDate)}
                    -
                    ${formatDate(toDate)}
                    |
                    ${selectedBranch !== 'all'
                      ? selectedBranch
                      : 'All Branches'
                    }
                  </div>

                </div>

                <table>

                  <thead>

                    <tr>

                      <th style="width:1%">#</th>
                      <th style="width:3%">User ID</th>
                      <th style="width:8%">Name</th>
                      <th style="width:3%">Branch</th>
                      <th style="width:4%">Date</th>
                      <th style="width:4%">Day</th>
                      <th style="width:4%">Check In</th>
                      <th style="width:4%">Check Out</th>
                      <th style="width:4%">Hours</th>
                      <th style="width:4%">Status</th>

                    </tr>

                  </thead>

                  <tbody>
                    ${tableRows}
                  </tbody>

                </table>

                <div class="print-footer">
                  This sheet is generated by system software |
                  A to Zee Switchgear Engineering (SMC) Pvt. Ltd.
                </div>

              </div>

              <script>

                window.onload = function() {

                  setTimeout(
                    function() {
                      window.print();
                    },
                    500
                  );

                };

              </script>

            </body>

          </html>
        `

        const printWindow =
          window.open(
            '',
            '_blank'
          )

        if (!printWindow) {

          alert(
            'Please allow popups for printing'
          )

          return
        }

        printWindow.document.write(
          printHTML
        )

        printWindow.document.close()

      },
      [
        filteredData,
        selectedEmployee,
        getSelectedEmployeeName,
        getRowColorForPrint,
        fromDate,
        toDate,
        selectedBranch,
        formatDate
      ]
    )

  // =====================================================
  // SET DEFAULT DATE RANGE
  // =====================================================

  useEffect(() => {

    if (!isAuthenticated) {
      return
    }

    const now =
      new Date()

    const firstDay =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )

    const lastDay =
      new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      )

    setFromDate(
      firstDay
        .toISOString()
        .split('T')[0]
    )

    setToDate(
      lastDay
        .toISOString()
        .split('T')[0]
    )

  }, [isAuthenticated])

  // =====================================================
  // FETCH WHEN FILTERS CHANGE
  // =====================================================

  useEffect(() => {

    if (
      isAuthenticated &&
      fromDate &&
      toDate
    ) {

      fetchAttendanceLogs()

    }

  }, [
    isAuthenticated,
    fromDate,
    toDate,
    selectedBranch,
    selectedEmployee,
    fetchAttendanceLogs
  ])

  // =====================================================
  // LOGIN PAGE
  // =====================================================

  if (!isAuthenticated) {

    return (

      <div
        className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${roboto.className}`}
      >

        <div className="max-w-md w-full">

          <div className="text-center mb-8">

            <div className="flex justify-center mb-4">

              <div className="relative w-56 h-28">

                <Image
                  src="/logo.png"
                  alt="Company Logo"
                  fill
                  className="object-contain"
                  priority
                />

              </div>

            </div>

            <h1
              className={`text-3xl font-bold text-[#0071BD] tracking-wider ${roboto.className}`}
            >
              Attendance Sheet
            </h1>


          </div>

          <div className="bg-white shadow-sm p-6 md:p-8">

            <form
              onSubmit={handleLogin}
              className="space-y-6"
            >

              {/* USERNAME */}

              <div>

                <label
                  className={`block text-sm font-medium text-gray-700 tracking-wide mb-2 ${roboto.className}`}
                >
                  Username
                </label>

                <div className="relative">

                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    value={username}
                    onChange={e =>
                      setUsername(
                        e.target.value
                      )
                    }
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm bg-white text-gray-900 placeholder-gray-400 tracking-wide ${roboto.className}`}
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  className={`block text-sm font-medium text-gray-700 tracking-wide mb-2 ${roboto.className}`}
                >
                  Password
                </label>

                <div className="relative">

                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={e =>
                      setPassword(
                        e.target.value
                      )
                    }
                    className={`w-full pl-10 pr-12 py-3 border border-gray-300 focus:ring-2 focus:ring-[#0071BD] focus:border-transparent outline-none shadow-sm bg-white text-gray-900 placeholder-gray-400 tracking-wide ${roboto.className}`}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >

                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}

                  </button>

                </div>

              </div>

              {/* ERROR */}

              {authError && (

                <div
                  className={`bg-red-50 border border-red-200 p-3 flex items-start gap-2 ${roboto.className}`}
                >

                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />

                  <p className="text-sm text-red-700 tracking-wide">
                    {authError}
                  </p>

                </div>

              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 bg-[#0071BD] text-white hover:bg-[#005a96] transition flex items-center justify-center gap-2 tracking-wider disabled:opacity-50 ${roboto.className}`}
              >

                {isLoading ? (

                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="tracking-wide">Signing in...</span>
                  </>

                ) : (

                  <>
                    <span className="tracking-wide">Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>

                )}

              </button>

              <div className="mt-6 text-center space-y-2">

                <p className={`text-xs text-gray-400 tracking-wide ${roboto.className}`}>
                  © 2026 All rights reserved
                </p>

                <p className={`text-[11px] text-gray-400 tracking-widest ${roboto.className}`}>

                  System and Software generated by{' '}

                  <span className={`font-medium text-[#0071BD] tracking-widest ${roboto.className}`}>
                    Muhammad Hassan Jaffer
                  </span>

                </p>

              </div>

            </form>

          </div>

        </div>

      </div>

    )
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div
        className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}
      >

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

          <h3 className={`text-xl font-semibold text-gray-800 mb-2 tracking-wider ${roboto.className}`}>
            Error
          </h3>

          <p className={`text-gray-600 mb-4 tracking-wide ${roboto.className}`}>
            {error}
          </p>

          <button
            onClick={fetchAttendanceLogs}
            className={`px-4 py-2 bg-[#0071BD] text-white hover:bg-[#005a96] transition tracking-wider ${roboto.className}`}
          >
            Retry
          </button>

        </div>

      </div>

    )
  }

  // =====================================================
  // SUMMARY
  // =====================================================

  const summary =
    getSummary()

  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div
      className={`min-h-screen bg-gray-50 p-2 ${roboto.className}`}
    >

      <div className="max-w-full mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-2">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

            <div>

              <h1 className={`text-lg font-bold text-[#0071BD] tracking-wider flex items-center gap-2 ${roboto.className}`}>

                <Database className="w-4 h-4" />

                Attendance Sheet

              </h1>

              <p className={`text-[10px] text-gray-500 tracking-wide ${roboto.className}`}>

                {
                  selectedEmployee === 'all'
                    ? 'All employees'
                    : getSelectedEmployeeName()
                }

              </p>

            </div>

            <div className="flex items-center gap-2 flex-wrap">

              <span className={`text-xs text-gray-600 tracking-wide ${roboto.className}`}>

                Welcome,

                <span className={`font-semibold text-[#0071BD] ml-1 tracking-wide ${roboto.className}`}>
                  HR
                </span>

              </span>

              <button
                onClick={handleLogout}
                className={`px-2 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center gap-1 rounded tracking-wide ${roboto.className}`}
              >

                <LogOut className="w-3 h-3" />

                Logout

              </button>

              <button
                onClick={fetchAttendanceLogs}
                className={`px-2 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-1 tracking-wide ${roboto.className}`}
              >

                <RefreshCw className="w-3 h-3" />

                Refresh

              </button>

              <button
                onClick={() =>
                  setShowPrintOptions(true)
                }
                className={`px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1 tracking-wide ${roboto.className}`}
              >

                <Printer className="w-3 h-3" />

                Print

              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            PRINT MODAL
        ================================================= */}

        {showPrintOptions && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">

              <div className="flex items-center justify-between mb-4">

                <h2 className={`text-xl font-bold text-gray-800 flex items-center gap-2 tracking-wider ${roboto.className}`}>

                  <Printer className="w-5 h-5 text-[#0071BD]" />

                  Print Options

                </h2>

                <button
                  onClick={() =>
                    setShowPrintOptions(false)
                  }
                  className="p-1 hover:bg-gray-200 rounded"
                >

                  <X className="w-5 h-5 text-gray-500" />

                </button>

              </div>

              <p className={`text-sm text-gray-600 mb-4 tracking-wide ${roboto.className}`}>

                Select how you want to print the attendance sheet:

              </p>

              <div className="space-y-3">

                <button
                  onClick={() =>
                    handlePrintWithColor(true)
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition ${roboto.className}`}
                >

                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-lg flex items-center justify-center">

                    <Palette className="w-5 h-5 text-white" />

                  </div>

                  <div className="flex-1 text-left">

                    <p className={`font-semibold text-gray-800 tracking-wide ${roboto.className}`}>
                      With Colors
                    </p>

                    <p className={`text-xs text-gray-500 tracking-wide ${roboto.className}`}>
                      Show time-based colors
                    </p>

                  </div>

                </button>

                <button
                  onClick={() =>
                    handlePrintWithColor(false)
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition ${roboto.className}`}
                >

                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">

                    <FileText className="w-5 h-5 text-gray-600" />

                  </div>

                  <div className="flex-1 text-left">

                    <p className={`font-semibold text-gray-800 tracking-wide ${roboto.className}`}>
                      Without Colors
                    </p>

                    <p className={`text-xs text-gray-500 tracking-wide ${roboto.className}`}>
                      Plain white background
                    </p>

                  </div>

                </button>

              </div>

              <button
                onClick={() =>
                  setShowPrintOptions(false)
                }
                className={`w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition rounded-lg tracking-wide ${roboto.className}`}
              >
                Cancel
              </button>

            </div>

          </div>

        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="grid grid-cols-4 gap-1.5 mb-2">

          <div className="bg-white shadow-sm p-1.5">

            <div className={`text-[10px] text-[#0071BD] tracking-wide ${roboto.className}`}>
              Total
            </div>

            <div className={`text-base font-bold text-[#0071BD] tracking-wider ${roboto.className}`}>
              {summary.total}
            </div>

          </div>

          <div className="bg-white shadow-sm p-1.5">

            <div className={`text-[10px] text-green-600 flex items-center gap-0.5 tracking-wide ${roboto.className}`}>

              <UserCheck className="w-2.5 h-2.5" />

              P

            </div>

            <div className={`text-base font-bold text-green-700 tracking-wider ${roboto.className}`}>
              {summary.present}
            </div>

          </div>

          <div className="bg-white shadow-sm p-1.5">

            <div className={`text-[10px] text-red-600 flex items-center gap-0.5 tracking-wide ${roboto.className}`}>

              <UserX className="w-2.5 h-2.5" />

              A

            </div>

            <div className={`text-base font-bold text-red-700 tracking-wider ${roboto.className}`}>
              {summary.absent}
            </div>

          </div>

          <div className="bg-white shadow-sm p-1.5">

            <div className={`text-[10px] text-yellow-600 flex items-center gap-0.5 tracking-wide ${roboto.className}`}>

              <UserMinus className="w-2.5 h-2.5" />

              H

            </div>

            <div className={`text-base font-bold text-yellow-700 tracking-wider ${roboto.className}`}>
              {summary.halfDay}
            </div>

          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="bg-white text-black shadow-sm p-1.5 mb-2">

          <button
            onClick={() =>
              setExpandedFilters(
                !expandedFilters
              )
            }
            className={`flex items-center gap-1 text-gray-700 hover:text-[#0071BD] transition text-xs tracking-wide ${roboto.className}`}
          >

            <Filter className="w-3 h-3" />

            {
              expandedFilters
                ? 'Hide Filters'
                : 'Show Filters'
            }

            {
              expandedFilters
                ? <ChevronUp className="w-3 h-3" />
                : <ChevronDown className="w-3 h-3" />
            }

          </button>

          {expandedFilters && (

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2">

              {/* FROM DATE */}

              <div>

                <label className={`block text-[10px] font-medium text-gray-700 mb-0.5 tracking-wide ${roboto.className}`}>
                  From Date
                </label>

                <div className="relative">

                  <Calendar className="w-3 h-3 absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="date"
                    value={fromDate}
                    onChange={e =>
                      setFromDate(
                        e.target.value
                      )
                    }
                    className={`w-full pl-6 pr-1.5 py-1 text-xs border border-gray-300 focus:ring-2 focus:ring-[#0071BD] outline-none tracking-wide ${roboto.className}`}
                  />

                </div>

              </div>

              {/* TO DATE */}

              <div>

                <label className={`block text-[10px] font-medium text-gray-700 mb-0.5 tracking-wide ${roboto.className}`}>
                  To Date
                </label>

                <div className="relative">

                  <Calendar className="w-3 h-3 absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="date"
                    value={toDate}
                    onChange={e =>
                      setToDate(
                        e.target.value
                      )
                    }
                    className={`w-full pl-6 pr-1.5 py-1 text-xs border border-gray-300 focus:ring-2 focus:ring-[#0071BD] outline-none tracking-wide ${roboto.className}`}
                  />

                </div>

              </div>

              {/* BRANCH */}

              <div>

                <label className={`block text-[10px] font-medium text-gray-700 mb-0.5 tracking-wide ${roboto.className}`}>
                  Branch
                </label>

                <div className="relative">

                  <Building className="w-3 h-3 absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400" />

                  <select
                    value={selectedBranch}
                    onChange={e =>
                      setSelectedBranch(
                        e.target.value
                      )
                    }
                    className={`w-full pl-6 pr-1.5 py-1 text-xs border border-gray-300 focus:ring-2 focus:ring-[#0071BD] outline-none tracking-wide ${roboto.className}`}
                  >

                    <option value="all">
                      All Branches
                    </option>

                    {branches.map(
                      branch => (
                        <option
                          key={branch}
                          value={branch}
                        >
                          {branch}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {/* EMPLOYEE */}

              <div>

                <label className={`block text-[10px] font-medium text-gray-700 mb-0.5 tracking-wide ${roboto.className}`}>
                  Employee
                </label>

                <div className="relative">

                  <User className="w-3 h-3 absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400" />

                  <select
                    value={selectedEmployee}
                    onChange={e =>
                      setSelectedEmployee(
                        e.target.value
                      )
                    }
                    className={`w-full pl-6 pr-1.5 py-1 text-xs border border-gray-300 focus:ring-2 focus:ring-[#0071BD] outline-none tracking-wide ${roboto.className}`}
                  >

                    <option value="all">
                      All Employees
                    </option>

                    {employeeNames.map(
                      employee => (

                        <option
                          key={employee.id}
                          value={employee.id}
                        >

                          {employee.name}
                          {' '}
                          ({employee.id})

                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>

            </div>

          )}

        </div>

        {/* =================================================
            DATA TABLE - NO COLORS ON WEB
        ================================================= */}

        <div className="bg-white shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-[10px]">

              <thead>

                <tr className="bg-gray-50 border-b border-gray-200">

                  <th className={`px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider ${roboto.className}`}>
                    #
                  </th>

                  <th className={`px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider ${roboto.className}`}>
                    User ID
                  </th>

                  <th className={`px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider ${roboto.className}`}>
                    Name
                  </th>

                  <th className={`px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider ${roboto.className}`}>
                    Branch
                  </th>

                  <th className={`px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider ${roboto.className}`}>
                    Date
                  </th>

                  <th className={`px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider ${roboto.className}`}>
                    Day
                  </th>

                  <th className={`px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider ${roboto.className}`}>
                    Check In
                  </th>

                  <th className={`px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider ${roboto.className}`}>
                    Check Out
                  </th>

                  <th className={`px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider ${roboto.className}`}>
                    Hours
                  </th>

                  <th className={`px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider ${roboto.className}`}>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-200">

                {filteredData.length === 0 ? (

                  <tr>

                    <td
                      colSpan={10}
                      className={`px-2 py-3 text-center text-gray-500 text-xs tracking-wide ${roboto.className}`}
                    >

                      <div className="flex flex-col items-center gap-1">

                        <Users className="w-6 h-6 text-gray-300" />

                        <p className={`tracking-wide ${roboto.className}`}>
                          No attendance records found
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredData.map(
                    (
                      record,
                      index
                    ) => {

                      // ✅ NO COLORS ON WEB - only white background
                      return (

                        <tr
                          key={`${record.employeeId}-${record.date}-${index}`}
                          className={`hover:bg-gray-50 transition ${roboto.className}`}
                        >

                          <td className={`px-1.5 py-0.5 text-[10px] text-gray-500 tracking-wide ${roboto.className}`}>
                            {index + 1}
                          </td>

                          <td className={`px-1.5 py-0.5 text-[10px] font-medium text-gray-800 tracking-wide ${roboto.className}`}>
                            {record.employeeId}
                          </td>

                          <td className={`px-1.5 py-0.5 text-[10px] text-gray-700 tracking-wide ${roboto.className}`}>
                            {record.name}
                          </td>

                          <td className={`px-1.5 py-0.5 text-[10px] text-gray-600 tracking-wide ${roboto.className}`}>
                            {record.branch_code || '-'}
                          </td>

                          <td className={`px-1.5 py-0.5 text-[10px] text-gray-600 tracking-wide ${roboto.className}`}>
                            {record.date}
                          </td>

                          <td
                            className={`px-1.5 py-0.5 text-[10px] text-gray-600 tracking-wide ${
                              record.day === 'Sunday'
                                ? 'font-bold text-red-600'
                                : ''
                            } ${roboto.className}`}
                          >
                            {record.day}
                          </td>

                          {/* ✅ FIRST TIMESTAMP = CHECK IN */}

                          <td className={`px-1.5 py-0.5 text-[10px] font-medium text-gray-700 tracking-wide ${roboto.className}`}>
                            {record.checkIn}
                          </td>

                          {/* ✅ LAST TIMESTAMP = CHECK OUT */}

                          <td className={`px-1.5 py-0.5 text-[10px] font-medium text-gray-700 tracking-wide ${roboto.className}`}>
                            {record.checkOut}
                          </td>

                          <td className={`px-1.5 py-0.5 text-[10px] text-gray-600 tracking-wide ${roboto.className}`}>
                            {record.totalHours}
                          </td>

                          <td className="px-1.5 py-0.5">

                            <span
                              className={`px-1 py-0.5 text-[9px] font-medium tracking-wide ${roboto.className} ${
                                record.status === 'Present'
                                  ? 'bg-green-100 text-green-700'
                                  : record.status === 'Absent'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >

                              {record.status}

                            </span>

                          </td>

                        </tr>

                      )

                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        {filteredData.length > 0 && (

          <div className="mt-1.5 bg-white shadow-sm p-1.5">

            <div className={`flex flex-wrap items-center justify-between text-[10px] text-gray-600 tracking-wide ${roboto.className}`}>

              <div className={`tracking-wide ${roboto.className}`}>
                {filteredData.length} records
              </div>

              <div className={`flex items-center gap-2 tracking-wide ${roboto.className}`}>

                <span className={`flex items-center gap-0.5 tracking-wide ${roboto.className}`}>

                  <span className="w-2 h-2 bg-green-500" />

                  P: {summary.present}

                </span>

                <span className={`flex items-center gap-0.5 tracking-wide ${roboto.className}`}>

                  <span className="w-2 h-2 bg-red-500" />

                  A: {summary.absent}

                </span>

                <span className={`flex items-center gap-0.5 tracking-wide ${roboto.className}`}>

                  <span className="w-2 h-2 bg-yellow-500" />

                  H: {summary.halfDay}

                </span>

              </div>

            </div>

          </div>

        )}

        {/* =================================================
            QUICK STATS
        ================================================= */}

        <div className="mt-1.5 grid grid-cols-3 gap-1.5">

          <div className="bg-white shadow-sm p-1.5">

            <div className={`flex items-center gap-1 text-[10px] text-gray-600 tracking-wide ${roboto.className}`}>

              <Users className="w-3 h-3 text-[#0071BD]" />

              <span className={`font-medium tracking-wide ${roboto.className}`}>
                Total Logs
              </span>

            </div>

            <div className={`text-base font-bold text-[#0071BD] tracking-wider ${roboto.className}`}>

              {logs.length}

            </div>

          </div>

          <div className="bg-white shadow-sm p-1.5">

            <div className={`flex items-center gap-1 text-[10px] text-gray-600 tracking-wide ${roboto.className}`}>

              <Calendar className="w-3 h-3 text-[#0071BD]" />

              <span className={`font-medium tracking-wide ${roboto.className}`}>
                Range
              </span>

            </div>

            <div className={`text-[10px] font-medium text-gray-700 tracking-wide ${roboto.className}`}>

              {formatDate(fromDate)}
              {' - '}
              {formatDate(toDate)}

            </div>

          </div>

          <div className="bg-white shadow-sm p-1.5">

            <div className={`flex items-center gap-1 text-[10px] text-gray-600 tracking-wide ${roboto.className}`}>

              <Building className="w-3 h-3 text-[#0071BD]" />

              <span className={`font-medium tracking-wide ${roboto.className}`}>
                Branches
              </span>

            </div>

            <div className={`text-base font-medium text-gray-700 tracking-wide ${roboto.className}`}>

              {branches.length}

            </div>

          </div>

        </div>

      </div>

    </div>

  )
}