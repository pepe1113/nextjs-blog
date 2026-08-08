import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const OWNER_EMAIL = 'notify@peiwang.dev'
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type GuestbookEntryRow = {
  id: string
  parent_id: string | null
  author_name: string
  content: string
  created_at: string
}

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

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-vercel-forwarded-for') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

async function hashIp(ip: string) {
  const salt = process.env.GUESTBOOK_HASH_SALT || serviceRoleKey || ''
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function sendEmail({
  to,
  subject,
  text,
  idempotencyKey,
}: {
  to: string
  subject: string
  text: string
  idempotencyKey: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.GUESTBOOK_FROM_EMAIL

  if (!apiKey || !from) return false

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ from, to, subject, text }),
    })

    return response.ok
  } catch {
    return false
  }
}

export async function GET() {
  const supabase = getSupabaseConfig()

  if (!supabase) {
    return NextResponse.json({ entries: [], configured: false })
  }

  const url = new URL(`${supabase.url}/rest/v1/guestbook_entries`)
  url.searchParams.set('select', 'id,parent_id,author_name,content,created_at')
  url.searchParams.set('order', 'created_at.asc')
  // ponytail: render at most 200 entries; paginate when the guestbook actually exceeds this.
  url.searchParams.set('limit', '200')

  const response = await fetch(url, { headers: supabase.headers, cache: 'no-store' })

  if (!response.ok) {
    return NextResponse.json({ error: '留言載入失敗。' }, { status: response.status })
  }

  return NextResponse.json({
    entries: (await response.json()) as GuestbookEntryRow[],
    configured: true,
  })
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    parentId?: unknown
    name?: unknown
    email?: unknown
    content?: unknown
    website?: unknown
  } | null

  if (typeof body?.website === 'string' && body.website.trim()) {
    return NextResponse.json({ error: '留言送出失敗。' }, { status: 400 })
  }

  const parentId = body?.parentId === null ? null : body?.parentId
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const content = typeof body?.content === 'string' ? body.content.trim() : ''

  if (
    (parentId !== null && (typeof parentId !== 'string' || !uuidPattern.test(parentId))) ||
    !name ||
    name.length > 80 ||
    /[\r\n]/.test(name) ||
    (email && (!emailPattern.test(email) || email.length > 254)) ||
    !content ||
    content.length > 2000
  ) {
    return NextResponse.json({ error: '請確認名字、Email 與留言內容。' }, { status: 400 })
  }

  const supabase = getSupabaseConfig()

  if (!supabase) {
    return NextResponse.json({ error: '留言板尚未設定完成。' }, { status: 503 })
  }

  const response = await fetch(`${supabase.url}/rest/v1/rpc/create_guestbook_entry`, {
    method: 'POST',
    headers: {
      ...supabase.headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_parent_id: parentId,
      p_author_name: name,
      p_author_email: email || null,
      p_content: content,
      p_ip_hash: await hashIp(getClientIp(request)),
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    const isRateLimited = details.includes('Too many guestbook entries')
    return NextResponse.json(
      { error: isRateLimited ? '留言太頻繁，請稍後再試。' : '留言送出失敗，請稍後再試。' },
      { status: isRateLimited ? 429 : response.status }
    )
  }

  const [created] = (await response.json()) as {
    entry_id: string
    entry_created_at: string
    parent_author_name: string | null
    parent_author_email: string | null
  }[]

  if (!created) {
    return NextResponse.json({ error: '留言送出失敗，請稍後再試。' }, { status: 500 })
  }

  const entryUrl = new URL(`/guestbook/#${created.entry_id}`, request.nextUrl.origin).toString()
  const ownerEmail = sendEmail({
    to: OWNER_EMAIL,
    subject: `${name} 在 Pei.Blog 留言板留言了`,
    text: `留言者：${name}\nEmail：${email || '未提供'}\n\n${content}\n\n${entryUrl}`,
    idempotencyKey: `guestbook-${created.entry_id}-owner`,
  })
  const replyEmail =
    created.parent_author_email && created.parent_author_email !== OWNER_EMAIL
      ? sendEmail({
          to: created.parent_author_email,
          subject: `${name} 回覆了你在 Pei.Blog 留言板的留言`,
          text: `${created.parent_author_name ?? '你好'}，${name} 回覆了你的留言：\n\n${content}\n\n${entryUrl}`,
          idempotencyKey: `guestbook-${created.entry_id}-reply`,
        })
      : Promise.resolve(true)
  const notificationSent = (await Promise.all([ownerEmail, replyEmail])).every(Boolean)

  return NextResponse.json(
    {
      entry: {
        id: created.entry_id,
        parent_id: parentId,
        author_name: name,
        content,
        created_at: created.entry_created_at,
      } satisfies GuestbookEntryRow,
      notificationSent,
    },
    { status: 201 }
  )
}
