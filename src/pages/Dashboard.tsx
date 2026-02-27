import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Week 1', score: 40 },
  { name: 'Week 2', score: 55 },
  { name: 'Week 3', score: 65 },
  { name: 'Week 4', score: 80 },
  { name: 'Week 5', score: 85 },
];

export const Dashboard = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setCourses(await res.json());
        }
      } catch (error) {
        console.error('Failed to fetch courses');
      }
    };
    if (token) fetchCourses();
  }, [token]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}</h1>
          <p className="text-gray-400">Here's an overview of your learning progress.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <BookOpen className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Enrolled Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Completed Modules</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Study Hours</p>
                <p className="text-2xl font-bold">34h</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 p-6 rounded-2xl bg-zinc-950 border border-white/10">
            <h3 className="text-xl font-semibold mb-6">Performance Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#888" tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10">
            <h3 className="text-xl font-semibold mb-6">Recent Courses</h3>
            <div className="space-y-4">
              {courses.slice(0, 4).map((course, i) => (
                <div key={i} className="p-4 rounded-xl bg-black border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="font-medium mb-1">{course.title}</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{course.difficulty}</span>
                    <span className="text-indigo-400">{course.progress?.score || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full" 
                      style={{ width: `${course.progress?.score || 0}%` }}
                    />
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No courses available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
