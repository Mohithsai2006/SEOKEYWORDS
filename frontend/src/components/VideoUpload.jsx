import { useState } from 'react'
import axios from 'axios'
import confetti from 'canvas-confetti'

export default function VideoUpload() {
  const [video, setVideo] = useState(null)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [expandedSections, setExpandedSections] = useState({})
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 })

  const handleFileChange = (e) => {
    setVideo(e.target.files[0])
    setError('')
    setProgress(0)
    setResults(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      setVideo(file)
      setError('')
      setProgress(0)
      setResults(null)
    } else {
      setError('Please drop a valid video file.')
    }
  }

  const handleDragOver = (e) => e.preventDefault()

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleReset = () => {
    setVideo(null)
    setResults(null)
    setError('')
    setProgress(0)
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
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setProgress(percent)
        },
      })
      setResults(response.data)
      setProgress(100)
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process video')
    } finally {
      setLoading(false)
    }
  }

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
        <h2 className="text-4xl font-bold gradient-text text-center mb-8 animate-slideIn">
          Video Upload & Analysis
        </h2>
        <div className="bg-white p-8 rounded-2xl shadow-2xl animated-card">
          <form onSubmit={handleSubmit} className="space-y-6" onDrop={handleDrop} onDragOver={handleDragOver}>
            <div
              className={`border-4 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                video ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
              } animate-pulse`}
              onMouseEnter={(e) => showTooltip(e, 'Drag & drop or click to upload')}
              onMouseLeave={hideTooltip}
            >
              <label htmlFor="video" className="block text-lg font-semibold text-gray-700 mb-4">
                {video ? video.name : 'Drag & Drop or Click to Upload Video'}
              </label>
              <input
                type="file"
                id="video"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => document.getElementById('video').click()}
                className="glow-button bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 animate-pulse"
                onMouseEnter={(e) => showTooltip(e, 'Select a video file')}
                onMouseLeave={hideTooltip}
              >
                Select Video
              </button>
            </div>
            {progress > 0 && (
              <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-green-500 h-3 rounded-full animate-progress"
                  style={{ width: `${progress}%` }}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {progress}%
                </span>
              </div>
            )}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 glow-button bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition duration-300 flex items-center justify-center"
                onMouseEnter={(e) => showTooltip(e, 'Upload and analyze video')}
                onMouseLeave={hideTooltip}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Upload and Process'
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="glow-button bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition duration-300"
                onMouseEnter={(e) => showTooltip(e, 'Reset form')}
                onMouseLeave={hideTooltip}
              >
                Reset
              </button>
            </div>
          </form>

          {error && (
            <p className="text-red-500 mt-4 text-center animate-shake font-semibold">{error}</p>
          )}

          {results && (
            <div className="mt-8 space-y-6">
              {results.transcription && (
                <div className="bg-white p-6 rounded-xl shadow-md animated-card">
                  <button
                    onClick={() => toggleSection('transcription')}
                    className="w-full text-left text-xl font-semibold gradient-text flex justify-between items-center"
                    onMouseEnter={(e) => showTooltip(e, 'View transcription')}
                    onMouseLeave={hideTooltip}
                  >
                    Transcription
                    <span className="animate-pulse">{expandedSections.transcription ? '▼' : '▶'}</span>
                  </button>
                  {expandedSections.transcription && (
                    <p
                      className="mt-4 text-gray-700 animate-fadeIn cursor-pointer"
                      onClick={() => copyToClipboard(results.transcription)}
                      onMouseEnter={(e) => showTooltip(e, 'Click to copy')}
                      onMouseLeave={hideTooltip}
                    >
                      {results.transcription}
                    </p>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}