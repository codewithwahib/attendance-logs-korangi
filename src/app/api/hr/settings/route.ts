// src/app/api/hr/settings/route.ts
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

// GET: Fetch all employees
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/hr/settings called')
    
    // Check if Sanity is configured
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      console.log('Sanity not configured, using mock data')
      
      // Return mock data for testing
      const mockEmployees = [
        {
          _id: '1',
          personalDetails: {
            employeeId: 'EMP001',
            fullName: 'John Doe',
            department: 'IT',
            position: 'Developer',
            phoneNumber: '1234567890',
            email: 'john@example.com'
          },
          username: 'johndoe',
          password: 'password123'
        },
        {
          _id: '2',
          personalDetails: {
            employeeId: 'EMP002',
            fullName: 'Jane Smith',
            department: 'HR',
            position: 'Manager',
            phoneNumber: '0987654321',
            email: 'jane@example.com'
          },
          username: 'janesmith',
          password: 'password456'
        },
        {
          _id: '3',
          personalDetails: {
            employeeId: 'EMP003',
            fullName: 'Mike Johnson',
            department: 'IT',
            position: 'Senior Developer',
            phoneNumber: '1122334455',
            email: 'mike@example.com'
          },
          username: 'mikej',
          password: 'password789'
        },
        {
          _id: '4',
          personalDetails: {
            employeeId: 'EMP004',
            fullName: 'Sarah Wilson',
            department: 'Marketing',
            position: 'Marketing Lead',
            phoneNumber: '5566778899',
            email: 'sarah@example.com'
          },
          username: 'sarahw',
          password: ''
        }
      ]

      return NextResponse.json({
        success: true,
        data: mockEmployees,
        total: mockEmployees.length
      })
    }

    // Fetch from Sanity
    const query = `
      *[_type == "employee"] {
        _id,
        personalDetails {
          employeeId,
          fullName,
          department,
          position,
          phoneNumber,
          email
        },
        username,
        password
      }
    `

    const employees = await client.fetch(query)

    return NextResponse.json({
      success: true,
      data: employees || [],
      total: employees?.length || 0
    })
  } catch (error) {
    console.error('Error in GET /api/hr/settings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch employees'
      },
      { status: 500 }
    )
  }
}

// PUT: Update employee password
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/hr/settings called')
    
    const body = await request.json()
    const { employeeId, newPassword, confirmPassword, username } = body

    // Validate
    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Password and confirm password are required' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // If Sanity is not configured, return success for testing
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      return NextResponse.json({
        success: true,
        message: 'Password updated successfully (mock)',
        data: { 
          employeeId, 
          username: username || 'updated_user' 
        }
      })
    }

    // Check if employee exists in Sanity
    const employee = await client.fetch(
      `*[_type == "employee" && _id == $employeeId][0] {
        _id,
        username
      }`,
      { employeeId }
    )

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Update password and username
    const updateData: any = {
      password: newPassword
    }

    if (username && username !== employee.username) {
      // Check if username is taken
      const existingUser = await client.fetch(
        `*[_type == "employee" && username == $username && _id != $employeeId][0]`,
        { username, employeeId }
      )
      
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Username already taken' },
          { status: 400 }
        )
      }
      updateData.username = username
    }

    await client
      .patch(employeeId)
      .set(updateData)
      .commit()

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      data: { 
        employeeId, 
        username: username || employee.username 
      }
    })
  } catch (error) {
    console.error('Error in PUT /api/hr/settings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update password'
      },
      { status: 500 }
    )
  }
}