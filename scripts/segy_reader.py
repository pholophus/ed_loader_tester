import os
import segyio
import pandas as pd
import utm
import json
import numpy as np
from pathlib import Path
import re
import sys
import hashlib

# Optional: show all DataFrame content
pd.set_option("display.max_rows", None)
pd.set_option("display.max_columns", None)
pd.set_option("display.width", 0)

# Add missing trace field if needed
if not hasattr(segyio.TraceField, "SourcePoint"):
    segyio.TraceField.SourcePoint = 17

def extract_header_bytes(filepath, byte_indices):
    values = {}
    all_zero_coords = True  # Track if all srcx and srcy are zero
    # debug_info = {}

    with open(filepath, "rb") as f:
        # Read the first trace header for initial values
        f.seek(3200 + 400)  # Skip to first trace header
        
        # Basic header values
        for label, idx in byte_indices.items():
            f.seek(3200 + 400 + idx)  # 3200 for textual header, 400 for binary header
            byte = f.read(4)
            if len(byte) == 4:
                values[label] = int.from_bytes(byte, byteorder='big', signed=False)
            else:
                values[label] = None
        
        # Get source coordinates from first trace
        f.seek(3200 + 400 + 72)  # Source X (bytes 73-76)
        source_x_bytes = f.read(4)
        f.seek(3200 + 400 + 76)  # Source Y (bytes 77-80)
        source_y_bytes = f.read(4)
        
        values["Source_X"] = int.from_bytes(source_x_bytes, byteorder='big', signed=True) if len(source_x_bytes) == 4 else None
        values["Source_Y"] = int.from_bytes(source_y_bytes, byteorder='big', signed=True) if len(source_y_bytes) == 4 else None
        
        # debug_info["first_trace_source_x"] = values["Source_X"]
        # debug_info["first_trace_source_y"] = values["Source_Y"]
        
        # Check if first trace coordinates are non-zero
        if values["Source_X"] != 0 or values["Source_Y"] != 0:
            all_zero_coords = False
            # debug_info["first_trace_has_coords"] = True
        # else:
            # debug_info["first_trace_has_coords"] = False

        # Get file size and calculate number of traces
        file_size = os.path.getsize(filepath)
        f.seek(3200 + 400 + 114)  # Move to number of samples in trace header (bytes 115-116)
        num_samples_bytes = f.read(2)
        num_samples = int.from_bytes(num_samples_bytes, byteorder='big', signed=False) if len(num_samples_bytes) == 2 else 0
        
        trace_size = 240 + (num_samples * 4)  # 240 for trace header + (num_samples * 4 bytes per sample)
        num_traces = (file_size - 3600) // trace_size if trace_size > 0 else 0
        
        # debug_info["num_samples"] = num_samples
        # debug_info["trace_size"] = trace_size
        # debug_info["num_traces"] = num_traces
        # debug_info["file_size"] = file_size
        
        if num_traces > 1:
            # Sample a few traces to check coordinates (check first 10, middle, and last 10)
            sample_traces = []
            if num_traces <= 20:
                sample_traces = list(range(num_traces))
            else:
                sample_traces = (list(range(10)) + 
                               [num_traces // 2] + 
                               list(range(max(10, num_traces - 10), num_traces)))
            
            zero_count = 0
            non_zero_count = 0
            sample_coords = []
            
            for trace_idx in sample_traces:
                trace_pos = 3600 + (trace_size * trace_idx)
                f.seek(trace_pos + 72)  # Source X
                src_x = int.from_bytes(f.read(4), byteorder='big', signed=True)
                f.seek(trace_pos + 76)  # Source Y
                src_y = int.from_bytes(f.read(4), byteorder='big', signed=True)
                
                sample_coords.append({"trace": trace_idx, "x": src_x, "y": src_y})
                
                if src_x == 0 and src_y == 0:
                    zero_count += 1
                else:
                    non_zero_count += 1
                    all_zero_coords = False
            
            # debug_info["sample_coords"] = sample_coords
            # debug_info["zero_count"] = zero_count
            # debug_info["non_zero_count"] = non_zero_count
            # debug_info["sampled_traces"] = len(sample_traces)
            
            # Read last trace header for final values
            last_trace_pos = 3600 + (trace_size * (num_traces - 1))
            
            # Field Record numbers
            f.seek(last_trace_pos + 8)
            last_ffid = int.from_bytes(f.read(4), byteorder='big', signed=False)
            values["First_FFID"] = values.get("FFID")
            values["Last_FFID"] = last_ffid
            
            # Shot points
            f.seek(last_trace_pos + 16)
            last_sp = int.from_bytes(f.read(4), byteorder='big', signed=False)
            values["First_SP"] = values.get("ShotPoint")
            values["Last_SP"] = last_sp
            
            # CDP numbers
            f.seek(last_trace_pos + 20)
            last_cdp = int.from_bytes(f.read(4), byteorder='big', signed=False)
            values["First_CDP"] = values.get("CDP")
            values["Last_CDP"] = last_cdp
            
            # Inline numbers
            f.seek(last_trace_pos + 188)
            last_inline = int.from_bytes(f.read(4), byteorder='big', signed=False)
            values["First_Inline"] = values.get("Inline")
            values["Last_Inline"] = last_inline
            
            # Crossline numbers
            f.seek(last_trace_pos + 192)
            last_xline = int.from_bytes(f.read(4), byteorder='big', signed=False)
            values["First_Xline"] = values.get("Xline")
            values["Last_Xline"] = last_xline
            
            # Last source coordinates
            f.seek(last_trace_pos + 72)
            last_source_x = int.from_bytes(f.read(4), byteorder='big', signed=True)
            f.seek(last_trace_pos + 76)
            last_source_y = int.from_bytes(f.read(4), byteorder='big', signed=True)
            
            values["Last_Source_X"] = last_source_x
            values["Last_Source_Y"] = last_source_y
            
            # debug_info["last_trace_source_x"] = last_source_x
            # debug_info["last_trace_source_y"] = last_source_y
    
    # debug_info["all_zero_coords_result"] = all_zero_coords
    return values, all_zero_coords
    # return values, all_zero_coords, debug_info

def get_file_unique_id(filepath):
    hash_sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def read_segy(filepath):
    try:
        unique_id = get_file_unique_id(filepath)
        file_size = os.path.getsize(filepath)
        with segyio.open(filepath, "r", ignore_geometry=True) as segyfile:
            ntraces = segyfile.tracecount
            nsamples = segyfile.samples.size
            interval = segyfile.bin[segyio.BinField.Interval]
            first5_samples = segyfile.trace[0][:5].tolist()
            header_bytes = {
                "FFID": 8,
                "ShotPoint": 16,
                "CDP": 20,
                "Inline": 188,
                "Xline": 192,
            }
            header_values, all_zero_coords = extract_header_bytes(filepath, header_bytes)
            # header_values, all_zero_coords, debug_info = extract_header_bytes(filepath, header_bytes)
            
            # Set error field
            error_field = {
                "type": None,
                "message": None
            }
            if all_zero_coords:
                error_field = {
                    "type": "all_zero",
                    "message": "0 value for srcx and srcy"
                }
            
            # Format the header values to match SegyTable.vue field names
            formatted_headers = {
                "FSP": header_values.get("First_SP"),
                "LSP": header_values.get("Last_SP"),
                "First_CDP": header_values.get("First_CDP"),
                "Last_CDP": header_values.get("Last_CDP"),
                "Inline": header_values.get("First_Inline"),
                "Xline": header_values.get("First_Xline"),
            }
            
            # Get the parent folder name and base file name
            folder_name = os.path.basename(os.path.dirname(filepath))
            composite_file_name = os.path.basename(filepath)
            
            # Attempt to remove the parent folder name prefix and suffix
            actual_clean_name = os.path.basename(filepath)
            
            return {
                "file_name": actual_clean_name,
                "edafy_seismic_id": "",
                "seismic_name": os.path.splitext(actual_clean_name)[0],
                "header_values": formatted_headers,
                "unique_id": unique_id,
                "first5": first5_samples,
                "error": error_field,
                # "debug_info": debug_info  # Add debug information
            }
    except Exception as e:
        return {
            "file_name": os.path.basename(filepath),
            "error": {
                "error": "processing_error",
                "message": str(e)
            },
            "headers_values": {}
        }

def process_folder(folder_path):
    results = []
    try:
        for entry in sorted(os.scandir(folder_path), key=lambda e: e.name):
            if entry.is_file() and entry.name.lower().endswith((".sgy", ".segy")):
                results.append(read_segy(entry.path))
    except Exception as e:
        results.append({
            "error": {
                "type": "folder_error",
                "message": f"Failed to process folder: {str(e)}"
            }
        })
    return results

def main():
    if len(sys.argv) <= 1:
        return {
            "error": {
                "error": "input_error",
                "message": "Please provide a file or folder path"
            }
        }
    
    path = sys.argv[1]
    
    try:
        if os.path.isfile(path):
            return [read_segy(path)]
        elif os.path.isdir(path):
            return process_folder(path)
        else:
            return [{
                "error": {
                    "error": "path_error",
                    "message": "Provided path does not exist"
                }
            }]
    except Exception as e:
        return [{
            "error": {
                "error": "system_error",
                "message": f"Error accessing path: {str(e)}"
            }
        }]

if __name__ == "__main__":
    results = main()
    print(json.dumps(results, indent=2))