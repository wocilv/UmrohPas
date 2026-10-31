export interface Filters {
  // Tanggal Berangkat (wajib) - rentang tanggal
  departureDateStart: string;
  departureDateEnd: string;
  
  // Durasi (wajib) - multi-select
  travelDays: string[];
  
  // Tipe Penerbangan - multi-level multi-select
  flightTypes: {
    direct: boolean;
    transit: boolean;
    transitDomestic: boolean;
    transitDomesticOvernight: boolean;
    transitDomesticNoOvernight: boolean;
    transitInternational: boolean;
    transitInternationalCityTour: boolean;
    transitInternationalNoCityTour: boolean;
  };
  
  // Bandara - multi-select
  airports: string[];
  saudiRoutes: string[];
  
  // Maskapai - multi-select
  aircrafts: string[];
  
  // Nama Travel - multi-select
  travelBrands: string[];
  
  // Hotel Makkah
  makkahHotel: {
    mode: 'stars' | 'distance' | 'name';
    stars: string[];
    distanceMin: number;
    distanceMax: number;
    names: string[];
  };
  
  // Hotel Madinah
  madinahHotel: {
    mode: 'stars' | 'distance' | 'name';
    stars: string[];
    distanceMin: number;
    distanceMax: number;
    names: string[];
  };
}

export type TransitType = 
  | 'direct'
  | 'transit_domestic_overnight'
  | 'transit_domestic_no_overnight'
  | 'transit_international_city_tour'
  | 'transit_international_no_city_tour';

export interface TravelAgency {
  brandName: string;
  legalName: string;
  ppNumber: string;
  ppYear: number;
  pihkNumber: string | null;
  pihkYear: number | null;
  ceo: string;
  hqAddress: string;
  branches: { city: string; address: string }[];
}

export interface Package {
  id: string;
  travelBrand: string;
  contactPerson: string;
  contactPhone: string;
  departureDate: string;
  travelDays: number;
  transitType: TransitType;
  transitCity?: string;
  transitCountry?: string;
  airport: string;
  airportCode: string;
  saudiRoute: string;
  aircraft: string;
  makkahHotel: {
    name: string;
    stars: string;
    distance: number;
  };
  madinahHotel: {
    name: string;
    stars: string;
    distance: number;
  };
  price: number;
  includes: string[];
  rating: number;
  promo?: boolean;
}

export const defaultFilters: Filters = {
  departureDateStart: '',
  departureDateEnd: '',
  travelDays: [],
  flightTypes: {
    direct: true,
    transit: true,
    transitDomestic: true,
    transitDomesticOvernight: true,
    transitDomesticNoOvernight: true,
    transitInternational: true,
    transitInternationalCityTour: true,
    transitInternationalNoCityTour: true,
  },
  airports: [],
  saudiRoutes: [],
  aircrafts: [],
  travelBrands: [],
  makkahHotel: {
    mode: 'stars',
    stars: [],
    distanceMin: 0,
    distanceMax: 2000,
    names: [],
  },
  madinahHotel: {
    mode: 'stars',
    stars: [],
    distanceMin: 0,
    distanceMax: 2000,
    names: [],
  },
};
