import { DietaryInfo, Location, RegionalData, UserPreferences, FoodItem } from './types';

export type { FoodItem };

export interface ProteinOptimizerProps {
    foods: FoodItem[];
    userPreferences: UserPreferences;
    onUpdatePreferences: (preferences: UserPreferences) => void;
}

// Re-export the Availability interface if needed elsewhere
export type { Availability } from './types';
