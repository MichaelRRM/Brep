export const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const solarSeasonalFactor = [0.25, 0.38, 0.75, 0.82, 0.95, 1.0, 0.96, 0.85, 0.63, 0.4, 0.2, 0.15];

export interface SolarPoint { label: string; potential: number; toGrid: number; toBESS: number; }

export const generateMonthlySolar = (year: number): SolarPoint[] =>
  months.map((m, i) => {
    const s = seededRandom(year * 100 + i);
    const factor = solarSeasonalFactor[i];
    const potential = Math.round((10000 + s * 3000) * factor);
    const toGrid    = Math.round(potential * (0.7 + s * 0.15));
    const toBESS    = Math.round(potential * (0.05 + s * 0.08));
    return { label: m, potential, toGrid, toBESS };
  });

export const generateDailySolar = (year: number, monthIdx: number): SolarPoint[] => {
  const days = daysInMonth(year, monthIdx);
  const factor = solarSeasonalFactor[monthIdx];
  return Array.from({ length: days }, (_, i) => {
    const s = seededRandom(year * 10000 + monthIdx * 100 + i);
    const potential = Math.round((150 + s * 350) * factor * 2);
    const toGrid    = Math.round(potential * (0.65 + s * 0.2));
    const toBESS    = Math.round(potential * (0.05 + s * 0.1));
    return { label: String(i + 1), potential, toGrid, toBESS };
  });
};

export const generateIntradaySolar = (year: number, monthIdx: number, day: number): SolarPoint[] => {
  const factor = solarSeasonalFactor[monthIdx];
  const peakHour = 13;
  const sigma = 3.2;
  return Array.from({ length: 96 }, (_, i) => {
    const hour = i * 0.25;
    const hh = String(Math.floor(hour)).padStart(2, '0');
    const mm = String((i % 4) * 15).padStart(2, '0');
    const s = seededRandom(year * 1_000_000 + monthIdx * 10_000 + day * 100 + i);
    const bell = Math.exp(-Math.pow(hour - peakHour, 2) / (2 * sigma * sigma));
    const potential = +(bell * factor * 28 * (0.92 + s * 0.16)).toFixed(2);
    const lossFactor = 0.86 + s * 0.1;
    const totalActual = +(potential * lossFactor).toFixed(2);
    const toBESS = +(totalActual * (0.1 + s * 0.15)).toFixed(2);
    const toGrid = +(totalActual - toBESS).toFixed(2);
    return { label: `${hh}:${mm}`, potential, toGrid, toBESS };
  });
};
