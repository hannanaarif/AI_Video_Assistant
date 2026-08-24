import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from main import run_pipeline
from core.rag_engine import ask_question

load_dotenv()

# Global state to hold active RAG chain session
CURRENT_SESSION = {
  "rag_chain": None,
  "result": None
}

class RAGApiHandler(BaseHTTPRequestHandler):

    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            preview_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'preview.html')
            if os.path.exists(preview_path):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(preview_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "online", "service": "AI Video Assistant API"}).encode('utf-8'))

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            payload = json.loads(post_data.decode('utf-8'))
        except Exception:
            payload = {}

        if self.path == '/api/upload' or (self.path == '/api/analyze' and payload.get('filedata')):
            filename = payload.get('filename', 'uploaded_media.mp4')
            filedata = payload.get('filedata')
            language = payload.get('language', 'english')

            if not filedata:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Missing 'filedata' parameter"}).encode('utf-8'))
                return

            try:
                import base64
                if ',' in filedata:
                    filedata = filedata.split(',', 1)[1]
                file_bytes = base64.b64decode(filedata)
                
                os.makedirs("downloads", exist_ok=True)
                safe_filename = "".join([c for c in filename if c.isalnum() or c in "._- "]).strip()
                upload_path = os.path.abspath(os.path.join("downloads", safe_filename))
                
                with open(upload_path, "wb") as f:
                    f.write(file_bytes)

                print(f"\n[API] Running pipeline for uploaded file: {upload_path} ({len(file_bytes)} bytes, language: {language})...")
                result = run_pipeline(upload_path, language)
                CURRENT_SESSION["rag_chain"] = result["rag_chain"]
                CURRENT_SESSION["result"] = result

                response_data = {
                    "title": result["title"],
                    "summary": result["summary"],
                    "action_items": result["action_items"],
                    "key_decisions": result["key_decisions"],
                    "open_questions": result["open_questions"],
                }
                self._set_headers(200)
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
            except Exception as e:
                print(f"[API ERROR Upload] {e}")
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        elif self.path == '/api/analyze':
            source = payload.get('source')
            language = payload.get('language', 'english')

            if not source:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Missing 'source' parameter"}).encode('utf-8'))
                return

            print(f"\n[API] Running pipeline for source: {source} (language: {language})...")
            try:
                result = run_pipeline(source, language)
                CURRENT_SESSION["rag_chain"] = result["rag_chain"]
                CURRENT_SESSION["result"] = result

                response_data = {
                    "title": result["title"],
                    "summary": result["summary"],
                    "action_items": result["action_items"],
                    "key_decisions": result["key_decisions"],
                    "open_questions": result["open_questions"],
                }
                self._set_headers(200)
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
            except Exception as e:
                print(f"[API ERROR] {e}")
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        elif self.path == '/api/chat':
            question = payload.get('question')
            rag_chain = CURRENT_SESSION.get("rag_chain")

            if not question:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Missing 'question' parameter"}).encode('utf-8'))
                return

            if not rag_chain:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "No active RAG chain found. Please analyze a video first."}).encode('utf-8'))
                return

            print(f"[API] Asking RAG question: {question}")
            try:
                answer = ask_question(rag_chain, question)
                self._set_headers(200)
                self.wfile.write(json.dumps({"answer": answer}).encode('utf-8'))
            except Exception as e:
                print(f"[API ERROR] {e}")
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))


def run_api_server(port=8080):
    server_address = ('', port)
    httpd = HTTPServer(server_address, RAGApiHandler)
    print(f"\n🚀 AI Video Assistant RAG API Server listening on port {port}...")
    print(f"👉 Endpoints: POST /api/analyze, POST /api/chat\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping API server.")

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.getenv("PORT", "8080"))
    run_api_server(port)
