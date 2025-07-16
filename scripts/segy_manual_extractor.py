import segyio
import struct
import os
import hashlib
from typing import Dict, Any, Optional
import numpy as np


def read_segy_file(filepath: str, field_mappings: Optional[Dict[str, int]] = None, format: str = "4-BYTE") -> Dict[str, Any]:

    try:
        hash_sha256 = hashlib.sha256()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        unique_id = hash_sha256.hexdigest()
        
        file_size = os.path.getsize(filepath)
        
        with segyio.open(filepath, "r", ignore_geometry=True) as segyfile:
            ntraces = segyfile.tracecount
            nsamples = segyfile.samples.size
            interval = segyfile.bin[segyio.BinField.Interval]
            first5_samples = segyfile.trace[0][:5].tolist()
            
            first_header = segyfile.header[0]
            last_header = segyfile.header[ntraces - 1]
            
            # Determine data type based on format
            data_type = "int16" if format == "2-BYTE" else "int32"
            
            if field_mappings:
                print(f"🔍 Using custom field mappings: {field_mappings}")
                print(f"📏 Using {format} format ({data_type})")
                
                # Extract fields based on user-provided byte positions using direct file access
                extracted_first = {}
                extracted_last = {}
                
                # Read trace headers directly from file
                with open(filepath, 'rb') as f:
                    # SEGY file structure: 3200 bytes text header + 400 bytes binary header + trace data
                    # Each trace has 240 bytes header + samples
                    text_header_size = 3200
                    binary_header_size = 400
                    trace_header_size = 240
                    
                    sample_size = 4  # 4 bytes per sample (assuming IBM float)
                    trace_data_size = nsamples * sample_size
                    trace_size = trace_header_size + trace_data_size
                    
                    # Read first trace header
                    first_trace_offset = text_header_size + binary_header_size
                    f.seek(first_trace_offset)
                    first_header_bytes = f.read(trace_header_size)
                    
                    # Read last trace header
                    last_trace_offset = text_header_size + binary_header_size + (ntraces - 1) * trace_size
                    f.seek(last_trace_offset)
                    last_header_bytes = f.read(trace_header_size)
                
                # Extract fields from raw bytes
                for field_name, byte_position in field_mappings.items():
                    first_val = extract_field_from_bytes(first_header_bytes, byte_position, data_type)
                    last_val = extract_field_from_bytes(last_header_bytes, byte_position, data_type)
                    extracted_first[field_name] = first_val
                    extracted_last[field_name] = last_val
                    print(f"📊 {field_name} at byte {byte_position}: First={first_val}, Last={last_val}")
                
                # Map extracted values to standard field names
                first_ffid = extracted_first.get("Ffid")
                last_ffid = extracted_last.get("Ffid")
                first_sp = extracted_first.get("Sp")
                last_sp = extracted_last.get("Sp")
                first_cdp = extracted_first.get("Cdp")
                last_cdp = extracted_last.get("Cdp")
                first_inline = extracted_first.get("Il")
                last_inline = extracted_last.get("Il")
                first_xline = extracted_first.get("Xl")
                last_xline = extracted_last.get("Xl")
                
                # For coordinates, use user-provided positions if available, otherwise use standard
                source_x_first = extracted_first.get("Source_X")
                source_y_first = extracted_first.get("Source_Y")
                source_x_last = extracted_last.get("Source_X")
                source_y_last = extracted_last.get("Source_Y")
                
                # If coordinates not provided by user, extract from standard positions
                if source_x_first is None:
                    source_x_first = extract_field_from_bytes(first_header_bytes, 73, data_type)
                if source_y_first is None:
                    source_y_first = extract_field_from_bytes(first_header_bytes, 77, data_type)
                if source_x_last is None:
                    source_x_last = extract_field_from_bytes(last_header_bytes, 73, data_type)
                if source_y_last is None:
                    source_y_last = extract_field_from_bytes(last_header_bytes, 77, data_type)
                
                # Add all extracted custom fields to the response
                custom_fields = {
                    "first_trace": extracted_first,
                    "last_trace": extracted_last,
                    "byte_positions": field_mappings,
                    "format_used": format
                }
            else:
                print("🔍 Using standard segyio field mappings")
                first_ffid = first_header[segyio.TraceField.FieldRecord]
                last_ffid = last_header[segyio.TraceField.FieldRecord]
                first_sp = first_header[segyio.TraceField.ShotPoint]
                last_sp = last_header[segyio.TraceField.ShotPoint]
                first_cdp = first_header[segyio.TraceField.CDP]
                last_cdp = last_header[segyio.TraceField.CDP]
                first_inline = first_header[segyio.TraceField.INLINE_3D]
                last_inline = last_header[segyio.TraceField.INLINE_3D]
                first_xline = first_header[segyio.TraceField.CROSSLINE_3D]
                last_xline = last_header[segyio.TraceField.CROSSLINE_3D]
                
                source_x_first = first_header[segyio.TraceField.SourceX]
                source_y_first = first_header[segyio.TraceField.SourceY]
                source_x_last = last_header[segyio.TraceField.SourceX]
                source_y_last = last_header[segyio.TraceField.SourceY]
                
                custom_fields = None
            
            # Debug print the extracted values
            print(f"📋 Extracted values:")
            print(f"   FFID: {first_ffid} -> {last_ffid}")
            print(f"   SP: {first_sp} -> {last_sp}")
            print(f"   CDP: {first_cdp} -> {last_cdp}")
            print(f"   IL: {first_inline} -> {last_inline}")
            print(f"   XL: {first_xline} -> {last_xline}")
            
            error_field = {"type": None, "message": None}
            if source_x_first == 0 and source_y_first == 0 and source_x_last == 0 and source_y_last == 0:
                error_field = {
                    "type": "zero_coordinates",
                    "message": "All Source_X and Source_Y are zero"
                }
            
            formatted_headers = {
                "FSP": first_sp,
                "LSP": last_sp,
                "First_CDP": first_cdp,
                "Last_CDP": last_cdp,
                "Inline": first_inline,
                "Xline": first_xline,
                "First_FFID": first_ffid,
                "Last_FFID": last_ffid,
            }
            
            folder_name = os.path.basename(os.path.dirname(filepath))
            composite_file_name = os.path.basename(filepath)
            
            actual_file_name = composite_file_name
            if composite_file_name.startswith(folder_name):
                actual_file_name = composite_file_name[len(folder_name):]
                while actual_file_name and actual_file_name[0] in ('_', '-'):
                    actual_file_name = actual_file_name[1:]
            
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
                "first_field_file": str(first_ffid) if first_ffid is not None else "",
                "last_field_file": str(last_ffid) if last_ffid is not None else "",
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
                # "header_values": formatted_headers,
                "unique_id": unique_id,
                "first5_samples": first5_samples,
                "error": error_field,
                "field_mappings_used": field_mappings if field_mappings else "standard_segyio",
                "format_used": format
            }
            
            # Add custom extracted fields if field mappings were provided
            if custom_fields:
                result["custom_extracted_fields"] = custom_fields
            
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


def extract_field_from_bytes(header_bytes: bytes, byte_position: Optional[int], data_type: str = 'int32') -> Optional[int]:
    """
    Extract a specific field from trace header bytes at the given position.
    
    Args:
        header_bytes (bytes): Raw trace header bytes
        byte_position (Optional[int]): Byte position to read from (1-based indexing as per SEGY standard)
        data_type (str): Data type to interpret ('int32', 'int16', 'uint32', 'uint16')
    
    Returns:
        Optional[int]: Extracted value or None if byte_position is None
    """
    if byte_position is None:
        return None
        
    # Convert 1-based to 0-based indexing
    byte_index = byte_position - 1
    
    # Define format strings for different data types
    format_map = {
        'int32': '>i',
        'int16': '>h',
        'uint32': '>I',
        'uint16': '>H'
    }
    
    # Define byte sizes
    size_map = {
        'int32': 4,
        'int16': 2,
        'uint32': 4,
        'uint16': 2
    }
    
    if data_type not in format_map:
        return None
    
    fmt = format_map[data_type]
    size = size_map[data_type]
    
    # Extract bytes and unpack
    try:
        if byte_index + size > len(header_bytes):
            return None
            
        value_bytes = header_bytes[byte_index:byte_index + size]
        if len(value_bytes) != size:
            return None
        
        value = struct.unpack(fmt, value_bytes)[0]
        return value
    except Exception:
        return None 