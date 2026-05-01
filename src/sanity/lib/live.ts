// Live preview functionality is disabled for Next.js 14 compatibility.
// To enable this feature, please upgrade to Next.js 15+ and next-sanity v11+.
// See: https://github.com/sanity-io/next-sanity#live-content-api

// Import your client for potential future use
import { client } from './client'

// Create placeholder exports that won't break your app
// This allows you to keep the imports in your layout without errors
export const sanityFetch = async ({ query, params = {} }: { query: string; params?: any }) => {
  // Fallback to a basic fetch using your client
  // This keeps content fetching working without live updates
  return await client.fetch(query, params)
}

// A placeholder component that renders nothing
export const SanityLive = () => {
  // Optional: log a warning in development to remind you this is disabled
  if (process.env.NODE_ENV === 'development') {
    console.warn('SanityLive is disabled. Enable by upgrading to Next.js 15+ and next-sanity v11+')
  }
  return null
}