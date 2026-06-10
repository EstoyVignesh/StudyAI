import { Link } from 'react-router-dom'
import { Brain, Zap, Target, TrendingUp, ChevronRight, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../store'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Tutoring',
    desc: 'Get instant explanations and guidance from an AI tutor trained on UPSC, JEE, and NEET curricula.',
  },
  {
    icon: Zap,
    title: 'Adaptive Difficulty',
    desc: 'Questions automatically adjust to your level. Get challenged appropriately — never too easy, never overwhelming.',
  },
  {
    icon: Target,
    title: 'Targeted Practice',
    desc: 'Focus on specific subjects and topics. Our AI identifies your weak areas and prioritizes them.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    desc: 'Track your improvement with detailed analytics. See accuracy trends and topic-wise performance.',
  },
]

const exams = [
  {
    name: 'UPSC',
    full: 'Civil Services',
    color: 'bg-indigo-500',
    subjects: ['History', 'Geography', 'Polity', 'Economy'],
  },
  {
    name: 'JEE',
    full: 'IIT Entrance',
    color: 'bg-blue-500',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
  },
  {
    name: 'NEET',
    full: 'Medical Entrance',
    color: 'bg-green-500',
    subjects: ['Physics', 'Chemistry', 'Biology'],
  },
]

export default function Landing() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Brain className="w-6 h-6" />
          StudyAI
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" />
          AI-Powered Adaptive Learning
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Crack{' '}
          <span className="text-indigo-600">UPSC, JEE & NEET</span>
          <br />
          with AI Tutoring
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Personalized exam preparation with adaptive quizzes and an AI tutor that explains
          concepts, answers doubts, and adjusts to your learning pace.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="btn-primary text-base px-6 py-3 flex items-center gap-2"
          >
            Start Preparing Free
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="btn-secondary text-base px-6 py-3"
          >
            Login to Account
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required</p>
      </section>

      {/* Exams */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div key={exam.name} className="card p-5 hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center justify-center w-10 h-10 ${exam.color} rounded-lg text-white font-bold text-sm mb-3`}>
                {exam.name}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{exam.full}</h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {exam.subjects.map((s) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Why StudyAI?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to ace your exam?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of students preparing smarter with AI-powered tutoring.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            {['Free to start', 'AI-generated questions', 'Personalized learning'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
          <Link to="/register" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
            Get Started Now
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-6 text-center text-sm text-gray-400">
        © 2024 StudyAI. Built for India's competitive exam aspirants.
      </footer>
    </div>
  )
}
