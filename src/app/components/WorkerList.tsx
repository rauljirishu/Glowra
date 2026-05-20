import { useState } from 'react';
import {
  Search,
  MapPin,
  Star,
  Phone,
  CheckCircle,
  ArrowLeft,
  SlidersHorizontal,
  Calendar,
  X,
  MessageCircle,
  Award,
  Briefcase,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { serviceCategories } from './ServiceCategories';

export interface Worker {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  location: string;
  experience: number;
  verified: boolean;
  skills: string[];
  image: string;
  description: string;
  phone: string;
  availability: string;
}

const mockWorkers: Worker[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    category: 'plumbing',
    rating: 4.8,
    reviews: 156,
    hourlyRate: 350,
    location: 'Mumbai, Maharashtra',
    experience: 8,
    verified: true,
    skills: ['Pipe Repair', 'Bathroom Fitting', 'Water Heater'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    description: 'Expert plumber with 8 years of experience. Specialized in residential and commercial plumbing.',
    phone: '+91 98765 43210',
    availability: 'Available today',
  },
  {
    id: '2',
    name: 'Amit Sharma',
    category: 'electrical',
    rating: 4.9,
    reviews: 203,
    hourlyRate: 400,
    location: 'Delhi NCR',
    experience: 12,
    verified: true,
    skills: ['Wiring', 'Panel Installation', 'Lighting'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
    description: 'Licensed electrician with expertise in residential and industrial electrical work.',
    phone: '+91 98765 43211',
    availability: 'Available tomorrow',
  },
  {
    id: '3',
    name: 'Suresh Patel',
    category: 'carpentry',
    rating: 4.7,
    reviews: 89,
    hourlyRate: 320,
    location: 'Bangalore, Karnataka',
    experience: 6,
    verified: true,
    skills: ['Furniture Making', 'Door Repair', 'Custom Carpentry'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh',
    description: 'Skilled carpenter specializing in custom furniture and home repairs.',
    phone: '+91 98765 43212',
    availability: 'Available today',
  },
  {
    id: '4',
    name: 'Vikram Singh',
    category: 'painting',
    rating: 4.6,
    reviews: 124,
    hourlyRate: 280,
    location: 'Pune, Maharashtra',
    experience: 10,
    verified: false,
    skills: ['Interior Painting', 'Exterior Painting', 'Texture'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    description: 'Professional painter with attention to detail and quality finish.',
    phone: '+91 98765 43213',
    availability: 'Available in 2 days',
  },
  {
    id: '5',
    name: 'Priya Desai',
    category: 'cleaning',
    rating: 5.0,
    reviews: 287,
    hourlyRate: 250,
    location: 'Mumbai, Maharashtra',
    experience: 5,
    verified: true,
    skills: ['Deep Cleaning', 'Office Cleaning', 'Sanitization'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    description: 'Professional cleaning service with eco-friendly products.',
    phone: '+91 98765 43214',
    availability: 'Available today',
  },
];

interface WorkerListProps {
  categoryId: string;
  onBack: () => void;
}

export function WorkerList({ categoryId, onBack }: WorkerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [hoveredWorker, setHoveredWorker] = useState<string | null>(null);

  const category = serviceCategories.find((c) => c.id === categoryId);
  const workers = mockWorkers.filter((w) => w.category === categoryId);

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBookWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setBookingDialogOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Floating Header with 3D */}
      <div className="sticky top-0 z-50 p-6">
        <motion.div
          className="max-w-6xl mx-auto glass-strong rounded-3xl p-6 card-3d shadow-2xl"
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
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-slate-900">{category?.name} Workers</h2>
                <p className="text-slate-600">{filteredWorkers.length} professionals available</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <motion.div
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center icon-3d"
                  whileHover={{ scale: 1.2, rotateZ: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Search className="w-4 h-4 text-white" />
                </motion.div>
                <input
                  type="text"
                  placeholder="Search by name or skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-4 py-4 rounded-2xl glass-strong border-0 focus:ring-2 focus:ring-cyan-500/50 text-slate-900"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotateZ: 5 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-4 rounded-2xl glass-strong hover:bg-white/80 flex items-center gap-2 text-slate-700 font-medium icon-3d"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Workers Grid - Floating 3D Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="space-y-6">
          {filteredWorkers.map((worker, index) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{
                y: -8,
                rotateX: -3,
                rotateY: hoveredWorker === worker.id ? 3 : 0,
              }}
              onHoverStart={() => setHoveredWorker(worker.id)}
              onHoverEnd={() => setHoveredWorker(null)}
              className={`glass-strong rounded-3xl p-8 relative overflow-hidden card-3d ${
                index % 2 === 0 ? 'floating' : 'floating float-delay-1'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex flex-col md:flex-row gap-6" style={{ transform: 'translateZ(30px)' }}>
                {/* 3D Avatar */}
                <div className="relative">
                  <motion.div
                    className="w-28 h-28 rounded-3xl overflow-hidden icon-3d relative"
                    whileHover={{ scale: 1.1, rotateZ: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <img
                      src={worker.image}
                      alt={worker.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
                  </motion.div>
                  {worker.verified && (
                    <motion.div
                      className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center icon-3d"
                      whileHover={{ scale: 1.2, rotateZ: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="w-6 h-6 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-semibold text-slate-900">{worker.name}</h3>
                        <motion.div
                          className="flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 icon-3d"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                          <span className="font-semibold text-slate-900">{worker.rating}</span>
                          <span className="text-slate-600">({worker.reviews})</span>
                        </motion.div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-3">
                        <motion.div
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass"
                          whileHover={{ scale: 1.05 }}
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">{worker.location}</span>
                        </motion.div>
                        <motion.div
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Briefcase className="w-4 h-4" />
                          <span className="text-sm font-medium">{worker.experience} years exp.</span>
                        </motion.div>
                      </div>
                    </div>
                    <div className="text-right">
                      <motion.div
                        className="glass-strong rounded-2xl p-4 icon-3d"
                        whileHover={{ scale: 1.1, rotateZ: 5 }}
                      >
                        <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                          ₹{worker.hourlyRate}
                        </div>
                        <div className="text-sm text-slate-600">per hour</div>
                      </motion.div>
                    </div>
                  </div>

                  <p className="text-slate-700 mb-4 leading-relaxed">{worker.description}</p>

                  {/* Skills as 3D badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {worker.skills.map((skill, idx) => (
                      <motion.span
                        key={skill}
                        className="px-4 py-2 rounded-xl glass-strong text-sm font-medium text-slate-700"
                        whileHover={{ scale: 1.1, y: -4 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>

                  {/* Actions - 3D Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(6, 182, 212, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBookWorker(worker)}
                      className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/30 icon-3d"
                    >
                      <Calendar className="w-5 h-5 inline mr-2" />
                      Book Now
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-4 rounded-2xl glass-strong hover:bg-white/80 text-slate-700 font-medium icon-3d"
                    >
                      <MessageCircle className="w-5 h-5 inline mr-2" />
                      Message
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-4 rounded-2xl glass-strong hover:bg-white/80 text-slate-700 font-medium icon-3d"
                    >
                      <Phone className="w-5 h-5 inline mr-2" />
                      Call
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Modal - 3D */}
      <AnimatePresence>
        {bookingDialogOpen && selectedWorker && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingDialogOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div
                className="glass-strong rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto card-3d shadow-2xl"
                initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50, rotateX: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div style={{ transform: 'translateZ(40px)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900">Book {selectedWorker.name}</h2>
                      <p className="text-slate-600">Fill in your details to confirm booking</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.2, rotateZ: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setBookingDialogOpen(false)}
                      className="w-12 h-12 rounded-2xl glass-strong flex items-center justify-center hover:bg-white/80 icon-3d"
                    >
                      <X className="w-6 h-6 text-slate-700" />
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {['Your Name', 'Phone Number (+91 XXXXX XXXXX)'].map((placeholder, idx) => (
                      <motion.input
                        key={idx}
                        type="text"
                        placeholder={placeholder}
                        className="w-full px-5 py-4 rounded-2xl glass-strong border-0 focus:ring-2 focus:ring-cyan-500/50 text-slate-900"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      />
                    ))}
                    <motion.textarea
                      placeholder="Address"
                      rows={2}
                      className="w-full px-5 py-4 rounded-2xl glass-strong border-0 focus:ring-2 focus:ring-cyan-500/50 text-slate-900"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    />
                    <motion.input
                      type="datetime-local"
                      className="w-full px-5 py-4 rounded-2xl glass-strong border-0 focus:ring-2 focus:ring-cyan-500/50 text-slate-900"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    />
                    <motion.textarea
                      placeholder="Description of work needed..."
                      rows={3}
                      className="w-full px-5 py-4 rounded-2xl glass-strong border-0 focus:ring-2 focus:ring-cyan-500/50 text-slate-900"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setBookingDialogOpen(false)}
                      className="flex-1 px-6 py-4 rounded-2xl glass-strong hover:bg-white/80 text-slate-700 font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(6, 182, 212, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setBookingDialogOpen(false);
                        alert('Booking request sent! The worker will contact you shortly.');
                      }}
                      className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/30 icon-3d"
                    >
                      Confirm Booking
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
