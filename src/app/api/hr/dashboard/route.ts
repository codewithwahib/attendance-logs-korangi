// src/app/api/hr/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/hr/dashboard called')
    
    // Check if Sanity is configured
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      console.log('Sanity not configured, using mock data')
      
      // Mock data for dashboard
      const mockData = {
        employees: [
          {
            _id: '1',
            personalDetails: {
              employeeId: 'EMP001',
              fullName: 'John Doe',
              department: 'IT',
              position: 'Senior Developer',
              phoneNumber: '1234567890',
              email: 'john@example.com',
              joiningDate: '2023-01-15',
              dob: '1990-05-20'
            },
            checkIn: [
              { time: '2024-01-15T09:00:00Z', location: 'Office A' },
              { time: '2024-01-16T09:15:00Z', location: 'Office A' }
            ],
            checkOut: [
              { time: '2024-01-15T17:00:00Z', location: 'Office A' },
              { time: '2024-01-16T17:30:00Z', location: 'Office A' }
            ]
          },
          {
            _id: '2',
            personalDetails: {
              employeeId: 'EMP002',
              fullName: 'Jane Smith',
              department: 'HR',
              position: 'HR Manager',
              phoneNumber: '0987654321',
              email: 'jane@example.com',
              joiningDate: '2023-03-10',
              dob: '1988-08-15'
            },
            checkIn: [
              { time: '2024-01-15T08:30:00Z', location: 'Office B' }
            ],
            checkOut: [
              { time: '2024-01-15T16:30:00Z', location: 'Office B' }
            ]
          },
          {
            _id: '3',
            personalDetails: {
              employeeId: 'EMP003',
              fullName: 'Mike Johnson',
              department: 'IT',
              position: 'Developer',
              phoneNumber: '1122334455',
              email: 'mike@example.com',
              joiningDate: '2023-06-20',
              dob: '1992-11-10'
            },
            checkIn: [],
            checkOut: []
          },
          {
            _id: '4',
            personalDetails: {
              employeeId: 'EMP004',
              fullName: 'Sarah Wilson',
              department: 'Marketing',
              position: 'Marketing Lead',
              phoneNumber: '5566778899',
              email: 'sarah@example.com',
              joiningDate: '2023-02-01',
              dob: '1985-03-25'
            },
            checkIn: [
              { time: '2024-01-15T09:30:00Z', location: 'Office C' },
              { time: '2024-01-16T09:00:00Z', location: 'Office C' }
            ],
            checkOut: [
              { time: '2024-01-15T18:00:00Z', location: 'Office C' },
              { time: '2024-01-16T17:45:00Z', location: 'Office C' }
            ]
          },
          {
            _id: '5',
            personalDetails: {
              employeeId: 'EMP005',
              fullName: 'David Brown',
              department: 'Finance',
              position: 'Accountant',
              phoneNumber: '9988776655',
              email: 'david@example.com',
              joiningDate: '2023-08-15',
              dob: '1991-07-08'
            },
            checkIn: [],
            checkOut: []
          }
        ],
        leaveRequests: [
          {
            _key: 'leave1',
            leaveType: 'Annual Leave',
            fromDate: '2024-01-20',
            toDate: '2024-01-22',
            status: 'pending',
            totalDays: 3,
            employeeName: 'John Doe'
          },
          {
            _key: 'leave2',
            leaveType: 'Sick Leave',
            fromDate: '2024-01-18',
            toDate: '2024-01-18',
            status: 'approved',
            totalDays: 1,
            employeeName: 'Jane Smith'
          },
          {
            _key: 'leave3',
            leaveType: 'Annual Leave',
            fromDate: '2024-01-25',
            toDate: '2024-01-26',
            status: 'pending',
            totalDays: 2,
            employeeName: 'Mike Johnson'
          },
          {
            _key: 'leave4',
            leaveType: 'Casual Leave',
            fromDate: '2024-01-16',
            toDate: '2024-01-16',
            status: 'approved',
            totalDays: 1,
            employeeName: 'Sarah Wilson'
          },
          {
            _key: 'leave5',
            leaveType: 'Emergency Leave',
            fromDate: '2024-01-19',
            toDate: '2024-01-19',
            status: 'rejected',
            totalDays: 1,
            employeeName: 'David Brown'
          }
        ]
      }

      return NextResponse.json({
        success: true,
        data: mockData
      })
    }

    // Fetch from Sanity
    const employeesQuery = `
      *[_type == "employee"] {
        _id,
        personalDetails {
          employeeId,
          fullName,
          department,
          position,
          phoneNumber,
          email,
          joiningDate,
          dob
        },
        checkIn[] {
          time,
          location
        },
        checkOut[] {
          time,
          location
        }
      }
    `

    const leavesQuery = `
      *[_type == "employee"] {
        leaves[] {
          _key,
          leaveType,
          fromDate,
          toDate,
          status,
          totalDays,
          employeeName
        }
      }
    `

    const [employees, leavesData] = await Promise.all([
      client.fetch(employeesQuery),
      client.fetch(leavesQuery)
    ])

    // Extract all leaves
    const allLeaves: any[] = []
    leavesData.forEach((emp: any) => {
      if (emp.leaves) {
        allLeaves.push(...emp.leaves)
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        employees: employees || [],
        leaveRequests: allLeaves || []
      }
    })
  } catch (error) {
    console.error('Error in GET /api/hr/dashboard:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard data'
      },
      { status: 500 }
    )
  }
}