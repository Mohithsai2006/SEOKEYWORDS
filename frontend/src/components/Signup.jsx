import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import confetti from 'canvas-confetti'
import { TypeAnimation } from 'react-type-animation'

export default function Signup() {
  console.log('Rendering Signup component')
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
    if (name === 'password') {
      setPasswordStrength(
        value.length < 6 ? 'weak' : value.length < 8 ? 'medium' : 'strong'
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { username, password } = formData
    if (!username || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await axios.post('http://localhost:3000/api/signup', { username, password })
      console.log('Signup response:', response.data)
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      navigate('/login')
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message)
      setError(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const keywords = [
    'SEO', 'Keywords', 'Analytics', 'Transcription', 'Optimization',
    'YouTube', 'Rankings', 'Content', 'AI', 'Video'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-green-50 flex flex-col overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-64 h-64 bg-indigo-200 rounded-full opacity-20 blur-3xl animate-pulse absolute top-10 left-10"></div>
        <div className="w-96 h-96 bg-green-200 rounded-full opacity-20 blur-3xl animate-pulse absolute bottom-20 right-20"></div>
        <div className="w-48 h-48 bg-purple-200 rounded-full opacity-20 blur-3xl animate-wave absolute top-40 right-40"></div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-lg w-full z-20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text animate-pulse">SEO Keywords Guru</h1>
          <Link
            to="/login"
            className="text-gray-700 hover:text-indigo-600 font-medium transition duration-300 transform hover:scale-105"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className={`bg-white p-8 rounded-lg shadow-xl max-w-md w-full animate-slideIn ${error ? 'animate-shake' : ''}`}>
            <h2 className="text-3xl font-bold gradient-text text-center mb-6">
              Create Your Account
            </h2>
            <TypeAnimation
              sequence={['Join the SEO revolution today.', 2000, 'Optimize your content with ease.', 2000]}
              wrapper="p"
              repeat={Infinity}
              className="text-gray-600 text-center mb-8 animate-fadeIn delay-200"
            />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 transition-all duration-300 group-focus-within:-translate-y-6 group-focus-within:text-indigo-600">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 group-hover:border-indigo-400"
                  disabled={loading}
                />
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-0">
                  Choose a unique username
                </span>
              </div>
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 transition-all duration-300 group-focus-within:-translate-y-6 group-focus-within:text-indigo-600">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 group-hover:border-indigo-400"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-0">
                  At least 6 characters
                </span>
                {formData.password && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-gray-200 rounded">
                      <div
                        className={`h-1 rounded transition-all duration-300 ${
                          passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                          passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                          'w-full bg-green-500'
                        }`}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password strength: {passwordStrength}
                    </p>
                  </div>
                )}
              </div>
              {error && <p className="text-red-500 text-sm animate-fadeIn">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing up...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>
            <p className="mt-4 text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:underline transform hover:scale-105 inline-block transition duration-300">
                Login
              </Link>
            </p>
          </div>
          {/* Right: Keyword List */}
          <div className="flex flex-col justify-center items-center animate-fadeIn">
            <h3 className="text-2xl font-bold gradient-text mb-4">Unleash Your SEO Potential</h3>
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
              <div className="flex flex-wrap justify-center gap-3">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="keyword-item text-lg font-medium text-gray-700 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 transition duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}