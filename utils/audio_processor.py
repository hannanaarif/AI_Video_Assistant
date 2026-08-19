import yt_dlp
import os
import shutil

DOWNLOAD_DIR = 'downloads'
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def download_youtube_audio(url: str) -> str:
    ffmpeg_location = None
    if shutil.which('ffmpeg') is not None:
        ffmpeg_location = shutil.which('ffmpeg')
    else:
        try:
            import importlib
            imageio_ffmpeg = importlib.import_module('imageio_ffmpeg')
            ffmpeg_location = imageio_ffmpeg.get_ffmpeg_exe()
        except ImportError:
            ffmpeg_location = None

    output_path = os.path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s")
    
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": output_path,
        "noplaylist": True,
        "nocheckcertificate": True,
        "extractor_args": {
            "youtube": {
                "player_client": ["android", "mweb"]
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
        if ffmpeg_location:
            filename = ydl.prepare_filename(info)
            base_name, _ = os.path.splitext(filename)
            audio_filename = f"{base_name}.wav"
        else:
            audio_filename = ydl.prepare_filename(info)
            
    return audio_filename

