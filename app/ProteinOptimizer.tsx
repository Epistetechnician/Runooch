import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { FoodItem } from '@/lib/protien-optimizer';
import { UserPreferences, DietaryPreference } from '@/lib/types';
import { formatCurrency, formatWeight } from '@/lib/utils/localization';
import ProteinScatterPlot from '@/components/ui/protein-scatter-plot';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { supabase } from '@/lib/supabase';

// Add these type definitions at the top of the file
type CategoryData = {
  color: string;
  data: Array<{
    name: string;
    x: number;
    y: number;
    z: number;
  }>;
};

type Categories = {
  [K in FoodItem['category']]: CategoryData;
};

// Add this near the top with other UI elements
const LOCATIONS = {
  'US': 'United States',
  'UK': 'United Kingdom',
  'CA': 'Canada',
  'AU': 'Australia',
  'IN': 'India',
  'JP': 'Japan',
  'ES': 'Spain',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy'
};

// Add this near the top with other imports and constants
const COUNTRY_COORDINATES: Record<string, { center: [number, number]; zoom: number }> = {
  'US': { center: [-95.7129, 37.0902], zoom: 3 },
  'UK': { center: [-3.4359, 55.3781], zoom: 4 },
  'CA': { center: [-106.3468, 56.1304], zoom: 3 },
  'AU': { center: [133.7751, -25.2744], zoom: 3 },
  'IN': { center: [78.9629, 20.5937], zoom: 4 },
  'JP': { center: [138.2529, 36.2048], zoom: 4 },
  'ES': { center: [-3.7492, 40.4637], zoom: 5 },
  'DE': { center: [10.4515, 51.1657], zoom: 5 },
  'FR': { center: [2.2137, 46.2276], zoom: 5 },
  'IT': { center: [12.5674, 41.8719], zoom: 5 }
};

// Add this debug utility function near the top
const debugScatterData = (data: any) => {
  console.log('Scatter data validation:');
  console.log('Number of categories:', data.length);
  data.forEach((category: any) => {
    console.log(`Category ${category.name}:`, {
      dataPoints: category.data.length,
      samplePoint: category.data[0],
      fill: category.fill
    });
  });
};

// Add this color mapping near the top of the file
const CATEGORY_COLORS = {
  'Meats': '#ef4444',
  'Legumes': '#22c55e',
  'Eggs': '#facc15',
  'Milks': '#f5f5f5',
  'Seeds': '#a855f7',
  'Seafoods': '#3b82f6',
  'Nuts': '#fb923c',
  'Vegetables': '#4ade80',
  'Grains': '#92400e'
};

// Add at the top with other constants
const DIETARY_RESTRICTIONS: DietaryPreference[] = [
  'vegetarian',
  'vegan',
  'pescatarian',
  'gluten-free',
  'dairy-free'
];

interface ProteinOptimizerProps {
  foods: FoodItem[];
  userPreferences: UserPreferences;
  onUpdatePreferences: (preferences: UserPreferences) => void;
}

const ProteinOptimizer: React.FC<ProteinOptimizerProps> = ({
  foods,
  userPreferences,
  onUpdatePreferences
}) => {
  // Add debug logging
  useEffect(() => {
    console.log('ProteinOptimizer foods:', foods);
  }, [foods]);

  const [optimizedFoods, setOptimizedFoods] = useState<FoodItem[]>([]);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    optimizeProtein();
  }, [foods, userPreferences]);

  const optimizeProtein = () => {
    // Filter foods based on dietary restrictions
    let availableFoods = foods.filter(food => {
      if (userPreferences.dietaryRestrictions.length === 0) return true;
      // Check if food has restrictions and if any of them match user's restrictions
      return !food.restrictions || !userPreferences.dietaryRestrictions.some(
        restriction => food.restrictions?.includes(restriction)
      );
    });

    // Sort by protein per dollar ratio
    availableFoods.sort((a, b) => (b.protein / b.cost) - (a.protein / a.cost));

    let remainingBudget = userPreferences.budget;
    let currentProtein = 0;
    const selected: FoodItem[] = [];

    // Greedy algorithm to maximize protein within budget
    for (const food of availableFoods) {
      if (remainingBudget >= food.cost) {
        selected.push(food);
        remainingBudget -= food.cost;
        currentProtein += food.protein;

        if (currentProtein >= userPreferences.proteinGoal) break;
      }
    }

    setOptimizedFoods(selected);
    setTotalProtein(currentProtein);
    setTotalCost(userPreferences.budget - remainingBudget);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        {/* Sliders and Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Protein Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/80">Protein Goal</label>
              <span className="text-sm font-medium text-emerald-400">
                {formatWeight(userPreferences.proteinGoal, userPreferences.location)}
              </span>
            </div>
            <div className="relative w-full">
              <Slider
                value={[userPreferences.proteinGoal]}
                min={50}
                max={250}
                step={5}
                onValueChange={([value]) => 
                  onUpdatePreferences({
                    ...userPreferences,
                    proteinGoal: value
                  })
                }
                className="z-10"
              />
            </div>
          </div>

          {/* Daily Budget */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/80">Daily Budget</label>
              <span className="text-sm font-medium text-emerald-400">
                {formatCurrency(userPreferences.budget, userPreferences.location)}
              </span>
            </div>
            <div className="relative w-full">
              <Slider
                value={[userPreferences.budget]}
                min={10}
                max={100}
                step={5}
                onValueChange={([value]) =>
                  onUpdatePreferences({
                    ...userPreferences,
                    budget: value
                  })
                }
                className="z-10"
              />
            </div>
          </div>
        </div>

        {/* Update the Dietary Restrictions section */}
        <div className="space-y-2">
          <label className="text-sm text-white/80">Dietary Restrictions</label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_RESTRICTIONS.map((restriction) => (
              <Badge
                key={restriction}
                variant={userPreferences.dietaryRestrictions.includes(restriction) ? 'default' : 'outline'}
                className="cursor-pointer text-xs sm:text-sm"
                onClick={() => {
                  const newRestrictions = userPreferences.dietaryRestrictions.includes(restriction)
                    ? userPreferences.dietaryRestrictions.filter(r => r !== restriction)
                    : [...userPreferences.dietaryRestrictions, restriction];
                  onUpdatePreferences({
                    ...userPreferences,
                    dietaryRestrictions: newRestrictions
                  });
                }}
              >
                {restriction}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Scatter Plot */}
      <div className="mt-6 bg-black/20 rounded-xl min-h-[300px] flex-1">
        {foods && foods.length > 0 && (
          <div className="w-full h-full min-h-[300px]">
            <ProteinScatterPlot 
              foods={foods}
              userPreferences={userPreferences}
              streamingInterval={3000}
            />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-xs sm:text-sm text-white/60">Total Protein</div>
          <div className="text-xl sm:text-2xl font-bold text-white">
            {formatWeight(totalProtein, userPreferences.location)}
          </div>
          <div className="text-xs sm:text-sm text-white/60">
            {((totalProtein / userPreferences.proteinGoal) * 100).toFixed(0)}% of goal
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-xs sm:text-sm text-white/60">Total Cost</div>
          <div className="text-xl sm:text-2xl font-bold text-white">
            {formatCurrency(totalCost, userPreferences.location)}
          </div>
          <div className="text-xs sm:text-sm text-white/60">
            {((totalCost / userPreferences.budget) * 100).toFixed(0)}% of budget
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProteinOptimizer;
