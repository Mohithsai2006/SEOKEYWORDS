import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-6">SEO Keywords Guru</h1>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => navigate('/video-upload')}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            SEO Keywords (Video Upload)
          </button>
          <button
            onClick={() => navigate('/youtube-analytics')}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            YouTube Analytics
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard