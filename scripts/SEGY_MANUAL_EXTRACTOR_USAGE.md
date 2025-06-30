# SEGY Manual Extractor Usage Guide

## Overview

The `segy_manual_extractor.py` module allows you to extract specific header fields from SEGY files by specifying their exact byte positions. This is useful when you need to extract custom fields or when standard SEGY readers don't expose certain header values.

## Basic Usage

### 1. Simple Function Call

```python
from segy_manual_extractor import extract_segy_headers

# Define your request object with field names and byte positions
request_object = {
    "Ffid": 1,    # Field File ID - bytes 1-4
    "Sp": 9,      # Shot Point - bytes 9-12
    "Cdp": 21,    # CDP number - bytes 21-24
    "Il": 189,    # Inline number - bytes 189-192
    "Xl": 193     # Crossline number - bytes 193-196
}

# Extract headers
result = extract_segy_headers(
    file_path="path/to/your/file.sgy",
    request_object=request_object,
    trace_range=(0, 100)  # First 100 traces
)

# Access extracted data
for field_name, values in result['extracted_fields'].items():
    print(f"{field_name}: {values[:5]}...")  # First 5 values
```

### 2. Context Manager Usage

```python
from segy_manual_extractor import SegyManualExtractor

request_object = {
    "Ffid": 1,
    "Sp": 9,
    "Cdp": 21
}

with SegyManualExtractor("path/to/file.sgy") as extractor:
    result = extractor.extract_headers_by_request(
        request_object,
        trace_range=(0, 50)
    )
    
    # Process results
    statistics = {}
    for field, values in result['extracted_fields'].items():
        statistics[field] = extractor.get_field_statistics(values)
```

## Request Object Structure

The request object is a dictionary where:
- **Keys**: Field names (you can use any name)
- **Values**: Byte positions (1-based indexing as per SEGY standard)

```python
request_object = {
    "FieldName": byte_position,
    "AnotherField": another_byte_position,
    # ... more fields
}
```

### Example from your specification:

```python
request_object = {
    "Ffid": 1,    # Field File ID
    "Sp": 1,      # Shot Point  
    "Cdp": 1,     # CDP number
    "Il": 1,      # Inline number
    "Xl": 1       # Crossline number
}
```

**Note**: You should replace the `1` values with the actual byte positions where these fields are stored in your SEGY files.

## Common SEGY Header Byte Positions

Based on the SEGY Rev 1 standard, here are common trace header byte positions:

```python
standard_positions = {
    # Basic trace identification
    "TraceSeqLine": 1,        # Trace sequence number within line
    "TraceSeqFile": 5,        # Trace sequence number within file
    "FieldRecord": 9,         # Original field record number (SP)
    "TraceNumber": 13,        # Trace number within field record
    
    # Coordinate information  
    "CDP": 21,                # CDP ensemble number
    "SourceX": 73,            # Source coordinate X
    "SourceY": 77,            # Source coordinate Y
    "GroupX": 81,             # Group coordinate X
    "GroupY": 85,             # Group coordinate Y
    
    # 3D survey information
    "Inline": 189,            # Inline number
    "Crossline": 193,         # Crossline number
    
    # Timing information
    "DelayTime": 109,         # Delay recording time
    "MuteStart": 111,         # Mute time start
    "MuteEnd": 113,           # Mute time end
    
    # Data format
    "SampleCount": 115,       # Number of samples in trace
    "SampleInterval": 117,    # Sample interval in microseconds
}
```

## Data Types

You can specify different data types for each field:

```python
data_types = {
    "Ffid": "int32",        # 32-bit signed integer
    "Sp": "int32",          # 32-bit signed integer  
    "Cdp": "int32",         # 32-bit signed integer
    "Il": "int16",          # 16-bit signed integer
    "Xl": "int16",          # 16-bit signed integer
    "Elevation": "float32"   # 32-bit float
}

result = extract_segy_headers(
    file_path="file.sgy",
    request_object=request_object,
    data_types=data_types
)
```

### Available Data Types:
- `int32`: 32-bit signed integer (default)
- `int16`: 16-bit signed integer
- `uint32`: 32-bit unsigned integer  
- `uint16`: 16-bit unsigned integer
- `float32`: 32-bit floating point

## Result Structure

The extraction function returns a dictionary with the following structure:

```python
{
    'extracted_fields': {
        'Ffid': [1, 2, 3, ...],      # List of values for each trace
        'Sp': [101, 102, 103, ...],   # List of values for each trace
        # ... other fields
    },
    'trace_indices': [0, 1, 2, ...],  # Trace indices processed
    'metadata': {
        'total_traces_in_file': 1000,
        'traces_processed': 100,
        'start_trace': 0,
        'end_trace': 100,
        'byte_positions': {...},      # Copy of request object
        'data_types': {...}           # Data types used
    },
    'field_statistics': {
        'Ffid': {
            'count': 100,
            'min': 1,
            'max': 100,
            'unique_count': 100,
            'unique_values': [1, 2, 3, 4, 5, ...],
            'has_nulls': False,
            'null_count': 0
        },
        # ... statistics for other fields
    },
    'errors': []  # List of any errors encountered
}
```

## Advanced Examples

### Extract coordinates with different data types

```python
coordinate_request = {
    "SourceX": 73,    # Source X coordinate
    "SourceY": 77,    # Source Y coordinate
    "ReceiverX": 81,  # Receiver X coordinate  
    "ReceiverY": 85,  # Receiver Y coordinate
    "Elevation": 89   # Surface elevation
}

coordinate_types = {
    "SourceX": "int32",
    "SourceY": "int32", 
    "ReceiverX": "int32",
    "ReceiverY": "int32",
    "Elevation": "int16"
}

result = extract_segy_headers(
    "survey_data.sgy",
    coordinate_request,
    data_types=coordinate_types,
    trace_range=(0, 1000)
)

# Access coordinate data
source_x = result['extracted_fields']['SourceX']
source_y = result['extracted_fields']['SourceY']
```

### Process large files in chunks

```python
def process_large_file(file_path, request_object, chunk_size=10000):
    """Process large SEGY file in chunks"""
    
    # Get total trace count first
    with SegyManualExtractor(file_path) as extractor:
        total_traces = extractor.segyfile.tracecount
    
    all_results = []
    
    for start in range(0, total_traces, chunk_size):
        end = min(start + chunk_size, total_traces)
        
        result = extract_segy_headers(
            file_path,
            request_object,
            trace_range=(start, end)
        )
        
        all_results.append(result)
        print(f"Processed traces {start} to {end}")
    
    return all_results
```

## Error Handling

The extractor includes comprehensive error handling:

```python
result = extract_segy_headers(file_path, request_object)

if result['errors']:
    print("Errors encountered:")
    for error in result['errors']:
        print(f"  - {error}")

# Check for null values
for field, stats in result['field_statistics'].items():
    if stats['has_nulls']:
        print(f"Field {field} has {stats['null_count']} null values")
```

## Performance Tips

1. **Use trace ranges** for large files to avoid memory issues
2. **Specify appropriate data types** to save memory
3. **Process in chunks** for very large datasets
4. **Use context manager** for better resource management

## Integration with Flask API

You can easily integrate this with your Flask application:

```python
from flask import Flask, request, jsonify
from segy_manual_extractor import extract_segy_headers

app = Flask(__name__)

@app.route('/extract_headers', methods=['POST'])
def extract_headers_endpoint():
    data = request.json
    
    file_path = data.get('file_path')
    request_object = data.get('request_object')
    trace_range = data.get('trace_range')
    
    result = extract_segy_headers(file_path, request_object, trace_range)
    
    return jsonify(result)
```

This allows you to send POST requests with your custom request objects to extract exactly the header fields you need. 