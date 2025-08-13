
'use client'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebaseClient'
import { onAuthStateChanged } from 'firebase/auth'
import { getRoleFromIdToken } from '@/lib/auth'

export default function VotersAdmin(){
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [until, setUntil] = useState('')
  const [lastPassword, setLastPassword] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(()=>{ return onAuthStateChanged(auth, async (u)=>{ if(!u) window.location.href='/'; const role = await getRoleFromIdToken(u); if(role!=='developer') window.location.href='/'; }); },[])

  async function createVoter(){
    setMsg('Creating...')
    const token = await auth.currentUser?.getIdToken()
    const res = await fetch('/api/admin/voters', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ username, name, allowedFrom: from || null, allowedUntil: until || null, role:'voter' }) })
    const data = await res.json()
    if(res.ok){ setLastPassword(data.password); setMsg('Voter created. Share the username and password securely.') }
    else setMsg(data.error || 'Failed')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Voters</h1>
      <div className="grid grid-cols-2 gap-2">
        <input className="border p-2 rounded" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Allowed From (YYYY-MM-DDTHH:mm)" value={from} onChange={e=>setFrom(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Allowed Until (YYYY-MM-DDTHH:mm)" value={until} onChange={e=>setUntil(e.target.value)} />
      </div>
      <button className="bg-black text-white px-4 py-2 rounded" onClick={createVoter}>Add Voter</button>
      {msg && <p className="text-sm">{msg}</p>}
      {lastPassword && (
        <div className="p-3 border rounded bg-gray-50">
          <div className="text-sm">One-time password (copy now):</div>
          <div className="font-mono text-lg">{lastPassword}</div>
        </div>
      )}
    </div>
  )
}
