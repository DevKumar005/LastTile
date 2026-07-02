"""
LastTile — Python AI Auto-Solver HTTP Server
Listens on http://localhost:8000/api/solve
Uses Python 3 Standard Library (http.server) — zero external pip dependencies required!
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import os
from solver import PuzzleSolver

PORT = int(os.environ.get("PORT", 8000))

class SolverRequestHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/" or self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._set_cors_headers()
            self.end_headers()
            response = {"status": "online", "message": "LastTile Python Auto-Solver API is running!"}
            self.wfile.write(json.dumps(response).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/api/solve":
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)

            try:
                data = json.loads(post_body.decode("utf-8"))
                board = data.get("board")
                size = int(data.get("size", 4))

                if not board or not isinstance(board, list):
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self._set_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Invalid board data"}).encode("utf-8"))
                    return

                solver = PuzzleSolver(size)
                solution_path = solver.solve(board)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self._set_cors_headers()
                self.end_headers()

                res = {
                    "status": "success",
                    "size": size,
                    "movesCount": len(solution_path) if solution_path else 0,
                    "solution": solution_path or []
                }
                self.wfile.write(json.dumps(res).encode("utf-8"))

            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, SolverRequestHandler)
    print(f"🚀 LastTile Python Auto-Solver Server running at http://localhost:{PORT}/")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
