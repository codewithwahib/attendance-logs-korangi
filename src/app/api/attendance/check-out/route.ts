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
    console.log('CHECK-OUT REQUEST')
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
        checkOut
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

    // Create check-out record
    const checkOutRecord = {
      _type: 'checkOutRecord',
      _key: `check-out-${Date.now()}`,
      time: new Date().toISOString(),
      location: location,
    }

    console.log('NEW CHECK-OUT RECORD:')
    console.log(checkOutRecord)

    // Save to Sanity
    const updatedEmployee = await client
      .patch(employee._id)
      .setIfMissing({
        checkOut: [],
      })
      .append('checkOut', [checkOutRecord])
      .commit()

    console.log('CHECK-OUT COMMIT SUCCESS')
    console.log(updatedEmployee)

    return NextResponse.json({
      success: true,
      message: 'Check-out saved successfully',
      data: {
        employeeId,
        employeeDocumentId: employee._id,
        record: checkOutRecord,
        latitude,
        longitude,
      },
    })
  } catch (error) {
    console.error('CHECK-OUT ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save check-out',
      },
      { status: 500 }
    )
  }
}