
'use client'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebaseClient'
import { signInWithCustomToken, onAuthStateChanged } from 'firebase/auth'
import { getRoleFromIdToken } from '@/lib/auth'

export default function Home(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    return onAuthStateChanged(auth, async (u)=>{
      if (!u) return
      const role = await getRoleFromIdToken(u)
      if (role === 'developer') window.location.href = '/admin'
      else if (role === 'voter') window.location.href = '/vote'
    })
  },[])

  async function login(){
    setError(''); setLoading(true)
    try{
      const res = await fetch('/api/auth/login', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ username, password }) })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || 'Login failed')
      await signInWithCustomToken(auth, data.token)
    }catch(e:any){ setError(e.message) }
    finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center">Sign in</h1>
        <input className="w-full border p-3 rounded" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full border p-3 rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button onClick={login} disabled={loading} className="w-full bg-black text-white p-3 rounded">{loading? 'Signing in...':'Login'}</button>
      </div>
    </div>
  )
}
