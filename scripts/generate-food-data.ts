import { FoodItem, Location } from '@/lib/types';

// Define food source locations
const FOOD_LOCATIONS: Record<string, [number, number]> = {
  // United States
  'US_MIDWEST': [-93.2650, 44.9778], // Minneapolis
  'US_WEST': [-122.4194, 37.7749],   // San Francisco
  'US_EAST': [-74.0060, 40.7128],    // New York
  'US_SOUTH': [-95.3698, 29.7604],   // Houston

  // United Kingdom
  'UK_LONDON': [-0.1276, 51.5074],
  'UK_MANCHESTER': [-2.2426, 53.4808],

  // Spain
  'ES_MADRID': [-3.7038, 40.4168],
  'ES_BARCELONA': [2.1734, 41.3851],

  // Japan
  'JP_TOKYO': [139.6503, 35.6762],
  'JP_OSAKA': [135.5023, 34.6937],
};

// Helper function to generate unique IDs
const generateUniqueId = (prefix: string, index: number) => `${prefix}_${index}`;

// Sample food data with coordinates
export const generateFoodData = (): FoodItem[] => [
  // US Foods
  {
    id: generateUniqueId('us_chicken', 1),
    name: "Chicken Breast",
    category: "Meats",
    protein: 31,
    cost: 3.99,
    location: "US",
    coordinates: FOOD_LOCATIONS.US_MIDWEST,
    availability: {
      inSeason: true,
      locallySourced: true,
      estimatedDelivery: "1-2 days",
      sustainabilityScore: 0.7
    },
    sustainabilityScore: 0.7
  },
  
  // Spanish Foods
  {
    id: generateUniqueId('es_jamon', 1),
    name: "Jamón Ibérico",
    category: "Meats",
    protein: 43,
    cost: 15.00,
    location: "ES",
    coordinates: FOOD_LOCATIONS.ES_MADRID,
    availability: {
      inSeason: true,
      locallySourced: true,
      estimatedDelivery: "1-2 days",
      sustainabilityScore: 0.8
    },
    sustainabilityScore: 0.8
  },
  {
    id: generateUniqueId('es_merluza', 1),
    name: "Merluza",
    category: "Seafoods",
    protein: 24,
    cost: 8.50,
    location: "ES",
    coordinates: FOOD_LOCATIONS.ES_BARCELONA,
    availability: {
      inSeason: true,
      locallySourced: true,
      estimatedDelivery: "1 day",
      sustainabilityScore: 0.9
    },
    sustainabilityScore: 0.9
  },

  // UK Foods
  {
    id: generateUniqueId('uk_salmon', 1),
    name: "Scottish Salmon",
    category: "Seafoods",
    protein: 25,
    cost: 7.99,
    location: "UK",
    coordinates: [-3.1883, 55.9533], // Edinburgh
    availability: {
      inSeason: true,
      locallySourced: true,
      estimatedDelivery: "1-2 days",
      sustainabilityScore: 0.85
    },
    sustainabilityScore: 0.85
  },

  // Japanese Foods
  {
    id: generateUniqueId('jp_tofu', 1),
    name: "Tofu",
    category: "Legumes",
    protein: 8,
    cost: 2.50,
    location: "JP",
    coordinates: FOOD_LOCATIONS.JP_TOKYO,
    availability: {
      inSeason: true,
      locallySourced: true,
      estimatedDelivery: "1 day",
      sustainabilityScore: 0.95
    },
    sustainabilityScore: 0.95
  },

  // Add more regional foods
  {
    id: generateUniqueId('jp_natto', 1),
    name: "Natto",
    category: "Legumes",
    protein: 19,
    cost: 3.00,
    location: "JP",
    coordinates: FOOD_LOCATIONS.JP_OSAKA,
    availability: {
      inSeason: true,
      locallySourced: true,
      estimatedDelivery: "1 day",
      sustainabilityScore: 0.95
    },
    sustainabilityScore: 0.95
  },
  // Add more foods as needed...
];