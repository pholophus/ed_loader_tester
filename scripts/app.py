from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from seismic_viewer import get_seismic_data, get_ebcdic_header, get_file_metadata
from segy_manual_extractor import read_segy_file
from proj4_converter import convert_multiple_segy_files_to_wgs84, convert_segy_coordinates_to_wgs84
import logging
import os

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

# Default file path - can be updated via environment variable or API parameter
DEFAULT_SEGY_FILE = os.environ.get('DEFAULT_SEGY_FILE', 
    '../../rnd/auto-import-segy-data/2D_SEISMIC/MYS1985P19862DM01PMOPMEC/MYS1985P19862DM01PMOPMEC_CS86-965_RAW_MIGR.sgy')

@app.route('/api/seismic_data', methods=['GET'])
def serve_seismic_data():
    """
    API endpoint to get seismic data from a SEGY file.
    
    Query parameters:
    - file_path: Path to SEGY file (optional, uses default if not provided)
    - start_trace: Starting trace index (default: 0)
    - end_trace: Ending trace index (optional, reads all traces if not provided)
    """
    file_path = request.args.get('file_path', DEFAULT_SEGY_FILE)
    start_trace = int(request.args.get('start_trace', 0))
    end_trace = request.args.get('end_trace', None)

    if end_trace is not None:
        end_trace = int(end_trace)
    
    app.logger.debug(f"Reading traces {start_trace} to {end_trace} from {file_path}")
    result = get_seismic_data(file_path, start_trace, end_trace)
    
    if 'error' in result and result['error']:
        app.logger.error(f"Error in get_seismic_data: {result['error']}")
        return jsonify(result), 500
    
    app.logger.debug("Successfully processed SEG-Y data")
    return jsonify(result)

@app.route('/api/ebcdic_header', methods=['GET'])
def serve_ebcdic_header():
    """
    API endpoint to get EBCDIC header from a SEGY file.
    
    Query parameters:
    - file_path: Path to SEGY file (optional, uses default if not provided)
    """
    file_path = request.args.get('file_path', DEFAULT_SEGY_FILE)
    
    app.logger.debug(f"Reading EBCDIC header from {file_path}")
    result = get_ebcdic_header(file_path)
    
    if result['error']:
        app.logger.error(f"Error in get_ebcdic_header: {result['error']}")
        return jsonify(result), 500
    
    app.logger.debug("Successfully retrieved EBCDIC header")
    return jsonify(result)

@app.route('/api/file_metadata', methods=['GET'])
def serve_file_metadata():
    """
    API endpoint to get file metadata from a SEGY file.
    
    Query parameters:
    - file_path: Path to SEGY file (optional, uses default if not provided)
    """
    file_path = request.args.get('file_path', DEFAULT_SEGY_FILE)
    
    app.logger.debug(f"Reading file metadata from {file_path}")
    result = get_file_metadata(file_path)
    
    if result['error']:
        app.logger.error(f"Error in get_file_metadata: {result['error']}")
        return jsonify(result), 500
    
    app.logger.debug("Successfully retrieved file metadata")
    return jsonify(result)

@app.route('/api/segy_manual_read', methods=['GET', 'POST'])
def serve_manual_segy_read():
    """
    API endpoint to read SEGY file using manual extraction method.
    Returns data in the same format as segy_read_from_list.py
    
    GET Query parameters:
    - file_path: Path to SEGY file (optional, uses default if not provided)
    
    POST Request body (JSON):
    {
        "file_path": "path/to/file.sgy" (optional),
        "field_mappings": {
            "Ffid": 9,
            "Sp": 17,
            "Cdp": 21,
            "Il": 189,
            "Xl": 193
        }
    }
    """
    
    if request.method == 'GET':
        # Handle GET request with query parameters
        file_path = request.args.get('file_path', DEFAULT_SEGY_FILE)
        field_mappings = None
    else:
        # Handle POST request with JSON body
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
            
            file_path = data.get('file_path', DEFAULT_SEGY_FILE)
            field_mappings = data.get('field_mappings', None)
            
            # Validate field_mappings structure if provided
            if field_mappings:
                if not isinstance(field_mappings, dict):
                    return jsonify({'error': 'field_mappings must be a dictionary'}), 400
                
                # Validate that all values are integers (byte positions)
                for key, value in field_mappings.items():
                    if not isinstance(value, int) or value < 1:
                        return jsonify({'error': f'Invalid byte position for {key}: must be a positive integer'}), 400
                        
        except Exception as e:
            return jsonify({'error': f'Invalid JSON data: {str(e)}'}), 400
    
    app.logger.debug(f"Reading SEGY file from {file_path} with field mappings: {field_mappings}")
    result = read_segy_file(file_path, field_mappings)
    
    if 'error' in result and result['error']['type'] is not None:
        app.logger.error(f"Error in manual SEGY read: {result['error']}")
        return jsonify(result), 500
    
    app.logger.debug("Successfully processed SEGY file with manual extraction")
    return jsonify(result)

@app.route('/api/convert_coordinates', methods=['POST'])
def serve_coordinate_conversion():
    """
    API endpoint to convert srcx/srcy coordinates from SEG-Y files to WGS84.
    
    POST Request body (JSON):
    {
        "segy_files": ["path/to/file1.sgy", "path/to/file2.sgy"],
        "srid": 2000,
        "proj4": "+proj=tmerc +lat_0=0 +lon_0=-62 +k=0.9995000000000001 +x_0=400000 +y_0=0 +ellps=GRS80 +units=m +no_defs",
        "byte_header_x": 73,
        "byte_header_y": 77,
        "sample_interval": 10
    }
    
    Returns:
    {
        "status": "success",
        "results": {
            "filename1.sgy": {
                "filename": "filename1.sgy",
                "original_coordinates": [[x1, y1], [x2, y2], ...],
                "converted_coordinates": [[lon1, lat1], [lon2, lat2], ...],
                "count": 10,
                "byte_header_x": 73,
                "byte_header_y": 77,
                "sample_interval": 10
            },
            "filename2.sgy": {
                "error": "Error message if any"
            }
        },
        "summary": {
            "total_files": 2,
            "successful_conversions": 1,
            "total_coordinates": 10,
            "byte_header_x": 73,
            "byte_header_y": 77,
            "sample_interval": 10
        }
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract parameters from request
        segy_files = data.get('segy_files', [])
        srid = data.get('srid', 2000)
        proj4_string = data.get('proj4', "+proj=tmerc +lat_0=0 +lon_0=-62 +k=0.9995000000000001 +x_0=400000 +y_0=0 +ellps=GRS80 +units=m +no_defs")
        byte_header_x = data.get('byte_header_x', None)
        byte_header_y = data.get('byte_header_y', None)
        sample_interval = data.get('sample_interval', 10)
        
        # Validate input
        if not segy_files:
            return jsonify({'error': 'segy_files array is required and cannot be empty'}), 400
        
        if not isinstance(segy_files, list):
            return jsonify({'error': 'segy_files must be an array'}), 400
        
        if not isinstance(srid, int):
            return jsonify({'error': 'srid must be an integer'}), 400
        
        if not isinstance(proj4_string, str):
            return jsonify({'error': 'proj4 must be a string'}), 400
        
        # Validate byte headers if provided
        if byte_header_x is not None and not isinstance(byte_header_x, int):
            return jsonify({'error': 'byte_header_x must be an integer'}), 400
        
        if byte_header_y is not None and not isinstance(byte_header_y, int):
            return jsonify({'error': 'byte_header_y must be an integer'}), 400
        
        # Both byte headers should be provided together or both should be None
        if (byte_header_x is not None and byte_header_y is None) or (byte_header_x is None and byte_header_y is not None):
            return jsonify({'error': 'Both byte_header_x and byte_header_y must be provided together'}), 400
        
        # Validate sample_interval
        if not isinstance(sample_interval, int) or sample_interval < 1:
            return jsonify({'error': 'sample_interval must be a positive integer'}), 400
        
        app.logger.debug(f"Converting coordinates for {len(segy_files)} SEG-Y files")
        app.logger.debug(f"SRID: {srid}")
        app.logger.debug(f"Proj4 string: {proj4_string}")
        app.logger.debug(f"Byte headers: X={byte_header_x}, Y={byte_header_y}")
        app.logger.debug(f"Sample interval: {sample_interval}")
        
        # Convert coordinates using the proj4_converter
        results = convert_multiple_segy_files_to_wgs84(segy_files, srid, proj4_string, byte_header_x, byte_header_y, sample_interval)
        
        # Calculate summary statistics
        total_files = len(segy_files)
        successful_conversions = 0
        total_coordinates = 0
        
        for filename, result in results.items():
            if 'error' not in result:
                successful_conversions += 1
                total_coordinates += result.get('count', 0)
        
        # Prepare response
        response = {
            'status': 'success',
            'results': results,
            'summary': {
                'total_files': total_files,
                'successful_conversions': successful_conversions,
                'failed_conversions': total_files - successful_conversions,
                'total_coordinates': total_coordinates,
                'srid': srid,
                'proj4_string': proj4_string,
                'byte_header_x': byte_header_x,
                'byte_header_y': byte_header_y,
                'sample_interval': sample_interval
            }
        }
        
        app.logger.debug(f"Successfully converted coordinates for {successful_conversions}/{total_files} files")
        return jsonify(response)
        
    except Exception as e:
        app.logger.error(f"Error in coordinate conversion: {str(e)}")
        return jsonify({
            'error': f'Internal server error: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/convert_single_file', methods=['POST'])
def serve_single_file_conversion():
    """
    API endpoint to convert srcx/srcy coordinates from a single SEG-Y file to WGS84.
    
    POST Request body (JSON):
    {
        "file_path": "path/to/file.sgy",
        "srid": 2000,
        "proj4": "+proj=tmerc +lat_0=0 +lon_0=-62 +k=0.9995000000000001 +x_0=400000 +y_0=0 +ellps=GRS80 +units=m +no_defs",
        "byte_header_x": 73,
        "byte_header_y": 77,
        "sample_interval": 10
    }
    
    Returns:
    {
        "status": "success",
        "filename": "filename.sgy",
        "original_coordinates": [[x1, y1], [x2, y2], ...],
        "converted_coordinates": [[lon1, lat1], [lon2, lat2], ...],
        "count": 10,
        "byte_header_x": 73,
        "byte_header_y": 77,
        "sample_interval": 10
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract parameters from request
        file_path = data.get('file_path')
        srid = data.get('srid', 2000)
        proj4_string = data.get('proj4', "+proj=tmerc +lat_0=0 +lon_0=-62 +k=0.9995000000000001 +x_0=400000 +y_0=0 +ellps=GRS80 +units=m +no_defs")
        byte_header_x = data.get('byte_header_x', None)
        byte_header_y = data.get('byte_header_y', None)
        sample_interval = data.get('sample_interval', 10)
        
        # Validate input
        if not file_path:
            return jsonify({'error': 'file_path is required'}), 400
        
        if not isinstance(file_path, str):
            return jsonify({'error': 'file_path must be a string'}), 400
        
        if not isinstance(srid, int):
            return jsonify({'error': 'srid must be an integer'}), 400
        
        if not isinstance(proj4_string, str):
            return jsonify({'error': 'proj4 must be a string'}), 400
        
        # Validate byte headers if provided
        if byte_header_x is not None and not isinstance(byte_header_x, int):
            return jsonify({'error': 'byte_header_x must be an integer'}), 400
        
        if byte_header_y is not None and not isinstance(byte_header_y, int):
            return jsonify({'error': 'byte_header_y must be an integer'}), 400
        
        # Both byte headers should be provided together or both should be None
        if (byte_header_x is not None and byte_header_y is None) or (byte_header_x is None and byte_header_y is not None):
            return jsonify({'error': 'Both byte_header_x and byte_header_y must be provided together'}), 400
        
        # Validate sample_interval
        if not isinstance(sample_interval, int) or sample_interval < 1:
            return jsonify({'error': 'sample_interval must be a positive integer'}), 400
        
        app.logger.debug(f"Converting coordinates for single file: {file_path}")
        app.logger.debug(f"SRID: {srid}")
        app.logger.debug(f"Proj4 string: {proj4_string}")
        app.logger.debug(f"Byte headers: X={byte_header_x}, Y={byte_header_y}")
        app.logger.debug(f"Sample interval: {sample_interval}")
        
        # Convert coordinates using the proj4_converter
        result = convert_segy_coordinates_to_wgs84(file_path, srid, proj4_string, byte_header_x, byte_header_y, sample_interval)
        
        if 'error' in result:
            app.logger.error(f"Error converting coordinates: {result['error']}")
            return jsonify({
                'error': result['error'],
                'status': 'error'
            }), 400
        
        # Add status to response
        result['status'] = 'success'
        
        app.logger.debug(f"Successfully converted {result['count']} coordinates")
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Error in single file coordinate conversion: {str(e)}")
        return jsonify({
            'error': f'Internal server error: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'SEGY Flask API is running'
    })

@app.route('/')
def serve_index():
    """Serve the main page"""
    try:
        return send_from_directory('static', 'index.html')
    except:
        return jsonify({
            'message': 'SEGY Flask API',
            'endpoints': {
                '/api/health': 'Health check',
                '/api/seismic_data': 'Get seismic data',
                '/api/ebcdic_header': 'Get EBCDIC header',
                '/api/file_metadata': 'Get file metadata',
                '/api/segy_manual_read': 'Read SEGY file with manual extraction (returns segy_read_from_list format)',
                '/api/convert_coordinates': 'Convert srcx/srcy coordinates from multiple SEG-Y files to WGS84',
                '/api/convert_single_file': 'Convert srcx/srcy coordinates from a single SEG-Y file to WGS84'
            }
        })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 