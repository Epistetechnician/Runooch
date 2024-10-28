import { motion } from 'framer-motion';

export const EnhancedTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/80 backdrop-blur-md p-3 rounded-lg shadow-xl border border-white/10"
      >
        <h3 className="font-medium text-white text-sm mb-2">{data.name}</h3>
        <div className="space-y-1 text-xs">
          <p className="text-white/70">
            Protein: <span className="text-white">{data.protein}g</span>
          </p>
          <p className="text-white/70">
            Cost: <span className="text-white">${data.cost.toFixed(2)}</span>
          </p>
          <p className="text-white/70">
            Efficiency: <span className="text-white">{data.efficiency}g/$</span>
          </p>
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-white/50">Sustainability</span>
              <div className="flex-1 h-1 bg-white/10 rounded-full">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${data.sustainabilityScore * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};
