// src/sanity/lib/client.ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published',
  // Add token for write operations
  token: process.env.SANITY_API_TOKEN, // This should be set in your .env.local
})