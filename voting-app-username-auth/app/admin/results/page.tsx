
'use client'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebaseClient'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import { getRoleFromIdToken } from '@/lib/auth'

export default function Results(){
  const [rows, setRows] = useState<any[]>([])

  useEffect(()=>{ return onAuthStateChanged(auth, async (u)=>{ if(!u) window.location.href='/'; const role = await getRoleFromIdToken(u); if(role!=='developer') window.location.href='/'; }); },[])
  useEffect(()=>{ (async()=>{
    const cand = await getDocs(collection(db,'candidates'))
    const res = await Promise.all(cand.docs.map(async d=>{
      const r = await getDoc(doc(db,'results', d.id))
      return { name: d.data().name, count: r.exists()? (r.data() as any).count : 0 }
    }))
    setRows(res.sort((a,b)=> b.count - a.count))
  })() },[])

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Live Results (Developers only)</h1>
      <ul className="divide-y">
        {rows.map((r,i)=> (
          <li key={i} className="py-3 flex items-center justify-between">
            <div>{r.name}</div>
            <div className="font-mono">{r.count}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
