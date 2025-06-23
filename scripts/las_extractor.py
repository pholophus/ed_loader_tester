#!/usr/bin/env python3
"""
LAS File Extractor using lasio
Extracts metadata from LAS files similar to the format shown in the provided image
"""

import os
from datetime import datetime
import json

try:
    import lasio
    import numpy as np
except ImportError:
    lasio = None
    np = None
    print("Warning: lasio not installed. Install with: pip install lasio")

def _convert_numpy_types(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if np is None:
        return obj
        
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: _convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [_convert_numpy_types(item) for item in obj]
    else:
        return obj

def extract_metadata(file_path):
    """
    Extract metadata from LAS file using lasio
    Returns metadata in the format similar to the image provided
    """
    if not lasio:
        raise ImportError("lasio library is required. Install with: pip install lasio")
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"LAS file not found: {file_path}")
    
    try:
        # Load LAS file using lasio
        las = lasio.read(file_path)
        
        # Extract header information
        well_info = las.well
        
        # Get file stats for created/modified dates
        file_stats = os.stat(file_path)
        created_date = datetime.fromtimestamp(file_stats.st_ctime)
        modified_date = datetime.fromtimestamp(file_stats.st_mtime)
        
        # Extract metadata fields (with fallbacks if not present)
        metadata = {
            "data_source": _extract_well_field(well_info, ['COMP', 'COMPANY', 'DATA_SOURCE'], 'UNKNOWN'),
            "region": _extract_well_field(well_info, ['REGION', 'PROV', 'PROVINCE'], ''),
            "country": _extract_well_field(well_info, ['CTRY', 'COUNTRY'], 'UNKNOWN'),
            "state": _extract_well_field(well_info, ['STAT', 'STATE'], 'UNKNOWN'),
            "asset": _extract_well_field(well_info, ['ASSET', 'FIELD'], ''),
            "field_name": _extract_well_field(well_info, ['FLD', 'FIELD', 'FIELD_NAME'], 'UNKNOWN'),
            "uwi": _extract_well_field(well_info, ['UWI', 'WELL'], ''),
            "well_name": _extract_well_field(well_info, ['WELL', 'WELL_NAME'], ''),
            "operator": _extract_well_field(well_info, ['COMP', 'COMPANY', 'OPERATOR'], 'UNKNOWN'),
            "surface_latitude": _extract_coordinate_well(well_info, ['LAT', 'LATITUDE', 'SLAT']),
            "surface_longitude": _extract_coordinate_well(well_info, ['LON', 'LONG', 'LONGITUDE', 'SLON']),
            "created": created_date.strftime("%Y-%m-%d %H:%M:%S"),
            "loaded": modified_date.strftime("%Y-%m-%d %H:%M:%S"),
            "approved": "",  # Not typically available in LAS files
            "last_updated": modified_date.strftime("%Y-%m-%d %H:%M:%S"),
            "file_path": file_path,
            "file_size": file_stats.st_size
        }
        
        # Add curve information
        if hasattr(las, 'curves'):
            curves = las.curves
            metadata["curves"] = {
                "count": len(curves),
                "names": [curve.mnemonic for curve in curves]
            }
        
        # Add well parameters if available
        if hasattr(las, 'params'):
            params = las.params
            metadata["parameters"] = {param.mnemonic: _convert_numpy_types(param.value) for param in params}
        
        # Add additional lasio-specific information
        metadata["version"] = str(getattr(las, 'version', 'Unknown'))
        metadata["sections"] = {
            "well_count": len(las.well) if hasattr(las, 'well') else 0,
            "curve_count": len(las.curves) if hasattr(las, 'curves') else 0,
            "param_count": len(las.params) if hasattr(las, 'params') else 0,
            "data_rows": len(las.data) if hasattr(las, 'data') else 0
        }
        
        # Convert all numpy types to Python native types
        metadata = _convert_numpy_types(metadata)
        
        return metadata
        
    except Exception as e:
        raise ValueError(f"Error extracting LAS metadata: {str(e)}")

def _extract_well_field(well_info, possible_keys, default_value):
    """
    Extract field from well info using multiple possible key names
    """
    if not well_info:
        return default_value
    
    # Try each possible key
    for key in possible_keys:
        # Try to find the header item by mnemonic
        for item in well_info:
            if item.mnemonic.upper() == key.upper():
                value = item.value
                if value and str(value).strip():
                    return str(value).strip()
    
    return default_value

def _extract_coordinate_well(well_info, possible_keys):
    """
    Extract coordinate value and format it properly from well info
    """
    coord_value = _extract_well_field(well_info, possible_keys, '')
    
    if not coord_value or coord_value == 'UNKNOWN':
        return ''
    
    try:
        # Try to convert to float and format
        coord_float = float(coord_value)
        return f"{coord_float:.6f}"
    except (ValueError, TypeError):
        # Return as string if can't convert to float
        return str(coord_value)

def get_las_summary(file_path):
    """
    Get a quick summary of LAS file without full metadata extraction
    """
    if not lasio:
        return {"error": "lasio library not available"}
    
    try:
        las = lasio.read(file_path)
        
        # Get well name
        well_name = 'Unknown'
        if hasattr(las, 'well'):
            for item in las.well:
                if item.mnemonic.upper() in ['WELL', 'WELL_NAME']:
                    if item.value:
                        well_name = str(item.value)
                        break
        
        summary = {
            "file_path": file_path,
            "file_size": os.path.getsize(file_path),
            "well_name": well_name,
            "curve_count": len(las.curves) if hasattr(las, 'curves') else 0,
            "data_points": len(las.data) if hasattr(las, 'data') else 0,
            "version": str(getattr(las, 'version', 'Unknown'))
        }
        
        # Convert numpy types
        summary = _convert_numpy_types(summary)
        
        return summary
        
    except Exception as e:
        return {"error": f"Error reading LAS file: {str(e)}"}

# Test function for standalone usage
def test_extractor():
    """Test function to demonstrate usage"""
    print("LAS Extractor Test (using lasio)")
    print("This requires a LAS file to test with.")
    print("Usage: extract_metadata('/path/to/file.las')")

if __name__ == "__main__":
    test_extractor() 