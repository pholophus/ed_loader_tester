import os
import sys
import json

# 🔧 Hardcoded file list path
FILE_LIST_PATH = "scripts/data/others_list.txt"

def get_file_details(file_path):
    """
    Return basic file info using os functions.
    """
    if not os.path.exists(file_path):
        return {
            "file_name": os.path.basename(file_path),
            "error": f"File not found: {file_path}",
            "success": False
        }

    return {
        "file_name": os.path.basename(file_path),
        "file_extension": os.path.splitext(file_path)[1],
        "directory": os.path.dirname(file_path),
        "file_windows_path": file_path.replace('/', '\\'),
        "file_unix_path": file_path.replace('\\', '/'),
        "file_size_bytes": os.path.getsize(file_path),
        # "success": True
    }

def process_file_list(file_list_path):
    results = []
    try:
        with open(file_list_path, 'r') as f:
            for line in f:
                filepath = line.strip()
                if os.path.isfile(filepath):
                    results.append(get_file_details(filepath))
    except Exception as e:
        results.append({
            "file_name": os.path.basename(file_list_path),
            "error": f"Failed to read file list: {str(e)}",
            "success": False
        })
    return results

if __name__ == "__main__":
    if os.path.isfile(FILE_LIST_PATH):
        result = process_file_list(FILE_LIST_PATH)
    else:
        result = [{
            "error": {
                "type": "path_error",
                "message": f"Hardcoded file list path '{FILE_LIST_PATH}' is not a file"
            },
            "success": False
        }]
    print(json.dumps(result, indent=2))