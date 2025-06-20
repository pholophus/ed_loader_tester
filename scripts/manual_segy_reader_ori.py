import os
import sys
import json
import segyio
import hashlib
import struct

# Default header byte positions and format
DEFAULT_HEADER_BYTES = {
    "FFID": 8,      # Bytes 9-12
    "ShotPoint": 16, # Bytes 17-20
    "CDP": 20,      # Bytes 21-24
    "Inline": 188,  # Bytes 189-192
    "Xline": 192    # Bytes 193-196
}
DEFAULT_FORMAT = "int32"  # Default format for headers (4-byte signed integer)

def extract_header_bytes(filepath, format_type):
    """Manually extract header bytes from SEG-Y file for FFID, ShotPoint, CDP, Inline, Xline"""
    values = {}
    try:
        with open(filepath, "rb") as f:
            # Read first trace header
            f.seek(3200 + 400)
            
            # Extract FFID from first trace
            f.seek(3200 + 400 + DEFAULT_HEADER_BYTES["FFID"])
            byte = f.read(4)
            # print("FFID first trace bytes:", byte.hex())
            if len(byte) == 4:
                if format_type == "ibm":
                    values["FFID"] = segyio.tools.from_ibm(byte)
                elif format_type == "ieee":
                    values["FFID"] = struct.unpack('>f', byte)[0]
                else:  # int32
                    values["FFID"] = int.from_bytes(byte, 'big', signed=True)
                # print("FFID first trace value:", values["FFID"])
            else:
                values["FFID"] = None
                # print("FFID first trace: Failed to read 4 bytes")

            # Extract ShotPoint from first trace
            f.seek(3200 + 400 + DEFAULT_HEADER_BYTES["ShotPoint"])
            byte = f.read(4)
            # print("ShotPoint first trace bytes:", byte.hex())
            if len(byte) == 4:
                if format_type == "ibm":
                    values["ShotPoint"] = segyio.tools.from_ibm(byte)
                elif format_type == "ieee":
                    values["ShotPoint"] = struct.unpack('>f', byte)[0]
                else:  # int32
                    values["ShotPoint"] = int.from_bytes(byte, 'big', signed=True)
                # print("ShotPoint first trace value:", values["ShotPoint"])
            else:
                values["ShotPoint"] = None
                # print("ShotPoint first trace: Failed to read 4 bytes")

            # Extract CDP from first trace
            f.seek(3200 + 400 + DEFAULT_HEADER_BYTES["CDP"])
            byte = f.read(4)
            # print("CDP first trace bytes:", byte.hex())
            if len(byte) == 4:
                if format_type == "ibm":
                    values["CDP"] = segyio.tools.from_ibm(byte)
                elif format_type == "ieee":
                    values["CDP"] = struct.unpack('>f', byte)[0]
                else:  # int32
                    values["CDP"] = int.from_bytes(byte, 'big', signed=True)
                # print("CDP first trace value:", values["CDP"])
            else:
                values["CDP"] = None
                # print("CDP first trace: Failed to read 4 bytes")

            # Extract Inline from first trace
            f.seek(3200 + 400 + DEFAULT_HEADER_BYTES["Inline"])
            byte = f.read(4)
            # print("Inline first trace bytes:", byte.hex())
            if len(byte) == 4:
                if format_type == "ibm":
                    values["Inline"] = segyio.tools.from_ibm(byte)
                elif format_type == "ieee":
                    values["Inline"] = struct.unpack('>f', byte)[0]
                else:  # int32
                    values["Inline"] = int.from_bytes(byte, 'big', signed=True)
                # print("Inline first trace value:", values["Inline"])
            else:
                values["Inline"] = None
                # print("Inline first trace: Failed to read 4 bytes")

            # Extract Xline from first trace
            f.seek(3200 + 400 + DEFAULT_HEADER_BYTES["Xline"])
            byte = f.read(4)
            # print("Xline first trace bytes:", byte.hex())
            if len(byte) == 4:
                if format_type == "ibm":
                    values["Xline"] = segyio.tools.from_ibm(byte)
                elif format_type == "ieee":
                    values["Xline"] = struct.unpack('>f', byte)[0]
                else:  # int32
                    values["Xline"] = int.from_bytes(byte, 'big', signed=True)
                # print("Xline first trace value:", values["Xline"])
            else:
                values["Xline"] = None
                # print("Xline first trace: Failed to read 4 bytes")
            
            # Source coordinates
            f.seek(3200 + 400 + 72)
            src_x = int.from_bytes(f.read(4), 'big', signed=True)
            f.seek(3200 + 400 + 76)
            src_y = int.from_bytes(f.read(4), 'big', signed=True)
            values.update({"Source_X": src_x, "Source_Y": src_y})
            
            # Calculate number of traces
            file_size = os.path.getsize(filepath)
            f.seek(3200 + 400 + 114)
            nsamples = int.from_bytes(f.read(2), 'big', signed=False)
            trace_size = 240 + (nsamples * 4)
            num_traces = (file_size - 3600) // trace_size if trace_size > 0 else 0
            
            if num_traces > 1:
                last_pos = 3600 + (trace_size * (num_traces - 1))
                
                # Extract FFID from last trace
                f.seek(last_pos + DEFAULT_HEADER_BYTES["FFID"])
                byte = f.read(4)
                # print("FFID last trace bytes:", byte.hex())
                if len(byte) == 4:
                    if format_type == "ibm":
                        values["Last_FFID"] = segyio.tools.from_ibm(byte)
                    elif format_type == "ieee":
                        values["Last_FFID"] = struct.unpack('>f', byte)[0]
                    else:
                        values["Last_FFID"] = int.from_bytes(byte, 'big', signed=True)
                    # print("FFID last trace value:", values["Last_FFID"])
                else:
                    values["Last_FFID"] = None
                    # print("FFID last trace: Failed to read 4 bytes")

                # Extract ShotPoint from last trace
                f.seek(last_pos + DEFAULT_HEADER_BYTES["ShotPoint"])
                byte = f.read(4)
                # print("ShotPoint last trace bytes:", byte.hex())
                if len(byte) == 4:
                    if format_type == "ibm":
                        values["Last_ShotPoint"] = segyio.tools.from_ibm(byte)
                    elif format_type == "ieee":
                        values["Last_ShotPoint"] = struct.unpack('>f', byte)[0]
                    else:
                        values["Last_ShotPoint"] = int.from_bytes(byte, 'big', signed=True)
                    # print("ShotPoint last trace value:", values["Last_ShotPoint"])
                else:
                    values["Last_ShotPoint"] = None
                    # print("ShotPoint last trace: Failed to read 4 bytes")

                # Extract CDP from last trace
                f.seek(last_pos + DEFAULT_HEADER_BYTES["CDP"])
                byte = f.read(4)
                # print("CDP last trace bytes:", byte.hex())
                if len(byte) == 4:
                    if format_type == "ibm":
                        values["Last_CDP"] = segyio.tools.from_ibm(byte)
                    elif format_type == "ieee":
                        values["Last_CDP"] = struct.unpack('>f', byte)[0]
                    else:
                        values["Last_CDP"] = int.from_bytes(byte, 'big', signed=True)
                    # print("CDP last trace value:", values["Last_CDP"])
                else:
                    values["Last_CDP"] = None
                    # print("CDP last trace: Failed to read 4 bytes")

                # Extract Inline from last trace
                f.seek(last_pos + DEFAULT_HEADER_BYTES["Inline"])
                byte = f.read(4)
                # print("Inline last trace bytes:", byte.hex())
                if len(byte) == 4:
                    if format_type == "ibm":
                        values["Last_Inline"] = segyio.tools.from_ibm(byte)
                    elif format_type == "ieee":
                        values["Last_Inline"] = struct.unpack('>f', byte)[0]
                    else:
                        values["Last_Inline"] = int.from_bytes(byte, 'big', signed=True)
                    # print("Inline last trace value:", values["Last_Inline"])
                else:
                    values["Last_Inline"] = None
                    # print("Inline last trace: Failed to read 4 bytes")

                # Extract Xline from last trace
                f.seek(last_pos + DEFAULT_HEADER_BYTES["Xline"])
                byte = f.read(4)
                # print("Xline last trace bytes:", byte.hex())
                if len(byte) == 4:
                    if format_type == "ibm":
                        values["Last_Xline"] = segyio.tools.from_ibm(byte)
                    elif format_type == "ieee":
                        values["Last_Xline"] = struct.unpack('>f', byte)[0]
                    else:
                        values["Last_Xline"] = int.from_bytes(byte, 'big', signed=True)
                    # print("Xline last trace value:", values["Last_Xline"])
                else:
                    values["Last_Xline"] = None
                    # print("Xline last trace: Failed to read 4 bytes")
                
                # Last source coords
                f.seek(last_pos + 72)
                values["Last_Source_X"] = int.from_bytes(f.read(4), 'big', signed=True)
                f.seek(last_pos + 76)
                values["Last_Source_Y"] = int.from_bytes(f.read(4), 'big', signed=True)
                
        return values
    except Exception as e:
        raise Exception(f"Header extraction failed: {str(e)}")

def get_file_unique_id(filepath):
    """Generate SHA256 hash of file"""
    hash_sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def read_segy(filepath, headers, format_type, expected_gaps):
    """Read SEG-Y file and return metadata, including gaps for all headers"""
    try:
        unique_id = get_file_unique_id(filepath)
        file_size = os.path.getsize(filepath)
        file_name = os.path.basename(filepath)
        
        with segyio.open(filepath, "r", ignore_geometry=True) as segyfile:
            ntraces = segyfile.tracecount
            nsamples = segyfile.samples.size
            interval = segyfile.bin[segyio.BinField.Interval]
            first5_samples = segyfile.trace[0][:5].tolist()
            
            headers_data = extract_header_bytes(filepath, format_type)
            
            header_values = {}
            for header in headers:
                if header in headers_data:
                    header_values[f"First_{header}"] = headers_data.get(header)
                if f"Last_{header}" in headers_data:
                    header_values[f"Last_{header}"] = headers_data.get(f"Last_{header}")
            
            header_values.update({
                "Source_X": headers_data.get("Source_X"),
                "Source_Y": headers_data.get("Source_Y"),
                "Last_Source_X": headers_data.get("Last_Source_X"),
                "Last_Source_Y": headers_data.get("Last_Source_Y")
            })
            
            # Compute gaps for all headers
            for field in headers:
                if field in headers_data and f"Last_{field}" in headers_data:
                    first_val = headers_data.get(field)
                    last_val = headers_data.get(f"Last_{field}")
                    if first_val is not None and last_val is not None and ntraces > 1:
                        computed_gap = (last_val - first_val) / (ntraces - 1)
                        header_values[f"{field}_gap"] = computed_gap
                        expected_gap = expected_gaps.get(field)
                        # if expected_gap is not None:
                            # print(f"{field} computed gap: {computed_gap}, expected: {expected_gap}")
                            # if abs(computed_gap - expected_gap) > 0.1:
                                # print(f"Warning: {field}_gap ({computed_gap}) does not match expected gap ({expected_gap})", file=sys.stderr)
                    else:
                        header_values[f"{field}_gap"] = None
            
            return {
                "file_name": file_name,
                "seismic_name": os.path.splitext(file_name)[0],
                "extensionType": "SEGY",
                "first_trc": "1",
                "last_trc": str(ntraces),
                "ntraces": ntraces,
                "sample_rate": interval / 1000,
                "sample_rate_uom": "ms",
                "record_length": nsamples * interval / 1000,
                "record_length_uom": "ms",
                "file_size_bytes": file_size,
                "header_values": header_values,
                "unique_id": unique_id,
                "first5_samples": first5_samples
            }
    except Exception as e:
        return {
            "file_name": os.path.basename(filepath),
            "error": str(e),
            "header_values": {}
        }

def save_to_json(data, filename):
    """Save data to a JSON file"""
    try:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Results saved to {filename}", file=sys.stderr)
    except Exception as e:
        print(f"Failed to save results to {filename}: {str(e)}", file=sys.stderr)

def get_header_bytes_config(input_data):
    """Determine format, gaps, headers, and byte positions from input"""
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
        "byte_positions": {}  # New: Store resolved byte positions
    }
    
    # Get header bytes from input_data
    user_headers = input_data.get("header_bytes", {})
    config["headers"] = list(user_headers.keys())
    
    # Resolve byte positions
    for header in config["headers"]:
        user_value = user_headers.get(header)
        if user_value is not None:
            config["byte_positions"][header] = user_value
            print(f"Using user-provided byte position for {header}: {user_value}", file=sys.stderr)
        else:
            config["byte_positions"][header] = DEFAULT_HEADER_BYTES.get(header, None)
            print(f"Using default byte position for {header}: {config['byte_positions'][header]}", file=sys.stderr)
    
    # Handle format and gaps
    input_format = input_data.get("format", DEFAULT_FORMAT).lower()
    if input_format in ["ibm", "ieee"]:
        config["format"] = input_format
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
    
    return config

def main():
    try:
        if len(sys.argv) < 2:
            error_msg = {"error": "No input data provided"}
            print(json.dumps(error_msg))
            save_to_json(error_msg, "tmp/segy_extract_by_files.json")
            sys.exit(1)
        
        input_json = sys.argv[1]
        input_data = json.loads(input_json)
        
        if not isinstance(input_data, dict) or "files" not in input_data:
            error_msg = {"error": "Input must contain 'files' array"}
            print(json.dumps(error_msg))
            save_to_json(error_msg, "tmp/segy_extract_by_files.json")
            sys.exit(1)
        
        header_config = get_header_bytes_config(input_data)
        print("header_config:", header_config, file=sys.stderr)
        
        results = {}
        for file_info in input_data["files"]:
            index = str(file_info.get("index", "unknown"))
            filepath = file_info.get("filePath")
            
            if not filepath:
                results[index] = {"error": "Missing filePath"}
                continue
                
            if not os.path.isfile(filepath):
                results[index] = {"error": f"File not found: {filepath}"}
                continue
                
            if not filepath.lower().endswith((".sgy", ".segy")):
                results[index] = {"error": f"Not a SEG-Y file: {filepath}"}
                continue
                
            results[index] = read_segy(filepath, header_config["headers"], header_config["format"], header_config["gaps"])
        
        json_output = json.dumps(results)
        print(json_output)
        save_to_json(results, "tmp/segy_extract_by_files.json")
        
    except Exception as e:
        error_msg = {
            "error": "Failed to process SEG-Y files",
            "details": str(e)
        }
        print(json.dumps(error_msg))
        save_to_json(error_msg, "tmp/segy_extract_by_files.json")
        sys.exit(1)

if __name__ == "__main__":
    main()