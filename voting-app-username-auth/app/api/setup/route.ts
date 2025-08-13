
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firebaseAdmin'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest){
  try{
    const secretHeader = req.headers.get('x-setup-secret')
    const secret = process.env.INITIAL_SETUP_SECRET
    if (!secret || !secretHeader || secretHeader !== secret){
      return NextResponse.json({ error:'Forbidden' }, { status: 403 })
    }

    const { username, password } = await req.json()
    if(!username || !password) return NextResponse.json({ error:'username and password required' }, { status: 400 })

    const db = getDb()
    const exists = await db.collection('voters').where('username','==', username).limit(1).get()
    if (!exists.empty) return NextResponse.json({ error:'Username already exists' }, { status: 400 })

    const passwordHash = await hash(password, 10)
    const uid = username

    await db.collection('voters').doc(uid).set({
      username,
      name: username,
      role: 'developer',
      hasVoted: false,
      allowedFrom: null,
      allowedUntil: null,
      passwordHash
    })

    return NextResponse.json({ ok:true, created: username })
  }catch(e:any){
    return NextResponse.json({ error: e.message || 'Setup failed' }, { status: 400 })
  }
}
