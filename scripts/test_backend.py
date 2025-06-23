#!/usr/bin/env python3
"""
Test script for the electron backend
This script sends test requests to the backend and shows responses
"""

import subprocess
import json
import time
import sys

def test_backend():
    """Test the backend with various requests"""
    
    # Start the backend process
    print("🚀 Starting Python backend...")
    process = subprocess.Popen(
        ['python3', 'electron_backend.py'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=0  # Unbuffered
    )
    
    # Wait for ready signal
    try:
        ready_line = process.stdout.readline()
        print(f"📡 Backend status: {ready_line.strip()}")
    except Exception as e:
        print(f"❌ Failed to read ready signal: {e}")
        return
    
    # Test requests
    test_cases = [
        # Ping test
        {"endpoint": "ping"},
        
        # Calculator tests
        {"endpoint": "calculate", "params": {"a": 10, "b": 5, "operation": "add"}},
        {"endpoint": "calculate", "params": {"a": 10, "b": 3, "operation": "power"}},
        {"endpoint": "calculate", "params": {"a": 15, "b": 3, "operation": "divide"}},
        
        # Data tests
        {"endpoint": "get_data", "params": {"type": "user"}},
        {"endpoint": "get_data", "params": {"type": "user", "user_id": 1}},
        {"endpoint": "get_data", "params": {"type": "stats"}},
        {"endpoint": "get_data", "params": {"type": "files", "directory": "."}},
        {"endpoint": "get_data"},  # default
        
        # File info test
        {"endpoint": "get_file_info", "params": {"filepath": "electron_backend.py"}},
        
        # LAS service tests
        {"endpoint": "get_las_status"},  # Check if LAS service is available
        {"endpoint": "get_las_summary", "params": {"file_path": "nonexistent.las"}},  # Test error handling
        # Note: We can't test actual LAS extraction without a real LAS file
        
        # Error tests
        {"endpoint": "calculate", "params": {"a": 10, "b": 0, "operation": "divide"}},  # Division by zero
        {"endpoint": "unknown_endpoint"},  # Unknown endpoint
        
        # Shutdown
        {"endpoint": "shutdown"}
    ]
    
    print("\n🧪 Running test cases...\n")
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"Test {i}: {json.dumps(test_case)}")
        
        try:
            # Check if process is still running
            if process.poll() is not None:
                print("❌ Backend process has terminated")
                break
                
            # Send request
            request_json = json.dumps(test_case) + '\n'
            process.stdin.write(request_json)
            process.stdin.flush()
            
            # Read response with timeout
            response_line = process.stdout.readline()
            if response_line:
                try:
                    response = json.loads(response_line.strip())
                    print(f"✅ Response: {json.dumps(response, indent=2)}")
                except json.JSONDecodeError as e:
                    print(f"❌ Invalid JSON response: {response_line.strip()}")
            else:
                print("❌ No response received")
                
        except BrokenPipeError:
            print("❌ Backend process terminated unexpectedly")
            break
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        print("-" * 50)
        time.sleep(0.1)  # Small delay between requests
    
    # Wait for process to finish
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()
        
    print("\n✅ Backend test completed!")

def test_las_with_file(las_file_path):
    """Test LAS extraction with a specific file"""
    print(f"🧪 Testing LAS extraction with file: {las_file_path}")
    
    process = subprocess.Popen(
        ['python3', 'electron_backend.py'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=0  # Unbuffered
    )
    
    # Wait for ready signal
    try:
        ready_line = process.stdout.readline()
        print(f"📡 Backend status: {ready_line.strip()}")
    except Exception as e:
        print(f"❌ Failed to read ready signal: {e}")
        return
    
    # Test LAS-specific requests
    las_tests = [
        {"endpoint": "get_las_status"},
        {"endpoint": "get_las_summary", "params": {"file_path": las_file_path}},
        {"endpoint": "extract_las_metadata", "params": {"file_path": las_file_path}},
        {"endpoint": "shutdown"}
    ]
    
    for i, test_case in enumerate(las_tests, 1):
        print(f"\nLAS Test {i}: {json.dumps(test_case)}")
        
        try:
            # Check if process is still running
            if process.poll() is not None:
                print("❌ Backend process has terminated")
                break
                
            # Send request
            request_json = json.dumps(test_case) + '\n'
            process.stdin.write(request_json)
            process.stdin.flush()
            
            # Read response
            response_line = process.stdout.readline()
            if response_line:
                try:
                    response = json.loads(response_line.strip())
                    print(f"✅ Response: {json.dumps(response, indent=2)}")
                except json.JSONDecodeError as e:
                    print(f"❌ Invalid JSON response: {response_line.strip()}")
            else:
                print("❌ No response received")
                
        except BrokenPipeError:
            print("❌ Backend process terminated unexpectedly")
            break
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        print("-" * 50)
    
    # Wait for process to finish
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()
        
    print("\n✅ LAS test completed!")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Test with specific LAS file
        las_file = sys.argv[1]
        test_las_with_file(las_file)
    else:
        # Run general tests
        test_backend()
        print("\n💡 To test LAS extraction with a specific file:")
        print("   python3 test_backend.py /path/to/your/file.las")
        print("\n💡 To install wellio for LAS support:")
        print("   pip install wellio") 