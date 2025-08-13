
'use client'
import { useState } from 'react'

const SETUP_ENABLED = process.env.NEXT_PUBLIC_SETUP_MODE === 'true'

export default function Setup(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [secret, setSecret] = useState('')
  const [msg, setMsg] = useState('')

  if (!SETUP_ENABLED){
    return <div className="p-6 max-w-xl mx-auto">Setup is disabled.</div>
  }

  async function create(){
    setMsg('Creating...')
    const res = await fetch('/api/setup', { method:'POST', headers: { 'Content-Type':'application/json', 'x-setup-secret': secret }, body: JSON.stringify({ username, password }) })
    const data = await res.json()
    if(res.ok) setMsg('Developer created. Remove setup mode and redeploy.')
    else setMsg(data.error || 'Failed')
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Initial Setup</h1>
      <input className="border p-2 rounded w-full" placeholder="New developer username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input className="border p-2 rounded w-full" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <input className="border p-2 rounded w-full" type="password" placeholder="Setup secret" value={secret} onChange={e=>setSecret(e.target.value)} />
      <button className="bg-black text-white px-4 py-2 rounded w-full" onClick={create}>Create Developer</button>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  )
}
