'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSendMagicLink = async () => {
    if (!email) return setError('Please enter your email')
    setLoading(true)
    setError('')
    setSuccessMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin + '/dashboard'
      }
    })
    if (error) setError(error.message)
    else setSuccessMessage('Check your email and click the link to sign in!')
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    })
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
          <p className="text-white/50 text-sm mt-2">Your AI Personal Stylist</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome 👋</h2>
          <p className="text-white/60 text-sm mb-6">
            We&apos;ll send you a magic link to sign in
          </p>

          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 rounded-xl py-3 font-medium hover:bg-gray-100 transition mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/40 text-xs">or continue with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <input type="email" placeholder="Email address" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMagicLink()}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-rose-400 mb-4 text-sm" />
          {error && <p className="text-red-300 text-sm mb-3">⚠️ {error}</p>}
          {successMessage && <p className="text-emerald-300 text-sm mb-3">✅ {successMessage}</p>}
          <button onClick={handleSendMagicLink} disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50"
            style={{background:'linear-gradient(135deg,#e8a598,#8b5cf6)'}}>
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>

          <p className="text-center text-white/50 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-rose-300 hover:text-rose-200 font-medium">Sign Up Free</Link>
          </p>
        </div>
        <p className="text-center text-white/30 text-xs mt-4">🔒 Secured with 256-bit encryption</p>
      </div>
    </div>
  )
}