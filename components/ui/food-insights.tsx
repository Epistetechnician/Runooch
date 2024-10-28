import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Scale,
  DollarSign,
  Store,
  Leaf,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { FoodItem } from '../../lib/protien-optimizer';
import { formatCurrency, formatWeight } from '@/lib/utils/localization';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Location } from '@/lib/types';

interface FoodInsightsProps {
  foods: FoodItem[];
  location: string;
}

interface InsightCardItem {
  id: string; // Change from number to string
  label: string;
  value: string;
  subValue: string;
}

interface ExpandedCardData {
  title: string;
  items: InsightCardItem[];
  color: string;
  icon: any;
}

const InsightCard = ({ 
  icon: Icon, 
  title, 
  items, 
  color,
  delay,
  onExpand
}: { 
  icon: any; 
  title: string; 
  items: InsightCardItem[];  // Update the type here
  color: string;
  delay: number;
  onExpand: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ delay, duration: 0.2 }}
    onClick={onExpand}
    className={cn(
      "min-w-[280px] h-[220px]",
      "relative overflow-hidden rounded-xl",
      "bg-gradient-to-br from-white/10 to-white/5",
      "backdrop-blur-lg border border-white/10",
      "transition-all duration-300",
      "cursor-pointer"
    )}
  >
    <div 
      className="absolute inset-0 opacity-10"
      style={{ 
        background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` 
      }}
    />
    
    <div className="relative p-4 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-white/10`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <h3 className="font-medium text-white text-sm">{title}</h3>
      </div>

      <div className="flex-1 space-y-2.5">
        {items.slice(0, 3).map((item, index) => (
          <motion.div
            key={`${item.id || index}-${index}`}  // Use id if available, fallback to index
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + (index * 0.1) }}
            className="flex items-center justify-between group py-1"
          >
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${color}`}>
                #{index + 1}
              </span>
              <span className="text-white/90 text-sm truncate max-w-[120px]">
                {item.label}
              </span>
            </div>
            <div className="text-right">
              <span className="text-white text-sm font-medium">{item.value}</span>
              {item.subValue && (
                <span className="text-white/60 text-xs block">
                  {item.subValue}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
);

const ExpandedCard = ({
  data,
  onClose
}: {
  data: ExpandedCardData;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      className="relative w-full max-w-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 backdrop-blur-lg"
      onClick={e => e.stopPropagation()}
      layoutId="expanded-card"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg bg-white/10`}>
          <data.icon className={`h-6 w-6 ${data.color}`} />
        </div>
        <h2 className="text-xl font-medium text-white">{data.title}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${data.color}`}>
                #{index + 1}
              </span>
              <TrendingUp className="h-4 w-4 text-white/40" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">{item.label}</h3>
            <div className="flex items-center justify-between">
              <span className="text-white text-xl font-medium">{item.value}</span>
              {item.subValue && (
                <span className="text-white/60 text-sm">{item.subValue}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// Add this new component for the title section
const InsightsHeader = () => (
  <div className="mb-2">
    <h2 className="text-l font-bold text-white flex items-center gap-3">
      <Sparkles className="h-3 w-3 text-amber-400" />
      Food Insights
    </h2>
    <p className="text-sm text-white/60 mt-2">
      Real-time analysis of protein sources in your area
    </p>
  </div>
);

export const FoodInsights: React.FC<FoodInsightsProps> = ({ foods, location }): JSX.Element => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [expandedCard, setExpandedCard] = useState<ExpandedCardData | null>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  const getTopProteinSources = () => foods
    .sort((a, b) => {
      // Adjust protein values based on location
      const proteinA = a.regionalData?.[location as Location]?.protein || a.protein;
      const proteinB = b.regionalData?.[location as Location]?.protein || b.protein;
      return proteinB - proteinA;
    })
    .slice(0, 3)
    .map((food, index) => ({
      id: food.id,
      label: food.name,
      value: formatWeight(food.regionalData?.[location as Location]?.protein || food.protein, location),
      subValue: `${((food.regionalData?.[location as Location]?.protein || food.protein) / 
                 (food.regionalData?.[location as Location]?.cost || food.cost)).toFixed(1)}g/$`
    }));

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if ('touches' in e) {
      setStartX(e.touches[0].pageX - scrollContainerRef.current!.offsetLeft);
    } else {
      setStartX(e.pageX - scrollContainerRef.current!.offsetLeft);
    }
    setScrollLeft(scrollContainerRef.current!.scrollLeft);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = 'touches' in e 
      ? e.touches[0].pageX - scrollContainerRef.current!.offsetLeft
      : e.pageX - scrollContainerRef.current!.offsetLeft;
    
    const walk = (x - startX) * 2;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const targetScroll = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const insights = [
    {
      icon: Scale,
      title: "Top Protein",
      items: getTopProteinSources(),
      color: "text-blue-400",
      onExpand: () => setExpandedCard({
        icon: Scale,
        title: "Top Protein",
        items: getTopProteinSources(),
        color: "text-blue-400"
      })
    },
    {
      icon: Leaf,
      title: "Seasonal Picks",
      items: foods
        .filter(food => food.availability.inSeason)
        .slice(0, 3)
        .map((food, index) => ({
          id: food.id,
          label: food.name,
          value: formatCurrency(food.cost, location),
          subValue: `${(food.sustainabilityScore * 100).toFixed(0)}% eco`
        })),
      color: "text-amber-400",
      onExpand: () => setExpandedCard({
        icon: Leaf,
        title: "Seasonal Picks",
        items: foods
          .filter(food => food.availability.inSeason)
          .slice(0, 3)
          .map((food, index) => ({
            id: food.id,
            label: food.name,
            value: formatCurrency(food.cost, location),
            subValue: `${(food.sustainabilityScore * 100).toFixed(0)}% eco`
          })),
        color: "text-amber-400"
      })
    },
    {
      icon: DollarSign,
      title: "Best Value",
      items: foods
        .filter(food => food.availability.locallySourced) // Changed from countries check
        .sort((a, b) => (b.protein / b.cost) - (a.protein / a.cost))
        .slice(0, 3)
        .map((food, index) => ({
          id: food.id,
          label: food.name,
          value: `${(food.protein / food.cost).toFixed(1)}g/$`,
          subValue: formatCurrency(food.cost, location)
        })),
      color: "text-green-400",
      onExpand: () => setExpandedCard({
        icon: DollarSign,
        title: "Best Value",
        items: foods
          .filter(food => food.availability.locallySourced) // Changed from countries check
          .sort((a, b) => (b.protein / b.cost) - (a.protein / a.cost))
          .slice(0, 3)
          .map((food, index) => ({
            id: food.id,
            label: food.name,
            value: `${(food.protein / food.cost).toFixed(1)}g/$`,
            subValue: formatCurrency(food.cost, location)
          })),
        color: "text-green-400"
      })
    },
    {
      icon: Store,
      title: "Local Options",
      items: foods
        .filter(food => food.availability.locallySourced)
        .slice(0, 3)
        .map((food, index) => ({
          id: food.id,
          label: food.name,
          value: formatCurrency(food.cost, location),
          subValue: food.availability.estimatedDelivery
        })),
      color: "text-purple-400",
      onExpand: () => setExpandedCard({
        icon: Store,
        title: "Local Options",
        items: foods
          .filter(food => food.availability.locallySourced)
          .slice(0, 3)
          .map((food, index) => ({
            id: food.id,
            label: food.name,
            value: formatCurrency(food.cost, location),
            subValue: food.availability.estimatedDelivery
          })),
        color: "text-purple-400"
      })
    }
  ];

  return (
    <div className="space-y-4">
      <InsightsHeader />
      
      <div 
        className="relative group overflow-x-auto sm:overflow-x-hidden"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div
          ref={scrollContainerRef}
          className="flex gap-4 pb-4 px-4 sm:px-0 overflow-x-auto snap-x snap-mandatory"
          onMouseDown={handleDragStart}
          onMouseLeave={handleDragEnd}
          onMouseUp={handleDragEnd}
          onMouseMove={handleDragMove}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          onTouchMove={handleDragMove}
        >
          {insights.map((insight, index) => (
            <div key={insight.title} className="snap-start">
              <InsightCard {...insight} delay={index * 0.1} />
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showScrollButtons && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => scroll('left')}
                  className="rounded-full bg-white/10 backdrop-blur-lg hover:bg-white/20"
                >
                  <ChevronLeft className="h-4 w-4 text-white" />
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => scroll('right')}
                  className="rounded-full bg-white/10 backdrop-blur-lg hover:bg-white/20"
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {expandedCard && (
            <ExpandedCard
              data={expandedCard}
              onClose={() => setExpandedCard(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
