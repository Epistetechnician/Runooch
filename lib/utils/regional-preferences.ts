export interface RegionalPreferences {
  commonProteins: string[];
  dietaryTrends: string[];
  mealPatterns: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
  seasonalAvailability: Record<string, string[]>;
}

export const regionalPreferences: Record<string, RegionalPreferences> = {
  'US': {
    commonProteins: ['Chicken Breast', 'Ground Beef', 'Whey Protein'],
    dietaryTrends: ['Keto', 'Paleo', 'Plant-based'],
    mealPatterns: {
      breakfast: ['Eggs', 'Oatmeal', 'Protein Shake'],
      lunch: ['Sandwich', 'Salad', 'Bowl'],
      dinner: ['Grilled Protein', 'Vegetables', 'Grain']
    },
    seasonalAvailability: {
      spring: ['Asparagus', 'Peas'],
      summer: ['Berries', 'Tomatoes'],
      fall: ['Pumpkin', 'Sweet Potato'],
      winter: ['Citrus', 'Root Vegetables']
    }
  },
  // Add more regions...
};

export const getRegionalRecommendations = (
  location: string,
  season: string,
  dietaryRestrictions: string[]
): string[] => {
  const prefs = regionalPreferences[location] || regionalPreferences['US'];
  const seasonal = prefs.seasonalAvailability[season] || [];
  
  return prefs.commonProteins
    .filter(protein => {
      if (dietaryRestrictions.includes('vegan')) {
        return !['Chicken', 'Beef', 'Fish', 'Eggs', 'Whey'].some(
          meat => protein.includes(meat)
        );
      }
      return true;
    })
    .concat(seasonal);
};
