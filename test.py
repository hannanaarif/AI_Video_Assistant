from dotenv import load_dotenv
load_dotenv()

from utils.audio_processor import process_input
from core.transcriber import transcribe_all

source = "https://www.youtube.com/watch?v=OxEMHsCKTWo&t=128s"
language = "hinglish"  # change to "hinglish" to test Sarvam

chunks = process_input(source)
transcript = transcribe_all(chunks, language=language)

print("\n=== TRANSCRIPT ===\n")
print(transcript)