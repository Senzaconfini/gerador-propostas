import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: lead }, { data: proposta }] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).single(),
    supabase.from('propostas').select('*').eq('lead_id', id).order('created_at', { ascending: false }).limit(1).single(),
  ])
  return NextResponse.json({ lead: lead || null, proposta: proposta || null })
}
