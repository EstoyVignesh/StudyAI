import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Globe } from 'lucide-react'
import { authApi } from '../api/auth'
import { quizApi } from '../api/quiz'
import { useAuthStore } from '../store'

const LANGUAGES = [
  { key: 'english', label: 'English', native: 'English' },
  { key: 'tamil', label: 'Tamil', native: 'தமிழ்' },
  { key: 'hindi', label: 'Hindi', native: 'हिन्दी' },
]

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    language_preference: 'english',
    state: '',
    selected_exam: '',
  })
  const [states, setStates] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    quizApi.getStates().then(setStates)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { access_token, user } = await authApi.register(
        form.email,
        form.username,
        form.password,
        form.selected_exam || undefined,
        form.language_preference,
        form.state || undefined,
      )
      login(access_token, user)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-xl mb-8">
          <Brain className="w-6 h-6" />
          StudyAI
        </Link>

        <div className="card p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-5">Start your personalized exam prep</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                className="input" placeholder="you@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={form.username} onChange={(e) => update('username', e.target.value)}
                className="input" placeholder="aspirant2025" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
                className="input" placeholder="Min. 6 characters" required minLength={6} />
            </div>

            {/* Language preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Preferred Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.key}
                    type="button"
                    onClick={() => update('language_preference', lang.key)}
                    className={`py-2 rounded-lg text-sm font-medium border-2 transition-colors flex flex-col items-center gap-0.5 ${
                      form.language_preference === lang.key
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{lang.label}</span>
                    <span className="text-xs opacity-70">{lang.native}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* State (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-gray-400 font-normal">(for state exam recommendations)</span>
              </label>
              <select value={form.state} onChange={(e) => update('state', e.target.value)} className="input">
                <option value="">All India / Not specified</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
