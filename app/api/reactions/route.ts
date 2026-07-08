import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabaseConfig() {
  if (!supabaseUrl || !serviceRoleKey) return null

  return {
    url: supabaseUrl,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  }
}

function isValidSlug(slug: unknown): slug is string {
  return (
    typeof slug === 'string' &&
    slug.length > 0 &&
    slug.length <= 200 &&
    /^[a-z0-9][a-z0-9-/]*$/i.test(slug)
  )
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')

  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const supabase = getSupabaseConfig()

  if (!supabase) {
    return NextResponse.json({ clapCount: 0, configured: false })
  }

  const response = await fetch(
    `${supabase.url}/rest/v1/post_reactions?post_slug=eq.${encodeURIComponent(
      slug
    )}&select=clap_count`,
    {
      headers: supabase.headers,
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to load reactions' }, { status: response.status })
  }

  const rows = (await response.json()) as { clap_count: number }[]

  return NextResponse.json({ clapCount: rows[0]?.clap_count ?? 0, configured: true })
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    slug?: unknown
    delta?: unknown
  } | null
  const slug = body?.slug
  const delta = body?.delta

  if (
    !isValidSlug(slug) ||
    typeof delta !== 'number' ||
    !Number.isInteger(delta) ||
    delta < 1 ||
    delta > 10
  ) {
    return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 })
  }

  const supabase = getSupabaseConfig()

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 })
  }

  const response = await fetch(`${supabase.url}/rest/v1/rpc/increment_post_claps`, {
    method: 'POST',
    headers: {
      ...supabase.headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_post_slug: slug, p_delta: delta }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to save reaction' }, { status: response.status })
  }

  const clapCount = (await response.json()) as number

  return NextResponse.json({ clapCount })
}
