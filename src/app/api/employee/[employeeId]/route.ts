// src/app/api/employee/[employeeId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    const employeeId = params.employeeId

    console.log('Fetching employee with ID:', employeeId)

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee ID is required',
        },
        { status: 400 }
      )
    }

    const employee = await client.fetch(
      `*[
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
        checkIn[] {
          _key,
          time,
          location
        },
        checkOut[] {
          _key,
          time,
          location
        }
      }`,
      {
        employeeId,
      }
    )

    console.log('Employee found:', employee ? 'Yes' : 'No')

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: employee,
    })
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch employee',
      },
      { status: 500 }
    )
  }
}