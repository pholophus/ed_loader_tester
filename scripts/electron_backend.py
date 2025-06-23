#!/usr/bin/env python3
"""
Electron Backend - Communication layer
This handles stdin/stdout communication and routes requests to backend services
"""

import json
import sys
from backend_services import BackendServices

class ElectronBackend:
    def __init__(self):
        self.running = True
        self.services = BackendServices()
        
    def handle_request(self, request_data):
        """Route requests to appropriate service methods"""
        try:
            endpoint = request_data.get('endpoint')
            params = request_data.get('params', {})
            
            # Route to service methods
            if endpoint == 'ping':
                return self.services.ping()
            elif endpoint == 'calculate':
                return self.services.calculate(params)
            elif endpoint == 'get_data':
                return self.services.get_data(params)
            elif endpoint == 'get_file_info':
                return self.services.get_file_info(params)
            elif endpoint == 'extract_las_metadata':
                return self.services.extract_las_metadata(params)
            elif endpoint == 'get_las_summary':
                return self.services.get_las_summary(params)
            elif endpoint == 'get_las_status':
                return self.services.get_las_status(params)
            elif endpoint == 'shutdown':
                self.running = False
                return {"message": "Shutting down..."}
            else:
                return {"error": f"Unknown endpoint: {endpoint}"}
                
        except ValueError as e:
            # Business logic errors (from services)
            return {"error": str(e)}
        except Exception as e:
            # Unexpected errors
            return {"error": f"Request handling error: {str(e)}"}
    
    def run(self):
        """Main loop - listen for requests on stdin"""
        try:
            # Send ready signal
            print(json.dumps({"status": "ready", "message": "Python backend started"}), flush=True)
            
            while self.running:
                try:
                    # Read line from stdin
                    line = sys.stdin.readline()
                    if not line:  # EOF
                        break
                        
                    line = line.strip()
                    if not line:  # Empty line
                        continue
                    
                    # Parse JSON request
                    request_data = json.loads(line)
                    
                    # Handle request using services
                    response = self.handle_request(request_data)
                    
                    # Send JSON response
                    print(json.dumps(response), flush=True)
                    
                except json.JSONDecodeError as e:
                    error_response = {"error": f"Invalid JSON: {str(e)}"}
                    print(json.dumps(error_response), flush=True)
                except Exception as e:
                    error_response = {"error": f"Unexpected error: {str(e)}"}
                    print(json.dumps(error_response), flush=True)
                    
        except KeyboardInterrupt:
            pass
        except Exception as e:
            error_response = {"error": f"Fatal error: {str(e)}"}
            print(json.dumps(error_response), flush=True)
        finally:
            # Send shutdown signal
            print(json.dumps({"status": "shutdown", "message": "Python backend stopped"}), flush=True)

if __name__ == "__main__":
    backend = ElectronBackend()
    backend.run() 