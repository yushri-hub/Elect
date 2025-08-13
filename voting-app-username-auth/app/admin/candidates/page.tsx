
'use client'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebaseClient'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import { getRoleFromIdToken } from '@/lib/auth'

export default function CandidatesAdmin(){
  const [list, setList] = useState<any[]>([])
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

  useEffect(()=>{ return onAuthStateChanged(auth, async (u)=>{ if(!u) window.location.href='/'; const role = await getRoleFromIdToken(u); if(role!=='developer') window.location.href='/'; }); },[])
  async function reload(){ const qs = await getDocs(collection(db,'candidates')); setList(qs.docs.map(d=>({id:d.id, ...d.data()}))) }
  useEffect(()=>{ reload(); },[])

  async function add(){ await addDoc(collection(db,'candidates'), { name, photoUrl, active:true, createdAt: new Date() }); setName(''); setPhotoUrl(''); reload(); }
  async function toggle(id:string, active:boolean){ await updateDoc(doc(db,'candidates',id), { active: !active }); reload(); }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Candidates</h1>
      <div className="flex gap-2">
        <input className="border p-2 rounded w-1/3" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border p-2 rounded w-2/3" placeholder="Photo URL" value={photoUrl} onChange={e=>setPhotoUrl(e.target.value)} />
        <button className="bg-black text-white px-4 rounded" onClick={add}>Add</button>
      </div>
      <ul className="divide-y">
        {list.map(i=> (
          <li key={i.id} className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {i.photoUrl && <img src={i.photoUrl} className="w-12 h-12 rounded object-cover" />}
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-xs text-gray-500">{i.active? 'Active':'Inactive'}</div>
              </div>
            </div>
            <button className="px-3 py-1 rounded border" onClick={()=>toggle(i.id, i.active)}>{i.active? 'Deactivate':'Activate'}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
