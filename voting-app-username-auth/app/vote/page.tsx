
'use client'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebaseClient'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import { getRoleFromIdToken } from '@/lib/auth'

const REQUIRED = parseInt(process.env.NEXT_PUBLIC_REQUIRED_COUNT || '9', 10)

export default function VotePage(){
  const [user, setUser] = useState<any>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState('')

  useEffect(()=>{
    return onAuthStateChanged(auth, async (u)=>{
      if(!u) { window.location.href = '/'; return }
      const role = await getRoleFromIdToken(u)
      if (role !== 'voter') { window.location.href = '/admin'; return }
      setUser(u)
    })
  },[])

  useEffect(()=>{
    (async()=>{
      const qs = await getDocs(query(collection(db,'candidates'), where('active','==', true)))
      setCandidates(qs.docs.map(d=>({id:d.id, ...d.data()})))
    })()
  },[])

  function toggle(id:string){
    setSelected((prev)=>{
      const has = prev.includes(id)
      if(has) return prev.filter(x=>x!==id)
      if(prev.length >= REQUIRED) return prev
      return [...prev, id]
    })
  }

  async function submit(){
    if(selected.length !== REQUIRED){ setMessage(`Please select exactly ${REQUIRED}.`); return }
    setMessage('Submitting...')
    const token = await user.getIdToken()
    const res = await fetch('/api/vote', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${token}`}, body: JSON.stringify({ selectedCandidateIds: selected }) })
    const data = await res.json()
    if(res.ok){ setMessage('Vote submitted successfully!') }
    else setMessage(data.error || 'Failed')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Select exactly {REQUIRED}</h1>
        <span className={`px-3 py-1 rounded-full text-sm border ${selected.length===REQUIRED? 'bg-green-100 border-green-200':'bg-gray-100 border-gray-200'}`}>
          {selected.length} / {REQUIRED}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {candidates.map(c=> (
          <button key={c.id} onClick={()=>toggle(c.id)} className={`border rounded-2xl overflow-hidden text-left transition ring-2 ${selected.includes(c.id)?'ring-black':'ring-transparent'}`}>
            {c.photoUrl && <img src={c.photoUrl} alt={c.name} className="w-full h-40 object-cover" />}
            <div className="p-4">
              <div className="font-medium">{c.name}</div>
              <div className="mt-2 text-sm">
                <input type="checkbox" checked={selected.includes(c.id)} readOnly /> Select
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white/80 backdrop-blur p-4 mt-6 border-t flex items-center gap-3">
        <button onClick={submit} disabled={selected.length !== REQUIRED} className={`px-4 py-3 rounded-xl text-white ${selected.length===REQUIRED? 'bg-black':'bg-gray-400 cursor-not-allowed'}`}>
          Submit Vote
        </button>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
}
