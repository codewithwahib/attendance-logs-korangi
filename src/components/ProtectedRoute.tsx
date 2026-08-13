'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Roboto } from 'next/font/google';
import { Loader } from 'lucide-react';


const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedUser: 'hr'
}

export default function ProtectedRoute({
  children,
  allowedUser,
}: ProtectedRouteProps) {
  const router = useRouter()

  const {
    user,
    loading,
  } = useAuth()

  useEffect(() => {
    if (loading) {
      return
    }

    if (!user) {
      router.replace('/login')
      return
    }

    if (user.role !== allowedUser) {
      router.replace('/unauthorized')
      return
    }
  }, [
    user,
    loading,
    allowedUser,
    router,
  ])

  if (loading) {
    return (
      <>
        <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${roboto.className}`}>
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-[#0071BD] mx-auto mb-4" />
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null
  }

  if (user.role !== allowedUser) {
    return null
  }

  return <>{children}</>
}