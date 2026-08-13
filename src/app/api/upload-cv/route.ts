// app/api/upload-cv/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client' // Changed from serverClient to client

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Convert File to Buffer for Sanity upload
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Upload to Sanity
    const asset = await client.assets.upload('file', buffer, { // Changed from serverClient to client
      filename: file.name,
      contentType: file.type
    })

    console.log('CV uploaded successfully:', asset)

    return NextResponse.json({
      success: true,
      message: 'CV uploaded successfully',
      assetId: asset._id,
      asset: asset
    })

  } catch (error) {
    console.error('Error uploading CV:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload CV' 
      },
      { status: 500 }
    )
  }
}