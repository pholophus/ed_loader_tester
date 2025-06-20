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
    all_source_x_zero = True
    all_source_y_zero = True
    has_source_x_non_zero = False
    has_source_y_non_zero = False

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
        
        # Update flags for first trace
        if values["Source_X"] != 0:
            all_source_x_zero = False
            has_source_x_non_zero = True
        if values["Source_Y"] != 0:
            all_source_y_zero = False
            has_source_y_non_zero = True

        # Get file size and calculate number of traces
        file_size = os.path.getsize(filepath)
        f.seek(3200 + 400 + 114)  # Move to number of samples in trace header (bytes 115-116)
        num_samples_bytes = f.read(2)
        num_samples = int.from_bytes(num_samples_bytes, byteorder='big', signed=False) if len(num_samples_bytes) == 2 else 0
        
        trace_size = 240 + (num_samples * 4)  # 240 for trace header + (num_samples * 4 bytes per sample)
        num_traces = (file_size - 3600) // trace_size if trace_size > 0 else 0
        
        if num_traces > 1:
            # Sample traces to check coordinates (check first 10, middle, and last 10)
            sample_traces = []
            if num_traces <= 20:
                sample_traces = list(range(num_traces))
            else:
                sample_traces = (list(range(10)) + 
                               [num_traces // 2] + 
                               list(range(max(10, num_traces - 10), num_traces)))
            
            for trace_idx in sample_traces:
                trace_pos = 3600 + (trace_size * trace_idx)
                f.seek(trace_pos + 72)  # Source X
                src_x = int.from_bytes(f.read(4), byteorder='big', signed=True)
                f.seek(trace_pos + 76)  # Source Y
                src_y = int.from_bytes(f.read(4), byteorder='big', signed=True)
                if src_x != 0:
                    all_source_x_zero = False
                    has_source_x_non_zero = True
                if src_y != 0:
                    all_source_y_zero = False
                    has_source_y_non_zero = True
                # Early exit if both coordinates have non-zero values
                if not all_source_x_zero and not all_source_y_zero:
                    break
            
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
            
            # Update flags for last trace
            if last_source_x != 0:
                all_source_x_zero = False
                has_source_x_non_zero = True
            if last_source_y != 0:
                all_source_y_zero = False
                has_source_y_non_zero = True
    
    # Set error_field based on coordinate checks
    error_field = {
        "type": None,
        "message": None
    }
    if all_source_x_zero and all_source_y_zero:
        error_field = {
            "type": "zero_coordinates",
            "message": "All Source_X and Source_Y are zero"
        }
    elif all_source_x_zero and has_source_y_non_zero:
        error_field = {
            "type": "zero_coordinates",
            "message": "All Source_X are zero, but Source_Y has non-zero values"
        }
    elif all_source_y_zero and has_source_x_non_zero:
        error_field = {
            "type": "zero_coordinates",
            "message": "All Source_Y are zero, but Source_X has non-zero values"
        }
    
    return values, error_field

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
            header_values, error_field = extract_header_bytes(filepath, header_bytes)
            
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

            # Attempt to remove the parent folder name prefix and leading separators if present
            actual_file_name = composite_file_name
            if composite_file_name.startswith(folder_name):
                actual_file_name = composite_file_name[len(folder_name):]
                # Remove leading separators if any remain (like _, -)
                while actual_file_name and actual_file_name[0] in ('_', '-'):
                    actual_file_name = actual_file_name[1:]

            return {
                "folder_name": folder_name,
                "composite_file_name": composite_file_name,
                "file_name": actual_file_name,
                "edafy_seismic_id": "",
                "seismic_name": os.path.splitext(actual_file_name)[0],
                "extensionType": "SEGY",
                "category": "",
                "subcategory": "",
                "description": "",
                "item": "",
                "remarks": "",
                "created_for": "",
                "created_by": "",
                "created_date": "",
                "first_field_file": str(header_values.get("First_FFID")),
                "last_field_file": str(header_values.get("Last_FFID")),
                "bin_spacing": "",
                "first_trc": "1",
                "last_trc": str(ntraces),
                "ntraces": ntraces,
                "sample_type": "4-byte IBM floating point",
                "sample_rate": interval / 1000,
                "sample_rate_uom": "seconds",
                "record_length": nsamples * interval / 1000,
                "record_length_uom": "seconds",
                "file_windows_path": filepath.replace('/', '\\'),
                "file_unix_path": filepath.replace('\\', '/'),
                "file_size_bytes": file_size,
                "header_values": formatted_headers,
                "unique_id": unique_id,
                "first5_samples": first5_samples,
                "error": error_field
            }
    except Exception as e:
        return {
            "file_name": os.path.basename(filepath),
            "error": {
                "type": "processing_error",
                "message": str(e)
            },
            "header_values": {}
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": {
                "type": "input_error",
                "message": "No .sgy file path provided. Usage: python script.py <path_to_sgy_file>"
            }
        }, indent=2))
        sys.exit(1)
    path = sys.argv[1]
    if os.path.isfile(path) and path.lower().endswith((".sgy", ".segy")):
        result = read_segy(path)
        print(json.dumps(result, indent=2))
    else:
        print(json.dumps({
            "error": {
                "type": "path_error",
                "message": f"Provided path '{path}' is not a valid .sgy file"
            }
        }, indent=2))
        sys.exit(1)