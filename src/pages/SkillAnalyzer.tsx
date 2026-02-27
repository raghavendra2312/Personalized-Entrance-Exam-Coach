import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Brain, Sparkles, Loader2, ArrowRight, CheckCircle, Target } from 'lucide-react';

export const SkillAnalyzer = () => {
  const { token } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai/analyze-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeText, currentSkills, goal }),
      });

      if (!res.ok) {
        let errorMessage = 'Failed to analyze skills';
        try {
          const text = await res.text();
          try {
            const errData = JSON.parse(text);
            if (errData.error) errorMessage = errData.error;
          } catch (e) {
            errorMessage = text || errorMessage;
          }
        } catch (e) {}
        throw new Error(errorMessage);
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Brain className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Skill Analyzer</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Powered by Google Gemini. Paste your background and goals to receive a personalized study plan and skill gap analysis.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-2xl bg-zinc-950 border border-white/10"
          >
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Background / Resume Summary</label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-black border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors outline-none resize-none"
                  placeholder="E.g., High school graduate with strong math skills but weak in physics..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Exam / Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors outline-none"
                  placeholder="E.g., SAT, GRE, Medical Entrance..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? 'Analyzing Profile...' : 'Generate Study Plan'}
              </button>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col"
          >
            {result ? (
              <div className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" /> Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {result.weaknesses?.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <h3 className="text-lg font-semibold text-indigo-300 mb-2">Recommended Strategy</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.recommendedPlan}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Suggested Focus Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.courseRecommendations?.map((c: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                <Brain className="w-16 h-16 mb-4 opacity-20" />
                <p>Fill out the form and click generate to see your personalized AI analysis.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};


