
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { getDb, getAdmin } from '@/lib/firebaseAdmin'

function ensureDeveloper(decoded: any){ if (decoded?.role !== 'developer') throw new Error('Forbidden') }

export async function GET(req: NextRequest){
  try{ const db = getDb(); const qs = await db.collection('candidates').get(); return NextResponse.json(qs.docs.map(d=>({ id:d.id, ...d.data() }))) }catch(e:any){ return NextResponse.json({ error:e.message }, { status: 400 }) }
}

export async function POST(req: NextRequest){
  try{
    const authHeader = req.headers.get('Authorization'); if(!authHeader) return NextResponse.json({ error:'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ',''); const admin = getAdmin(); const decoded = await admin.verifyIdToken(token); ensureDeveloper(decoded)
    const db = getDb(); const body = await req.json(); const ref = await db.collection('candidates').add({ name: body.name, photoUrl: body.photoUrl || '', active: true, createdAt: new Date() });
    return NextResponse.json({ id: ref.id })
  }catch(e:any){ return NextResponse.json({ error:e.message }, { status: 400 }) }
}

export async function PUT(req: NextRequest){
  try{
    const authHeader = req.headers.get('Authorization'); if(!authHeader) return NextResponse.json({ error:'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ',''); const admin = getAdmin(); const decoded = await admin.verifyIdToken(token); ensureDeveloper(decoded)
    const db = getDb(); const body = await req.json(); if(!body.id) return NextResponse.json({ error:'id required' }, { status: 400 })
    await db.collection('candidates').doc(body.id).set({ ...body, updatedAt: new Date() }, { merge: true })
    return NextResponse.json({ ok:true })
  }catch(e:any){ return NextResponse.json({ error:e.message }, { status: 400 }) }
}
