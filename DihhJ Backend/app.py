#!/usr/bin/env python3
"""
Pure Python HTTP server for DihhJ Backend
No external dependencies - should work on any Python installation
"""
import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

class DihhJHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Credentials', 'true')

    def send_json_response(self, data, status_code=200):
        """Send JSON response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/':
            self.send_json_response({
                "message": "DihhJ Backend is alive! 🎉",
                "status": "healthy",
                "version": "1.0.0-pure-python",
                "no_dependencies": True,
                "frontend_url": "https://dihhjbitchin-ido5.onrender.com"
            })
        
        elif path == '/health':
            self.send_json_response({
                "status": "healthy",
                "message": "DihhJ Backend is running",
                "version": "1.0.0-pure-python"
            })
        
        elif path == '/api/test':
            self.send_json_response({
                "message": "API is working!",
                "status": "success",
                "data": {
                    "backend": "DihhJ Backend",
                    "version": "1.0.0-pure-python",
                    "dependencies": "none"
                }
            })
        
        elif path == '/api/tea':
            self.send_json_response({
                "message": "Tea posts endpoint working",
                "posts": [
                    {
                        "id": "1",
                        "title": "Sample Tea Post",
                        "content": "This is a sample tea post to test the API",
                        "author": "test_user",
                        "created_at": "2024-01-01T00:00:00Z",
                        "votes": 5
                    }
                ]
            })
        
        else:
            self.send_json_response({
                "error": "Not Found",
                "message": f"Endpoint {path} not found"
            }, 404)

    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            if content_length > 0:
                data = json.loads(post_data.decode('utf-8'))
            else:
                data = {}
        except json.JSONDecodeError:
            data = {}
        
        if path == '/api/tea':
            self.send_json_response({
                "message": "Tea post creation endpoint working",
                "status": "success",
                "received_data": data
            })
        
        elif path == '/api/register':
            self.send_json_response({
                "message": "Registration endpoint working",
                "status": "success",
                "received_data": data
            })
        
        elif path == '/api/login':
            self.send_json_response({
                "message": "Login endpoint working",
                "status": "success",
                "received_data": data
            })
        
        else:
            self.send_json_response({
                "error": "Not Found",
                "message": f"Endpoint {path} not found"
            }, 404)

    def log_message(self, format, *args):
        """Override to customize logging"""
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def run_server():
    """Run the HTTP server"""
    port = int(os.environ.get('PORT', 8000))
    host = '0.0.0.0'
    
    server = HTTPServer((host, port), DihhJHandler)
    
    print("🚀 Starting DihhJ Backend (Pure Python Version)...")
    print(f"📍 Server running at: http://{host}:{port}")
    print("🔧 This is a pure Python version with no external dependencies")
    print("✅ Should work on any Python installation")
    print("-" * 60)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        server.shutdown()

if __name__ == "__main__":
    run_server()
