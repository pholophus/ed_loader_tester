import utm
from typing import List, Dict

def convert_utm_to_latlon(srcx_array: List[float], srcy_array: List[float], 
                         zone_number: int, zone_letter: str) -> List[Dict[str, float]]:
    """
    Convert UTM coordinates to latitude/longitude.
    
    Args:
        srcx_array: List of UTM easting coordinates
        srcy_array: List of UTM northing coordinates
        zone_number: UTM zone number
        zone_letter: UTM zone letter
        
    Returns:
        List of dictionaries with 'latitude' and 'longitude' keys
    """
    if len(srcx_array) != len(srcy_array):
        raise ValueError("SRCX and SRCY arrays must be of equal length")
    
    coords = []
    for x, y in zip(srcx_array, srcy_array):
        lat, lon = utm.to_latlon(x, y, zone_number, zone_letter)
        coords.append({"latitude": lat, "longitude": lon})
    return coords