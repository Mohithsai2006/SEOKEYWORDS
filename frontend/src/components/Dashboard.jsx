import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const toggleFeaturesDropdown = () => {
    setIsFeaturesDropdownOpen(!isFeaturesDropdownOpen)
  }

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  // Testimonial data for carousel
  const testimonials = [
    { name: 'Jane Doe', text: 'SEO Keywords Guru boosted my video rankings!' },
    { name: 'John Smith', text: 'The analytics are incredibly insightful!' },
    { name: 'Alex Lee', text: 'Easy to use and powerful SEO tools!' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-green-50 overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-64 h-64 bg-indigo-200 rounded-full opacity-20 blur-3xl animate-pulse absolute top-10 left-10"></div>
        <div className="w-96 h-96 bg-green-200 rounded-full opacity-20 blur-3xl animate-pulse absolute bottom-20 right-20"></div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-lg fixed w-full z-20 top-0">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600 animate-pulse">SEO Keywords Guru</h1>
          <div className="flex items-center space-x-4">
            {/* Features Dropdown */}
            <div className="relative">
              <button
                onClick={toggleFeaturesDropdown}
                className="text-gray-700 hover:text-indigo-600 font-medium transition duration-300 flex items-center"
              >
                Features
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isFeaturesDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-20 animate-fadeIn">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    <p className="font-semibold">Project Features:</p>
                    <ul className="list-disc pl-5">
                      <li>Video Transcription</li>
                      <li>SEO Keywords Generation</li>
                      <li>YouTube Analytics</li>
                      <li>Keyword Rankings with Scores</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto pt-24 pb-12 px-4 text-center">
        <h1 className="text-5xl font-extrabold text-indigo-800 mb-4 animate-slideIn">
          Empower Your Content with AI-Driven SEO
        </h1>
        <p className="text-lg text-gray-600 mb-8 animate-fadeIn delay-200">
          Unlock the potential of your videos with advanced transcription, analytics, and SEO tools.
        </p>
        <button
          onClick={toggleModal}
          className="bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 animate-bounce"
        >
          Explore Our Features
        </button>
      </div>

      {/* Feature Cards */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-indigo-800 mb-8 animate-slideIn">
          Get Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div
            onClick={() => navigate('/video-upload')}
            className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 cursor-pointer"
          >
            <h3 className="text-xl font-semibold text-indigo-600 mb-2">Video Upload</h3>
            <p className="text-gray-600">Upload your videos to generate transcriptions and SEO keywords.</p>
          </div>
          <div
            onClick={() => navigate('/youtube-analytics')}
            className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 cursor-pointer"
          >
            <h3 className="text-xl font-semibold text-green-600 mb-2">YouTube Analytics</h3>
            <p className="text-gray-600">Analyze YouTube videos for performance metrics and rankings.</p>
          </div>
        </div>
      </div>

      {/* Animated Stats */}
      <div className="container mx-auto px-4 py-12 bg-gradient-to-r from-indigo-600 to-green-600 text-white">
        <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="animate-fadeIn delay-300">
            <p className="text-4xl font-bold">10,000+</p>
            <p className="text-lg">Videos Processed</p>
          </div>
          <div className="animate-fadeIn delay-400">
            <p className="text-4xl font-bold">50,000+</p>
            <p className="text-lg">Keywords Generated</p>
          </div>
          <div className="animate-fadeIn delay-500">
            <p className="text-4xl font-bold">1,000+</p>
            <p className="text-lg">Users Empowered</p>
          </div>
        </div>
      </div>

      {/* Testimonial Carousel */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-indigo-800 mb-8">What Users Say</h2>
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 mx-4 bg-white p-6 rounded-lg shadow-md"
              >
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
                <p className="mt-4 font-semibold text-indigo-600">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 animate-fadeIn">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">Select a Feature</h2>
            <div className="space-y-4">
              <button
                onClick={() => {
                  navigate('/video-upload')
                  setIsModalOpen(false)
                }}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
              >
                Video Upload
              </button>
              <button
                onClick={() => {
                  navigate('/youtube-analytics')
                  setIsModalOpen(false)
                }}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
              >
                YouTube Analytics
              </button>
            </div>
            <button
              onClick={toggleModal}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}