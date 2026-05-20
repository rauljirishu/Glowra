import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Droplet,
  Car,
  Laptop,
  Home,
  Scissors,
  Package,
  Truck,
  Camera,
  ArrowLeft,
  Search,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
  workerCount: number;
  rating: number;
}

export const serviceCategories: ServiceCategory[] = [
  { id: 'plumbing', name: 'Plumbing', icon: <Droplet />, gradient: 'from-blue-400 to-cyan-500', workerCount: 1245, rating: 4.8 },
  { id: 'electrical', name: 'Electrical', icon: <Zap />, gradient: 'from-yellow-400 to-orange-500', workerCount: 987, rating: 4.9 },
  { id: 'carpentry', name: 'Carpentry', icon: <Hammer />, gradient: 'from-amber-600 to-orange-700', workerCount: 756, rating: 4.7 },
  { id: 'painting', name: 'Painting', icon: <Paintbrush />, gradient: 'from-purple-400 to-pink-500', workerCount: 654, rating: 4.6 },
  { id: 'cleaning', name: 'Cleaning', icon: <Home />, gradient: 'from-green-400 to-emerald-500', workerCount: 2134, rating: 4.9 },
  { id: 'mechanic', name: 'Mechanic', icon: <Car />, gradient: 'from-red-400 to-rose-500', workerCount: 876, rating: 4.7 },
  { id: 'appliance', name: 'Appliance Repair', icon: <Wrench />, gradient: 'from-indigo-400 to-purple-500', workerCount: 543, rating: 4.5 },
  { id: 'computer', name: 'Computer Repair', icon: <Laptop />, gradient: 'from-cyan-400 to-blue-500', workerCount: 432, rating: 4.8 },
  { id: 'salon', name: 'Salon & Beauty', icon: <Scissors />, gradient: 'from-pink-400 to-rose-500', workerCount: 765, rating: 4.9 },
  { id: 'delivery', name: 'Delivery', icon: <Truck />, gradient: 'from-orange-400 to-amber-500', workerCount: 1876, rating: 4.6 },
  { id: 'packaging', name: 'Packing & Moving', icon: <Package />, gradient: 'from-teal-400 to-cyan-500', workerCount: 456, rating: 4.7 },
  { id: 'photography', name: 'Photography', icon: <Camera />, gradient: 'from-slate-500 to-gray-600', workerCount: 234, rating: 4.8 },
];

interface ServiceCategoriesProps {
  onSelectCategory: (categoryId: string) => void;
  onBack: () => void;
}

export function ServiceCategories({ onSelectCategory, onBack }: ServiceCategoriesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  const filteredCategories = serviceCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Floating Header with 3D effect */}
      <div className="sticky top-0 z-50 p-6">
        <motion.div
          className="max-w-7xl mx-auto glass-strong rounded-3xl p-6 card-3d shadow-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div style={{ transform: 'translateZ(20px)' }}>
            <div className="flex items-center gap-6 mb-4">
              <motion.button
                onClick={onBack}
                className="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center hover:bg-white/80 transition-all icon-3d"
                whileHover={{ scale: 1.1, rotateZ: -10 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-6 h-6 text-slate-700" />
              </motion.button>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Select a Service</h2>
                <p className="text-slate-600">Choose the category you need help with</p>
              </div>
            </div>

            {/* Search Bar with 3D effect */}
            <div className="relative">
              <motion.div
                className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center icon-3d"
                whileHover={{ scale: 1.2, rotateZ: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Search className="w-4 h-4 text-white" />
              </motion.div>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-4 py-4 rounded-2xl glass-strong border-0 focus:ring-2 focus:ring-cyan-500/50 text-slate-900 placeholder-slate-400 text-lg"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Categories Grid - Flashcards */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{
                scale: 1.05,
                y: -12,
                rotateY: 10,
                rotateX: -10,
              }}
              onClick={() => onSelectCategory(category.id)}
              onMouseEnter={() => setFlippedCard(category.id)}
              onMouseLeave={() => setFlippedCard(null)}
              className={`glass-strong rounded-3xl p-8 cursor-pointer relative overflow-hidden card-3d flashcard ${
                index % 4 === 0 ? 'floating' : index % 4 === 1 ? 'floating float-delay-1' : index % 4 === 2 ? 'floating float-delay-2' : 'floating float-delay-3'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Gradient Overlay on Hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 transition-opacity duration-300`}
                animate={{ opacity: flippedCard === category.id ? 0.15 : 0 }}
              />

              <div className="relative z-10 flex flex-col items-center text-center space-y-4" style={{ transform: 'translateZ(40px)' }}>
                {/* 3D Holographic Icon */}
                <div className="relative">
                  <motion.div
                    className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${category.gradient} flex items-center justify-center icon-3d`}
                    whileHover={{ rotateY: 20, rotateX: -20, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="text-white scale-125" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                      {category.icon}
                    </div>
                  </motion.div>
                  {/* Glow effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${category.gradient} blur-2xl opacity-40 -z-10`} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">{category.name}</h3>

                  {/* Rating Badge */}
                  <motion.div
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full glass mb-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-slate-900">{category.rating}</span>
                  </motion.div>

                  <p className="text-sm text-slate-500 font-medium">{category.workerCount.toLocaleString()} workers</p>
                </div>

                {/* Hover state - Show additional info */}
                <motion.div
                  className="absolute bottom-4 left-4 right-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: flippedCard === category.id ? 1 : 0, y: flippedCard === category.id ? 0 : 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="glass-strong rounded-xl px-3 py-2 text-xs text-slate-700 font-medium">
                    Click to view →
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="glass-strong rounded-3xl p-12 max-w-md mx-auto">
              <motion.div
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center mx-auto mb-4 icon-3d"
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Search className="w-10 h-10 text-white" />
              </motion.div>
              <p className="text-slate-500 text-lg">No services found matching "{searchTerm}"</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
