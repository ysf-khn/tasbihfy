export interface GeocodeResult {
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  formattedAddress: string;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeResult> {
  try {
    // Use our API endpoint to avoid CORS issues
    const url = `/api/geocode?lat=${latitude}&lon=${longitude}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data as GeocodeResult;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    throw new Error('Failed to determine location from coordinates');
  }
}

export function isCoordinateString(location: string): boolean {
  // Check if the string looks like coordinates (lat,lon)
  const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
  return coordPattern.test(location.trim());
}