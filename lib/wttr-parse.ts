export type NormalizedWeather = {
  tempC: number;
  feelsLikeC: number;
  description: string;
  bucket: 'sunny' | 'rainy' | 'cloudy' | 'cold' | 'hot' | 'mild';
  areaName: string | null;
};

function bucketFrom(desc: string, temp: number): NormalizedWeather['bucket'] {
  const d = desc.toLowerCase();
  if (temp <= 8) return 'cold';
  if (temp >= 30) return 'hot';
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower') || d.includes('thunder'))
    return 'rainy';
  if (d.includes('clear') || d.includes('sunny')) return 'sunny';
  if (d.includes('cloud') || d.includes('overcast') || d.includes('fog')) return 'cloudy';
  return 'mild';
}

export function parseWttrJ1Json(j: unknown): NormalizedWeather {
  const data = j as {
    current_condition?: Array<{
      temp_C?: string;
      FeelsLikeC?: string;
      weatherDesc?: Array<{ value?: string }>;
    }>;
    nearest_area?: Array<{ areaName?: Array<{ value?: string }> }>;
  };
  const cur = data.current_condition?.[0];
  const tempC = Number.parseInt(String(cur?.temp_C ?? '20'), 10);
  const feels = Number.parseInt(String(cur?.FeelsLikeC ?? cur?.temp_C ?? '20'), 10);
  const description = cur?.weatherDesc?.[0]?.value ?? 'Unknown';
  const area = data.nearest_area?.[0]?.areaName?.[0]?.value?.trim() ?? null;
  return {
    tempC: Number.isFinite(tempC) ? tempC : 20,
    feelsLikeC: Number.isFinite(feels) ? feels : tempC,
    description,
    bucket: bucketFrom(description, Number.isFinite(tempC) ? tempC : 20),
    areaName: area,
  };
}

export function weatherEmoji(bucket: NormalizedWeather['bucket']): string {
  switch (bucket) {
    case 'sunny':
      return '☀️';
    case 'rainy':
      return '🌧️';
    case 'cold':
      return '❄️';
    case 'hot':
      return '🔥';
    case 'cloudy':
      return '☁️';
    default:
      return '✨';
  }
}
