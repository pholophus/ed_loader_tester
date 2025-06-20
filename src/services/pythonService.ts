import { spawnSync } from 'child_process';
import { manualTraceHeaderExtractRequest } from '../schemas/SegyTable';

interface PythonResult {
  error?: string;
  raw?: string;
  // Add other properties if Python scripts return more structured data
}

function runPythonScript(scriptPath: string, folderPath?: string, formData?: any): any {
  try {
    // console.log(`Running script: ${scriptPath}`);
    const args: string[] = [scriptPath];

    if (folderPath) args.push(folderPath);

    if (formData) {
      const formDataString = JSON.stringify(formData);
      args.push('--form-data');
      args.push(formDataString);
    }

    // console.log("args   ", args);

    const result = spawnSync('python3', args, { encoding: 'utf-8' });

    // console.log('Result: ', result);

    if (result.error) return { error: result.error.message };
    if (result.stderr) return { error: result.stderr };

    try {
      return JSON.parse(result.stdout);
    } catch (e) {
      return { error: 'Failed to parse Python output', raw: result.stdout };
    }
  } catch (e: any) {
    return { error: e.message };
  }
}

export function extractSegySingleFileContent(filePath: string): any {
  return runPythonScript('scripts/segy_read_single_file.py', filePath);
}

export function extractSegyContent(): any {
  return runPythonScript('scripts/segy_read_from_list.py');
}

export function extractLasContent(folderPath?: string, formData?: any): any {
  return runPythonScript('scripts/las_reader.py', folderPath, formData);
}

export function extractOthersContent(folderPath?: string, formData?: any): any {
  return runPythonScript('scripts/others_reader.py', folderPath, formData);
}

export function extractSEGYFilesContent(
  manualTraceHeaderExtractRequest: manualTraceHeaderExtractRequest
): any {
  try {
    const args = ['scripts/manual_segy_reader.py'];

    // Prepare the single configuration object
    const config = {
      action: 'process_files',
      files: manualTraceHeaderExtractRequest.segyRows.map(file => ({
        index: file.index,
        filePath: file.filePath.replace(/\\/g, '/') // Normalize path
      })),
      header_bytes: manualTraceHeaderExtractRequest.headerByteConfig ?? {},
      format: manualTraceHeaderExtractRequest.sampleFormat ?? '4-bit',
      coordinate_config: manualTraceHeaderExtractRequest.coordinateConfig
    };

    // Push the single JSON argument
    args.push(JSON.stringify(config));

    // console.log('Final args:', args);

    const result = spawnSync('python3', args, {
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 50 // 50MB
    });

    if (result.error) {
      console.error('Spawn error:', result.error);
      return {
        error: result.error.message,
        details: {}
      };
    }

    if (result.stderr) {
      console.error('Python stderr:', result.stderr);
    }

    try {
      return JSON.parse(result.stdout);
    } catch (e) {
      console.error('Parse error:', e);
      return {
        error: 'Failed to parse Python output',
        rawOutput: result.stdout
      };
    }
  } catch (e: any) {
    console.error('Unexpected error:', e);
    return {
      error: 'Unexpected error in extractSEGYFilesContent',
      details: e.message,
      stack: e.stack
    };
  }
}

function runPythonScriptWithStdin(scriptPath: string, inputData: any): any {
  try {
    const args: string[] = [scriptPath];
    
    const result = spawnSync('python3', args, {
      input: JSON.stringify(inputData),
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 50 // 50MB, consistent with extractSEGYFilesContent
    });

    if (result.error) {
      return { error: result.error.message };
    }
    if (result.stderr) {
      return { error: result.stderr };
    }

    try {
      return JSON.parse(result.stdout);
    } catch (e) {
      return { error: 'Failed to parse Python output', raw: result.stdout };
    }
  } catch (e: any) {
    return { error: e.message };
  }
}

export function extractSegyCoordinates(fileConfigs: any[], srid: number, proj4_string: string): any {
  const inputData = {
    file_configs: fileConfigs,
    srid: srid,
    proj4_string: proj4_string
  };
  return runPythonScriptWithStdin('scripts/proj4_converter_segy.py', inputData);
}
