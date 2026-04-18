export interface Site {
  id: string;
  name: string;
  solarMWp: number;
  bessMW?: number;
  bessMWh?: number;
}

export const SITES: Site[] = [
  { id: 'all',      name: 'All sites',       solarMWp: 105.8, bessMW: 55, bessMWh: 250 },
  { id: 'kirikmae', name: 'Kirikmäe Hybrid', solarMWp: 77.5,  bessMW: 55, bessMWh: 250 },
  { id: 'imavere',  name: 'Imavere',         solarMWp: 15.5 },
  { id: 'lohu',     name: 'Lohu Mets',       solarMWp: 12.8 },
];
