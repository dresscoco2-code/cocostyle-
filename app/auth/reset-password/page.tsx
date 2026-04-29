'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleReset = async () => {
    if (!password) return setError('Please enter a new password')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4"
      style={{backgroundImage: "url('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80')", backgroundSize:'cover', backgroundPosition:'center'}}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold italic"
            style={{background:'linear-gradient(135deg,#e8a598,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            CocoStyle
          </h1>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Set New Password 🔐</h2>
          <p className="text-white/60 text-sm mb-6">Enter your new password below.</p>
          <input type="password" placeholder="New password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-rose-400 mb-4 text-sm" />
          {error && <p className="text-red-300 text-sm mb-3">⚠️ {error}</p>}
          <button onClick={handleReset} disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50"
            style={{background:'linear-gradient(135deg,#e8a598,#8b5cf6)'}}>
            {loading ? 'Updating...' : 'Update Password →'}
          </button>
        </div>
      </div>
    </div>
  )
}