import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ==========================================
// SANITY SERVER CLIENT
// ==========================================

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    'production',
  apiVersion: '2026-08-08',

  // Always get fresh data
  useCdn: false,

  // Server-side Sanity token
  token: process.env.SANITY_API_TOKEN!,
});

// ==========================================
// GET EMPLOYEE
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    const employeeId =
      request.nextUrl.searchParams
        .get('employeeId')
        ?.trim() || '';

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee ID is required',
        },
        { status: 400 }
      );
    }

    const query = `*[
      _type == "employee" &&
      personalDetails.employeeId == $employeeId
    ][0]{
      _id,
      personalDetails {
        employeeId,
        fullName,
        department,
        position
      },
      username
    }`;

    const employee =
      await sanityClient.fetch(
        query,
        {
          employeeId,
        }
      );

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: employee,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'GET /api/settings ERROR:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load employee settings',
      },
      { status: 500 }
    );
  }
}

// ==========================================
// UPDATE USERNAME + PASSWORD
// NO CURRENT PASSWORD REQUIRED
// ==========================================

export async function PUT(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const employeeId =
      typeof body.employeeId === 'string'
        ? body.employeeId.trim()
        : '';

    const username =
      typeof body.username === 'string'
        ? body.username.trim()
        : '';

    const newPassword =
      typeof body.newPassword === 'string'
        ? body.newPassword
        : '';

    // ======================================
    // VALIDATION
    // ======================================

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee ID is required',
        },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username is required',
        },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password is required',
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error:
            'New password must be at least 6 characters',
        },
        { status: 400 }
      );
    }

    // ======================================
    // FIND EMPLOYEE
    // ======================================

    const employeeQuery = `*[
      _type == "employee" &&
      personalDetails.employeeId == $employeeId
    ][0]{
      _id,
      personalDetails {
        employeeId,
        fullName,
        department,
        position
      },
      username
    }`;

    const employee =
      await sanityClient.fetch(
        employeeQuery,
        {
          employeeId,
        }
      );

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
        },
        { status: 404 }
      );
    }

    // ======================================
    // CHECK USERNAME DUPLICATE
    // ======================================

    const usernameQuery = `count(*[
      _type == "employee" &&
      username == $username &&
      personalDetails.employeeId != $employeeId
    ])`;

    const usernameCount =
      await sanityClient.fetch<number>(
        usernameQuery,
        {
          username,
          employeeId,
        }
      );

    if (usernameCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'This username is already in use',
        },
        { status: 409 }
      );
    }

    // ======================================
    // UPDATE SANITY
    // ======================================

    const updatedEmployee =
      await sanityClient
        .patch(employee._id)
        .set({
          username,
          password: newPassword,
        })
        .commit();

    // ======================================
    // SUCCESS
    // ======================================

    return NextResponse.json(
      {
        success: true,
        message:
          'Username and password updated successfully',

        data: {
          _id: updatedEmployee._id,

          personalDetails:
            updatedEmployee.personalDetails,

          username:
            updatedEmployee.username,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'PUT /api/settings ERROR:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update credentials',
      },
      { status: 500 }
    );
  }
}