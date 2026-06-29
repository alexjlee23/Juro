import * as Location from 'expo-location';

// Maps a reverse-geocoded address to one of the directory region keys.
// Works regardless of device locale (handles both Korean and English names).
export function geocodeToDirectoryRegion(addr: Location.LocationGeocodedAddress): string | null {
  const text = `${addr.region ?? ''} ${addr.city ?? ''} ${addr.subregion ?? ''}`.toLowerCase();

  if (text.includes('서울') || text.includes('seoul')) return '서울';
  if (text.includes('부산') || text.includes('busan')) return '부산';
  if (text.includes('대구') || text.includes('daegu')) return '대구';
  if (text.includes('인천') || text.includes('incheon')) return '인천';
  if (text.includes('광주') || text.includes('gwangju')) return '광주';
  if (text.includes('대전') || text.includes('daejeon')) return '대전';
  if (text.includes('울산') || text.includes('ulsan')) return '울산';
  if (text.includes('세종') || text.includes('sejong')) return '세종';
  if (text.includes('강원') || text.includes('gangwon')) return '강원';
  if (text.includes('충북') || text.includes('충청북') || text.includes('north chungcheong')) return '충북';
  if (text.includes('충남') || text.includes('충청남') || text.includes('south chungcheong')) return '충남';
  if (text.includes('전북') || text.includes('전라북') || text.includes('north jeolla')) return '전북';
  if (text.includes('전남') || text.includes('전라남') || text.includes('south jeolla')) return '전남';
  if (text.includes('경북') || text.includes('경상북') || text.includes('north gyeongsang')) return '경북';
  if (text.includes('경남') || text.includes('경상남') || text.includes('south gyeongsang')) return '경남';
  if (text.includes('경기')) {
    // Rough north/south split — cities north of Suwon go to 경기북부
    const northCities = ['의정부', '구리', '남양주', '가평', '양주', '동두천', '포천', '연천', '파주', '고양', '김포'];
    if (northCities.some(c => text.includes(c))) return '경기북부';
    return '경기남부';
  }
  return null;
}

export async function detectNearbyRegion(): Promise<string | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const results = await Location.reverseGeocodeAsync(pos.coords);
  if (!results.length) return null;

  return geocodeToDirectoryRegion(results[0]);
}
