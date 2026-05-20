import { useState } from 'react';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Power,
  MapPin,
  Phone,
  Zap,
  Award,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingRequest {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  amount: number;
}

const mockBookings: BookingRequest[] = [
  {
    id: '1',
    customerName: 'Anjali Verma',
    service: 'Pipe Repair',
    date: '2026-05-20',
    time: '10:00 AM',
    location: 'Andheri West, Mumbai',
    description: 'Kitchen sink leaking, needs urgent repair',
    status: 'pending',
    amount: 1200,
  },
  {
    id: '2',
    customerName: 'Rahul Mehta',
    service: 'Bathroom Fitting',
    date: '2026-05-21',
    time: '2:00 PM',
    location: 'Bandra, Mumbai',
    description: 'New bathroom fittings installation',
    status: 'pending',
    amount: 3500,
  },
  {
    id: '3',
    customerName: 'Sneha Kapoor',
    service: 'Water Heater',
    date: '2026-05-19',
    time: '11:00 AM',
    location: 'Powai, Mumbai',
    description: 'Water heater not working',
    status: 'accepted',
    amount: 1800,
  },
];

interface WorkerDashboardProps {
  onBack: () => void;
}

export function WorkerDashboard({ onBack }: WorkerDashboardProps) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [bookings, setBookings] = useState<BookingRequest[]>(mockBookings);

  const handleAcceptBooking = (id: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'accepted' as const } : b));
  };

  const handleRejectBooking = (id: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'rejected' as const } : b));
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');

  const stats = [
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: '₹45,280',
      change: '+12.5%',
      gradient: 'from-green-400 to-emerald-500',
      delay: 0
    },
    {
      icon: CheckCircle,
      label: 'Jobs Completed',
      value: '156',
      change: '+8 this week',
      gradient: 'from-blue-400 to-cyan-500',
      delay: 0.1
    },
    {
      icon: Star,
      label: 'Rating',
      value: '4.8',
      change: '287 reviews',
      gradient: 'from-yellow-400 to-orange-500',
      delay: 0.2
    },
    {
      icon: TrendingUp,
      label: 'This Month',
      value: '23',
      change: '+15% vs last month',
      gradient: 'from-purple-400 to-pink-500',
      delay: 0.3
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Floating Header with 3D */}
      <div className="sticky top-0 z-50 p-6">
        <motion.div
          className="max-w-7xl mx-auto glass-strong rounded-3xl p-6 card-3d shadow-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div style={{ transform: 'translateZ(20px)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <motion.button
                  onClick={onBack}
                  className="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center hover:bg-white/80 transition-all icon-3d"
                  whileHover={{ scale: 1.1, rotateZ: -10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-6 h-6 text-slate-700" />
                </motion.button>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Worker Dashboard</h2>
                  <p className="text-slate-600">Manage your bookings and earnings</p>
                </div>
              </div>

              {/* 3D Availability Toggle */}
              <motion.div
                className="flex items-center gap-4 px-6 py-3 rounded-2xl glass-strong icon-3d"
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <motion.div
                  animate={{ scale: isAvailable ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 2, repeat: isAvailable ? Infinity : 0 }}
                >
                  <Power className={`w-6 h-6 ${isAvailable ? 'text-green-500' : 'text-slate-400'}`} />
                </motion.div>
                <span className="text-sm font-medium text-slate-700">
                  {isAvailable ? 'Available for work' : 'Offline'}
                </span>
                <motion.button
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`w-16 h-9 rounded-full relative transition-all icon-3d ${
                    isAvailable ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-300'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-1 w-7 h-7 rounded-full bg-white shadow-md"
                    animate={{ left: isAvailable ? '32px' : '4px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Stats Grid - 3D Floating Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className={`glass-strong rounded-3xl p-6 relative overflow-hidden card-3d ${
                index % 2 === 0 ? 'floating' : 'floating float-delay-1'
              }`}
              initial={{ opacity: 0, y: 20, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              whileHover={{
                scale: 1.05,
                y: -8,
                rotateY: 5,
                rotateX: -5,
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="relative z-10" style={{ transform: 'translateZ(30px)' }}>
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 icon-3d`}
                  whileHover={{ scale: 1.1, rotateZ: 10 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-sm text-slate-600 mb-2">{stat.label}</div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-xs text-green-600 font-medium">{stat.change}</div>
              </div>
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-3xl`} />
            </motion.div>
          ))}
        </div>

        {/* Pending Requests - 3D Cards */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
              Pending Requests
              {pendingBookings.length > 0 && (
                <motion.span
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-sm font-medium icon-3d"
                  whileHover={{ scale: 1.1, rotateZ: 5 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {pendingBookings.length} new
                </motion.span>
              )}
            </h3>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {pendingBookings.length === 0 ? (
                <motion.div
                  className="glass-strong rounded-3xl p-12 text-center card-3d"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.div
                    className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center mx-auto mb-4 icon-3d"
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Clock className="w-12 h-12 text-white" />
                  </motion.div>
                  <p className="text-slate-500 text-lg">No pending requests</p>
                </motion.div>
              ) : (
                pendingBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    className={`glass-strong rounded-3xl p-6 card-3d ${index % 2 === 0 ? 'floating' : 'floating float-delay-1'}`}
                    initial={{ opacity: 0, x: -20, rotateX: -20 }}
                    animate={{ opacity: 1, x: 0, rotateX: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, rotateX: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -6, rotateX: -3 }}
                    layout
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div style={{ transform: 'translateZ(30px)' }}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-slate-900 mb-2">{booking.customerName}</h4>
                          <motion.div
                            className="inline-flex px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 font-medium"
                            whileHover={{ scale: 1.05 }}
                          >
                            {booking.service}
                          </motion.div>
                        </div>
                        <div className="text-right">
                          <motion.div
                            className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.1 }}
                          >
                            ₹{booking.amount}
                          </motion.div>
                          <motion.div
                            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 text-xs font-medium mt-2 icon-3d"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            New Request
                          </motion.div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <motion.div
                          className="flex items-center gap-2 text-slate-600 px-3 py-2 rounded-xl glass"
                          whileHover={{ scale: 1.02, x: 4 }}
                        >
                          <Calendar className="w-5 h-5" />
                          <span className="text-sm font-medium">{booking.date} at {booking.time}</span>
                        </motion.div>
                        <motion.div
                          className="flex items-center gap-2 text-slate-600 px-3 py-2 rounded-xl glass"
                          whileHover={{ scale: 1.02, x: 4 }}
                        >
                          <MapPin className="w-5 h-5" />
                          <span className="text-sm font-medium">{booking.location}</span>
                        </motion.div>
                      </div>

                      <p className="text-slate-700 mb-6 p-4 rounded-xl glass leading-relaxed">{booking.description}</p>

                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAcceptBooking(booking.id)}
                          className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 icon-3d"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Accept Request
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRejectBooking(booking.id)}
                          className="flex-1 px-6 py-4 rounded-2xl glass-strong hover:bg-red-50 text-red-600 font-medium flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Decline
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Upcoming Jobs - 3D Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <h3 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
            Upcoming Jobs
            {acceptedBookings.length > 0 && (
              <motion.span
                className="px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-medium icon-3d"
                whileHover={{ scale: 1.1 }}
              >
                {acceptedBookings.length} confirmed
              </motion.span>
            )}
          </h3>

          <div className="space-y-4">
            {acceptedBookings.length === 0 ? (
              <motion.div
                className="glass-strong rounded-3xl p-12 text-center card-3d"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-4 icon-3d"
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap className="w-12 h-12 text-white" />
                </motion.div>
                <p className="text-slate-500 text-lg">No upcoming jobs</p>
              </motion.div>
            ) : (
              acceptedBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  className={`glass-strong rounded-3xl p-6 card-3d ${index % 2 === 0 ? 'floating' : 'floating float-delay-1'}`}
                  initial={{ opacity: 0, y: 20, rotateX: -20 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -6, rotateX: -3 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div style={{ transform: 'translateZ(30px)' }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-slate-900 mb-2">{booking.customerName}</h4>
                        <motion.div
                          className="inline-flex px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 font-medium"
                          whileHover={{ scale: 1.05 }}
                        >
                          {booking.service}
                        </motion.div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-slate-900">₹{booking.amount}</div>
                        <motion.div
                          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-medium mt-2 icon-3d"
                          whileHover={{ scale: 1.1 }}
                        >
                          Confirmed
                        </motion.div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <motion.div
                        className="flex items-center gap-2 text-slate-600 px-3 py-2 rounded-xl glass"
                        whileHover={{ scale: 1.02, x: 4 }}
                      >
                        <Calendar className="w-5 h-5" />
                        <span className="text-sm font-medium">{booking.date} at {booking.time}</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2 text-slate-600 px-3 py-2 rounded-xl glass"
                        whileHover={{ scale: 1.02, x: 4 }}
                      >
                        <MapPin className="w-5 h-5" />
                        <span className="text-sm font-medium">{booking.location}</span>
                      </motion.div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 rounded-2xl glass-strong hover:bg-white/80 text-slate-700 font-medium flex items-center gap-2 icon-3d"
                    >
                      <Phone className="w-5 h-5" />
                      Contact Customer
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
