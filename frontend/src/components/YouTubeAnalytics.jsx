import { useState } from 'react'
import axios from 'axios'

function YouTubeAnalytics() {
  const [youtubeLink, setYoutubeLink] = useState('')
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!youtubeLink) {
      setError('Please provide a YouTube link.')
      return
    }
    setLoading(true)
    setError('')
    setResults(null)

    const formData = new FormData()
    formData.append('youtubeLink', youtubeLink)
    formData.append('action', 'analyze')

    try {
      const response = await axios.post('http://localhost:3000/api/upload', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setResults(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">YouTube Analytics</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">YouTube Video Link</label>
            <input
              type="text"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-400"
            >
              {loading ? 'Analyzing...' : 'Analyze YouTube Link'}
            </button>
          </form>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {results && results.analytics && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">YouTube Video Analytics</h2>
            <div className="mb-4">
              <p><strong>Title:</strong> {results.analytics.title}</p>
              <p><strong>Views:</strong> {results.analytics.views}</p>
              <p><strong>Likes:</strong> {results.analytics.likes}</p>
              <p><strong>Comments:</strong> {results.analytics.comments}</p>
              <p><strong>Published:</strong> {results.analytics.published}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-medium">Logs</h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-700 overflow-auto max-h-96">
                {results.logs || 'No logs available.'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default YouTubeAnalytics