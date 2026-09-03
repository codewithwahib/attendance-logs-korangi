import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// =============================================
// FORCE DYNAMIC RENDERING - REQUIRED FOR API ROUTES THAT USE request.url
// =============================================
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const branchesParam = searchParams.get('branches')
    const employee = searchParams.get('employee')

    // Parse branches
    let selectedBranches: string[] = []
    if (branchesParam) {
      selectedBranches = branchesParam.split(',').filter(b => b.trim() !== '')
    }

    // =============================================
    // FETCH FROM MAIN TABLE (K BRANCH)
    // =============================================
    let mainQuery = supabase
      .from('attendance_logs')
      .select('*')

    if (fromDate) {
      const fromDateObj = new Date(fromDate)
      fromDateObj.setHours(0, 0, 0, 0)
      mainQuery = mainQuery.gte('timestamp', fromDateObj.toISOString())
    }

    if (toDate) {
      const toDateObj = new Date(toDate)
      toDateObj.setHours(23, 59, 59, 999)
      mainQuery = mainQuery.lte('timestamp', toDateObj.toISOString())
    }

    if (selectedBranches.length > 0) {
      mainQuery = mainQuery.in('branch_code', selectedBranches)
    }

    if (employee && employee !== 'all') {
      mainQuery = mainQuery.eq('user_id', employee)
    }

    mainQuery = mainQuery.order('timestamp', { ascending: true })

    // =============================================
    // FETCH FROM PQ TABLE (PQ BRANCH)
    // =============================================
    let pqQuery = supabase
      .from('pq_attendance_logs')
      .select('*')

    if (fromDate) {
      const fromDateObj = new Date(fromDate)
      fromDateObj.setHours(0, 0, 0, 0)
      pqQuery = pqQuery.gte('timestamp', fromDateObj.toISOString())
    }

    if (toDate) {
      const toDateObj = new Date(toDate)
      toDateObj.setHours(23, 59, 59, 999)
      pqQuery = pqQuery.lte('timestamp', toDateObj.toISOString())
    }

    if (selectedBranches.length > 0) {
      pqQuery = pqQuery.in('branch_code', selectedBranches)
    }

    if (employee && employee !== 'all') {
      pqQuery = pqQuery.eq('user_id', employee)
    }

    pqQuery = pqQuery.order('timestamp', { ascending: true })

    // =============================================
    // EXECUTE BOTH QUERIES IN PARALLEL
    // =============================================
    const [mainResult, pqResult] = await Promise.all([
      mainQuery,
      pqQuery
    ])

    // Handle errors
    if (mainResult.error) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Main Table Error: ${mainResult.error.message}` 
        },
        { status: 500 }
      )
    }

    if (pqResult.error) {
      return NextResponse.json(
        { 
          success: false, 
          error: `PQ Table Error: ${pqResult.error.message}` 
        },
        { status: 500 }
      )
    }

    const mainData = mainResult.data || []
    const pqData = pqResult.data || []

    // =============================================
    // ADD SOURCE TAG TO EACH RECORD
    // =============================================
    const mainWithSource = mainData.map((item: any) => ({ 
      ...item, 
      source: 'K' 
    }))

    const pqWithSource = pqData.map((item: any) => ({ 
      ...item, 
      source: 'PQ' 
    }))

    // =============================================
    // MERGE BOTH DATASETS
    // =============================================
    const allData = [...mainWithSource, ...pqWithSource]

    // Sort by timestamp (oldest first)
    allData.sort((a, b) => {
      try {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      } catch {
        return 0
      }
    })

    return NextResponse.json({
      success: true,
      data: allData,
      total: allData.length,
      mainCount: mainData.length,
      pqCount: pqData.length
    })

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch attendance logs'
      },
      { status: 500 }
    )
  }
}