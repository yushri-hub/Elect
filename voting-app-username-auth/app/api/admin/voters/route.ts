
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { getDb, getAdmin } from '@/lib/firebaseAdmin'
import { hash } from 'bcryptjs'

function ensureDeveloper(decoded: any){
  if (decoded?.role !== 'developer') throw new Error('Forbidden')
}

function randomPassword(len=10){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let s=''; for(let i=0;i<len;i++){ s += chars[Math.floor(Math.random()*chars.length)] }
  return s
}

export async function POST(req: NextRequest){
  try{
    const authHeader = req.headers.get('Authorization')
    if(!authHeader) return NextResponse.json({ error:'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ','')
    const admin = getAdmin()
    const decoded = await admin.verifyIdToken(token)
    ensureDeveloper(decoded)

    const { username, name, allowedFrom, allowedUntil, role } = await req.json()
    if(!username) return NextResponse.json({ error:'username required' }, { status: 400 })

    const db = getDb()
    const exists = await db.collection('voters').where('username','==', username).limit(1).get()
    if (!exists.empty) return NextResponse.json({ error:'Username already exists' }, { status: 400 })

    const passwordPlain = randomPassword()
    const passwordHash = await hash(passwordPlain, 10)

    const uid = username
    await db.collection('voters').doc(uid).set({
      username,
      name: name || username,
      role: role === 'developer' ? 'developer' : 'voter',
      hasVoted: false,
      allowedFrom: allowedFrom ? new Date(allowedFrom) : null,
      allowedUntil: allowedUntil ? new Date(allowedUntil) : null,
      passwordHash
    })

    return NextResponse.json({ ok:true, username, password: passwordPlain })
  }catch(e:any){
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 })
  }
}
