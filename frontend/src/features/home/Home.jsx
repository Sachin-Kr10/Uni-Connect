import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, MessageSquare, Zap, Shield, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  
  const features = [
    { icon: Users, title: "Campus Communities", desc: "Join vibrant clubs and groups across your university.", color: "from-primary-500 to-primary-700" },
    { icon: MessageSquare, title: "Real-time Chat", desc: "Secure, instant messaging with typing indicators.", color: "from-tertiary-500 to-tertiary-700" },
    { icon: Zap, title: "Dynamic Feed", desc: "Instagram-style feed with stories and media sharing.", color: "from-secondary-500 to-secondary-700" },
    { icon: Shield, title: "Verified Network", desc: "University-verified accounts for a trusted community.", color: "from-green-500 to-green-700" },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 sm:px-12">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-primary-100/40 blur-[140px]" style={{ animation: 'float 8s ease-in-out infinite' }} />
          <div className="absolute bottom-[-10%] left-[-15%] w-[800px] h-[800px] rounded-full bg-tertiary-100/30 blur-[150px]" style={{ animation: 'float 10s ease-in-out infinite reverse' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100/80 text-primary-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-4 h-4" /> Welcome to the Future
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-extrabold font-[family-name:var(--font-display)] tracking-tighter leading-[0.9]"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-tertiary-500 to-secondary-500">
              Uni-Connect
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-on-surface-variant font-medium max-w-2xl mx-auto leading-relaxed"
          >
            The premium social platform designed exclusively for university communities. Connect, collaborate, and create together.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link 
              to={user ? "/feed" : "/login"} 
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-primary-600 to-tertiary-500 text-white font-bold rounded-full shadow-xl shadow-primary-500/30 hover:scale-105 active:scale-95 transition-transform font-[family-name:var(--font-display)] text-lg"
            >
              {user ? 'Go to Feed' : 'Get Started'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to={user ? "/groups" : "/register"}
              className="inline-flex items-center gap-2 px-10 py-4 bg-surface-container-low text-on-surface font-bold rounded-full hover:bg-surface-container transition-colors font-[family-name:var(--font-display)] text-lg shadow-sm"
            >
              {user ? 'Explore Communities' : 'Create Account'}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-32 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold font-[family-name:var(--font-display)] tracking-tighter mb-4">
              Built for Campus Life
            </h2>
            <p className="text-on-surface-variant font-medium max-w-xl mx-auto">
              Everything you need to thrive in your university community, in one beautiful platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface-container-lowest p-8 sm:p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold font-[family-name:var(--font-display)] tracking-tight mb-2">{f.title}</h3>
                <p className="text-on-surface-variant font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-surface-container text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary-500" />
          <span className="font-[family-name:var(--font-display)] font-extrabold text-lg tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-tertiary-500">
            Uni-Connect
          </span>
        </div>
        <p className="text-xs text-on-surface-variant font-medium">© 2024 Uni-Connect. Built for university communities worldwide.</p>
      </footer>
    </div>
  );
};

export default Home;
