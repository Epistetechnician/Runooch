export type Location = 'US' | 'CA' | 'UK' | 'AU' | 'IN' | 'JP' | 'DE' | 'FR' | 'IT' | 'ES';

export type DietaryPreference = 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'gluten-free' | 'dairy-free';

export interface UserPreferences {
  proteinGoal: number;
  budget: number;
  dietaryRestrictions: DietaryPreference[];
  location: Location;
  unitSystem: 'metric' | 'imperial';
  seasonalPreference: boolean;
}

export interface DietaryInfo {
  none: boolean;
  vegetarian: boolean;
  vegan: boolean;
  pescatarian: boolean;
  'gluten-free': boolean;
  'dairy-free': boolean;
}

export interface RegionalData {
  protein: number;
  cost: number;
  availability: boolean;
}

export interface Availability {
  inSeason: boolean;
  locallySourced: boolean;
  estimatedDelivery: string;
  sustainabilityScore: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  protein: number;
  cost: number;
  dietaryInfo?: DietaryInfo;
  regionalData?: Record<Location, RegionalData>;
  restrictions?: DietaryPreference[];
  location?: Location;
  coordinates?: [number, number];
  availability: Availability;
  sustainabilityScore: number;
}
