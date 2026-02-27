import express from 'express';
import bcrypt from 'bcryptjs';
import db from './db';
import { generateToken, authenticateToken, AuthRequest, requireAdmin } from './auth';
import { GoogleGenAI, Type } from '@google/genai';

const router = express.Router();

// Initialize Gemini
const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing.');
  }
  return new GoogleGenAI({ apiKey });
};

// --- Auth Routes ---
router.post('/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const insert = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    const result = insert.run(name, email, hashedPassword, role || 'student');
    
    const token = generateToken(result.lastInsertRowid as number, role || 'student');
    res.json({ token, user: { id: result.lastInsertRowid, name, email, role: role || 'student' } });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id, user.role);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/auth/me', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user?.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Courses Routes ---
router.get('/courses', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courses = db.prepare('SELECT * FROM courses').all();
    
    // Get progress if student
    if (req.user?.role === 'student') {
      const progress = db.prepare('SELECT course_id, status, score FROM progress WHERE user_id = ?').all(req.user.id) as any[];
      const progressMap = progress.reduce((acc, p) => ({ ...acc, [p.course_id]: p }), {});
      
      const coursesWithProgress = courses.map((c: any) => ({
        ...c,
        progress: progressMap[c.id] || { status: 'not_started', score: 0 }
      }));
      return res.json(coursesWithProgress);
    }
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/courses', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const { title, description, difficulty } = req.body;
  try {
    const insert = db.prepare('INSERT INTO courses (title, description, difficulty) VALUES (?, ?, ?)');
    const result = insert.run(title, description, difficulty);
    res.json({ id: result.lastInsertRowid, title, description, difficulty });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- AI Routes ---
router.post('/ai/analyze-skills', authenticateToken, async (req: AuthRequest, res) => {
  const { resumeText, currentSkills, goal } = req.body;
  
  try {
    const aiClient = getAi();
    const prompt = `
      You are an expert entrance exam coach. Analyze the student's profile and provide a personalized study plan.
      
      Resume/Background: ${resumeText || 'Not provided'}
      Current Skills: ${currentSkills || 'Not provided'}
      Goal/Target Exam: ${goal || 'General Entrance Exam'}
      
      Provide a structured JSON response with the following format:
      {
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "recommendedPlan": "A short paragraph describing the overall strategy.",
        "courseRecommendations": ["Topic 1", "Topic 2"]
      }
    `;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of student's strengths"
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of student's weaknesses"
            },
            recommendedPlan: {
              type: Type.STRING,
              description: "A short paragraph describing the overall strategy"
            },
            courseRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of recommended topics or courses"
            }
          }
        }
      }
    });

    let text = response.text || '{}';
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error('AI Error Details:', error);
    let errorMessage = error.message || 'Failed to analyze skills';
    if (errorMessage.includes('API key not valid') || errorMessage.includes('GEMINI_API_KEY is missing')) {
      // Fallback mock response
      return res.json({
        strengths: ["Strong analytical skills (Mock Data)", "Good foundational knowledge (Mock Data)"],
        weaknesses: ["Time management under pressure (Mock Data)", "Advanced problem solving (Mock Data)"],
        recommendedPlan: "Note: The Gemini API key is missing or invalid, so this is a mock response. To get real AI analysis, please configure a valid GEMINI_API_KEY in the AI Studio Secrets panel. For now, focus on improving your time management and practice advanced problems daily.",
        courseRecommendations: ["Time Management 101", "Advanced Problem Solving"]
      });
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      errorMessage = 'The requested AI model was not found. Please check the model name.';
    }
    res.status(500).json({ error: errorMessage, details: error.toString() });
  }
});

router.post('/ai/chat', authenticateToken, async (req: AuthRequest, res) => {
  const { message, history } = req.body;
  
  try {
    const aiClient = getAi();
    
    // Format history for Gemini if needed, or just send the latest message with context
    const prompt = `
      You are a helpful, encouraging entrance exam coach.
      Answer the student's question concisely.
      
      Student: ${message}
    `;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('AI Error Details:', error);
    let errorMessage = 'Failed to get chat response';
    if (error.message?.includes('API key not valid') || error.message?.includes('GEMINI_API_KEY is missing')) {
      return res.json({ reply: "Note: The Gemini API key is missing or invalid, so this is a mock response. Please configure a valid GEMINI_API_KEY in the AI Studio Secrets panel to get real AI responses. I'm here to help you study!" });
    } else if (error.message?.includes('not found') || error.message?.includes('404')) {
      errorMessage = 'The requested AI model was not found. Please check the model name.';
    }
    res.status(500).json({ error: errorMessage, details: error.toString() });
  }
});

export default router;
