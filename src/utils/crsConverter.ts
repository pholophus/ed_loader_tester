import proj4 from 'proj4';

// Define common projections
// proj4.defs([
//   ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'], // WGS84 (Longitude, Latitude)
//   ['EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs'], // Web Mercator
//   ['EPSG:4269', '+proj=longlat +ellps=GRS80 +datum=NAD83 +no_defs'], // NAD83
//   ['EPSG:32633', '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs'] // UTM Zone 33N
// ]);

export type CRSParam = {
    epsgCode: string;
    projDefinition: string;
    coordinates: Coordinate;
}
export type Coordinate = [number, number];
export type Coordinate3D = [number, number, number];

/**
 * Coordinate Transformer Utility
 */
export class Converter {
  /**
   * Transform coordinates from one projection to another
   * @param fromProjection Source projection (e.g., 'EPSG:4326')
   * @param toProjection Target projection (e.g., 'EPSG:3857')
   * @param coordinates Coordinates to transform [x, y] or [x, y, z]
   * @returns Transformed coordinates
   */
  static transform(
    fromProjection: string,
    toProjection: string,
    coordinates: Coordinate | Coordinate3D
  ): Coordinate | Coordinate3D {
    return proj4(fromProjection, toProjection, coordinates);
  }

//   /**
//    * Transform WGS84 (Longitude, Latitude) to Web Mercator
//    * @param lonLat [longitude, latitude] coordinates
//    * @returns Web Mercator coordinates [x, y]
//    */
//   static wgs84ToWebMercator(lonLat: Coordinate): Coordinate {
//     return this.transform('EPSG:4326', 'EPSG:3857', lonLat) as Coordinate;
//   }

//   /**
//    * Transform Web Mercator to WGS84 (Longitude, Latitude)
//    * @param mercator [x, y] coordinates in Web Mercator
//    * @returns [longitude, latitude] coordinates
//    */
//   static webMercatorToWgs84(mercator: Coordinate): Coordinate {
//     return this.transform('EPSG:3857', 'EPSG:4326', mercator) as Coordinate;
//   }

  /**
   * Add a custom projection definition
   * @param projectionName Projection identifier (e.g., 'EPSG:21037')
   * @param projectionDef Proj4 projection definition string
   */
  static addProjection(projectionName: string, projectionDef: string): void {
    proj4.defs(projectionName, projectionDef);
  }

  /**
   * Convert from a custom EPSG projection to WGS84 (EPSG:4326)
   * @param customEpsgCode The EPSG code of the source projection (e.g., 'EPSG:21037')
   * @param customProjDefinition The proj4 definition string for the custom projection
   * @param coordinates The coordinates to transform [x, y]
   * @returns Transformed coordinates in WGS84 [longitude, latitude]
   * @throws Error if transformation fails
   */
  static convertCustomToWgs84(
    params: CRSParam
  ): Coordinate {
    try {
      // Add the custom projection if not already defined
      if (!proj4.defs(params.epsgCode)) {
        this.addProjection(params.epsgCode, params.projDefinition);
      }

      console.log("params.epsgCode", params.epsgCode);
      console.log("params.projDefinition", params.projDefinition);
      console.log("params.coordinates", params.coordinates);
      
      // Perform the transformation
      const result = this.transform(params.epsgCode, 'EPSG:4326', params.coordinates);
      
      // Ensure we return a 2D coordinate
      return [result[0], result[1]];
    } catch (error) {
      console.error('Transformation failed:', error);
      throw new Error(`Failed to transform coordinates from ${params.epsgCode} to WGS84: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}