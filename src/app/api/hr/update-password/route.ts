import { NextRequest, NextResponse } from 'next/server'
import { client, serverClient } from '@/sanity/lib/client'

export async function GET() {
  try {
    const login = await client.fetch(
      `*[_type == "login"][0]{
        _id,
        username,
        password
      }`
    )

    return NextResponse.json({
      success: true,
      data: login ? [login] : [],
    })
  } catch (error) {
    console.error('GET login error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch login data',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      adminId,
      username,
      newPassword,
      confirmPassword,
    } = body

    if (!adminId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Login ID is required',
        },
        { status: 400 }
      )
    }

    if (!newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password is required',
        },
        { status: 400 }
      )
    }

    if (!confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Confirm password is required',
        },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Passwords do not match',
        },
        { status: 400 }
      )
    }

    const currentLogin = await serverClient.fetch(
      `*[_type == "login" && _id == $id][0]{
        _id,
        username
      }`,
      {
        id: adminId,
      }
    )

    if (!currentLogin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Login document not found',
        },
        { status: 404 }
      )
    }

    const updatedLogin = await serverClient
      .patch(adminId)
      .set({
        username: username || currentLogin.username,
        password: newPassword,
      })
      .commit()

    return NextResponse.json({
      success: true,
      data: updatedLogin,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('PUT password error:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update password',
      },
      { status: 500 }
    )
  }
}

