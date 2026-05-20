import { User, Wrench, Sparkles, TrendingUp, Users, Award, Zap, Shield, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface HomePageProps {
  onSelectUserType: (type: 'customer' | 'worker') => void;
}

export function HomePage({ onSelectUserType }: HomePageProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features = [
    { icon: Zap, title: 'Instant Booking', desc: 'Book in 30 seconds', gradient: 'from-yellow-400 to-orange-500' },
    { icon: Shield, title: 'Verified Workers', desc: '100% background checked', gradient: 'from-green-400 to-emerald-500' },
    { icon: Clock, title: '24/7 Support', desc: 'Always here to help', gradient: 'from-blue-400 to-cyan-500' },
  ];

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%)',
            top: '-20%',
            right: '-10%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            bottom: '-10%',
            left: '-5%',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.25, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong mb-6 floating"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5 text-cyan-500" />
              </motion.div>
              <span className="text-sm font-medium text-slate-700">Trusted by 50,000+ users across India</span>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              QuickFix
            </motion.h1>
            <motion.p
              className="text-xl text-slate-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              India's most trusted service marketplace powered by AI. Connect skilled workers with customers instantly.
            </motion.p>
          </motion.div>

          {/* Main Cards - 3D Effect */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{
                scale: 1.02,
                y: -12,
                rotateY: hoveredCard === 'customer' ? 5 : 0,
                rotateX: hoveredCard === 'customer' ? -5 : 0,
              }}
              onHoverStart={() => setHoveredCard('customer')}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => onSelectUserType('customer')}
              className="glass-strong rounded-3xl p-10 cursor-pointer relative overflow-hidden card-3d floating"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10" style={{ transform: 'translateZ(50px)' }}>
                {/* 3D Icon */}
                <motion.div
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-6 icon-3d relative"
                  whileHover={{
                    scale: 1.1,
                    rotateY: 15,
                    rotateX: -15,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <User className="w-12 h-12 text-white" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-300 to-blue-400 opacity-50 blur-xl" />
                </motion.div>

                <h2 className="text-3xl font-semibold mb-4 text-slate-900">I Need a Service</h2>
                <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                  Find verified professionals for plumbing, electrical, carpentry, cleaning, and 20+ other services
                </p>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(6, 182, 212, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUserType('customer');
                  }}
                  style={{ transform: 'translateZ(30px)' }}
                >
                  Find Workers →
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{
                scale: 1.02,
                y: -12,
                rotateY: hoveredCard === 'worker' ? -5 : 0,
                rotateX: hoveredCard === 'worker' ? -5 : 0,
              }}
              onHoverStart={() => setHoveredCard('worker')}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => onSelectUserType('worker')}
              className="glass-strong rounded-3xl p-10 cursor-pointer relative overflow-hidden card-3d floating float-delay-1"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10" style={{ transform: 'translateZ(50px)' }}>
                {/* 3D Icon */}
                <motion.div
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 icon-3d relative"
                  whileHover={{
                    scale: 1.1,
                    rotateY: -15,
                    rotateX: -15,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Wrench className="w-12 h-12 text-white" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400 to-indigo-500 opacity-50 blur-xl" />
                </motion.div>

                <h2 className="text-3xl font-semibold mb-4 text-slate-900">I Am a Worker</h2>
                <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                  Showcase your skills, get verified, find customers, and grow your business with our smart platform
                </p>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUserType('worker');
                  }}
                  style={{ transform: 'translateZ(30px)' }}
                >
                  Start Earning →
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Feature Flashcards */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`glass-strong rounded-2xl p-6 flashcard floating float-delay-${index + 1}`}
                whileHover={{
                  y: -8,
                  rotateY: 8,
                  rotateX: -8,
                  scale: 1.03,
                }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div style={{ transform: 'translateZ(30px)' }}>
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 icon-3d`}
                    whileHover={{ rotateZ: 10 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats - 3D Cards */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {[
              { icon: Users, value: '10,000+', label: 'Active Workers', color: 'text-cyan-500', gradient: 'from-cyan-400 to-blue-500' },
              { icon: TrendingUp, value: '50,000+', label: 'Happy Customers', color: 'text-blue-500', gradient: 'from-blue-400 to-purple-500' },
              { icon: Sparkles, value: '25+', label: 'Service Categories', color: 'text-purple-500', gradient: 'from-purple-400 to-pink-500' },
              { icon: Award, value: '4.8★', label: 'Average Rating', color: 'text-indigo-500', gradient: 'from-yellow-400 to-orange-500' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className={`glass-strong rounded-2xl p-6 text-center relative overflow-hidden card-3d floating float-delay-${index + 1}`}
                whileHover={{
                  scale: 1.08,
                  y: -8,
                  rotateY: 5,
                  rotateX: -5,
                }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div style={{ transform: 'translateZ(40px)' }}>
                  <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-3 icon-3d`}
                    whileHover={{ rotateZ: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
                <div className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${stat.gradient} opacity-20 blur-2xl`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
