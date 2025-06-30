from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from seismic_viewer import get_seismic_data, get_ebcdic_header, get_file_metadata
from segy_manual_extractor import read_segy_file
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
                '/api/segy_manual_read': 'Read SEGY file with manual extraction (returns segy_read_from_list format)'
            }
        })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 