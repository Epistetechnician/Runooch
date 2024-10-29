"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  MapIcon, 
  BarChart2, 
  ShoppingCart, 
  Utensils, 
  Settings2,
  Leaf,
  Globe2,
  Calendar
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import ProteinOptimizer from './ProteinOptimizer';
import { FoodDetails } from '../components/ui/food-details';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { UserPreferences, Location } from '@/lib/types';
import { formatCurrency, formatWeight, convertCurrency } from '../lib/utils/localization';
import { getRegionalRecommendations } from '../lib/utils/regional-preferences';
import { FoodItem } from '../lib/protien-optimizer';
import { FoodInsights } from '../components/ui/food-insights';
import { LocationSelector }  from '../components/ui/location-selector';
import Image from 'next/image';
import { Availability } from '@/lib/protien-optimizer';
import ProteinScatterPlot from '../components/ui/protein-scatter-plot';
import { generateFoodData } from '@/scripts/generate-food-data';

// Add country coordinates for map navigation
const COUNTRY_COORDINATES: Record<string, { center: [number, number]; zoom: number; name: string }> = {
  'US': { center: [-95.7129, 37.0902], zoom: 3, name: 'United States' },
  'UK': { center: [-3.4359, 55.3781], zoom: 4, name: 'United Kingdom' },
  'CA': { center: [-106.3468, 56.1304], zoom: 3, name: 'Canada' },
  'AU': { center: [133.7751, -25.2744], zoom: 3, name: 'Australia' },
  'IN': { center: [78.9629, 20.5937], zoom: 4, name: 'India' },
  'JP': { center: [138.2529, 36.2048], zoom: 4, name: 'Japan' },
  'ES': { center: [-3.7492, 40.4637], zoom: 5, name: 'Spain' },
  'DE': { center: [10.4515, 51.1657], zoom: 5, name: 'Germany' },
  'FR': { center: [2.2137, 46.2276], zoom: 5, name: 'France' },
  'IT': { center: [12.5674, 41.8719], zoom: 5, name: 'Italy' }
};

interface AppProps {
  // Add any props that are required by the component
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXBpc3RldGVjaCIsImEiOiJjbTJkZzE3cjgwZGo4MmxzYjV3bG1nZWNnIn0.6UmLgZTagCdK7iETTy2JeA';
mapboxgl.accessToken = MAPBOX_TOKEN;

const getCurrentSeason = (): string => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

// Add type for markers ref
interface MarkerMap {
  [key: string]: mapboxgl.Marker;
}

const App: React.FC<AppProps> = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    proteinGoal: 150,
    budget: 50,
    dietaryRestrictions: [],
    location: 'US',
    unitSystem: 'metric',
    seasonalPreference: true
  });
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<MarkerMap>({});

  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);

  useEffect(() => {
    fetchFoodData();
  }, []);

  const fetchFoodData = async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*');
      
      if (error) throw error;

      // Transform the raw data into FoodItem format
      const enhancedData: FoodItem[] = data.map(food => ({
        id: food.id,
        name: food.name,
        protein: parseFloat(food.protein),
        cost: parseFloat(food.cost),
        category: food.category,
        location: food.location || 'US',
        coordinates: food.coordinates ? [
          parseFloat(food.coordinates.x || food.coordinates[0]),
          parseFloat(food.coordinates.y || food.coordinates[1])
        ] as [number, number] : undefined,
        availability: {
          inSeason: food.in_season || Math.random() > 0.5,
          locallySourced: food.location === userPreferences.location,
          estimatedDelivery: food.estimated_delivery || '1-2 days',
          sustainabilityScore: food.sustainability_score || Math.random()
        },
        sustainabilityScore: food.sustainability_score || Math.random(),
        restrictions: food.restrictions || []
      }));

      // Combine database data with generated data
      const generatedData = generateFoodData();
      const combinedData = [...enhancedData, ...generatedData];

      setFoods(combinedData);
    } catch (error) {
      console.error('Error fetching food data:', error);
      // Fallback to generated data if there's an error
      const generatedData = generateFoodData();
      setFoods(generatedData);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !userPreferences.location) return;

    const coords = COUNTRY_COORDINATES[userPreferences.location];
    if (!coords) return;

    if (!map.current) {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: coords.center,
        zoom: coords.zoom,
        touchZoomRotate: true,
        dragRotate: true,
        projection: 'globe'
      });

      // Add atmosphere and sky layers
      newMap.on('load', () => {
        newMap.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6
        });
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl());
      
      // Make touch handlers passive
      const canvas = newMap.getCanvas();
      canvas.addEventListener('touchstart', () => {}, { passive: true });
      canvas.addEventListener('touchmove', () => {}, { passive: true });

      map.current = newMap;
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [userPreferences.location]);

  // Add effect to handle location changes
  useEffect(() => {
    if (!map.current || !userPreferences.location) return;

    const coords = COUNTRY_COORDINATES[userPreferences.location];
    if (coords) {
      map.current.flyTo({
        center: coords.center,
        zoom: coords.zoom,
        duration: 2000,
        essential: true
      });
    }
  }, [userPreferences.location]);

  const handleUpdatePreferences = async (preferences: UserPreferences) => {
    if (preferences.location !== userPreferences.location) {
      // Convert all food prices to new currency
      const updatedFoods = await Promise.all(foods.map(async (food) => ({
        ...food,
        cost: await convertCurrency(food.cost, userPreferences.location, preferences.location)
      })));
      setFoods(updatedFoods);
    }
    
    setUserPreferences(preferences);
    
    // Handle map navigation when location changes
    if (map.current && preferences.location !== userPreferences.location) {
      const coords = COUNTRY_COORDINATES[preferences.location];
      if (coords) {
        map.current.flyTo({
          center: coords.center,
          zoom: coords.zoom,
          duration: 3000,
          essential: true,
          curve: 1.42,
          speed: 0.6,
          bearing: 0,
          pitch: 45
        });

        // Clear existing markers
        Object.values(markers.current).forEach(marker => marker.remove());
        markers.current = {};

        // Add new markers for the selected location
        foods
          .filter(food => !food.location || food.location === preferences.location)
          .forEach(food => {
            if (food.coordinates) {
              const el = document.createElement('div');
              el.className = 'custom-marker';
              el.style.backgroundColor = food.availability?.inSeason ? '#22c55e' : '#ef4444';
              el.style.width = '12px';
              el.style.height = '12px';
              el.style.borderRadius = '50%';
              el.style.border = '2px solid white';

              const marker = new mapboxgl.Marker(el)
                .setLngLat(food.coordinates)
                .setPopup(
                  new mapboxgl.Popup({ offset: 25 }).setHTML(`
                    <div class="bg-white/10 backdrop-blur-md p-3 rounded-lg">
                      <h3 class="font-medium text-white">${food.name}</h3>
                      <p class="text-sm text-white/70">Protein: ${food.protein}g</p>
                      <p class="text-sm text-white/70">Cost: $${food.cost}</p>
                      ${food.availability?.inSeason ? 
                        '<span class="text-green-500 text-xs">In Season</span>' : 
                        '<span class="text-red-500 text-xs">Out of Season</span>'
                      }
                    </div>
                  `)
                );

              if (map.current) {
                marker.addTo(map.current);
              }
              
              // Add proper type safety for the markers map
              markers.current[food.id] = marker;
            }
          });
      }
    }
  };

  const handleFoodFiltered = (foods: FoodItem[]) => {
    setFilteredFoods(foods);
    
    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add new markers for filtered foods
    foods.forEach(food => {
      if (food.coordinates) {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.backgroundColor = food.availability?.inSeason ? '#22c55e' : '#ef4444';
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';

        const marker = new mapboxgl.Marker(el)
          .setLngLat(food.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="bg-black/90 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                <h3 class="font-medium text-white">${food.name}</h3>
                <p class="text-sm text-white/70">Protein: ${food.protein}g</p>
                <p class="text-sm text-white/70">Cost: ${formatCurrency(food.cost, userPreferences.location)}</p>
                ${food.availability?.inSeason ? 
                  '<span class="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">In Season</span>' : 
                  '<span class="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Out of Season</span>'
                }
                ${food.location === userPreferences.location ?
                  '<span class="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full ml-1">Local</span>' :
                  ''
                }
              </div>
            `)
          );

        if (map.current) {
          marker.addTo(map.current);
        }
        
        markers.current[food.id] = marker;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-2 text-white/80 order-2 sm:order-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm capitalize">{getCurrentSeason()}</span>
          </div>

          <div className="flex-1 flex flex-col items-center -mt-6 sm:-mt-12 order-1 sm:order-2">
            <motion.div className="flex flex-col items-center">
              <Image
                src="https://raw.githubusercontent.com/Epistetechnician/Runooch/main/images/ReNutri_Logo.png"
                alt="ReNutri Logo"
                width={400}
                height={120}
                className="object-contain block sm:w-[300px] sm:h-[90px]"
                priority
              />
        
            </motion.div>
          </div>

          <div className="order-3">
            <LocationSelector
              value={userPreferences.location}
              onValueChange={(newLocation) => {
                handleUpdatePreferences({
                  ...userPreferences,
                  location: newLocation
                });
              }}
            />
          </div>
        </div>

        <Tabs defaultValue="optimizer" className="space-y-4 sm:space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 bg-white/10 p-1 rounded-lg">
            {[
              { value: 'optimizer', icon: <BarChart2 className="h-4 w-4" />, label: 'Optimizer' },
              { value: 'locations', icon: <MapIcon className="h-4 w-4" />, label: 'Local' }
             // { value: 'meal-plan', icon: <Utensils className="h-4 w-4" />, label: 'Meals' },
             // { value: 'shopping', icon: <ShoppingCart className="h-4 w-4" />, label: 'Shop' }
            ].map(({ value, icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 text-xs sm:text-sm"
              >
                {icon}
                <span className="ml-1 sm:ml-2">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="optimizer" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-none text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    Optimization Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProteinOptimizer 
                    foods={foods} 
                    userPreferences={userPreferences}
                    onUpdatePreferences={handleUpdatePreferences}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-none text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe2 className="h-5 w-5" />
                    Local Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={mapContainer} 
                    className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg mb-12"
                  />
                  <FoodInsights 
                    foods={foods} 
                    location={userPreferences.location} 
                  />
                </CardContent>
              </Card>
            </div>

            {/* Seasonal Recommendations */}
            <Card className="bg-white/10 border-none text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Seasonal Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {foods
                      .filter(food => food.availability.inSeason)
                      .map(food => (
                        <FoodDetails
                          key={food.id}
                          name={food.name}
                          protein={food.protein}
                          cost={food.cost}
                          location={userPreferences.location}
                          availability={food.availability}
                          sustainabilityScore={food.sustainabilityScore}
                        />
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add other TabsContent components for meal planning, shopping, etc. */}
        </Tabs>
      </div>
    </div>
  );
};

export default App;
