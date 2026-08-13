// app/api/hr/employees/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/lib/client'

// GET - Fetch single employee (optional)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const query = `*[_type == "employee" && _id == $id][0] {
      _id,
      personalDetails,
      qualifications,
      experience,
      checkIn,
      checkOut,
      username,
      password,
      _createdAt,
      _updatedAt
    }`
    
    const employee = await serverClient.fetch(query, { id })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: employee
    })

  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch employee' 
      },
      { status: 500 }
    )
  }
}

// PUT - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { personalDetails } = body

    // Validate required fields
    if (!personalDetails) {
      return NextResponse.json(
        { success: false, error: 'Personal details are required' },
        { status: 400 }
      )
    }

    if (!personalDetails.employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    if (!personalDetails.fullName) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      )
    }

    if (!personalDetails.phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Check if employee exists
    const existingEmployee = await serverClient.fetch(
      `*[_type == "employee" && _id == $id][0]`,
      { id }
    )

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Check if employee with same ID or CNIC exists (excluding current)
    const duplicateCheck = await serverClient.fetch(
      `*[_type == "employee" && _id != $id && (personalDetails.employeeId == $employeeId || personalDetails.cnic == $cnic)][0]`,
      {
        id,
        employeeId: personalDetails.employeeId,
        cnic: personalDetails.cnic
      }
    )

    if (duplicateCheck) {
      return NextResponse.json(
        { success: false, error: 'Employee with this ID or CNIC already exists' },
        { status: 409 }
      )
    }

    // Update the employee
    const updatedEmployee = await serverClient
      .patch(id)
      .set({
        'personalDetails': {
          employeeId: personalDetails.employeeId,
          fullName: personalDetails.fullName,
          fatherName: personalDetails.fatherName || '',
          cnic: personalDetails.cnic || '',
          phoneNumber: personalDetails.phoneNumber,
          emergencyContact: personalDetails.emergencyContact || '',
          dob: personalDetails.dob || '',
          maritalStatus: personalDetails.maritalStatus || '',
          address: personalDetails.address || '',
          joiningDate: personalDetails.joiningDate || '',
          department: personalDetails.department || '',
          position: personalDetails.position || '',
          // Preserve existing CV if not updated
          cv: existingEmployee.personalDetails?.cv || null
        },
        updatedAt: new Date().toISOString()
      })
      .commit()

    console.log('Employee updated successfully:', updatedEmployee)

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    })

  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update employee' 
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if employee exists
    const existingEmployee = await serverClient.fetch(
      `*[_type == "employee" && _id == $id][0]`,
      { id }
    )

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Delete the employee
    await serverClient.delete(id)

    console.log('Employee deleted successfully:', id)

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete employee' 
      },
      { status: 500 }
    )
  }
}