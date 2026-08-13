import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const username = body.username?.trim()
    const password = body.password

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username and password are required',
        },
        {
          status: 400,
        }
      )
    }

    const user = await client.fetch(
      `*[
        _type == "login" &&
        username == $username &&
        password == $password
      ][0]{
        username
      }`,
      {
        username,
        password,
      }
    )

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password',
        },
        {
          status: 401,
        }
      )
    }

    return NextResponse.json({
      success: true,
      username: user.username,
      role: 'hr',
    })
  } catch (error) {
    console.error('Login error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
      },
      {
        status: 500,
      }
    )
  }
}