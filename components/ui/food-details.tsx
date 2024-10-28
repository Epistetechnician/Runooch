import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Timer, MapPin, BarChart2 } from 'lucide-react';
import { formatCurrency, formatWeight } from '@/lib/utils/localization';
import { Availability } from '@/lib/types';

interface FoodDetailsProps {
  name: string;
  protein: number;
  cost: number;
  location: string;
  availability: Availability;
  sustainabilityScore: number;
}

export const FoodDetails: React.FC<FoodDetailsProps> = ({
  name,
  protein,
  cost,
  location,
  availability,
  sustainabilityScore
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white/10 rounded-lg space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">{name}</h3>
        <div className="flex items-center gap-2">
          {availability.inSeason && (
            <Leaf className="h-4 w-4 text-green-400" />
          )}
          {availability.locallySourced && (
            <MapPin className="h-4 w-4 text-blue-400" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-white/70">Protein</p>
          <p className="text-white">{formatWeight(protein, location)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-white/70">Cost</p>
          <p className="text-white">{formatCurrency(cost, location)}</p>
        </div>
      </div>

      {availability.estimatedDelivery && (
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Timer className="h-4 w-4" />
          <span>Available: {availability.estimatedDelivery}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-white/70" />
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-400 rounded-full"
            style={{ width: `${sustainabilityScore * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};
