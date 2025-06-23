#!/usr/bin/env python3
"""
Backend Services - Contains the actual business logic
This file contains all the methods that the electron_backend.py will call
"""

import json
import time
from datetime import datetime

# Import the LAS extractor
try:
    from las_extractor import extract_metadata, get_las_summary
    LAS_AVAILABLE = True
except ImportError as e:
    LAS_AVAILABLE = False
    LAS_IMPORT_ERROR = str(e)

class CalculatorService:
    """Service for mathematical calculations"""
    
    def add(self, a, b):
        return a + b
    
    def subtract(self, a, b):
        return a - b
    
    def multiply(self, a, b):
        return a * b
    
    def divide(self, a, b):
        if b == 0:
            raise ValueError("Division by zero")
        return a / b
    
    def power(self, a, b):
        return a ** b
    
    def calculate(self, operation, a, b):
        """Main calculation method"""
        operations = {
            'add': self.add,
            'subtract': self.subtract,
            'multiply': self.multiply,
            'divide': self.divide,
            'power': self.power
        }
        
        if operation not in operations:
            raise ValueError(f"Unknown operation: {operation}")
        
        return operations[operation](a, b)

class DataService:
    """Service for data operations"""
    
    def __init__(self):
        # Simulate some in-memory data
        self.users = [
            {"id": 1, "name": "John Doe", "email": "john@example.com", "role": "developer"},
            {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "role": "designer"},
            {"id": 3, "name": "Bob Johnson", "email": "bob@example.com", "role": "manager"}
        ]
        self.stats = {
            "requests_processed": 0,
            "start_time": time.time(),
            "status": "healthy"
        }
    
    def get_user(self, user_id=None):
        """Get user by ID or return all users"""
        if user_id is None:
            return self.users
        
        user = next((u for u in self.users if u["id"] == user_id), None)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        return user
    
    def get_stats(self):
        """Get system statistics"""
        current_time = time.time()
        uptime_seconds = current_time - self.stats["start_time"]
        
        return {
            "requests_processed": self.stats["requests_processed"],
            "uptime_seconds": uptime_seconds,
            "uptime_formatted": self._format_uptime(uptime_seconds),
            "status": self.stats["status"],
            "timestamp": datetime.now().isoformat()
        }
    
    def increment_request_count(self):
        """Increment the request counter"""
        self.stats["requests_processed"] += 1
    
    def _format_uptime(self, seconds):
        """Format uptime in human readable format"""
        if seconds < 60:
            return f"{int(seconds)} seconds"
        elif seconds < 3600:
            return f"{int(seconds/60)} minutes"
        else:
            hours = int(seconds/3600)
            minutes = int((seconds % 3600) / 60)
            return f"{hours}h {minutes}m"

class FileService:
    """Service for file operations (placeholder for future expansion)"""
    
    def list_files(self, directory="."):
        """List files in directory"""
        import os
        try:
            files = os.listdir(directory)
            return {
                "directory": directory,
                "files": files,
                "count": len(files)
            }
        except Exception as e:
            raise ValueError(f"Error listing files: {str(e)}")
    
    def get_file_info(self, filepath):
        """Get file information"""
        import os
        try:
            if not os.path.exists(filepath):
                raise ValueError(f"File not found: {filepath}")
            
            stat = os.stat(filepath)
            return {
                "filepath": filepath,
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "is_file": os.path.isfile(filepath),
                "is_directory": os.path.isdir(filepath)
            }
        except Exception as e:
            raise ValueError(f"Error getting file info: {str(e)}")

class LASService:
    """Service for LAS file operations"""
    
    def __init__(self):
        self.available = LAS_AVAILABLE
        self.error_message = LAS_IMPORT_ERROR if not LAS_AVAILABLE else None
    
    def extract_metadata(self, file_path):
        """Extract full metadata from LAS file"""
        if not self.available:
            raise ValueError(f"LAS extraction not available: {self.error_message}")
        
        try:
            metadata = extract_metadata(file_path)
            return metadata
        except Exception as e:
            raise ValueError(f"LAS metadata extraction failed: {str(e)}")
    
    def get_summary(self, file_path):
        """Get quick summary of LAS file"""
        if not self.available:
            raise ValueError(f"LAS extraction not available: {self.error_message}")
        
        try:
            summary = get_las_summary(file_path)
            return summary
        except Exception as e:
            raise ValueError(f"LAS summary failed: {str(e)}")
    
    def get_status(self):
        """Get LAS service status"""
        return {
            "available": self.available,
            "error": self.error_message,
            "wellio_installed": LAS_AVAILABLE
        }

# Main service container
class BackendServices:
    """Main service container that electron_backend.py will use"""
    
    def __init__(self):
        self.calculator = CalculatorService()
        self.data = DataService()
        self.file = FileService()
        self.las = LASService()
    
    def ping(self):
        """Health check endpoint"""
        return {
            "message": "pong",
            "timestamp": datetime.now().isoformat(),
            "status": "healthy"
        }
    
    def calculate(self, params):
        """Calculator endpoint"""
        try:
            a = params.get('a')
            b = params.get('b')
            operation = params.get('operation', 'add')
            
            if a is None or b is None:
                raise ValueError("Parameters 'a' and 'b' are required")
            
            result = self.calculator.calculate(operation, a, b)
            self.data.increment_request_count()
            
            return {"result": result}
        except Exception as e:
            raise ValueError(f"Calculation error: {str(e)}")
    
    def get_data(self, params):
        """Data retrieval endpoint"""
        try:
            data_type = params.get('type', 'default')
            
            if data_type == 'user':
                user_id = params.get('user_id')
                data = self.data.get_user(user_id)
            elif data_type == 'stats':
                data = self.data.get_stats()
            elif data_type == 'files':
                directory = params.get('directory', '.')
                data = self.file.list_files(directory)
            else:
                data = {
                    "message": "Hello from Python backend services!",
                    "timestamp": datetime.now().isoformat(),
                    "available_types": ["user", "stats", "files"]
                }
            
            self.data.increment_request_count()
            return {"data": data}
            
        except Exception as e:
            raise ValueError(f"Data retrieval error: {str(e)}")
    
    def get_file_info(self, params):
        """File information endpoint"""
        try:
            filepath = params.get('filepath')
            if not filepath:
                raise ValueError("Parameter 'filepath' is required")
            
            info = self.file.get_file_info(filepath)
            self.data.increment_request_count()
            
            return {"file_info": info}
            
        except Exception as e:
            raise ValueError(f"File info error: {str(e)}")
    
    def extract_las_metadata(self, params):
        """Extract LAS file metadata endpoint"""
        try:
            file_path = params.get('file_path')
            if not file_path:
                raise ValueError("Parameter 'file_path' is required")
            
            metadata = self.las.extract_metadata(file_path)
            self.data.increment_request_count()
            
            return {"las_metadata": metadata}
            
        except Exception as e:
            raise ValueError(f"LAS metadata extraction error: {str(e)}")
    
    def get_las_summary(self, params):
        """Get LAS file summary endpoint"""
        try:
            file_path = params.get('file_path')
            if not file_path:
                raise ValueError("Parameter 'file_path' is required")
            
            summary = self.las.get_summary(file_path)
            self.data.increment_request_count()
            
            return {"las_summary": summary}
            
        except Exception as e:
            raise ValueError(f"LAS summary error: {str(e)}")
    
    def get_las_status(self, params):
        """Get LAS service status endpoint"""
        try:
            status = self.las.get_status()
            self.data.increment_request_count()
            
            return {"las_status": status}
            
        except Exception as e:
            raise ValueError(f"LAS status error: {str(e)}") 