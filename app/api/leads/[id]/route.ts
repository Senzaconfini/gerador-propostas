import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: lead }, { data: contexto }] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).single(),
    supabase.from('lead_contexto').select('*').eq('lead_id', id).single(),
  ])
  return NextResponse.json({ lead: lead || null, contexto: contexto || null })
}
