import Database from 'better-sqlite3';

const db = new Database('app.db', { verbose: console.log });

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER,
    course_id INTEGER,
    status TEXT DEFAULT 'not_started',
    score INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );
`);

// Insert some dummy courses if none exist
const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number };
if (courseCount.count === 0) {
  const insertCourse = db.prepare('INSERT INTO courses (title, description, difficulty) VALUES (?, ?, ?)');
  insertCourse.run('JEE Main Mathematics', 'Comprehensive coverage of Calculus, Algebra, and Coordinate Geometry for JEE Main.', 'Advanced');
  insertCourse.run('JEE Advanced Physics', 'In-depth physics concepts, mechanics, and electromagnetism for JEE Advanced.', 'Expert');
  insertCourse.run('GATE Computer Science', 'Core CS subjects: Data Structures, Algorithms, OS, and DBMS for GATE.', 'Advanced');
  insertCourse.run('SSC CGL Quantitative Aptitude', 'Mastering arithmetic, algebra, geometry, and data interpretation for SSC CGL Tier I & II.', 'Intermediate');
  insertCourse.run('SSC CGL General Intelligence', 'Logical reasoning, analogies, and problem-solving techniques.', 'Beginner');
  insertCourse.run('GATE Mechanical Engineering', 'Thermodynamics, fluid mechanics, and manufacturing processes.', 'Advanced');
}

export default db;
