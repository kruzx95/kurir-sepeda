export const MAX_DISTANCE_KM = 8.0;
export const MAX_WEIGHT_KG = 5.0;
export const BASE_FARE = 15000;
export const BASE_DISTANCE_KM = 2.0;
export const PER_KM_FARE = 3500;
export const CO2_PER_KM_GRAMS = 120;

export function validateDistance(distanceKm) {
  if (typeof distanceKm !== 'number' || distanceKm <= 0) {
    return { isValid: false, message: 'Jarak harus berupa angka positif.' };
  }
  if (distanceKm > MAX_DISTANCE_KM) {
    return {
      isValid: false,
      message: `Jarak pengiriman ${distanceKm} km melebihi batas operasional kurir sepeda (maksimal ${MAX_DISTANCE_KM} km demi keselamatan pesepeda).`
    };
  }
  return { isValid: true };
}

export function validateWeight(weightKg) {
  if (typeof weightKg !== 'number' || weightKg <= 0) {
    return { isValid: false, message: 'Berat harus berupa angka positif.' };
  }
  if (weightKg > MAX_WEIGHT_KG) {
    return {
      isValid: false,
      message: `Berat ${weightKg} kg melebihi kapasitas tas kurir (maksimal ${MAX_WEIGHT_KG} kg).`
    };
  }
  return { isValid: true };
}

export function calculateFare(distanceKm) {
  if (distanceKm <= BASE_DISTANCE_KM) {
    return BASE_FARE;
  }
  const extraKm = distanceKm - BASE_DISTANCE_KM;
  return BASE_FARE + Math.round(extraKm * PER_KM_FARE);
}

export function calculateCo2Saved(distanceKm) {
  return Math.round(distanceKm * CO2_PER_KM_GRAMS);
}
