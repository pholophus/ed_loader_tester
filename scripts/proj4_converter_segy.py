import segyio
import pyproj
import numpy as np
import json
import struct
import sys
from datetime import datetime
import pytz

def ibm_to_float(ibm_bytes):
    """
    Convert 4-byte IBM floating-point to Python float.
    """
    try:
        if len(ibm_bytes) != 4:
            raise ValueError("IBM float requires 4 bytes")
        word = struct.unpack('>I', ibm_bytes)[0]
        if word == 0:
            return 0.0
        sign = -1 if (word >> 31) & 0x01 else 1
        exponent = (word >> 24) & 0x7F
        mantissa = (word & 0x00FFFFFF) / float(1 << 24)
        return sign * mantissa * (16 ** (exponent - 64))
    except Exception as e:
        raise ValueError(f"Error converting IBM float: {e}")

def extract_coordinates(file_configs):
    """
    Extract srcx and srcy coordinates from multiple SEGY files with custom formats, skipping every 10 traces.
    
    Parameters:
    - file_configs: List of dicts with file_path, srcx_field, srcy_field, srcx_format, srcy_format, scalar_field, seismic_id
    
    Returns:
    - List of tuples: [(file_path, seismic_id, srcx_list, srcy_list, None) or (file_path, seismic_id, None, None, error_message)]
    """
    results = []
    for config in file_configs:
        file_path = config.get('file_path')
        srcx_field = config.get('srcx_field', 73) if config.get('srcx_field') is not None else 73
        srcy_field = config.get('srcy_field', 77) if config.get('srcy_field') is not None else 77
        srcx_format = config.get('srcx_format', 'int32').lower() if config.get('srcx_format') is not None else 'int32'
        srcy_format = config.get('srcy_format', 'int32').lower() if config.get('srcy_format') is not None else 'int32'
        scalar_field = config.get('scalar_field', 71) if config.get('scalar_field') is not None else 71
        seismic_id = config.get('seismic_id')
        
        try:
            with segyio.open(file_path, mode='r', strict=False) as segy:
                srcx = []
                srcy = []
                for trace_idx in range(0, segy.tracecount, 10):  # Modified to skip every 10 traces
                    header = segy.header[trace_idx]
                    
                    # Read scalar (16-bit at scalar_field)
                    scalar = header[71]
                    if scalar == 0:
                        scalar = 1
                    
                    # Read srcx based on format
                    if srcx_format == 'ibm':
                        x_bytes = struct.pack('>i', header.get(srcx_field, 0))
                        x = ibm_to_float(x_bytes)
                    elif srcx_format == 'ieee':
                        x_bytes = struct.pack('>i', header.get(srcx_field, 0))
                        x = struct.unpack('>f', x_bytes)[0]
                    elif srcx_format == 'uint32':
                        x = max(header.get(srcx_field, 0), 0)  # Ensure non-negative
                    elif srcx_format == '2-bit':
                        x = header.get(srcx_field, 0) & 0xFFFF  # Mask to 16-bit
                        if x & 0x8000:  # Sign-extend if negative
                            x -= 0x10000
                    elif srcx_format == '4-bit' or srcx_format == 'int32':
                        x = header.get(srcx_field, 0)
                    else:
                        x = header.get(srcx_field, 0)  # Default to int32
                    
                    # Read srcy based on format
                    if srcy_format == 'ibm':
                        y_bytes = struct.pack('>i', header.get(srcy_field, 0))
                        y = ibm_to_float(y_bytes)
                    elif srcy_format == 'ieee':
                        y_bytes = struct.pack('>i', header.get(srcy_field, 0))
                        y = struct.unpack('>f', y_bytes)[0]
                    elif srcy_format == 'uint32':
                        y = max(header.get(srcy_field, 0), 0)
                    elif srcy_format == '2-bit':
                        y = header.get(srcy_field, 0) & 0xFFFF
                        if y & 0x8000:
                            y -= 0x10000
                    elif srcy_format == '4-bit' or srcy_format == 'int32':
                        y = header.get(srcy_field, 0)
                    else:
                        y = header.get(srcy_field, 0)  # Default to int32
                    
                    # Apply scalar
                    x = x / abs(scalar) if scalar < 0 else x * scalar
                    y = y / abs(scalar) if scalar < 0 else y * scalar
                    
                    srcx.append(x)
                    srcy.append(y)
                
                results.append((file_path, seismic_id, srcx, srcy, None))
        except Exception as e:
            results.append((file_path, seismic_id, None, None, str(e)))
    return results

def convert_segy_to_latlon(srcx, srcy, srid=None, proj4_string=None):
    """
    Convert srcx, srcy coordinates to latitude and longitude (WGS84).
    
    Parameters:
    - srcx: List of x-coordinates
    - srcy: List of y-coordinates
    - srid: Integer, EPSG code (SRID) of the source CRS (optional)
    - proj4_string: String, Proj4 definition of the source CRS (optional)
    
    Returns:
    - Tuple: (lons, lats, None) or (None, None, error_message)
    """
    try:
        if proj4_string:
            source_crs = pyproj.CRS.from_string(proj4_string)
        elif srid:
            source_crs = pyproj.CRS.from_epsg(srid)
        else:
            raise ValueError("Either srid or proj4_string must be provided")
        
        wgs84_crs = pyproj.CRS.from_epsg(4326)
        transformer = pyproj.Transformer.from_crs(source_crs, wgs84_crs, always_xy=True)
        lons, lats = transformer.transform(srcx, srcy)
        return lons, lats, None
    except Exception as e:
        return None, None, str(e)

def process_segy_files(file_configs, srid=None, proj4_string=None):
    """
    Process multiple SEGY files and convert coordinates to lat/lon, skipping every 10 traces.
    
    Parameters:
    - file_configs: List of dicts with file_path, srcx_field, srcy_field, srcx_format, srcy_format, scalar_field, seismic_id
    - srid: Integer, EPSG code (SRID) of the source CRS (optional)
    - proj4_string: String, Proj4 definition of the source CRS (optional)
    
    Returns:
    - dict: JSON-serializable dictionary with status and results
    """
    response = {
        "status": "success",
        "srid": srid,
        "proj4_string": proj4_string,
        "processed_at": datetime.now(pytz.timezone('Asia/Singapore')).isoformat(),
        "files": []
    }
    
    extracted_coords = extract_coordinates(file_configs)
    
    for file_path, seismic_id, srcx, srcy, error in extracted_coords:
        file_result = {
            "file_path": file_path,
            "seismic_id": seismic_id,
            "header_fields": {
                "srcx_field": next((c['srcx_field'] for c in file_configs if c['file_path'] == file_path), 73),
                "srcy_field": next((c['srcy_field'] for c in file_configs if c['file_path'] == file_path), 77),
                "srcx_format": next((c['srcx_format'] for c in file_configs if c['file_path'] == file_path), 'int32'),
                "srcy_format": next((c['srcy_format'] for c in file_configs if c['file_path'] == file_path), 'int32'),
                "scalar_field": next((c.get('scalar_field', 71) for c in file_configs if c['file_path'] == file_path), 71)
            },
            "coordinates": []
        }
        
        if error:
            file_result["status"] = "error"
            file_result["message"] = error
        else:
            lons, lats, conv_error = convert_segy_to_latlon(srcx, srcy, srid=srid, proj4_string=proj4_string)
            if conv_error:
                file_result["status"] = "error"
                file_result["message"] = conv_error
            else:
                file_result["status"] = "success"
                file_result["coordinates"] = [
                    {
                        "srcx": float(x),
                        "srcy": float(y),
                        "latitude": float(lat),
                        "longitude": float(lon)
                    }
                    for x, y, lat, lon in zip(srcx, srcy, lats, lons)
                ]
        
        response["files"].append(file_result)
    
    if any(file_result["status"] == "error" for file_result in response["files"]):
        response["status"] = "partial_success"
    
    return response

def main():
    """
    Read input from stdin, process SEGY files skipping every 10 traces, and output JSON to stdout.
    Expects JSON input: { "file_configs": [...], "srid": <int>, "proj4_string": <str> }
    """
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)
        file_configs = input_data.get('file_configs', [])
        srid = input_data.get('srid')
        proj4_string = input_data.get('proj4_string')
        
        # Validate inputs
        if not file_configs:
            raise ValueError("file_configs is empty or missing")
        if srid is None and proj4_string is None:
            raise ValueError("Either srid or proj4_string must be provided")
        if srid is not None and not isinstance(srid, int):
            raise ValueError("srid must be an integer")
        if proj4_string is not None and not isinstance(proj4_string, str):
            raise ValueError("proj4_string must be a string")
        
        # Process files and get response
        response = process_segy_files(file_configs, srid=srid, proj4_string=proj4_string)
        
        # Output JSON to stdout
        json.dump(response, sys.stdout, indent=2)
    except Exception as e:
        # Output error to stderr
        error_response = {
            "status": "error",
            "message": str(e)
        }
        json.dump(error_response, sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()