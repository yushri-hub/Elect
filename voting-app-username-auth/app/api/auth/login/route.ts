
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { getDb, getAdmin } from '@/lib/firebaseAdmin'
import { compare } from 'bcryptjs'

export async function POST(req: NextRequest){
  try{
    const { username, password } = await req.json()
    if(!username || !password) return NextResponse.json({ error:'Missing credentials' }, { status: 400 })

    const db = getDb()
    const snap = await db.collection('voters').where('username','==', username).limit(1).get()
    if (snap.empty) return NextResponse.json({ error:'Invalid username or password' }, { status: 401 })
    const doc = snap.docs[0]
    const data = doc.data() as any

    if (!data.passwordHash) return NextResponse.json({ error:'Account not set up' }, { status: 401 })
    const ok = await compare(password, data.passwordHash)
    if(!ok) return NextResponse.json({ error:'Invalid username or password' }, { status: 401 })

    const role = data.role || 'voter'
    if (role !== 'developer'){
      const now = new Date()
      if (data.allowedFrom && data.allowedFrom.toDate && data.allowedFrom.toDate() > now){
        return NextResponse.json({ error: 'Voting has not started' }, { status: 403 })
      }
      if (data.allowedUntil && data.allowedUntil.toDate && data.allowedUntil.toDate() < now){
        return NextResponse.json({ error: 'Voting has ended' }, { status: 403 })
      }
    }

    const auth = getAdmin()
    const uid = doc.id
    const token = await auth.createCustomToken(uid, { role })

    return NextResponse.json({ token })
  }catch(e:any){
    return NextResponse.json({ error: e.message || 'Login failed' }, { status: 400 })
  }
}
