import logging
from io import StringIO
from flask import Flask, request, jsonify
import os
import re
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from transformers import BartTokenizer, BartForConditionalGeneration
import speech_recognition as sr
import tempfile
import uuid
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import time
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import math

try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

log_stream = StringIO()
logging.basicConfig(level=logging.INFO, handlers=[
    logging.StreamHandler(log_stream),
    logging.StreamHandler()
])
logger = logging.getLogger(__name__)

load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
FFMPEG_PATH = os.getenv("FFMPEG_PATH")

app = Flask(__name__)
app.secret_key = os.urandom(24)
UPLOAD_FOLDER = 'Uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

try:
    from moviepy.editor import VideoFileClip
    USE_MOVIEPY = True
except ImportError:
    from pydub import AudioSegment
    USE_MOVIEPY = False
    logger.warning("moviepy not found, falling back to pydub.")

model_name = "facebook/bart-large-cnn"
try:
    tokenizer = BartTokenizer.from_pretrained(model_name)
    model = BartForConditionalGeneration.from_pretrained(model_name)
    logger.info("✅ BART model loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load BART model: {e}")

def transcribe_audio(video_path):
    temp_audio_path = None
    try:
        absolute_video_path = os.path.abspath(video_path)
        logger.info(f"🔊 Attempting audio extraction from {absolute_video_path} using {'moviepy' if USE_MOVIEPY else 'pydub'}...")

        if USE_MOVIEPY:
            video = VideoFileClip(absolute_video_path)
            logger.info("🔊 Video loaded successfully, extracting audio...")
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
                temp_audio_path = temp_audio.name
                video.audio.write_audiofile(temp_audio_path, codec="pcm_s16le", bitrate="16000")
            logger.info(f"🔊 Audio extracted to {temp_audio_path}")
        else:
            if not os.path.isfile(FFMPEG_PATH):
                logger.error(f"❌ ffmpeg.exe not found at {FFMPEG_PATH}.")
                raise FileNotFoundError(f"ffmpeg.exe not found at {FFMPEG_PATH}")

            ffprobe_path = os.path.join(os.path.dirname(FFMPEG_PATH), "ffprobe.exe")
            if not os.path.isfile(ffprobe_path):
                logger.error(f"❌ ffprobe.exe not found at {ffprobe_path}.")
                raise FileNotFoundError(f"ffprobe.exe not found at {ffprobe_path}")

            import subprocess
            result = subprocess.run([FFMPEG_PATH, "-version"], capture_output=True, text=True)
            if result.returncode != 0:
                logger.error(f"❌ ffmpeg build invalid: {result.stderr}")
                raise OSError(f"ffmpeg build invalid: {result.stderr}")

            os.environ["PATH"] += os.pathsep + os.path.dirname(FFMPEG_PATH)
            AudioSegment.ffmpeg = FFMPEG_PATH
            AudioSegment.ffprobe = ffprobe_path
            logger.info(f"🔊 Using ffmpeg at {FFMPEG_PATH} and ffprobe at {ffprobe_path}...")

            audio = AudioSegment.from_file(absolute_video_path, format="mp4")
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
                temp_audio_path = temp_audio.name
                audio.export(temp_audio_path, format="wav", parameters=["-ar", "16000", "-ac", "1"])
            logger.info(f"🔊 Audio extracted to {temp_audio_path}")

        logger.info(f"🔊 Transcribing audio from {temp_audio_path} using pocketsphinx...")
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_audio_path) as source:
            audio = recognizer.record(source)

        try:
            text = recognizer.recognize_sphinx(audio)
            logger.info("✅ Offline transcription successful with pocketsphinx!")
            return text
        except sr.UnknownValueError:
            logger.warning("Pocketsphinx could not understand the audio, falling back to Google...")
        except sr.RequestError as e:
            logger.error(f"Pocketsphinx request failed: {e}, falling back to Google...")

        text = recognizer.recognize_google(audio)
        logger.info("✅ Transcription successful with Google fallback!")
        return text

    except Exception as e:
        logger.error(f"❌ Transcription failed: {str(e)}")
        return None
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            logger.info(f"🗑️ Cleaning up temporary file: {temp_audio_path}")
            os.remove(temp_audio_path)

def generate_seo_keywords(text):
    if not text:
        logger.warning("❌ No transcription text provided, using fallback keywords")
        return ["seo", "video", "optimization", "ranking", "keywords", "content", "analysis", "strategy", "traffic", "digital"]
    
    try:
        inputs = tokenizer(text, max_length=1024, return_tensors="pt", truncation=True)
        summary_ids = model.generate(
            inputs["input_ids"],
            max_length=150,
            min_length=40,
            length_penalty=2.0,
            num_beams=4
        )
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        
        tokens = word_tokenize(summary.lower())
        stop_words = set(stopwords.words('english'))
        keywords = [word for word in tokens if word.isalnum() and word not in stop_words and len(word) > 2]
        
        return list(dict.fromkeys(keywords))[:10]
    except Exception as e:
        logger.error(f"❌ SEO keyword generation failed: {e}")
        return ["seo", "video", "optimization", "ranking", "keywords", "content", "analysis", "strategy", "traffic", "digital"]

def generate_seo_description(transcription, keywords):
    if not transcription:
        transcription = "No transcription available."
    hashtags = [f"#{keyword}" for keyword in keywords[:5]]
    description = (
        f"{transcription[:200]}... Optimized for SEO with keywords: {', '.join(keywords)}. "
        f"{', '.join(hashtags)} Upload to YouTube: https://youtube.com/upload"
    )
    return description

def fetch_youtube_rankings(keywords, max_results=5):
    if not YOUTUBE_API_KEY:
        logger.error("❌ YOUTUBE_API_KEY not set")
        return []

    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        logger.info("✅ YouTube API service initialized")

        w_l = 1.0
        w_c = 2.0
        w_v = 0.05
        epsilon = 1e-6
        K = 5000

        keyword_scores = []
        for keyword in keywords:
            for attempt in range(3):
                try:
                    request = youtube.search().list(
                        part='snippet',
                        q=keyword,
                        maxResults=max_results,
                        type='video',
                        order='relevance'
                    )
                    response = request.execute()
                    logger.info(f"✅ Fetched YouTube search results for keyword: {keyword}")

                    video_ids = [item['id']['videoId'] for item in response.get('items', [])]
                    total_likes = 0
                    total_comments = 0
                    total_views = 0
                    top_video_title = response['items'][0]['snippet']['title'] if video_ids else 'N/A'
                    top_video_id = video_ids[0] if video_ids else 'N/A'

                    if video_ids:
                        videos_request = youtube.videos().list(
                            part='statistics',
                            id=','.join(video_ids)
                        )
                        videos_response = videos_request.execute()
                        for video in videos_response.get('items', []):
                            stats = video.get('statistics', {})
                            views = int(stats.get('viewCount', 0))
                            likes = int(stats.get('likeCount', 0))
                            comments = int(stats.get('commentCount', 0))
                            total_views += views
                            total_likes += likes
                            total_comments += comments

                        raw_score = (w_l * total_likes + w_c * total_comments) / (w_v * total_views + epsilon)
                        normalized_score = math.tanh(raw_score) / math.tanh(K)
                        logger.info(f"✅ Fetched raw score for keyword '{keyword}': {raw_score}, normalized: {normalized_score}")

                        keyword_scores.append({
                            'keyword': keyword,
                            'score': round(normalized_score, 3),
                            'top_video_title': top_video_title,
                            'top_video_id': top_video_id
                        })
                    else:
                        keyword_scores.append({
                            'keyword': keyword,
                            'score': 0,
                            'top_video_title': 'N/A',
                            'top_video_id': 'N/A'
                        })
                    break
                except HttpError as e:
                    if e.resp.status == 429:
                        logger.warning(f"Rate limit exceeded for keyword '{keyword}', retrying {attempt + 1}/3...")
                        time.sleep(2 ** attempt)
                        continue
                    logger.error(f"❌ YouTube API error for keyword '{keyword}': {e}")
                    if hasattr(e, 'content'):
                        logger.error(f"API error details: {e.content}")
                    keyword_scores.append({
                        'keyword': keyword,
                        'score': 0,
                        'top_video_title': 'N/A',
                        'top_video_id': 'N/A'
                    })
                    break
                except Exception as e:
                    logger.error(f"❌ Failed to fetch results for keyword '{keyword}': {e}")
                    keyword_scores.append({
                        'keyword': keyword,
                        'score': 0,
                        'top_video_title': 'N/A',
                        'top_video_id': 'N/A'
                    })
                    break

        keyword_scores.sort(key=lambda x: x['score'], reverse=True)
        rankings = [
            {
                'keyword': item['keyword'],
                'rank': index + 1,
                'score': item['score'],
                'top_video_title': item['top_video_title'],
                'top_video_id': item['top_video_id']
            }
            for index, item in enumerate(keyword_scores)
        ]
        logger.info("✅ Scores computed and rankings generated")
        return rankings
    except Exception as e:
        logger.error(f"❌ Failed to fetch YouTube rankings: {e}")
        return []

def fetch_youtube_analytics(video_url):
    if not YOUTUBE_API_KEY:
        logger.error("❌ YOUTUBE_API_KEY not set")
        return None

    video_id_match = re.search(r'(?:v=|youtu\.be/|youtube\.com/watch\?v=)([a-zA-Z0-9_-]{11})', video_url)
    if not video_id_match:
        logger.error("❌ Invalid YouTube video URL")
        return None
    video_id = video_id_match.group(1)

    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        logger.info("✅ YouTube API service initialized for analytics")

        request = youtube.videos().list(
            part='snippet,statistics',
            id=video_id
        )
        response = request.execute()

        if not response.get('items'):
            logger.error("❌ No video found for the provided ID")
            return None

        video = response['items'][0]
        snippet = video.get('snippet', {})
        stats = video.get('statistics', {})

        analytics = {
            'title': snippet.get('title', 'N/A'),
            'views': stats.get('viewCount', 'N/A'),
            'likes': stats.get('likeCount', 'N/A'),
            'comments': stats.get('commentCount', 'N/A'),
            'published': snippet.get('publishedAt', 'N/A')
        }
        logger.info(f"✅ Fetched analytics for video ID: {video_id}")
        return analytics

    except HttpError as e:
        logger.error(f"❌ YouTube API error for video ID '{video_id}': {e}")
        if hasattr(e, 'content'):
            logger.error(f"API error details: {e.content}")
        return None
    except Exception as e:
        logger.error(f"❌ Failed to fetch analytics for video ID '{video_id}': {e}")
        return None

@app.route('/upload', methods=['POST'])
def upload_video():
    log_stream.seek(0)
    log_stream.truncate(0)

    action = request.form.get('action')
    video_file = request.files.get('video')
    youtube_link = request.form.get('youtubeLink')
    transcription = None
    keywords = None
    seo_description = None
    rankings = []
    analytics = None
    video_path = None

    if action == 'process' and video_file and video_file.filename:
        if not video_file.filename.lower().endswith('.mp4'):
            logger.error("❌ Invalid file format. Only .mp4 files are accepted")
            return jsonify({"error": "Invalid file format. Only .mp4 files are accepted"}), 400

        filename = secure_filename(f"{uuid.uuid4()}.mp4")
        video_path = os.path.join(UPLOAD_FOLDER, filename)
        video_file.save(video_path)
        logger.info(f"🎥 Video uploaded: {video_path}")

        transcription = transcribe_audio(video_path)
        if transcription:
            keywords = generate_seo_keywords(transcription)
            seo_description = generate_seo_description(transcription, keywords)
            rankings = fetch_youtube_rankings(keywords, max_results=5)
        else:
            logger.error("❌ Transcription failed")
            if os.path.exists(video_path):
                os.remove(video_path)
                logger.info(f"🗑️ Deleted temporary video file: {video_path}")
            return jsonify({"error": "Transcription failed"}), 500

    if action == 'analyze' and youtube_link:
        analytics = fetch_youtube_analytics(youtube_link)
        if not analytics:
            logger.error("❌ No valid analytics data retrieved for the provided YouTube link")
            return jsonify({"error": "Invalid YouTube link or no analytics data available"}), 400

    if not (transcription or analytics):
        logger.error("❌ No valid action performed")
        return jsonify({"error": "No valid action performed. Please upload a video or provide a valid YouTube link."}), 400

    if video_path and os.path.exists(video_path):
        os.remove(video_path)
        logger.info(f"🗑️ Deleted temporary video file: {video_path}")

    logs = log_stream.getvalue()
    return jsonify({
        "transcription": transcription,
        "keywords": keywords,
        "seo_description": seo_description,
        "rankings": rankings,
        "analytics": analytics,
        "logs": logs
    })

if __name__ == '__main__':
    app.run(debug=True)