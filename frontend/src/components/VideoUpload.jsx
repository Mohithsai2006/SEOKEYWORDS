import { useState } from 'react'
import axios from 'axios'

function VideoUpload() {
  const [video, setVideo] = useState(null)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!video) {
      setError('Please select a video file.')
      return
    }
    setLoading(true)
    setError('')
    setResults(null)

    const formData = new FormData()
    formData.append('video', video)
    formData.append('action', 'process')

    try {
      const response = await axios.post('http://localhost:3000/api/upload', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setResults(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Video Upload - SEO Keywords</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Upload Video (.mp4)</label>
            <input
              type="file"
              accept=".mp4"
              onChange={(e) => setVideo(e.target.files[0])}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? 'Processing...' : 'Process Video'}
            </button>
          </form>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {results && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Processing Results</h2>
            <div className="mb-4">
              <h3 className="text-lg font-medium">Transcription</h3>
              <p className="text-gray-700">{results.transcription || 'No transcription available.'}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-medium">SEO Keywords</h3>
              <p className="text-gray-700">{results.keywords ? results.keywords.join(', ') : 'No keywords generated.'}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-medium">SEO Description</h3>
              <p className="text-gray-700">{results.seo_description || 'No SEO description generated.'}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-medium">Keyword Rankings</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b p-2">Keyword</th>
                    <th className="border-b p-2">Rank</th>
                    <th className="border-b p-2">Score</th>
                    <th className="border-b p-2">Top Video Title</th>
                  </tr>
                </thead>
                <tbody>
                  {results.rankings && results.rankings.length > 0 ? (
                    results.rankings.map((ranking, index) => (
                      <tr key={index}>
                        <td className="border-b p-2">{ranking.keyword}</td>
                        <td className="border-b p-2">{ranking.rank}</td>
                        <td className="border-b p-2">{ranking.score}</td>
                        <td className="border-b p-2">{ranking.top_video_title}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="border-b p-2">No keyword rankings available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
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

export default VideoUpload