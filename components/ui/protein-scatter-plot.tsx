import React, { useEffect } from 'react';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { FoodItem, UserPreferences, DietaryInfo, DietaryPreference, Location, Availability } from '@/lib/types';

const CATEGORY_COLORS: Record<FoodItem['category'], string> = {
  'Meats': '#ef4444',      // Brighter red
  'Legumes': '#10b981',    // Brighter green
  'Eggs': '#fbbf24',       // Brighter yellow
  'Milks': '#f9fafb',      // Brighter white
  'Seeds': '#a855f7',      // Brighter purple
  'Seafoods': '#3b82f6',   // Brighter blue
  'Nuts': '#f97316',       // Brighter orange
  'Vegetables': '#34d399', // Brighter emerald
  'Grains': '#e5e5e5'      // Brighter gray
};

interface ProteinScatterPlotProps {
  foods: FoodItem[];
  userPreferences: UserPreferences;
  streamingInterval?: number;
  onFoodFiltered?: (filteredFoods: FoodItem[]) => void;
}

const ProteinScatterPlot: React.FC<ProteinScatterPlotProps> = ({
  foods,
  userPreferences,
  onFoodFiltered,
}) => {
  useEffect(() => {
    const filteredFoods = foods.filter(food => {
      const regionalData = food.regionalData?.[userPreferences.location];
      const isRegionallyAvailable = regionalData?.availability !== false;
      const isLocalFood = food.location === userPreferences.location;
      const isGlobalFood = !food.location;
      const isImportedFood = food.location && food.location !== userPreferences.location;

      // Check availability
      if (!isRegionallyAvailable && !isLocalFood && !isGlobalFood && 
          (isImportedFood && !regionalData?.availability)) {
        return false;
      }

      // Check dietary restrictions
      const meetsRestrictions = userPreferences.dietaryRestrictions.length === 0 || 
        userPreferences.dietaryRestrictions.every((restriction: DietaryPreference) => {
          if (restriction === 'none') return true;
          
          switch (restriction) {
            case 'vegetarian':
              return !['Meats', 'Seafoods'].includes(food.category);
            case 'vegan':
              return !['Meats', 'Seafoods', 'Eggs', 'Milks'].includes(food.category);
            case 'pescatarian':
              return food.category === 'Seafoods' || !['Meats'].includes(food.category);
            case 'gluten-free':
              return !['Grains'].includes(food.category) || (food.dietaryInfo?.['gluten-free'] === true);
            case 'dairy-free':
              return food.category !== 'Milks' || (food.dietaryInfo?.['dairy-free'] === true);
            default: {
              const dietaryKey = restriction as keyof DietaryInfo;
              return food.dietaryInfo?.[dietaryKey] ?? true;
            }
          }
        });

      return meetsRestrictions;
    });

    // Notify parent component of filtered foods
    onFoodFiltered?.(filteredFoods);
  }, [foods, userPreferences, onFoodFiltered]);

  const processedData = foods.reduce((acc, food) => {
    // Check regional availability and local food rules
    const regionalData = food.regionalData?.[userPreferences.location];
    const isRegionallyAvailable = regionalData?.availability !== false;
    const isLocalFood = food.location === userPreferences.location;
    const isGlobalFood = !food.location; // Foods available everywhere
    const isImportedFood = food.location && food.location !== userPreferences.location;

    // Skip if food is not available in this region
    // A food should be shown if:
    // 1. It's regionally available (from regionalData)
    // 2. It's a local food for this region
    // 3. It's a global food (no specific location)
    // 4. It's an imported food that's available in this region
    if (!isRegionallyAvailable && !isLocalFood && !isGlobalFood && 
        (isImportedFood && !regionalData?.availability)) {
      return acc;
    }

    // Check dietary restrictions with proper typing
    const meetsRestrictions = userPreferences.dietaryRestrictions.length === 0 || 
      userPreferences.dietaryRestrictions.every((restriction) => {
        if (restriction === 'none') return true;
        
        switch (restriction) {
          case 'vegetarian':
            return !['Meats', 'Seafoods'].includes(food.category);
          case 'vegan':
            return !['Meats', 'Seafoods', 'Eggs', 'Milks'].includes(food.category);
          case 'pescatarian':
            return food.category === 'Seafoods' || !['Meats'].includes(food.category);
          case 'gluten-free':
            return !['Grains'].includes(food.category) || (food.dietaryInfo?.['gluten-free'] === true);
          case 'dairy-free':
            return food.category !== 'Milks' || (food.dietaryInfo?.['dairy-free'] === true);
          default: {
            // Handle the dietary info check without string manipulation
            const dietaryKey = restriction as keyof DietaryInfo;
            return food.dietaryInfo?.[dietaryKey] ?? true;
          }
        }
      });

    if (!meetsRestrictions) {
      return acc;
    }

    const category = food.category as FoodItem['category'];
    if (!acc[category]) {
      acc[category] = [];
    }

    // Use regional data if available, otherwise use base values
    const protein = regionalData?.protein || food.protein;
    const cost = regionalData?.cost || food.cost;
    
    // Adjust cost based on region if needed (you might want to add regional cost multipliers)
    const adjustedCost = cost * getRegionalCostMultiplier(userPreferences.location);
    
    // Only add foods that have valid protein and cost data
    if (protein && adjustedCost && protein > 0 && adjustedCost > 0) {
      acc[category].push({
        x: protein,
        y: Number((adjustedCost / protein).toFixed(2)),
        name: food.name,
        efficiency: Number((protein / adjustedCost).toFixed(2)),
        category: food.category,
        dietaryInfo: Object.entries(food.dietaryInfo || {})
          .filter(([_, value]) => value === true)
          .map(([key]) => key),
        region: userPreferences.location,
        cost: adjustedCost,
        isRegionalPrice: !!regionalData,
        isLocalFood,
        isGlobalFood,
        isImportedFood,
        availability: food.availability,
        originalLocation: food.location
      });
    }
    return acc;
  }, {} as Record<string, any[]>);

  // Helper function to get cost multiplier based on region
  function getRegionalCostMultiplier(location: Location): number {
    const multipliers: Record<Location, number> = {
      'US': 1.0,
      'UK': 0.8,  // GBP to USD
      'CA': 0.75, // CAD to USD
      'AU': 0.7,  // AUD to USD
      'JP': 0.009, // JPY to USD
      'ES': 1.1,  // EUR to USD
      'DE': 1.1,  // EUR to USD
      'FR': 1.1,  // EUR to USD
      'IT': 1.1,  // EUR to USD
      'IN': 0.012  // INR to USD
    };
    return multipliers[location] || 1;
  }

  // Filter out empty categories and sort data points
  const chartData = Object.entries(processedData)
    .filter(([_, data]) => data.length > 0)
    .map(([id, data]) => ({
      id,
      data: data.sort((a, b) => b.efficiency - a.efficiency), // Sort by efficiency
    }));

  return (
    <div className="w-full h-[500px]">
      <ResponsiveScatterPlot
        data={chartData}
        margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
        xScale={{ type: 'linear', min: 0, max: 'auto' }}
        yScale={{ type: 'linear', min: 0, max: 'auto' }}
        blendMode="normal"
        colors={({ serieId }) => CATEGORY_COLORS[serieId as keyof typeof CATEGORY_COLORS] || '#000000'}
        nodeSize={14}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Protein Content (g/100g)',
          legendPosition: 'middle',
          legendOffset: 46,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Cost per Gram ($)',
          legendPosition: 'middle',
          legendOffset: -60,
        }}
        theme={{
          background: 'transparent',
          text: {
            fontSize: 12,
            fill: 'rgba(255,255,255,0.8)',
          },
          axis: {
            domain: {
              line: {
                stroke: 'rgba(255,255,255,0.2)',
                strokeWidth: 1
              }
            },
            ticks: {
              line: {
                stroke: 'rgba(255,255,255,0.2)',
                strokeWidth: 1
              },
              text: {
                fill: 'rgba(255,255,255,0.8)'
              }
            }
          },
          grid: {
            line: {
              stroke: 'rgba(255,255,255,0.1)',
              strokeWidth: 1
            }
          },
          legends: {
            text: {
              fill: 'rgba(255,255,255,0.8)'
            }
          }
        }}
        legends={[
          {
            anchor: 'right',
            direction: 'column',
            justify: false,
            translateX: 130,
            translateY: 0,
            itemWidth: 100,
            itemHeight: 12,
            itemsSpacing: 5,
            itemDirection: 'left-to-right',
            symbolSize: 12,
            symbolShape: 'circle'
          }
        ]}
        tooltip={({ node }) => {
          if (!node || !node.data) return null;
          
          const data = node.data as {
            name: string;
            x: number;
            cost: number;
            efficiency: number;
            region: string;
            isRegionalPrice: boolean;
            isLocalFood: boolean;
            isGlobalFood: boolean;
            isImportedFood: boolean;
            availability: Availability;
            originalLocation?: Location;
            dietaryInfo: string[];
          };

          return (
            <div className="bg-black/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/20">
              <p className="text-white font-medium mb-1">{data.name}</p>
              <div className="space-y-1 text-sm">
                <p className="text-white/90">Protein: {data.x}g</p>
                <p className="text-white/90">
                  Cost: ${data.cost.toFixed(2)}
                  {data.isRegionalPrice && 
                    <span className="text-xs ml-1 text-blue-400">(Regional price)</span>
                  }
                </p>
                <p className="text-emerald-400 font-medium">
                  Efficiency: {data.efficiency}g/$
                </p>
                <p className="text-white/90">
                  {data.isLocalFood && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full mr-1">
                      Local
                    </span>
                  )}
                  {data.isImportedFood && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full mr-1">
                      Imported
                    </span>
                  )}
                  {data.isGlobalFood && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                      Global
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.availability.inSeason && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      In Season
                    </span>
                  )}
                  {data.availability.locallySourced && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                      Locally Sourced
                    </span>
                  )}
                  {data.isGlobalFood && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                      Global Food
                    </span>
                  )}
                </div>
                {data.dietaryInfo.length > 0 && (
                  <div className="text-xs text-white/70 mt-1 flex flex-wrap gap-1">
                    {data.dietaryInfo.map((diet: string) => (
                      <span 
                        key={diet}
                        className="bg-white/10 px-2 py-0.5 rounded-full"
                      >
                        {diet}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default ProteinScatterPlot;
