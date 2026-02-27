import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Brain, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black -z-10" />
        
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Google Gemini</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              Master your entrance exams with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI precision</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Personalized study plans, real-time skill analysis, and intelligent course recommendations tailored to your unique learning profile.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                Start Learning Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/courses" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 text-white font-semibold hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center">
                Explore Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-950 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why choose PrepCoach AI?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our platform combines advanced AI with proven pedagogical methods to accelerate your learning.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Brain className="w-6 h-6 text-indigo-400" />,
                title: "AI Skill Analysis",
                desc: "Upload your background and let Gemini identify your strengths and exact knowledge gaps."
              },
              {
                icon: <Target className="w-6 h-6 text-cyan-400" />,
                title: "Personalized Paths",
                desc: "Get a custom curriculum that focuses only on what you need to learn to pass your exam."
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
                title: "Progress Tracking",
                desc: "Visualize your improvement over time with detailed analytics and performance metrics."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
