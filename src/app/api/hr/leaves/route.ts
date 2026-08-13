// app/api/hr/leaves/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

// =====================================================
// GET - Fetch all leaves
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const query = `
      *[_type == "employee"] {
        _id,
        personalDetails {
          fullName,
          employeeId,
          department,
          position
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
          appliedOn,
          adminRemarks,
          updatedOn
        }
      }
    `

    const employees = await client.fetch(query)

    let allLeaves: any[] = []

    employees.forEach((employee: any) => {
      if (!Array.isArray(employee.leaves)) return

      employee.leaves.forEach((leave: any) => {
        // IMPORTANT:
        // Sanity array item key
        const leaveKey = leave?._key

        // Ignore invalid leave objects
        if (!leaveKey) {
          console.warn(
            'Leave found without _key:',
            JSON.stringify(leave, null, 2)
          )
          return
        }

        allLeaves.push({
          // Keep both names for safety
          _key: leaveKey,
          leaveKey: leaveKey,

          employeeName:
            employee.personalDetails?.fullName ||
            leave.employeeName ||
            '',

          employeeId:
            employee.personalDetails?.employeeId ||
            leave.employeeId ||
            '',

          department:
            employee.personalDetails?.department ||
            leave.department ||
            '',

          position:
            employee.personalDetails?.position ||
            leave.position ||
            '',

          leaveType: leave.leaveType || '',
          fromDate: leave.fromDate || '',
          toDate: leave.toDate || '',
          totalDays: leave.totalDays || 0,
          reason: leave.reason || '',
          status: leave.status || 'pending',
          appliedOn: leave.appliedOn || '',
          adminRemarks: leave.adminRemarks || '',
          updatedOn: leave.updatedOn || '',

          // VERY IMPORTANT
          employeeRef: employee._id
        })
      })
    })

    // =====================================================
    // Filters
    // =====================================================

    if (status) {
      allLeaves = allLeaves.filter(
        (leave) => leave.status === status
      )
    }

    if (department) {
      allLeaves = allLeaves.filter(
        (leave) => leave.department === department
      )
    }

    if (fromDate) {
      allLeaves = allLeaves.filter(
        (leave) =>
          leave.fromDate &&
          leave.fromDate >= fromDate
      )
    }

    if (toDate) {
      allLeaves = allLeaves.filter(
        (leave) =>
          leave.toDate &&
          leave.toDate <= toDate
      )
    }

    // Newest first
    allLeaves.sort((a, b) => {
      const dateA = a.appliedOn
        ? new Date(a.appliedOn).getTime()
        : 0

      const dateB = b.appliedOn
        ? new Date(b.appliedOn).getTime()
        : 0

      return dateB - dateA
    })

    console.log(
      'FINAL LEAVES:',
      allLeaves.map((leave) => ({
        leaveKey: leave.leaveKey,
        employeeRef: leave.employeeRef,
        employeeName: leave.employeeName
      }))
    )

    return NextResponse.json({
      success: true,
      data: allLeaves,
      total: allLeaves.length
    })
  } catch (error) {
    console.error('GET leaves error:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch leaves'
      },
      { status: 500 }
    )
  }
}

// =====================================================
// PUT - Update leave status
// =====================================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('PUT body:', body)

    const {
      leaveKey,
      employeeId,
      status,
      reason
    } = body

    // Validate
    if (!leaveKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing leaveKey'
        },
        { status: 400 }
      )
    }

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing employeeId'
        },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing status'
        },
        { status: 400 }
      )
    }

    const validStatuses = [
      'pending',
      'approved',
      'rejected',
      'cancelled'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Allowed: ${validStatuses.join(', ')}`
        },
        { status: 400 }
      )
    }

    // Fetch employee
    const employee = await client.fetch(
      `
        *[_type == "employee" && _id == $employeeId][0] {
          _id,
          leaves[]
        }
      `,
      { employeeId }
    )

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found'
        },
        { status: 404 }
      )
    }

    const leaves = Array.isArray(employee.leaves)
      ? employee.leaves
      : []

    console.log(
      'Available leave keys:',
      leaves.map((leave: any) => leave?._key)
    )

    console.log(
      'Requested leave key:',
      leaveKey
    )

    // Find leave
    const leaveIndex = leaves.findIndex(
      (leave: any) =>
        leave?._key === leaveKey
    )

    if (leaveIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Leave not found',
          requestedLeaveKey: leaveKey,
          availableKeys: leaves.map(
            (leave: any) => leave?._key
          )
        },
        { status: 404 }
      )
    }

    // Update
    const updatedLeaves = [...leaves]

    updatedLeaves[leaveIndex] = {
      ...updatedLeaves[leaveIndex],
      status,
      ...(reason
        ? { adminRemarks: reason }
        : {}),
      updatedOn: new Date().toISOString()
    }

    // Save - Use the client with token
    await client
      .patch(employeeId)
      .set({
        leaves: updatedLeaves
      })
      .commit()

    console.log(
      'Leave updated successfully:',
      leaveKey
    )

    return NextResponse.json({
      success: true,
      message: `Leave ${status} successfully`,
      data: {
        leaveKey,
        employeeId,
        status
      }
    })
  } catch (error) {
    console.error('PUT leaves error:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update leave'
      },
      { status: 500 }
    )
  }
}

// =====================================================
// DELETE - Delete leave
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const searchParams =
      request.nextUrl.searchParams

    const leaveKey =
      searchParams.get('leaveKey')

    const employeeId =
      searchParams.get('employeeId')

    console.log('DELETE:', {
      leaveKey,
      employeeId
    })

    if (!leaveKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing leaveKey'
        },
        { status: 400 }
      )
    }

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing employeeId'
        },
        { status: 400 }
      )
    }

    // Fetch employee
    const employee = await client.fetch(
      `
        *[_type == "employee" && _id == $employeeId][0] {
          _id,
          leaves[]
        }
      `,
      { employeeId }
    )

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found'
        },
        { status: 404 }
      )
    }

    const leaves = Array.isArray(employee.leaves)
      ? employee.leaves
      : []

    const exists = leaves.some(
      (leave: any) =>
        leave?._key === leaveKey
    )

    if (!exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Leave not found',
          requestedLeaveKey: leaveKey,
          availableKeys: leaves.map(
            (leave: any) => leave?._key
          )
        },
        { status: 404 }
      )
    }

    // Remove leave
    const updatedLeaves = leaves.filter(
      (leave: any) =>
        leave?._key !== leaveKey
    )

    // Save - Use the client with token
    await client
      .patch(employeeId)
      .set({
        leaves: updatedLeaves
      })
      .commit()

    console.log(
      'Leave deleted successfully:',
      leaveKey
    )

    return NextResponse.json({
      success: true,
      message: 'Leave deleted successfully'
    })
  } catch (error) {
    console.error('DELETE leaves error:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete leave'
      },
      { status: 500 }
    )
  }
}