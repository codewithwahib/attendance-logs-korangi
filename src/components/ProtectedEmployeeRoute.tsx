'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader } from 'lucide-react'

interface Props {
  children: React.ReactNode
  allowedRole?: 'employee' | 'hr'
}

export default function ProtectedEmployeeRoute({
  children,
  allowedRole = 'employee',
}: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    try {
      const data = localStorage.getItem('employeeData')

      if (!data) {
        router.replace('/')
        return
      }

      const user = JSON.parse(data)

      const employeeIdFromUrl = pathname.split('/').filter(Boolean).pop()

      if (
        allowedRole === 'employee' &&
        user.role === 'employee' &&
        user.employeeId === employeeIdFromUrl
      ) {
        setAuthorized(true)
      } else {
        router.replace(`/dashboard/${user.employeeId}`)
      }
    } catch (error) {
      localStorage.removeItem('employeeData')
      router.replace('/')
    } finally {
      setLoading(false)
    }
  }, [pathname, router, allowedRole])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="w-10 h-10 animate-spin text-[#0071BD]" />
      </div>
    )
  }

  if (!authorized) return null

  return <>{children}</>
}