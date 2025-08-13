
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { getDb, getAdmin } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: NextRequest){
  try{
    const { selectedCandidateIds } = await req.json()
    if (!Array.isArray(selectedCandidateIds)) return NextResponse.json({ error:'Invalid payload' }, { status: 400 })
    const REQUIRED = parseInt(process.env.VOTING_REQUIRED_COUNT || process.env.NEXT_PUBLIC_REQUIRED_COUNT || '9', 10)
    if (selectedCandidateIds.length !== REQUIRED) return NextResponse.json({ error:`You must select exactly ${REQUIRED}` }, { status: 400 })

    const authHeader = req.headers.get('Authorization')
    if(!authHeader) return NextResponse.json({ error:'Unauthorized' }, { status: 401 })
    const idToken = authHeader.replace('Bearer ', '')

    const admin = getAdmin()
    const decoded = await admin.verifyIdToken(idToken)
    const uid = decoded.uid

    const db = getDb()
    const voterRef = db.collection('voters').doc(uid)
    const voteRef = db.collection('votes').doc(uid)

    await db.runTransaction(async (tx) => {
      const voterSnap = await tx.get(voterRef)
      if (!voterSnap.exists) throw new Error('Voter not found')
      const voter: any = voterSnap.data()

      const now = new Date()
      if (voter.allowedFrom?.toDate && voter.allowedFrom.toDate() > now) throw new Error('Voting has not started')
      if (voter.allowedUntil?.toDate && voter.allowedUntil.toDate() < now) throw new Error('Voting has ended')
      if (voter.hasVoted) throw new Error('You have already voted')

      const candidateRefs = selectedCandidateIds.map((id:string)=> db.collection('candidates').doc(id))
      const candSnaps = await Promise.all(candidateRefs.map(r=> tx.get(r)))
      if (candSnaps.some(s=> !s.exists || (s.data() as any)?.active === false)) throw new Error('One or more candidates are invalid')

      tx.set(voteRef, { voterId: uid, selectedCandidateIds, submittedAt: new Date(), receipt: Math.random().toString(36).slice(2,10).toUpperCase() }, { merge: false })
      tx.update(voterRef, { hasVoted: true })

      selectedCandidateIds.forEach((cid:string)=>{
        const resRef = db.collection('results').doc(cid)
        tx.set(resRef, { count: 0 }, { merge: true })
        tx.update(resRef, { count: FieldValue.increment(1) })
      })
    })

    return NextResponse.json({ ok:true })
  }catch(e:any){
    return NextResponse.json({ error: e.message || 'Vote failed' }, { status: 400 })
  }
}
