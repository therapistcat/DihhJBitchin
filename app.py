#!/usr/bin/env python3
"""
EMERGENCY MINIMAL APP - Guaranteed to work on any Python version
"""
import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "message": "DihhJ Backend is alive! 🎉",
            "status": "healthy",
            "path": self.path,
            "python_version": sys.version,
            "frontend_url": "https://dihhjbitchin-ido5.onrender.com"
        }
        self.wfile.write(json.dumps(response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    server = HTTPServer(('0.0.0.0', port), SimpleHandler)
    print(f"🚀 Starting emergency HTTP server on port {port}")
    print(f"Python version: {sys.version}")
    server.serve_forever()
