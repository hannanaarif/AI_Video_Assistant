import yt_dlp
import os
import shutil
import sys
import re
from pydub import AudioSegment

def ensure_ffmpeg_in_path():
    """Helper function to find system FFmpeg or imageio_ffmpeg binary and add it to os.environ['PATH']."""
    if shutil.which('ffmpeg') is not None:
        return shutil.which('ffmpeg')
    
    # Check .venv/bin or sys.prefix/bin
    sys_bin = os.path.join(sys.prefix, "bin")
    ffmpeg_in_sys_bin = os.path.join(sys_bin, "ffmpeg")
    if os.path.exists(ffmpeg_in_sys_bin):
        os.environ["PATH"] = sys_bin + os.path.pathsep + os.environ.get("PATH", "")
        return ffmpeg_in_sys_bin

    try:
        import importlib
        imageio_ffmpeg = importlib.import_module('imageio_ffmpeg')
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        ffmpeg_dir = os.path.dirname(ffmpeg_exe)
        symlink_path = os.path.join(ffmpeg_dir, "ffmpeg")
        if not os.path.exists(symlink_path):
            try:
                os.symlink(ffmpeg_exe, symlink_path)
            except Exception:
                pass
        target_dir = ffmpeg_dir if os.path.exists(symlink_path) else sys_bin
        os.environ["PATH"] = target_dir + os.path.pathsep + os.environ.get("PATH", "")
        return ffmpeg_exe
    except Exception:
        return None

def get_ffmpeg_location():
    """Helper function to find system FFmpeg or imageio_ffmpeg binary."""
    return ensure_ffmpeg_in_path()

# Automatically ensure FFmpeg is in PATH before pydub or whisper are loaded
ensure_ffmpeg_in_path()

DOWNLOAD_DIR = 'downloads'
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def extract_subtitle_text(download_dir: str, base_name: str) -> str:
    """Extract clean verbatim text from downloaded .vtt or .srt subtitle files."""
    subtitle_lines = []
    for f in os.listdir(download_dir):
        if f.startswith(os.path.basename(base_name)) and f.endswith(('.vtt', '.srt')):
            sub_path = os.path.join(download_dir, f)
            try:
                with open(sub_path, 'r', encoding='utf-8', errors='ignore') as sf:
                    content = sf.readlines()
                for line in content:
                    line = line.strip()
                    if not line or line.startswith('WEBVTT') or line.startswith('Kind:') or line.startswith('Language:'):
                        continue
                    if re.match(r'^\d+$', line) or re.match(r'^\d{2}:\d{2}', line) or '-->' in line:
                        continue
                    clean_line = re.sub(r'<[^>]+>', '', line).strip()
                    if clean_line and (not subtitle_lines or subtitle_lines[-1] != clean_line):
                        subtitle_lines.append(clean_line)
            except Exception as e:
                print(f"[Subtitle Extractor Warning] {e}")
    return " ".join(subtitle_lines)

def download_youtube_audio(url: str) -> tuple[str, dict]:
    ffmpeg_location = get_ffmpeg_location()
    output_path = os.path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s")
    
    ydl_opts = {
        "format": "bestaudio/ba/best",
        "outtmpl": output_path,
        "noplaylist": True,
        "nocheckcertificate": True,
        "restrictfilenames": True,  # Replaces special unicode chars & pipes with safe ASCII
        "retries": 10,
        "sleep_interval": 1,
        "http_headers": {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        },
        "extractor_args": {
            "youtube": {
                "player_client": ["mweb", "android"]
            }
        },
        "quiet": True,
    }

    if ffmpeg_location:
        ydl_opts["ffmpeg_location"] = ffmpeg_location
        ydl_opts["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "wav",
                "preferredquality": "192",
            }
        ]

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        if not info:
            raise RuntimeError(f"Failed to extract info for URL: {url}")
            
        uploader = info.get('uploader') or info.get('channel') or info.get('uploader_id') or 'Unknown'
        title = info.get('title') or ''
        description = info.get('description') or ''

        # Optionally attempt subtitle extraction (non-fatal if rate-limited by HTTP 429)
        subtitles_text = ""
        try:
            base_name_search = os.path.splitext(ydl.prepare_filename(info))[0]
            subtitles_text = extract_subtitle_text(DOWNLOAD_DIR, base_name_search)
        except Exception as sub_err:
            print(f"[Subtitle Download Note] {sub_err}")

        meta = {
            "title": title,
            "uploader": uploader,
            "channel": info.get('channel') or uploader,
            "description": description[:3000],
            "subtitles": subtitles_text
        }

        if ffmpeg_location:
            filename = ydl.prepare_filename(info)
            base_name, _ = os.path.splitext(filename)
            audio_filename = f"{base_name}.wav"
        else:
            audio_filename = ydl.prepare_filename(info)

    if not os.path.exists(audio_filename) or os.path.getsize(audio_filename) < 10000:
        # Fallback search if extension or filename differed
        base_search = os.path.splitext(ydl.prepare_filename(info))[0]
        possible_files = [
            os.path.join(DOWNLOAD_DIR, f) 
            for f in os.listdir(DOWNLOAD_DIR) 
            if f.startswith(os.path.basename(base_search)) and os.path.getsize(os.path.join(DOWNLOAD_DIR, f)) > 10000
        ]
        if possible_files:
            audio_filename = possible_files[0]
        else:
            # Remove invalid corrupt 0-byte/78-byte files if created
            if os.path.exists(audio_filename):
                os.remove(audio_filename)
            raise FileNotFoundError(f"Audio download failed or was rate-limited (HTTP 429/403) for {url}")
            
    return audio_filename, meta

def convert_to_wav(input_path: str) -> str:
    """Convert any uploaded audio/video file to 16kHz mono WAV format using pydub."""
    ffmpeg_location = get_ffmpeg_location()
    if ffmpeg_location:
        AudioSegment.converter = ffmpeg_location

    output_path = os.path.splitext(input_path)[0] + "_converted.wav"
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_channels(1).set_frame_rate(16000)
    audio.export(output_path, format="wav")
    return output_path


def chunk_audio(wav_path: str, chunk_minutes: int = 10) -> list[str]:
    """
    Split a large WAV file into smaller chunks to avoid memory errors during Whisper processing.
    """
    wav_path = os.path.abspath(wav_path)
    if not os.path.exists(wav_path) or os.path.getsize(wav_path) < 10000:
        raise FileNotFoundError(f"Audio file is empty or corrupted (size < 10KB): {wav_path}")

    ffmpeg_location = get_ffmpeg_location()
    if ffmpeg_location:
        AudioSegment.converter = ffmpeg_location

    audio = AudioSegment.from_file(wav_path)
    if len(audio) == 0:
        raise ValueError(f"Audio file contains 0 milliseconds of sound: {wav_path}")

    chunk_ms = chunk_minutes * 60 * 1000  # Convert minutes to milliseconds

    # If audio is under chunk_minutes, use original WAV directly without splitting/re-exporting
    if len(audio) <= chunk_ms:
        return [wav_path]

    chunks = []
    base_name, _ = os.path.splitext(wav_path)

    for i, start in enumerate(range(0, len(audio), chunk_ms)):
        chunk = audio[start : start + chunk_ms]
        chunk_path = f"{base_name}_chunk_{i}.wav"
        chunk.export(chunk_path, format="wav")
        chunks.append(chunk_path)

    return chunks

def process_input(source: str) -> tuple[list[str], dict]:
    """
    Main entry point to process any input (YouTube URL or local file path) into audio chunks.
    """
    meta = {}
    if source.startswith("http://") or source.startswith("https://"):
        print("Detected YouTube URL. Downloading audio and video metadata...")
        wav_path, meta = download_youtube_audio(source)
    else:
        print("Detected local file. Converting to WAV...")
        wav_path = convert_to_wav(source)
        meta = {"title": os.path.basename(source), "uploader": "Local Presenter", "channel": "Local Media", "description": ""}

    print("Chunking audio...")
    chunks = chunk_audio(wav_path)
    print(f"Audio ready - {len(chunks)} chunk(s) created.")
    return chunks, meta

