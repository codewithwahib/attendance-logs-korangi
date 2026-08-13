import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      employeeId,
      location,
      latitude,
      longitude,
    } = body

    console.log('==============================')
    console.log('CHECK-IN REQUEST')
    console.log('Employee ID:', employeeId)
    console.log('Location:', location)
    console.log('Latitude:', latitude)
    console.log('Longitude:', longitude)
    console.log('==============================')

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee ID is required',
        },
        { status: 400 }
      )
    }

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          error: 'Location is required',
        },
        { status: 400 }
      )
    }

    // Find employee
    const employee = await client.fetch(
      `*[
        _type == "employee" &&
        personalDetails.employeeId == $employeeId
      ][0]{
        _id,
        personalDetails,
        checkIn
      }`,
      {
        employeeId,
      }
    )

    console.log('FOUND EMPLOYEE:')
    console.log(employee)

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: `Employee not found: ${employeeId}`,
        },
        { status: 404 }
      )
    }

    // Create check-in record
    const checkInRecord = {
      _type: 'checkInRecord',
      _key: `check-in-${Date.now()}`,
      time: new Date().toISOString(),
      location: location,
    }

    console.log('NEW CHECK-IN RECORD:')
    console.log(checkInRecord)

    // Save to Sanity
    const updatedEmployee = await client
      .patch(employee._id)
      .setIfMissing({
        checkIn: [],
      })
      .append('checkIn', [checkInRecord])
      .commit()

    console.log('CHECK-IN COMMIT SUCCESS')
    console.log(updatedEmployee)

    return NextResponse.json({
      success: true,
      message: 'Check-in saved successfully',
      data: {
        employeeId,
        employeeDocumentId: employee._id,
        record: checkInRecord,
        latitude,
        longitude,
      },
    })
  } catch (error) {
    console.error('CHECK-IN ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save check-in',
      },
      { status: 500 }
    )
  }
}