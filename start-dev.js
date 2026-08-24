import { spawn, exec } from 'child_process';
import path from 'path';

const pythonExecutable = path.resolve(process.cwd(), '.venv', 'bin', 'python');
const apiServerScript = path.resolve(process.cwd(), 'api_server.py');
const previewPath = path.resolve(process.cwd(), 'frontend', 'preview.html');

console.log('\n🚀 Starting AI Video Assistant Python Backend & Frontend...\n');
console.log('📡 Launching Python RAG API Server on http://localhost:8080 ...');

// Spawn Python API Server in terminal process
const pyServer = spawn(pythonExecutable, [apiServerScript, '8080'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

pyServer.on('error', (err) => {
  console.error('Failed to start Python API server:', err);
});

console.log(`📄 Opening local browser interface: file://${previewPath}\n`);

const openCmd = process.platform === 'darwin' 
  ? `open "${previewPath}"`
  : process.platform === 'win32'
  ? `start "" "${previewPath}"`
  : `xdg-open "${previewPath}"`;

setTimeout(() => {
  exec(openCmd);
}, 1200);
