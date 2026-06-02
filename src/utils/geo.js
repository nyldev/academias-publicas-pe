// Distância em km entre dois pontos geográficos (fórmula de Haversine).
export function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // raio médio da Terra em km
  const rad = (graus) => (graus * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Formata a distância para exibição: "850 m" ou "1.2 km".
export function formatarDistancia(km) {
  if (km == null || Number.isNaN(km)) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
