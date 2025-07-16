/**
 * File filter utility for different data types
 */

export type DataType = 'seismic' | 'well' | 'other';

export class FileFilter {
  private static readonly SEISMIC_EXTENSIONS = [
    '.sgy', '.segy'
  ];

  private static readonly WELL_EXTENSIONS = [
    '.las', '.dat', '.bin', '.raw', '.txt', '.csv', '.xlsx', '.xls', '.pdf', 
    '.doc', '.docx', '.tif', '.tiff', '.jpg', '.jpeg', '.png'
  ];

  private static readonly OTHER_EXTENSIONS = [
    '.dat', '.bin', '.raw', '.txt', '.csv', '.xlsx', '.xls', '.pdf', 
    '.doc', '.docx', '.tif', '.tiff', '.jpg', '.jpeg', '.png'
  ];

  /**
   * Get allowed file extensions for a specific data type
   */
  static getExtensions(dataType: DataType): string[] {
    switch (dataType) {
      case 'seismic':
        return [...this.SEISMIC_EXTENSIONS];
      case 'well':
        return [...this.WELL_EXTENSIONS];
      case 'other':
        return [...this.OTHER_EXTENSIONS];
      default:
        return [...this.SEISMIC_EXTENSIONS, ...this.WELL_EXTENSIONS, ...this.OTHER_EXTENSIONS];
    }
  }

  /**
   * Get file filter string for Electron dialog
   * Format: "SEGY Files (*.sgy *.segy);;All Files (*)"
   */
  static getFilterString(dataType: DataType): string {
    const extensions = this.getExtensions(dataType);
    let dataTypeLabel: string;
    switch (dataType) {
      case 'seismic':
        dataTypeLabel = 'Seismic';
        break;
      case 'well':
        dataTypeLabel = 'Well';
        break;
      default:
        dataTypeLabel = 'Other';
        break;
    }
    
    const filterParts = extensions.map(ext => `*${ext}`).join(' ');
    return `${dataTypeLabel} Files (${filterParts});;All Files (*)`;
  }

  /**
   * Check if a file extension is allowed for the given data type
   */
  static isAllowedExtension(extension: string, dataType: DataType): boolean {
    const allowedExtensions = this.getExtensions(dataType);
    return allowedExtensions.includes(extension.toLowerCase());
  }
}
