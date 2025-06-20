export const isDMS = (coord: any): boolean => {
  if (typeof coord !== 'string') {
    return false;
  }
  // Check for symbolic DMS format
  if (coord.includes('\'') || coord.includes('"') || coord.includes('°')) {
    return true;
  }

  // Check for space-separated DMS format (assuming three parts: degrees, minutes, seconds)
  const parts = coord.split(' ').filter(part => part !== '');
  if (parts.length === 3 && parts.every(part => !isNaN(parseFloat(part)))) {
    return true;
  }

  return false;
};

export const dmsToDecimal = (dms: string): number | null => {
  
  if (typeof dms !== 'string') {
    return null;
  }

  // Regex to capture degrees, minutes, seconds, and optional direction
  const dmsRegex = /^(-?\d+)[°\s]+(\d+)'[\s]+(\d+)(?:"|\s|$)?([NSEWnesw])?$/i;
  const match = dms.match(dmsRegex);

  if (!match) {
    // Handle simple degrees (e.g., "136")
    if (!isNaN(parseFloat(dms))) {
      return parseFloat(dms);
    }
    return null;
  }

  const degrees = parseFloat(match[1]);
  const minutes = parseFloat(match[2]) || 0;
  const seconds = parseFloat(match[3]) || 0;
  const direction = match[4]?.toUpperCase();

  // Calculate decimal degrees
  let decimal = degrees + (minutes / 60) + (seconds / 3600);

  // Adjust sign based on direction
  if (direction === 'S' || direction === 'W') {
    decimal *= -1;
  }

  return parseFloat(decimal.toFixed(6)); // Round to 6 decimal places for precision
};
