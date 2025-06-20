import os
import sys
import json
import segyio
import hashlib
import struct
import pandas as pd

# Default header byte positions and format
DEFAULT_HEADER_BYTES = {
    "FFID": 8,      # Bytes 9-12
    "ShotPoint": 16, # Bytes 17-20
    "CDP": 20,      # Bytes 21-24
    "Inline": 188,  # Bytes 189-192
    "Xline": 192    # Bytes 193-196
}
DEFAULT_FORMAT = "4-bit"  # Default format for headers
DEFAULT_COORD_BYTES = {
    "Source_X": 72,  # Bytes 73-76
    "Source_Y": 76   # Bytes 77-80
}

def get_header_bytes_config(input_data):
    """Determine format, gaps, headers, byte positions, and coordinate config from input"""
    config = {
        "headers": [],
        "format": DEFAULT_FORMAT,
        "gaps": {
            "FFID": None,
            "ShotPoint": None,
            "CDP": None,
            "Inline": None,
            "Xline": None
        },
        "byte_positions": {},
        "coordinate_config": {
            "srcx_value": DEFAULT_COORD_BYTES["Source_X"],
            "srcy_value": DEFAULT_COORD_BYTES["Source_Y"],
            "srcx_format": DEFAULT_FORMAT,
            "srcy_format": DEFAULT_FORMAT
        }
    }
    
    # Get header bytes from input_data
    user_headers = input_data.get("header_bytes", {})
    config["headers"] = [h for h in user_headers.keys() if h in DEFAULT_HEADER_BYTES]
    
    # Resolve byte positions for headers
    for header in config["headers"]:
        user_value = user_headers.get(header)
        if user_value is not None:
            config["byte_positions"][header] = user_value
            print(f"Using user-provided byte position for {header}: {user_value}", file=sys.stderr)
        else:
            config["byte_positions"][header] = DEFAULT_HEADER_BYTES.get(header, None)
            print(f"Using default byte position for {header}: {config['byte_positions'][header]}", file=sys.stderr)
    
    # Handle format and gaps
    input_format = input_data.get("format", DEFAULT_FORMAT)
    if isinstance(input_format, dict):
        input_format = input_format.get("Format", DEFAULT_FORMAT)
    if isinstance(input_format, str):
        input_format = input_format.lower()
        if input_format in ["ibm", "ieee"]:
            config["format"] = input_format
        elif input_format == "uint32":
            config["format"] = "uint32"
        elif input_format == "2-bit":
            config["format"] = "int32"
            for header in config["headers"]:
                config["gaps"][header] = 2
        elif input_format == "4-bit":
            config["format"] = "int32"
            for header in config["headers"]:
                config["gaps"][header] = 4
        else:
            config["format"] = "int32"
    else:
        config["format"] = DEFAULT_FORMAT
        print(f"Warning: Invalid format type {type(input_format)}, using default format: {DEFAULT_FORMAT}", file=sys.stderr)

    # Handle coordinate config
    coord_config = input_data.get("coordinate_config", {})
    if isinstance(coord_config, dict):
        srcx_value = coord_config.get("srcx_value")
        srcy_value = coord_config.get("srcy_value")
        srcx_format = coord_config.get("srcx_format", DEFAULT_FORMAT)
        srcy_format = coord_config.get("srcy_format", DEFAULT_FORMAT)
        
        if srcx_value is not None:
            config["coordinate_config"]["srcx_value"] = srcx_value
            print(f"Using user-provided byte position for Source_X: {srcx_value}", file=sys.stderr)
        if srcy_value is not None:
            config["coordinate_config"]["srcy_value"] = srcy_value
            print(f"Using user-provided byte position for Source_Y: {srcy_value}", file=sys.stderr)
        
        if isinstance(srcx_format, str) and srcx_format.lower() in ["ibm", "ieee", "int32", "uint32"]:
            config["coordinate_config"]["srcx_format"] = srcx_format.lower()
            print(f"Using user-provided format for Source_X: {srcx_format.lower()}", file=sys.stderr)
        else:
            config["coordinate_config"]["srcx_format"] = DEFAULT_FORMAT
            print(f"Warning: Invalid srcx_format type {type(srcx_format)} or value {srcx_format}, using default: {DEFAULT_FORMAT}", file=sys.stderr)
        
        if isinstance(srcy_format, str) and srcy_format.lower() in ["ibm", "ieee", "int32", "uint32"]:
            config["coordinate_config"]["srcy_format"] = srcy_format.lower()
            print(f"Using user-provided format for Source_Y: {srcy_format.lower()}", file=sys.stderr)
        else:
            config["coordinate_config"]["srcy_format"] = DEFAULT_FORMAT
            print(f"Warning: Invalid srcy_format type {type(srcy_format)} or value {srcy_format}, using default: {DEFAULT_FORMAT}", file=sys.stderr)
    
    return config

def extract_header_bytes(filepath, format_type, headers, byte_positions, gaps, coord_config):
    values = {}
    all_source_x_zero = True
    all_source_y_zero = True
    has_source_x_non_zero = False
    has_source_y_non_zero = False

    try:
        with open(filepath, "rb") as f:
            f.seek(3200 + 400)
            for header in headers:
                byte_pos = byte_positions.get(header)
                gap = gaps.get(header, 4)  # Default to 4 bytes if not specified
                if byte_pos is not None:
                    f.seek(3200 + 400 + byte_pos)
                    byte = f.read(gap)
                    print(f"Raw bytes for {header} at position {byte_pos} (gap={gap}): {byte.hex()}", file=sys.stderr)
                    if len(byte) == gap:
                        if format_type == "ibm":
                            if gap != 4:
                                raise ValueError(f"IBM format requires 4 bytes, but gap is {gap}")
                            values[header] = segyio.tools.from_ibm(byte)
                        elif format_type == "ieee":
                            if gap != 4:
                                raise ValueError(f"IEEE format requires 4 bytes, but gap is {gap}")
                            values[header] = struct.unpack('>f', byte)[0]
                        elif format_type == "uint32":
                            if gap != 4:
                                raise ValueError(f"uint32 format requires 4 bytes, but gap is {gap}")
                            values[header] = int.from_bytes(byte, 'big', signed=False)
                        else:  # int32
                            if gap == 2:
                                values[header] = struct.unpack('>h', byte)[0]  # signed 16-bit
                            elif gap == 4:
                                values[header] = int.from_bytes(byte, 'big', signed=True)
                            else:
                                raise ValueError(f"Invalid gap {gap} for int32 format")
                        print(f"Interpreted {header} as {format_type} with gap={gap}: {values[header]}", file=sys.stderr)
                    else:
                        values[header] = None
                        print(f"Failed to read {gap} bytes for {header} at position {byte_pos}", file=sys.stderr)

            # Extract Source_X from first trace
            srcx_pos = coord_config.get("srcx_value", DEFAULT_COORD_BYTES["Source_X"])
            srcx_format = coord_config.get("srcx_format", DEFAULT_FORMAT)
            f.seek(3200 + 400 + srcx_pos)
            byte = f.read(4)
            if len(byte) == 4:
                if srcx_format == "ibm":
                    values["Source_X"] = segyio.tools.from_ibm(byte)
                elif srcx_format == "ieee":
                    values["Source_X"] = struct.unpack('>f', byte)[0]
                else:  # int32
                    values["Source_X"] = int.from_bytes(byte, 'big', signed=True)
                if values["Source_X"] != 0:
                    all_source_x_zero = False
                    has_source_x_non_zero = True
            else:
                values["Source_X"] = None
            
            # Extract Source_Y from first trace
            srcy_pos = coord_config.get("srcy_value", DEFAULT_COORD_BYTES["Source_Y"])
            srcy_format = coord_config.get("srcy_format", DEFAULT_FORMAT)
            f.seek(3200 + 400 + srcy_pos)
            byte = f.read(4)
            if len(byte) == 4:
                if srcy_format == "ibm":
                    values["Source_Y"] = segyio.tools.from_ibm(byte)
                elif srcy_format == "ieee":
                    values["Source_Y"] = struct.unpack('>f', byte)[0]
                else:  # int32
                    values["Source_Y"] = int.from_bytes(byte, 'big', signed=True)
                if values["Source_Y"] != 0:
                    all_source_y_zero = False
                    has_source_y_non_zero = True
            else:
                values["Source_Y"] = None
            
            # Calculate number of traces
            file_size = os.path.getsize(filepath)
            f.seek(3200 + 400 + 114)
            nsamples = int.from_bytes(f.read(2), 'big', signed=False)
            trace_size = 240 + (nsamples * 4)
            num_traces = (file_size - 3600) // trace_size if trace_size > 0 else 0
            
            if num_traces > 1:
                last_pos = 3600 + (trace_size * (num_traces - 1))
                
                # Extract headers from last trace
                for header in headers:
                    byte_pos = byte_positions.get(header)
                    gap = gaps.get(header, 4)
                    if byte_pos is not None:
                        f.seek(last_pos + byte_pos)
                        byte = f.read(gap)
                        print(f"Raw bytes for Last_{header} at position {byte_pos} (gap={gap}): {byte.hex()}", file=sys.stderr)
                        if len(byte) == gap:
                            if format_type == "ibm":
                                if gap != 4:
                                    raise ValueError(f"IBM format requires 4 bytes, but gap is {gap}")
                                values[f"Last_{header}"] = segyio.tools.from_ibm(byte)
                            elif format_type == "ieee":
                                if gap != 4:
                                    raise ValueError(f"IEEE format requires 4 bytes, but gap is {gap}")
                                values[f"Last_{header}"] = struct.unpack('>f', byte)[0]
                            elif format_type == "uint32":
                                if gap != 4:
                                    raise ValueError(f"uint32 format requires 4 bytes, but gap is {gap}")
                                values[f"Last_{header}"] = int.from_bytes(byte, 'big', signed=False)
                            else:  # int32
                                if gap == 2:
                                    values[f"Last_{header}"] = struct.unpack('>h', byte)[0]  # signed 16-bit
                                elif gap == 4:
                                    values[f"Last_{header}"] = int.from_bytes(byte, 'big', signed=True)
                                else:
                                    raise ValueError(f"Invalid gap {gap} for int32 format")
                            print(f"Interpreted Last_{header} as {format_type} with gap={gap}: {values[f'Last_{header}']}", file=sys.stderr)
                        else:
                            values[f"Last_{header}"] = None
                            print(f"Failed to read {gap} bytes for Last_{header} at position {byte_pos}", file=sys.stderr)

                # Extract Last_Source_X
                f.seek(last_pos + srcx_pos)
                byte = f.read(4)
                if len(byte) == 4:
                    if srcx_format == "ibm":
                        values["Last_Source_X"] = segyio.tools.from_ibm(byte)
                    elif srcx_format == "ieee":
                        values["Last_Source_X"] = struct.unpack('>f', byte)[0]
                    else:  # int32
                        values["Last_Source_X"] = int.from_bytes(byte, 'big', signed=True)
                    if values["Last_Source_X"] != 0:
                        all_source_x_zero = False
                        has_source_x_non_zero = True
                else:
                    values["Last_Source_X"] = None
                
                # Extract Last_Source_Y
                f.seek(last_pos + srcy_pos)
                byte = f.read(4)
                if len(byte) == 4:
                    if srcy_format == "ibm":
                        values["Last_Source_Y"] = segyio.tools.from_ibm(byte)
                    elif srcy_format == "ieee":
                        values["Last_Source_Y"] = struct.unpack('>f', byte)[0]
                    else:  # int32
                        values["Last_Source_Y"] = int.from_bytes(byte, 'big', signed=True)
                    if values["Last_Source_Y"] != 0:
                        all_source_y_zero = False
                        has_source_y_non_zero = True
                else:
                    values["Last_Source_Y"] = None
            
            # Set error field based on coordinate checks
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
    except Exception as e:
        raise Exception(f"Header extraction failed: {str(e)}")

def get_file_unique_id(filepath):
    """Compute SHA-256 hash of the file for unique_id"""
    hash_sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def read_segy(filepath, headers, format_type, byte_positions, gaps, coord_config):
    try:
        # Extract header values and error field
        header_values, error_field = extract_header_bytes(filepath, format_type, headers, byte_positions, gaps, coord_config)
        
        # Compute file unique ID (SHA-256)
        unique_id = get_file_unique_id(filepath)
        
        # Get file size
        file_size = os.path.getsize(filepath)
        
        # Open file with segyio to extract additional metadata
        with segyio.open(filepath, "r", ignore_geometry=True) as segyfile:
            ntraces = segyfile.tracecount
            nsamples = segyfile.samples.size
            interval = segyfile.bin[segyio.BinField.Interval]
            first5_samples = segyfile.trace[0][:5].tolist()
        
        # Format header values to match desired output
        formatted_headers = {
            "FSP": header_values.get("ShotPoint"),
            "LSP": header_values.get("Last_ShotPoint"),
            "First_CDP": header_values.get("CDP"),
            "Last_CDP": header_values.get("Last_CDP"),
            "Inline": header_values.get("Inline"),
            "Xline": header_values.get("Xline")
        }
        
        # Get file path components
        folder_name = os.path.basename(os.path.dirname(filepath))
        composite_file_name = os.path.basename(filepath)
        actual_file_name = composite_file_name
        if composite_file_name.startswith(folder_name):
            actual_file_name = composite_file_name[len(folder_name):]
            while actual_file_name and actual_file_name[0] in ('_', '-'):
                actual_file_name = actual_file_name[1:]
        
        # Construct result matching desired structure
        result = {
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
            "first_field_file": str(header_values.get("FFID", "")),
            "last_field_file": str(header_values.get("Last_FFID", "")),
            "bin_spacing": "",
            "first_trc": "1",
            "last_trc": str(ntraces),
            "ntraces": ntraces,
            "sample_type": "4-byte IBM floating point",
            "sample_rate": interval / 1000.0 if interval else 0.0,
            "sample_rate_uom": "seconds",
            "record_length": (nsamples * interval / 1000.0) if interval else 0.0,
            "record_length_uom": "seconds",
            "file_windows_path": filepath.replace('/', '\\'),
            "file_unix_path": filepath.replace('\\', '/'),
            "file_size_bytes": file_size,
            "header_values": formatted_headers,
            "unique_id": unique_id,
            "first5_samples": first5_samples,
            "error": error_field  # Renamed from error_field to error
        }
        
        return result
    except Exception as e:
        return {
            "file_name": os.path.basename(filepath),
            "error": {
                "type": "processing_error",
                "message": str(e)
            },
            "header_values": {}
        }

def save_to_json(data, output_file):
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(data, f, indent=2)

def main():
    try:
        if len(sys.argv) < 2:
            error_msg = {
                "error": {
                    "type": "input_error",
                    "message": "No input data provided"
                }
            }
            print(json.dumps(error_msg))
            save_to_json(error_msg, "tmp/segy_extract_by_files.json")
            sys.exit(1)
        
        input_json = sys.argv[1]
        input_data = json.loads(input_json)
        
        if not isinstance(input_data, dict) or "files" not in input_data:
            error_msg = {
                "error": {
                    "type": "input_error",
                    "message": "Input must contain 'files' array"
                }
            }
            print(json.dumps(error_msg))
            save_to_json(error_msg, "tmp/segy_extract_by_files.json")
            sys.exit(1)
        
        header_config = get_header_bytes_config(input_data)
        print("header_config:", header_config, file=sys.stderr)
        
        print(f"Headers to extract: {header_config['headers']}", file=sys.stderr)
        print(f"Byte positions: {header_config['byte_positions']}", file=sys.stderr)
        print(f"Gaps: {header_config['gaps']}", file=sys.stderr)

        results = {}
        for file_info in input_data["files"]:
            index = str(file_info.get("index", "unknown"))
            filepath = file_info.get("filePath")
            
            if not filepath:
                results[index] = {
                    "error": {
                        "type": "input_error",
                        "message": "Missing filePath"
                    }
                }
                continue
                
            if not os.path.isfile(filepath):
                results[index] = {
                    "error": {
                        "type": "path_error",
                        "message": f"File not found: {filepath}"
                    }
                }
                continue
                
            if not filepath.lower().endswith((".sgy", ".segy")):
                results[index] = {
                    "error": {
                        "type": "path_error",
                        "message": f"Not a SEG-Y file: {filepath}"
                    }
                }
                continue
                
            results[index] = read_segy(
                filepath,
                header_config["headers"],
                header_config["format"],
                header_config["byte_positions"],
                header_config["gaps"],
                header_config["coordinate_config"]
            )
        
        json_output = json.dumps(results)
        print(json_output)
        save_to_json(results, "tmp/segy_extract_by_files.json")
        
    except Exception as e:
        error_msg = {
            "error": {
                "type": "processing_error",
                "message": "Failed to process SEG-Y files",
                "details": str(e)
            }
        }
        print(json.dumps(error_msg))
        save_to_json(error_msg, "tmp/segy_extract_by_files.json")
        sys.exit(1)

if __name__ == "__main__":
    main()