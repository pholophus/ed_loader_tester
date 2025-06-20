import lasio
import os
import json
import sys
import pandas as pd

def validate_depth_step(depths):
    if len(depths) < 2:
        return True, None
    step = round(depths[1] - depths[0], 5)
    for i in range(1, len(depths)):
        if round(depths[i] - depths[i - 1], 5) != step:
            return False, step
    return True, step

def parse_single_las_file(file_path):
    if not os.path.exists(file_path):
        return {
            "file_name": os.path.basename(file_path),
            "well_name": os.path.splitext(os.path.basename(file_path))[0],
            "edafy_well_id": "",
            "error": f"File not found: {file_path}",
            "success": False
        }

    try:
        las = lasio.read(file_path)
    except Exception as e:
        return {
            "file_name": os.path.basename(file_path),
            "well_name": os.path.splitext(os.path.basename(file_path))[0],
            "edafy_well_id": "",
            "error": f"Failed to read LAS file: {e}",
            "success": False
        }

    # === Extract ~V Version Info ===
    version_info = {item.mnemonic: {"value": item.value, "description": item.descr} for item in las.version}

    # === Extract ~W Well Info ===
    well_info = {item.mnemonic.lower(): item.value for item in las.well}
    key_well_info = {
        "creation_date": well_info.get("date"),
        "start_depth": well_info.get("strt"),
        "stop_depth": well_info.get("stop"),
        "company": well_info.get("comp"),
        "well_name": well_info.get("well"),
        "field": well_info.get("fld"),
        "location": well_info.get("loc"),
        "state": well_info.get("stat"),
        "country": well_info.get("ctry"),
        "uwi": well_info.get("uwi"),
        "latitude": well_info.get("lati"),
        "longitude": well_info.get("long"),
    }

    # === Extract ~A ASCII Log Data ===
    df = las.df().reset_index()
    df.columns = [col.strip() for col in df.columns]
    depth_column = df.columns[0]
    depth_values = df[depth_column].tolist()
    is_valid_depth, step = validate_depth_step(depth_values)

    ascii_info = {
        "row_count": len(df),
        "depth_stepping_consistent": is_valid_depth,
        "step_size": step
    }

    # === Construct Final Data Structure ===
    data = {
        "file_name": os.path.basename(file_path),
        "well_name": os.path.splitext(os.path.basename(file_path))[0],
        "edafy_well_id": "",
        "version_info": version_info,
        "well_info": key_well_info,
        "ascii_data_summary": ascii_info,
        "success": True,
        "extensionType": "LAS",
        "file_windows_path": file_path.replace('/', '\\'),
        "file_unix_path": file_path.replace('\\', '/'),
        "file_size_bytes": os.path.getsize(file_path),
    }

    return data

def process_file_list(file_list_path):
    results = []
    try:
        with open(file_list_path, 'r') as f:
            for line in f:
                filepath = line.strip()
                if filepath.lower().endswith(".las") and os.path.isfile(filepath):
                    results.append(parse_single_las_file(filepath))
    except Exception as e:
        results.append({
            "file_name": os.path.basename(file_list_path),
            "well_name": os.path.splitext(os.path.basename(file_list_path))[0],
            "edafy_well_id": "",
            "error": f"Failed to read file list: {str(e)}",
            "success": False
        })
    return results

if __name__ == "__main__":
    file_list_path = "scripts/data/las_list.txt"  # Hardcoded file list path
    if os.path.isfile(file_list_path):
        result = process_file_list(file_list_path)
    else:
        result = [{
            "error": {
                "type": "path_error",
                "message": "Hardcoded file list path 'scripts/data/las_list.txt' is not a file"
            },
            "success": False
        }]
    print(json.dumps(result, indent=2))