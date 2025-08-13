
'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { auth } from '@/lib/firebaseClient'
import { onAuthStateChanged } from 'firebase/auth'
import { getRoleFromIdToken } from '@/lib/auth'

export default function AdminHome(){
  useEffect(()=>{
    return onAuthStateChanged(auth, async (u)=>{
      if (!u) { window.location.href='/' }
      const role = await getRoleFromIdToken(u)
      if (role !== 'developer') window.location.href='/'
    })
  },[])

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <ul className="list-disc pl-6">
        <li><Link href="/admin/candidates">Manage Candidates</Link></li>
        <li><Link href="/admin/voters">Manage Voters</Link></li>
        <li><Link href="/admin/results">View Results</Link></li>
      </ul>
    </div>
  )
}
