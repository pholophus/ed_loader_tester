import pyproj
import segyio
from typing import List, Tuple, Union, Dict, Any
import numpy as np
import os
from pathlib import Path

def convert_coordinates_to_wgs84(
    coordinates: List[List[float]], 
    srid: int = 2000,
    proj4_string: str = "+proj=tmerc +lat_0=0 +lon_0=-62 +k=0.9995000000000001 +x_0=400000 +y_0=0 +ellps=GRS80 +units=m +no_defs"
) -> List[List[float]]:
    """
    Convert coordinates from a custom projection to WGS84.
    
    Args:
        coordinates: List of [coordx, coordy] pairs
        srid: Source coordinate system ID (default: 2000)
        proj4_string: Proj4 string defining the source projection
        
    Returns:
        List of [longitude, latitude] pairs in WGS84
    """
    try:
        # Validate proj4 string - if it doesn't start with +proj, try using EPSG code
        if not proj4_string.startswith('+proj='):
            print(f"Warning: Invalid proj4 string '{proj4_string}', trying to use EPSG:{srid}")
            try:
                source_proj = pyproj.Proj(f'EPSG:{srid}')
            except Exception as epsg_error:
                print(f"Error using EPSG:{srid}: {epsg_error}")
                return []
        else:
            source_proj = pyproj.Proj(proj4_string)
        
        target_proj = pyproj.Proj('EPSG:4326')  # WGS84
        
        converted_coords = []
        for coord in coordinates:
            if len(coord) != 2:
                raise ValueError(f"Each coordinate must have exactly 2 values (x, y). Got: {coord}")
            
            x, y = coord[0], coord[1]
            lon, lat = pyproj.transform(source_proj, target_proj, x, y)
            # Convert numpy types to native Python types for JSON serialization
            converted_coords.append([float(lon), float(lat)])
        
        return converted_coords
        
    except Exception as e:
        print(f"Error converting coordinates: {e}")
        return []

def extract_srcx_srcy_from_segy(file_path: str, byte_header_x: int = None, byte_header_y: int = None, sample_interval: int = 10) -> List[List[float]]:
    """
    Extract srcx and srcy values from a SEG-Y file using custom byte header positions.
    
    Args:
        file_path: Path to the SEG-Y file
        byte_header_x: Custom byte header position for srcx (default: segyio.TraceField.SourceX)
        byte_header_y: Custom byte header position for srcy (default: segyio.TraceField.SourceY)
        sample_interval: Read every nth trace (default: 10, meaning read every 10th trace)
        
    Returns:
        List of [srcx, srcy] coordinate pairs
    """
    try:
        coordinates = []
        
        # Open SEG-Y file with ignore_geometry=True to handle both 2D and 3D files
        with segyio.open(file_path, 'r', ignore_geometry=True) as f:
            # Use custom byte headers if provided, otherwise use default segyio fields
            if byte_header_x is not None and byte_header_y is not None:
                srcx_values = f.attributes(byte_header_x)[:]
                srcy_values = f.attributes(byte_header_y)[:]
            else:
                srcx_values = f.attributes(segyio.TraceField.SourceX)[:]
                srcy_values = f.attributes(segyio.TraceField.SourceY)[:]
            
            coord_set = set()
            # Sample traces by reading every nth trace
            for i in range(0, len(srcx_values), sample_interval):
                srcx = srcx_values[i]
                srcy = srcy_values[i]
                
                if srcx != 0 and srcy != 0:  # Assuming 0,0 might be invalid coordinates
                    # Convert numpy types to native Python types for JSON serialization
                    srcx_float = float(srcx)
                    srcy_float = float(srcy)
                    coord_pair = (srcx_float, srcy_float)
                    if coord_pair not in coord_set:
                        coord_set.add(coord_pair)
                        coordinates.append([srcx_float, srcy_float])
        
        return coordinates
        
    except Exception as e:
        print(f"Error reading SEG-Y file {file_path}: {e}")
        return []

def convert_segy_coordinates_to_wgs84(
    file_path: str,
    srid: int = 2000,
    proj4_string: str = "+proj=tmerc +lat_0=0 +lon_0=-62 +k=0.9995000000000001 +x_0=400000 +y_0=0 +ellps=GRS80 +units=m +no_defs",
    byte_header_x: int = None,
    byte_header_y: int = None,
    sample_interval: int = 10
) -> Dict[str, Any]:
    """
    Extract srcx/srcy from SEG-Y file and convert to WGS84.
    
    Args:
        file_path: Path to the SEG-Y file
        srid: Source coordinate system ID (default: 2000)
        proj4_string: Proj4 string defining the source projection
        byte_header_x: Custom byte header position for srcx (default: segyio.TraceField.SourceX)
        byte_header_y: Custom byte header position for srcy (default: segyio.TraceField.SourceY)
        sample_interval: Read every nth trace (default: 10, meaning read every 10th trace)
        
    Returns:
        Dictionary containing original and converted coordinates
    """
    try:
        original_coords = extract_srcx_srcy_from_segy(file_path, byte_header_x, byte_header_y, sample_interval)
        
        if not original_coords:
            return {"error": "No valid coordinates found in SEG-Y file"}
        
        converted_coords = convert_coordinates_to_wgs84(original_coords, srid, proj4_string)
        
        return {
            "filename": os.path.basename(file_path),
            "original_coordinates": original_coords,
            "converted_coordinates": converted_coords,
            "count": len(original_coords),
            "byte_header_x": byte_header_x or segyio.TraceField.SourceX,
            "byte_header_y": byte_header_y or segyio.TraceField.SourceY,
            "sample_interval": sample_interval
        }
        
    except Exception as e:
        return {"error": f"Error processing file {file_path}: {e}"}

def convert_multiple_segy_files_to_wgs84(
    file_paths: List[str],
    srid: int = 2000,
    proj4_string: str = "+proj=tmerc +lat_0=0 +lon_0=-62 +k=0.9995000000000001 +x_0=400000 +y_0=0 +ellps=GRS80 +units=m +no_defs",
    byte_header_x: int = None,
    byte_header_y: int = None,
    sample_interval: int = 10
) -> Dict[str, Dict[str, Any]]:
    """
    Convert coordinates from multiple SEG-Y files to WGS84.
    
    Args:
        file_paths: List of paths to SEG-Y files
        srid: Source coordinate system ID (default: 2000)
        proj4_string: Proj4 string defining the source projection
        byte_header_x: Custom byte header position for srcx (default: segyio.TraceField.SourceX)
        byte_header_y: Custom byte header position for srcy (default: segyio.TraceField.SourceY)
        sample_interval: Read every nth trace (default: 10, meaning read every 10th trace)
        
    Returns:
        Dictionary with filename as key and conversion results as value
    """
    results = {}
    
    for file_path in file_paths:
        result = convert_segy_coordinates_to_wgs84(file_path, srid, proj4_string, byte_header_x, byte_header_y, sample_interval)
        results[os.path.basename(file_path)] = result
    
    return results
