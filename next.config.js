/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',  // Disabled for Sanity Studio support
  images: {
    unoptimized: true,  // Required for static export (keep if needed for images)
  },
  trailingSlash: true,  // Adds trailing slashes to URLs
}

module.exports = nextConfig