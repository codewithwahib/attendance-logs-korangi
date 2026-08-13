// app/api/leaves/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ==========================================
// SANITY CLIENT
// ==========================================

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-08-08',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN!,
});

// ==========================================
// GENERATE UNIQUE KEY
// ==========================================

const generateUniqueKey = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// ==========================================
// GET EMPLOYEE
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const employeeId = request.nextUrl.searchParams.get('employeeId')?.trim() || '';

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const query = `*[_type == "employee" && personalDetails.employeeId == $employeeId][0]{
      _id,
      personalDetails {
        employeeId,
        fullName,
        department,
        position
      }
    }`;

    const employee = await sanityClient.fetch(query, { employeeId });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: employee },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/leaves ERROR:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load employee' },
      { status: 500 }
    );
  }
}

// ==========================================
// POST LEAVE REQUEST
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const employeeId = typeof body.employeeId === 'string' ? body.employeeId.trim() : '';
    const employeeName = typeof body.employeeName === 'string' ? body.employeeName.trim() : '';
    const department = typeof body.department === 'string' ? body.department.trim() : '';
    const position = typeof body.position === 'string' ? body.position.trim() : '';
    const leaveType = typeof body.leaveType === 'string' ? body.leaveType.trim() : '';
    const fromDate = typeof body.fromDate === 'string' ? body.fromDate : '';
    const toDate = typeof body.toDate === 'string' ? body.toDate : '';
    const totalDays = typeof body.totalDays === 'number' ? body.totalDays : 0;
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

    // ========================================
    // VALIDATION
    // ========================================

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    if (!employeeName) {
      return NextResponse.json(
        { success: false, error: 'Employee name is required' },
        { status: 400 }
      );
    }

    if (!leaveType) {
      return NextResponse.json(
        { success: false, error: 'Leave type is required' },
        { status: 400 }
      );
    }

    if (!fromDate) {
      return NextResponse.json(
        { success: false, error: 'From date is required' },
        { status: 400 }
      );
    }

    if (!toDate) {
      return NextResponse.json(
        { success: false, error: 'To date is required' },
        { status: 400 }
      );
    }

    if (totalDays <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid leave dates' },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Reason is required' },
        { status: 400 }
      );
    }

    if (reason.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Reason must be at least 20 characters' },
        { status: 400 }
      );
    }

    // ========================================
    // VERIFY EMPLOYEE
    // ========================================

    const employeeQuery = `*[_type == "employee" && personalDetails.employeeId == $employeeId][0]{
      _id,
      personalDetails {
        employeeId,
        fullName,
        department,
        position
      }
    }`;

    const employee = await sanityClient.fetch(employeeQuery, { employeeId });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // ========================================
    // CREATE LEAVE REQUEST WITH UNIQUE _key
    // ========================================

    const leave = {
      _key: generateUniqueKey(), // <-- IMPORTANT: This fixes the "Missing keys" error
      employeeName: employeeName || employee.personalDetails?.fullName || '',
      employeeId: employee.personalDetails?.employeeId || employeeId,
      department: department || employee.personalDetails?.department || '',
      position: position || employee.personalDetails?.position || '',
      leaveType,
      fromDate,
      toDate,
      totalDays,
      reason,
      status: 'pending',
      appliedOn: new Date().toISOString(),
    };

    console.log('Creating leave with _key:', leave._key);

    // ========================================
    // PATCH EMPLOYEE
    // ADD LEAVE TO LEAVES ARRAY
    // ========================================

    const updatedEmployee = await sanityClient
      .patch(employee._id)
      .setIfMissing({ leaves: [] })
      .append('leaves', [leave])
      .commit();

    // ========================================
    // SUCCESS
    // ========================================

    return NextResponse.json(
      {
        success: true,
        message: 'Leave request submitted successfully',
        data: {
          employeeId,
          leave,
          employee: updatedEmployee._id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/leaves ERROR:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to submit leave request' },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT - Update Leave Status
// ==========================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { leaveKey, employeeId, status, reason } = body;

    console.log('PUT request:', { leaveKey, employeeId, status, reason });

    if (!leaveKey) {
      return NextResponse.json(
        { success: false, error: 'Leave key is required' },
        { status: 400 }
      );
    }

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Find employee by _id
    const employee = await sanityClient.fetch(
      `*[_type == "employee" && _id == $employeeId][0]`,
      { employeeId }
    );

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Find the leave by _key
    const leaves = employee.leaves || [];
    const leaveIndex = leaves.findIndex((leave: any) => leave._key === leaveKey);

    if (leaveIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Leave not found' },
        { status: 404 }
      );
    }

    // Update the leave
    const updatedLeave = {
      ...leaves[leaveIndex],
      status,
      adminRemarks: reason || '',
      updatedOn: new Date().toISOString()
    };

    const updatedLeaves = [...leaves];
    updatedLeaves[leaveIndex] = updatedLeave;

    const result = await sanityClient
      .patch(employeeId)
      .set({ leaves: updatedLeaves })
      .commit();

    console.log('Leave updated successfully:', result);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Leave ${status} successfully`
    });

  } catch (error) {
    console.error('PUT /api/leaves ERROR:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update leave' },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE - Delete Leave Request
// ==========================================

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leaveKey = searchParams.get('leaveKey');
    const employeeId = searchParams.get('employeeId');

    console.log('DELETE request:', { leaveKey, employeeId });

    if (!leaveKey) {
      return NextResponse.json(
        { success: false, error: 'Leave key is required' },
        { status: 400 }
      );
    }

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Find employee by _id
    const employee = await sanityClient.fetch(
      `*[_type == "employee" && _id == $employeeId][0]`,
      { employeeId }
    );

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Remove the leave
    const leaves = employee.leaves || [];
    const updatedLeaves = leaves.filter((leave: any) => leave._key !== leaveKey);

    const result = await sanityClient
      .patch(employeeId)
      .set({ leaves: updatedLeaves })
      .commit();

    console.log('Leave deleted successfully:', result);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Leave deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/leaves ERROR:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete leave' },
      { status: 500 }
    );
  }
}