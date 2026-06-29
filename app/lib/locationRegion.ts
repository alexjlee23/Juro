import * as Location from 'expo-location';

// Pure coordinate → region lookup. Entirely on-device, works on web + native.
// Bounding boxes are approximate but accurate enough for regional filtering.
function coordsToRegion(lat: number, lon: number): string | null {
  // Metropolitan cities (checked first — more precise boxes)
  if (lat >= 37.40 && lat <= 37.71 && lon >= 126.75 && lon <= 127.20) return '서울';
  if (lat >= 35.00 && lat <= 35.40 && lon >= 128.80 && lon <= 129.30) return '부산';
  if (lat >= 35.70 && lat <= 36.05 && lon >= 128.45 && lon <= 128.85) return '대구';
  if (lat >= 37.30 && lat <= 37.66 && lon >= 126.40 && lon <= 126.80) return '인천';
  if (lat >= 35.05 && lat <= 35.30 && lon >= 126.75 && lon <= 127.00) return '광주';
  if (lat >= 36.20 && lat <= 36.52 && lon >= 127.30 && lon <= 127.56) return '대전';
  if (lat >= 35.40 && lat <= 35.70 && lon >= 129.00 && lon <= 129.40) return '울산';
  if (lat >= 36.40 && lat <= 36.70 && lon >= 127.20 && lon <= 127.50) return '세종';
  // Gyeonggi — split north/south around 37.55 latitude
  if (lat >= 36.80 && lat <= 38.20 && lon >= 126.50 && lon <= 127.80) {
    return lat >= 37.55 ? '경기북부' : '경기남부';
  }
  // Provinces
  if (lat >= 37.00 && lat <= 38.62 && lon >= 127.50 && lon <= 129.40) return '강원';
  if (lat >= 36.40 && lat <= 37.20 && lon >= 127.20 && lon <= 128.30) return '충북';
  if (lat >= 36.00 && lat <= 37.00 && lon >= 125.80 && lon <= 127.50) return '충남';
  if (lat >= 35.10 && lat <= 36.10 && lon >= 126.40 && lon <= 127.80) return '전북';
  if (lat >= 33.90 && lat <= 35.10 && lon >= 125.50 && lon <= 127.60) return '전남';
  if (lat >= 35.60 && lat <= 37.00 && lon >= 127.90 && lon <= 129.60) return '경북';
  if (lat >= 34.60 && lat <= 35.60 && lon >= 127.60 && lon <= 129.30) return '경남';
  return null;
}

export async function detectNearbyRegion(): Promise<string | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return coordsToRegion(pos.coords.latitude, pos.coords.longitude);
}
