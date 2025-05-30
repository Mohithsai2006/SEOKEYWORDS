const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { MongoClient } = require('mongodb')
const axios = require('axios')
const multer = require('multer')
const FormData = require('form-data')
require('dotenv').config()

const app = express()
const port = 3000

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017'
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret'
const flaskBaseUrl = process.env.FLASK_BASE_URL || 'http://localhost:5000'

let db
MongoClient.connect(mongoUri, { useUnifiedTopology: true })
  .then(client => {
    db = client.db('seo_db')
    console.log('Connected to MongoDB')
  })
  .catch(err => console.error('MongoDB connection failed:', err))

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    console.error('No token provided')
    return res.status(401).json({ error: 'Access denied' })
  }
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message)
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }
    const usersCollection = db.collection('users')
    const existingUser = await usersCollection.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await usersCollection.insertOne({ username, password: hashedPassword })
    res.status(201).json({ message: 'User created' })
  } catch (err) {
    console.error('Signup error:', err.message)
    res.status(500).json({ error: 'Signup failed' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }
    const usersCollection = db.collection('users')
    const user = await usersCollection.findOne({ username })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ username, id: user._id }, jwtSecret, { expiresIn: '1h' })
    res.json({ token })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/api/upload', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    const { action, youtubeLink } = req.body
    const video = req.file
    console.log('Upload request:', { action, youtubeLink, hasVideo: !!video, user: req.user })

    if (!action) {
      return res.status(400).json({ error: 'Action parameter is required' })
    }
    if (action === 'process' && !video) {
      return res.status(400).json({ error: 'Video file is required for process action' })
    }
    if (action === 'analyze' && !youtubeLink) {
      return res.status(400).json({ error: 'YouTube link is required for analyze action' })
    }

    const formData = new FormData()
    formData.append('action', action)
    if (action === 'process' && video) {
      formData.append('video', video.buffer, video.originalname)
    }
    if (action === 'analyze' && youtubeLink) {
      formData.append('youtubeLink', youtubeLink)
    }

    const response = await axios.post(`${flaskBaseUrl}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    })

    if (!db) {
      throw new Error('MongoDB connection not established')
    }

    if (response.data.transcription || response.data.analytics) {
      const videoData = {
        userId: req.user.id,
        video_path: response.data.video_path || null,
        transcription: response.data.transcription || null,
        keywords: response.data.keywords || null,
        seo_description: response.data.seo_description || null,
        youtube_rankings: response.data.rankings || null,
        youtube_analytics: response.data.analytics || null,
        timestamp: new Date(),
      }
      await db.collection('video_data').insertOne(videoData)
    }

    res.json(response.data)
  } catch (err) {
    console.error('Error in /api/upload:', err.message, err.stack)
    res.status(err.response?.status || 500).json({ error: err.response?.data?.error || err.message || 'Failed to process request' })
  }
})

app.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`)
})