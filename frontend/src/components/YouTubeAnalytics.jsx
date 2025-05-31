import { useState } from 'react'
import axios from 'axios'
import confetti from 'canvas-confetti'

export default function YouTubeAnalytics() {
  const [youtubeLink, setYoutubeLink] = useState('')
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 })

  const extractVideoId = (url) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : null
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleClear = () => {
    setYoutubeLink('')
    setResults(null)
    setError('')
    setExpandedSections({})
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setTooltip({ show: true, text: 'Copied!', x: 0, y: 0 })
    setTimeout(() => setTooltip({ show: false, text: '', x: 0, y: 0 }), 2000)
  }

  const showTooltip = (e, text) => {
    setTooltip({ show: true, text, x: e.clientX + 10, y: e.clientY + 10 })
  }

  const hideTooltip = () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 })
  }

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
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const videoId = extractVideoId(youtubeLink)
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-green-50 p-4 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-64 h-64 bg-indigo-200 rounded-full opacity-20 blur-3xl animate-pulse absolute top-10 left-10"></div>
        <div className="w-96 h-96 bg-green-200 rounded-full opacity-20 blur-3xl animate-pulse absolute bottom-20 right-20"></div>
        <div className="w-48 h-48 bg-purple-200 rounded-full opacity-20 blur-3xl animate-wave absolute top-40 right-40"></div>
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div className="tooltip" style={{ top: tooltip.y, left: tooltip.x }}>
          {tooltip.text}
        </div>
      )}

      <div className="container mx-auto max-w-2xl relative z-10">
        <h1 className="text-4xl font-bold gradient-text text-center mb-8 animate-slideIn">
          YouTube Video Analytics
        </h1>
        <div className="bg-white p-8 rounded-2xl shadow-2xl animated-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label className="block text-lg font-semibold text-gray-700">YouTube Video Link</label>
              <input
                type="text"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                className="mt-2 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 group-hover:border-indigo-400 p-3"
                disabled={loading}
                onMouseEnter={(e) => showTooltip(e, 'Paste a YouTube URL')}
                onMouseLeave={hideTooltip}
              />
            </div>
            {thumbnailUrl && (
              <div className="mt-4 animate-fadeIn">
                <img
                  src={thumbnailUrl}
                  alt="Video Thumbnail"
                  className="w-full h-48 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                  onMouseEnter={(e) => showTooltip(e, 'Video thumbnail')}
                  onMouseLeave={hideTooltip}
                />
              </div>
            )}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 glow-button bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition duration-300 flex items-center justify-center animate-pulse"
                onMouseEnter={(e) => showTooltip(e, 'Analyze video')}
                onMouseLeave={hideTooltip}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze YouTube Link'
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="glow-button bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition duration-300"
                onMouseEnter={(e) => showTooltip(e, 'Clear form')}
                onMouseLeave={hideTooltip}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {error && (
          <p className="text-red-500 mt-4 text-center animate-shake font-semibold">{error}</p>
        )}

        {results && (
          <div className="mt-8 space-y-6">
            {results.analytics && (
              <div className="bg-white p-6 rounded-xl shadow-md animated-card">
                <button
                  onClick={() => toggleSection('analytics')}
                  className="w-full text-left text-xl font-semibold gradient-text flex justify-between items-center"
                  onMouseEnter={(e) => showTooltip(e, 'View analytics')}
                  onMouseLeave={hideTooltip}
                >
                  YouTube Video Analytics
                  <span className="animate-pulse">{expandedSections.analytics ? '▼' : '▶'}</span>
                </button>
                {expandedSections.analytics && (
                  <div className="mt-4 overflow-x-auto animate-fadeIn">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead>
                        <tr className="bg-gradient-to-r from-indigo-100 to-green-100">
                          <th className="py-3 px-6 border-b text-left text-gray-700 font-semibold">Metric</th>
                          <th className="py-3 px-6 border-b text-left text-gray-700 font-semibold">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.analytics.views && (
                          <tr className="table-row-hover">
                            <td className="py-3 px-6 border-b">Views</td>
                            <td
                              className="py-3 px-6 border-b cursor-pointer"
                              onClick={() => copyToClipboard(results.analytics.views.toString())}
                              onMouseEnter={(e) => showTooltip(e, 'Click to copy')}
                              onMouseLeave={hideTooltip}
                            >
                              {results.analytics.views}
                            </td>
                          </tr>
                        )}
                        {results.analytics.likes && (
                          <tr className="table-row-hover">
                            <td className="py-3 px-6 border-b">Likes</td>
                            <td
                              className="py-3 px-6 border-b cursor-pointer"
                              onClick={() => copyToClipboard(results.analytics.likes.toString())}
                              onMouseEnter={(e) => showTooltip(e, 'Click to copy')}
                              onMouseLeave={hideTooltip}
                            >
                              {results.analytics.likes}
                            </td>
                          </tr>
                        )}
                        {results.analytics.comments && (
                          <tr className="table-row-hover">
                            <td className="py-3 px-6 border-b">Comments</td>
                            <td
                              className="py-3 px-6 border-b cursor-pointer"
                              onClick={() => copyToClipboard(results.analytics.comments.toString())}
                              onMouseEnter={(e) => showTooltip(e, 'Click to copy')}
                              onMouseLeave={hideTooltip}
                            >
                              {results.analytics.comments}
                            </td>
                          </tr>
                        )}
                        {results.analytics.published && (
                          <tr className="table-row-hover">
                            <td className="py-3 px-6 border-b">Published</td>
                            <td
                              className="py-3 px-6 border-b cursor-pointer"
                              onClick={() => copyToClipboard(results.analytics.published)}
                              onMouseEnter={(e) => showTooltip(e, 'Click to copy')}
                              onMouseLeave={hideTooltip}
                            >
                              {results.analytics.published}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {results.rankings && results.rankings.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-md animated-card">
                <button
                  onClick={() => toggleSection('rankings')}
                  className="w-full text-left text-xl font-semibold gradient-text flex justify-between items-center"
                  onMouseEnter={(e) => showTooltip(e, 'View keyword rankings')}
                  onMouseLeave={hideTooltip}
                >
                  Keyword Rankings
                  <span className="animate-pulse">{expandedSections.rankings ? '▼' : '▶'}</span>
                </button>
                {expandedSections.rankings && (
                  <div className="mt-4 overflow-x-auto animate-fadeIn">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead>
                        <tr className="bg-gradient-to-r from-indigo-100 to-green-100">
                          <th className="py-3 px-6 border-b text-left text-gray-700 font-semibold">Rank</th>
                          <th className="py-3 px-6 border-b text-left text-gray-700 font-semibold">Keyword</th>
                          <th className="py-3 px-6 border-b text-left text-gray-700 font-semibold">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.rankings.map((item, index) => (
                          <tr key={index} className="table-row-hover">
                            <td className="py-3 px-6 border-b">{item.position || index + 1}</td>
                            <td
                              className="py-3 px-6 border-b cursor-pointer"
                              onClick={() => copyToClipboard(item.keyword)}
                              onMouseEnter={(e) => showTooltip(e, 'Click to copy')}
                              onMouseLeave={hideTooltip}
                            >
                              {item.keyword}
                            </td>
                            <td className="py-3 px-6 border-b">{item.score?.toFixed(2) || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {results.keywords && results.keywords.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-md animated-card">
                <button
                  onClick={() => toggleSection('keywords')}
                  className="w-full text-left text-xl font-semibold gradient-text flex justify-between items-center"
                  onMouseEnter={(e) => showTooltip(e, 'View SEO keywords')}
                  onMouseLeave={hideTooltip}
                >
                  SEO Keywords
                  <span className="animate-pulse">{expandedSections.keywords ? '▼' : '▶'}</span>
                </button>
                {expandedSections.keywords && (
                  <div className="mt-4 flex flex-wrap gap-2 animate-fadeIn">
                    {results.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="keyword-item bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full cursor-pointer"
                        onClick={() => copyToClipboard(keyword)}
                        onMouseEnter={(e) => showTooltip(e, 'Click to copy')}
                        onMouseLeave={hideTooltip}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {results.seo_description && (
              <div className="bg-white p-6 rounded-xl shadow-md animated-card">
                <button
                  onClick={() => toggleSection('seo_description')}
                  className="w-full text-left text-xl font-semibold gradient-text flex justify-between items-center"
                  onMouseEnter={(e) => showTooltip(e, 'View SEO description')}
                  onMouseLeave={hideTooltip}
                >
                  SEO Description
                  <span className="animate-pulse">{expandedSections.seo_description ? '▼' : '▶'}</span>
                </button>
                {expandedSections.seo_description && (
                  <p
                    className="mt-4 text-gray-700 animate-fadeIn cursor-pointer"
                    onClick={() => copyToClipboard(results.seo_description)}
                    onMouseEnter={(e) => showTooltip(e, 'Click to copy')}
                    onMouseLeave={hideTooltip}
                  >
                    {results.seo_description}
                  </p>
                )}
              </div>
            )}
            {results.logs && (
              <div className="bg-white p-6 rounded-xl shadow-md animated-card">
                <button
                  onClick={() => toggleSection('logs')}
                  className="w-full text-left text-xl font-semibold gradient-text flex justify-between items-center"
                  onMouseEnter={(e) => showTooltip(e, 'View logs')}
                  onMouseLeave={hideTooltip}
                >
                  Logs
                  <span className="animate-pulse">{expandedSections.logs ? '▼' : '▶'}</span>
                </button>
                {expandedSections.logs && (
                  <pre
                    className="mt-4 bg-gray-100 p-4 rounded-md text-sm text-gray-700 overflow-auto max-h-96 animate-fadeIn cursor-pointer"
                    onClick={() => copyToClipboard(results.logs)}
                    onMouseEnter={(e) => showTooltip(e, 'Click to copy')}
                    onMouseLeave={hideTooltip}
                  >
                    {results.logs || 'No logs available.'}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}