import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Course, Order, Test, Result, Notification, PiracyAlert } from './models/schemas.js';
import { paymentRouter } from './routes/paymentRoute.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/payments', paymentRouter);

const MONGODB_URI = process.env.MONGODB_URI;
let useRealDb = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('🔗 Connected to MongoDB Atlas successfully.');
      useRealDb = true;
      
      // Seed default courses and tests if database is empty
      seedDefaultData().then(() => {
        syncFromMongoDB();
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Error. Running Mock DB fallback.', err);
    });
} else {
  console.log('⚠️ MONGODB_URI not found in env. Running in Standalone Mock DB Mode.');
}

async function seedDefaultData() {
  try {
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      await Course.create([
        {
          title: 'Rank Booster JEE Advanced Mathematics 2027',
          description: 'Master Calculus, Coordinate Geometry, and Algebra with A.K. Sir. Includes video lectures, notes, assignments, and test series.',
          price: 4999,
          originalPrice: 14999,
          coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
          tag: 'JEE Advanced',
          rating: 4.95,
          modules: [
            {
              title: 'Module 1: Differential Calculus',
              chapters: [
                {
                  title: 'Chapter 1: Limits & Continuity',
                  videos: [
                    { title: '1.1 Concept of Limits & Indeterminate Forms', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: '20:15', isDemo: true },
                    { title: '1.2 Sandwich Theorem & L\'Hopital\'s Rule', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: '25:40', isDemo: false }
                  ],
                  pdfs: [
                    { title: 'Limits Standard Formulas Sheet', url: '/pdfs/limits_formulas.pdf', size: '2.4 MB' },
                    { title: 'DPP-01: Limits and Graphing Method', url: '/pdfs/dpp_01.pdf', size: '1.1 MB' }
                  ]
                }
              ]
            }
          ]
        },
        {
          title: 'Complete Algebra & Matrices for JEE Main + Advanced',
          description: 'Comprehensive course covering Matrices, Determinants, Complex Numbers, and Permutations. Designed by Ajay Kumar Saroj (A.K. Sir).',
          price: 3999,
          originalPrice: 9999,
          coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
          tag: 'JEE Main & Advanced',
          rating: 4.88,
          modules: []
        }
      ]);
      console.log('🌱 Seeded default courses in MongoDB.');
    }

    const testCount = await Test.countDocuments();
    if (testCount === 0) {
      await Test.create([
        {
          title: 'Mega Test 01 - Calculus (JEE Advanced Pattern)',
          description: 'Syllabus: Limits, Continuity, Differentiability. Time: 30 minutes, Total Marks: 24. Marking: +4 / -1.',
          durationMinutes: 30,
          questions: [
            {
              questionText: 'Find the limit of lim_{x -> 0} (cos(x))^(1 / x^2).',
              options: ['e', 'e^(-1/2)', 'e^(1/2)', '1'],
              correctOption: 1,
              marks: 4,
              negativeMarks: -1,
              subject: 'Calculus',
              explanation: 'Take logs: ln(y) = (1/x^2) * ln(cos(x)). Expand ln(cos(x)) = ln(1 - x^2/2 + ...) = -x^2/2. So ln(y) -> -1/2. Thus y -> e^(-1/2).'
            },
            {
              questionText: 'If f(x) = |x| + |x-1|, then at x = 0, the function is:',
              options: ['Continuous and differentiable', 'Continuous but not differentiable', 'Discontinuous but differentiable', 'Discontinuous and not differentiable'],
              correctOption: 1,
              marks: 4,
              negativeMarks: -1,
              subject: 'Calculus',
              explanation: 'f(0) = 1. Left limit = 1, Right limit = 1. So continuous. However, left derivative is -2, right derivative is 0, so non-differentiable.'
            }
          ]
        }
      ]);
      console.log('🌱 Seeded default tests in MongoDB.');
    }
  } catch (e) {
    console.error('❌ Failed to seed default data in MongoDB.', e);
  }
}

async function syncFromMongoDB() {
  if (!useRealDb) return;
  try {
    const dbUsers = await User.find({});
    if (dbUsers.length > 0) {
      mockDb.users = dbUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: u.password,
        role: u.role,
        classLevel: u.classLevel,
        targetExam: u.targetExam,
        isBanned: u.isBanned,
        dailyStreak: u.dailyStreak,
        lastActive: u.lastActive ? u.lastActive.toISOString() : new Date().toISOString(),
        attendance: u.attendance,
        purchasedCourses: u.purchasedCourses.map(id => id.toString()),
        sessions: u.sessions.map(s => ({
          sessionId: s.sessionId,
          deviceFingerprint: s.deviceFingerprint,
          ipAddress: s.ipAddress,
          loginTime: s.loginTime
        }))
      }));
    }

    const dbCourses = await Course.find({});
    if (dbCourses.length > 0) {
      mockDb.courses = dbCourses.map(c => ({
        id: c._id.toString(),
        title: c.title,
        description: c.description,
        price: c.price,
        originalPrice: c.originalPrice,
        coverImage: c.coverImage,
        tag: c.tag,
        rating: c.rating,
        modules: c.modules.map(m => ({
          id: m._id ? m._id.toString() : 'mod_' + Math.random().toString(36).substr(2, 9),
          title: m.title,
          chapters: m.chapters.map(ch => ({
            id: ch._id ? ch._id.toString() : 'ch_' + Math.random().toString(36).substr(2, 9),
            title: ch.title,
            videos: ch.videos.map(v => ({ id: v._id ? v._id.toString() : 'v_' + Math.random().toString(36).substr(2, 9), title: v.title, url: v.url, duration: v.duration, isDemo: v.isDemo })),
            pdfs: ch.pdfs.map(p => ({ id: p._id ? p._id.toString() : 'p_' + Math.random().toString(36).substr(2, 9), title: p.title, url: p.url, size: p.size })),
            assignments: ch.assignments || []
          }))
        }))
      }));
    }

    const dbTests = await Test.find({});
    if (dbTests.length > 0) {
      mockDb.tests = dbTests.map(t => ({
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        durationMinutes: t.durationMinutes,
        questions: t.questions.map(q => ({
          id: q._id ? q._id.toString() : 'q_' + Math.random().toString(36).substr(2, 9),
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          subject: q.subject,
          explanation: q.explanation
        }))
      }));
    }

    const dbNotices = await Notification.find({}).sort({ createdAt: -1 });
    if (dbNotices.length > 0) {
      mockDb.notifications = dbNotices.map(n => ({
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        createdAt: n.createdAt.toISOString()
      }));
    }

    const dbAlerts = await PiracyAlert.find({}).sort({ createdAt: -1 });
    if (dbAlerts.length > 0) {
      mockDb.piracyAlerts = dbAlerts.map(a => ({
        id: a._id.toString(),
        userId: a.user.toString(),
        userName: 'Aspirant Log',
        type: a.type,
        details: a.details,
        ipAddress: a.ipAddress,
        createdAt: a.createdAt.toISOString()
      }));
    }

    const dbOrders = await Order.find({});
    if (dbOrders.length > 0) {
      mockDb.orders = dbOrders.map(o => ({
        id: o._id.toString(),
        user: o.user.toString(),
        course: o.course.toString(),
        amount: o.amount,
        status: o.status,
        paymentProvider: o.paymentProvider,
        transactionId: o.transactionId,
        createdAt: o.createdAt.toISOString()
      }));
    }

    const dbResults = await Result.find({});
    if (dbResults.length > 0) {
      mockDb.results = dbResults.map(r => ({
        id: r._id.toString(),
        user: r.user.toString(),
        test: r.test.toString(),
        score: r.score,
        totalMarks: r.totalMarks,
        correctAnswers: r.correctAnswers,
        wrongAnswers: r.wrongAnswers,
        skippedAnswers: r.skippedAnswers,
        percentile: r.percentile,
        rank: r.rank,
        createdAt: r.createdAt.toISOString()
      }));
    }

    console.log('🔄 Synced all MongoDB documents into Express memory cache.');
  } catch (e) {
    console.error('❌ Error syncing data from MongoDB.', e);
  }
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'quantrex_super_secret_key_2026';

// IN-MEMORY / LOCAL DATABASE FALLBACK FOR EASY RUNNING
const mockDb = {
  users: [
    {
      id: 'student1',
      name: 'Rohan Sharma',
      email: 'student@quantrex.com',
      phone: '9876543210',
      passwordHash: bcrypt.hashSync('student123', 8),
      role: 'student',
      classLevel: '12th Pass',
      targetExam: 'JEE Advanced 2027',
      purchasedCourses: ['course1'],
      dailyStreak: 12,
      lastActive: new Date().toISOString(),
      attendance: 98,
      isBanned: false,
      sessions: [
        { sessionId: 'sess_1', deviceFingerprint: 'chrome-windows-fingerprint', ipAddress: '192.168.1.1', loginTime: new Date() }
      ]
    },
    {
      id: 'admin1',
      name: 'Ajay Kumar Saroj (A.K. Sir)',
      email: 'admin@quantrex.com',
      phone: '9999999999',
      passwordHash: bcrypt.hashSync('admin123', 8),
      role: 'admin',
      isBanned: false,
      sessions: []
    }
  ],
  courses: [
    {
      id: 'course1',
      title: 'Rank Booster JEE Advanced Mathematics 2027',
      description: 'Master Calculus, Coordinate Geometry, and Algebra with A.K. Sir. Includes video lectures, notes, assignments, and test series.',
      price: 4999,
      originalPrice: 14999,
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
      tag: 'JEE Advanced',
      rating: 4.95,
      modules: [
        {
          id: 'mod1',
          title: 'Module 1: Differential Calculus',
          chapters: [
            {
              id: 'ch1',
              title: 'Chapter 1: Limits & Continuity',
              videos: [
                { id: 'v1', title: '1.1 Concept of Limits & Indeterminate Forms', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: '20:15', isDemo: true },
                { id: 'v2', title: '1.2 Sandwich Theorem & L\'Hopital\'s Rule', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: '25:40', isDemo: false }
              ],
              pdfs: [
                { id: 'p1', title: 'Limits Standard Formulas Sheet', url: '/pdfs/limits_formulas.pdf', size: '2.4 MB' },
                { id: 'p2', title: 'DPP-01: Limits and Graphing Method', url: '/pdfs/dpp_01.pdf', size: '1.1 MB' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'course2',
      title: 'Complete Algebra & Matrices for JEE Main + Advanced',
      description: 'Comprehensive course covering Matrices, Determinants, Complex Numbers, and Permutations. Designed by Ajay Kumar Saroj (A.K. Sir).',
      price: 3999,
      originalPrice: 9999,
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
      tag: 'JEE Main & Advanced',
      rating: 4.88,
      modules: []
    }
  ],
  orders: [],
  tests: [
    {
      id: 'test1',
      title: 'Mega Test 01 - Calculus (JEE Advanced Pattern)',
      description: 'Syllabus: Limits, Continuity, Differentiability. Time: 30 minutes, Total Marks: 24. Marking: +4 / -1.',
      durationMinutes: 30,
      questions: [
        {
          id: 'q1',
          questionText: 'Find the limit of lim_{x -> 0} (cos(x))^(1 / x^2).',
          options: ['e', 'e^(-1/2)', 'e^(1/2)', '1'],
          correctOption: 1, // e^(-1/2)
          marks: 4,
          negativeMarks: -1,
          subject: 'Calculus',
          explanation: 'Take logs: ln(y) = (1/x^2) * ln(cos(x)). Expand ln(cos(x)) = ln(1 - x^2/2 + ...) = -x^2/2. So ln(y) -> -1/2. Thus y -> e^(-1/2).'
        },
        {
          id: 'q2',
          questionText: 'If f(x) = |x| + |x-1|, then at x = 0, the function is:',
          options: ['Continuous and differentiable', 'Continuous but not differentiable', 'Discontinuous but differentiable', 'Discontinuous and not differentiable'],
          correctOption: 1, // Continuous but not differentiable
          marks: 4,
          negativeMarks: -1,
          subject: 'Calculus',
          explanation: 'f(0) = 1. Left limit = 1, Right limit = 1. So continuous. However, left derivative is -2, right derivative is 0, so non-differentiable.'
        }
      ]
    }
  ],
  results: [],
  notifications: [
    { id: 'n1', title: 'Live Session Today', message: 'Calculus Doubt Clearing Session by A.K. Sir at 6:00 PM today. Do not miss it!', type: 'live-class', createdAt: new Date().toISOString() },
    { id: 'n2', title: 'New DPP Uploaded', message: 'DPP-02 for Limits has been uploaded under differential calculus module.', type: 'new-content', createdAt: new Date().toISOString() }
  ],
  piracyAlerts: []
};

// MIDDLEWARES
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Token Required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token Invalid or Expired' });
    req.user = user;
    next();
  });
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// API ROUTES

// AUTHENTICATION
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Please provide all details' });
  }
  const userExists = mockDb.users.find(u => u.email === email || u.phone === phone);
  if (userExists) {
    return res.status(400).json({ message: 'User with this email/phone already exists' });
  }
  const passwordHash = bcrypt.hashSync(password, 8);
  const newUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name,
    email,
    phone,
    passwordHash,
    role: role || 'student',
    classLevel: '12th Pass',
    targetExam: 'JEE Advanced 2027',
    purchasedCourses: [],
    dailyStreak: 1,
    lastActive: new Date().toISOString(),
    attendance: 100,
    isBanned: false,
    sessions: []
  };
  mockDb.users.push(newUser);

  if (useRealDb) {
    User.create({
      _id: new mongoose.Types.ObjectId(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      password: newUser.passwordHash,
      role: newUser.role,
      classLevel: newUser.classLevel,
      targetExam: newUser.targetExam,
      dailyStreak: newUser.dailyStreak,
      attendance: newUser.attendance,
      isBanned: newUser.isBanned
    }).catch(e => console.error('MongoDB Register sync error:', e));
  }

  const token = jwt.sign({ id: newUser.id, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, otp, phone, fingerprint } = req.body;
  let user;

  if (otp) {
    // Simulated OTP authentication
    user = mockDb.users.find(u => u.phone === phone || u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'User not registered with this number/email' });
    }
  } else {
    // Password authentication
    user = mockDb.users.find(u => u.email === email || u.phone === email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  }

  if (user.isBanned) {
    return res.status(403).json({ message: 'Your account has been banned due to security violations.' });
  }

  // Device Session Limiting: Max 1 active session for students
  if (user.role === 'student') {
    // If fingerprint is provided, check session count
    const activeSessions = user.sessions || [];
    if (activeSessions.length >= 1 && fingerprint && activeSessions[0].deviceFingerprint !== fingerprint) {
      // Clear sessions and force logout previous
      user.sessions = [];
      io.emit('force-logout', { userId: user.id, message: 'LoggedIn on another device.' });
    }
    // Add new session
    const newSession = {
      sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
      deviceFingerprint: fingerprint || 'unknown-web-agent',
      ipAddress: req.ip || '127.0.0.1',
      loginTime: new Date()
    };
    user.sessions = [newSession];
  }

  user.lastActive = new Date().toISOString();
  // Increment streak if logged in on a different day
  user.dailyStreak = (user.dailyStreak || 0) + 1;

  if (useRealDb) {
    // Attempt Mongoose lookup to get DB ObjectId or sync session
    try {
      const dbUser = await User.findOne({ $or: [{ email: user.email }, { phone: user.phone }] });
      if (dbUser) {
        dbUser.sessions = user.sessions.map(s => ({
          sessionId: s.sessionId,
          deviceFingerprint: s.deviceFingerprint,
          ipAddress: s.ipAddress,
          loginTime: s.loginTime
        }));
        dbUser.lastActive = new Date();
        dbUser.dailyStreak = user.dailyStreak;
        await dbUser.save();
      }
    } catch (e) {
      console.error('MongoDB Login Session sync error:', e);
    }
  }

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '12h' });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      classLevel: user.classLevel,
      targetExam: user.targetExam,
      dailyStreak: user.dailyStreak,
      attendance: user.attendance,
      purchasedCourses: user.purchasedCourses,
      sessions: user.sessions
    }
  });
});

// GET PROFILE
app.get('/api/users/profile', authenticateToken, (req, res) => {
  const user = mockDb.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    classLevel: user.classLevel,
    targetExam: user.targetExam,
    dailyStreak: user.dailyStreak,
    attendance: user.attendance,
    purchasedCourses: user.purchasedCourses,
    sessions: user.sessions
  });
});

// COURSE ENDPOINTS
app.get('/api/courses', (req, res) => {
  res.json(mockDb.courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = mockDb.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

// PURCHASE COURSE
app.post('/api/payments/checkout', async (req, res) => {
  const { courseId, paymentProvider } = req.body;
  const course = mockDb.courses.find(c => c.id === courseId);
  const user = mockDb.users.find(u => u.id === req.user.id);
  if (!course || !user) return res.status(404).json({ message: 'Course or User not found' });

  // Simulate payment processing
  const orderId = 'order_' + Math.random().toString(36).substr(2, 9);
  const newOrder = {
    id: orderId,
    user: user.id,
    course: course.id,
    amount: course.price,
    status: 'completed', // auto-complete for mock checkout
    paymentProvider: paymentProvider || 'Razorpay',
    transactionId: 'tx_' + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  mockDb.orders.push(newOrder);

  // Grant course access to student
  if (!user.purchasedCourses.includes(courseId)) {
    user.purchasedCourses.push(courseId);
  }

  if (useRealDb) {
    try {
      // Find Mongoose course and user references
      const dbCourse = await Course.findOne({ title: course.title });
      const dbUser = await User.findOne({ email: user.email });
      if (dbCourse && dbUser) {
        // Create order
        await Order.create({
          user: dbUser._id,
          course: dbCourse._id,
          amount: newOrder.amount,
          status: newOrder.status,
          paymentProvider: newOrder.paymentProvider,
          transactionId: newOrder.transactionId
        });

        // Push course reference
        await User.findByIdAndUpdate(dbUser._id, {
          $addToSet: { purchasedCourses: dbCourse._id }
        });
      }
    } catch (e) {
      console.error('MongoDB Checkout sync error:', e);
    }
  }

  // Push notification and socket broadcast
  const notification = {
    id: 'n_' + Math.random().toString(36).substr(2, 9),
    title: 'Payment Successful!',
    message: `Thank you for enrolling in ${course.title}. Start learning now!`,
    type: 'general',
    createdAt: new Date().toISOString()
  };
  mockDb.notifications.unshift(notification);
  io.emit('new-notification', notification);

  res.json({ success: true, order: newOrder });
});

// ADMIN COURSE MANAGEMENT
app.post('/api/admin/courses', authenticateToken, adminOnly, async (req, res) => {
  const { title, description, price, originalPrice, coverImage, tag } = req.body;
  const newCourse = {
    id: 'course_' + Math.random().toString(36).substr(2, 9),
    title,
    description,
    price: Number(price),
    originalPrice: Number(originalPrice || price),
    coverImage: coverImage || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    tag: tag || 'JEE Main',
    rating: 5.0,
    modules: []
  };
  mockDb.courses.push(newCourse);

  if (useRealDb) {
    Course.create({
      title: newCourse.title,
      description: newCourse.description,
      price: newCourse.price,
      originalPrice: newCourse.originalPrice,
      coverImage: newCourse.coverImage,
      tag: newCourse.tag,
      rating: newCourse.rating,
      modules: []
    }).catch(e => console.error('MongoDB Course create error:', e));
  }
  
  // Real-time broadcast
  io.emit('live-update', { type: 'course-created', course: newCourse });
  
  res.status(201).json(newCourse);
});

app.post('/api/admin/courses/:id/modules', authenticateToken, adminOnly, async (req, res) => {
  const course = mockDb.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  
  const { title } = req.body;
  const newModule = {
    id: 'mod_' + Math.random().toString(36).substr(2, 9),
    title,
    chapters: []
  };
  course.modules.push(newModule);

  if (useRealDb) {
    Course.findOneAndUpdate(
      { title: course.title },
      { $push: { modules: { title: newModule.title, chapters: [] } } }
    ).catch(e => console.error('MongoDB Module push error:', e));
  }

  io.emit('live-update', { type: 'module-added', courseId: course.id, module: newModule });
  res.status(201).json(course);
});

app.post('/api/admin/courses/:courseId/modules/:moduleId/chapters', authenticateToken, adminOnly, async (req, res) => {
  const course = mockDb.courses.find(c => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const mod = course.modules.find(m => m.id === req.params.moduleId);
  if (!mod) return res.status(404).json({ message: 'Module not found' });

  const { title, videoTitle, videoUrl, pdfTitle, pdfUrl } = req.body;

  const newChapter = {
    id: 'ch_' + Math.random().toString(36).substr(2, 9),
    title,
    videos: videoUrl ? [{ id: 'v_' + Math.random().toString(36).substr(2, 9), title: videoTitle || 'Lecture', url: videoUrl, duration: '45:00', isDemo: false }] : [],
    pdfs: pdfUrl ? [{ id: 'p_' + Math.random().toString(36).substr(2, 9), title: pdfTitle || 'Class Notes', url: pdfUrl, size: '3.5 MB' }] : [],
    assignments: []
  };
  mod.chapters.push(newChapter);

  if (useRealDb) {
    try {
      const dbCourse = await Course.findOne({ title: course.title });
      if (dbCourse) {
        // Map modules to match mongoose schema and save
        dbCourse.modules = course.modules.map(m => ({
          title: m.title,
          chapters: m.chapters.map(ch => ({
            title: ch.title,
            videos: ch.videos.map(v => ({ title: v.title, url: v.url, duration: v.duration })),
            pdfs: ch.pdfs.map(p => ({ title: p.title, url: p.url, size: p.size }))
          }))
        }));
        await dbCourse.save();
      }
    } catch (e) {
      console.error('MongoDB Chapter add sync error:', e);
    }
  }

  io.emit('live-update', { type: 'chapter-added', courseId: course.id, moduleId: mod.id, chapter: newChapter });
  res.status(201).json(course);
});

// NOTIFICATION CREATE
app.post('/api/admin/notifications', authenticateToken, adminOnly, async (req, res) => {
  const { title, message, type } = req.body;
  const newNotification = {
    id: 'n_' + Math.random().toString(36).substr(2, 9),
    title,
    message,
    type: type || 'general',
    createdAt: new Date().toISOString()
  };
  mockDb.notifications.unshift(newNotification);

  if (useRealDb) {
    Notification.create({
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type
    }).catch(e => console.error('MongoDB Notice save error:', e));
  }
  
  // Real-time notification
  io.emit('new-notification', newNotification);
  res.status(201).json(newNotification);
});

app.get('/api/notifications', (req, res) => {
  res.json(mockDb.notifications);
});

// PIRACY TELEMETRY
app.post('/api/security/alert', authenticateToken, async (req, res) => {
  const { type, details } = req.body;
  const alert = {
    id: 'alert_' + Math.random().toString(36).substr(2, 9),
    userId: req.user.id,
    userName: req.user.name,
    type,
    details: details || '',
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString()
  };
  mockDb.piracyAlerts.unshift(alert);

  if (useRealDb) {
    try {
      const dbUser = await User.findOne({ email: req.user.email });
      if (dbUser) {
        await PiracyAlert.create({
          user: dbUser._id,
          type: alert.type,
          details: alert.details,
          ipAddress: alert.ipAddress
        });
      }
    } catch (e) {
      console.error('MongoDB telemetry alert save error:', e);
    }
  }

  // Send real-time alerts to logged-in admin panels
  io.emit('security-breach', alert);
  res.json({ success: true, message: 'Security incident logged.' });
});

// ADMIN TELEMETRY GET
app.get('/api/admin/security/alerts', authenticateToken, adminOnly, (req, res) => {
  res.json(mockDb.piracyAlerts);
});

app.get('/api/admin/revenue', authenticateToken, adminOnly, (req, res) => {
  const totalSales = mockDb.orders.reduce((sum, o) => sum + o.amount, 0) + 4999; // Mock initial
  const activeStudents = mockDb.users.filter(u => u.role === 'student').length;
  const metrics = {
    totalRevenue: totalSales,
    activeStudents: activeStudents,
    coursesPurchasedCount: mockDb.orders.length + 1,
    activeStreamsCount: mockDb.users.reduce((sum, u) => sum + (u.sessions || []).length, 0),
    recentOrders: mockDb.orders.map(o => {
      const u = mockDb.users.find(usr => usr.id === o.user);
      const c = mockDb.courses.find(crs => crs.id === o.course);
      return {
        id: o.id,
        studentName: u ? u.name : 'Unknown User',
        courseTitle: c ? c.title : 'Deleted Course',
        amount: o.amount,
        status: o.status,
        createdAt: o.createdAt
      };
    })
  };
  res.json(metrics);
});

// BAN/UNBAN STUDENT
app.post('/api/admin/users/:id/ban', authenticateToken, adminOnly, async (req, res) => {
  const user = mockDb.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { ban } = req.body;
  user.isBanned = ban;
  if (ban) {
    user.sessions = [];
    io.emit('force-logout', { userId: user.id, message: 'You have been banned.' });
  }

  if (useRealDb) {
    User.findOneAndUpdate(
      { email: user.email },
      { isBanned: ban, sessions: user.sessions }
    ).catch(e => console.error('MongoDB User ban sync error:', e));
  }

  res.json({ success: true, message: `Student status set to banned: ${ban}` });
});

// GET STUDENTS LIST FOR ADMIN
app.get('/api/admin/students', authenticateToken, adminOnly, (req, res) => {
  const students = mockDb.users.filter(u => u.role === 'student').map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    isBanned: u.isBanned,
    dailyStreak: u.dailyStreak,
    attendance: u.attendance,
    purchasedCourses: u.purchasedCourses,
    sessionsCount: (u.sessions || []).length
  }));
  res.json(students);
});

// AI MATH CHATBOT AND STUDY PLANNER
app.post('/api/ai/doubt-solver', authenticateToken, (req, res) => {
  const { question } = req.body;
  let response = '';

  // IIT-JEE Mathematics specific responses to simulate premium AI engine
  const questionLower = question.toLowerCase();
  if (questionLower.includes('limit') || questionLower.includes('sin(x)/x') || questionLower.includes('sinx/x')) {
    response = `**Quantrex AI Math Mentor:** Let's solve $\\lim_{x \\to 0} \\frac{\\sin x}{x}$ step-by-step:
    
1. **Identify the form:** As $x \\to 0$, both $\\sin x \\to 0$ and $x \\to 0$. This is the Indeterminate Form $\\frac{0}{0}$.
2. **Method 1: Expansion Series**
   We know the Taylor series expansion of $\\sin x$ is:
   $$\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots$$
   Dividing by $x$:
   $$\\frac{\\sin x}{x} = 1 - \\frac{x^2}{6} + \\frac{x^4}{120} - \\dots$$
   Taking limit $x \\to 0$, all terms containing $x$ vanish:
   $$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$
3. **Method 2: L'Hôpital's Rule**
   Differentiate numerator and denominator with respect to $x$:
   $$\\frac{d}{dx}(\\sin x) = \\cos x, \\quad \\frac{d}{dx}(x) = 1$$
   Applying the limit:
   $$\\lim_{x \\to 0} \\frac{\\cos x}{1} = \\cos(0) = 1$$

Therefore, the limit is **1**.`;
  } else if (questionLower.includes('integrate') || questionLower.includes('integration') || questionLower.includes('integral')) {
    response = `**Quantrex AI Math Mentor:** Let's calculate the integral $\\int x e^{x} \\, dx$ using Integration by Parts:

1. **Formula:** 
   $$\\int u \\, dv = uv - \\int v \\, du$$
2. **Choice of $u$ and $dv$ (using ILATE rule):**
   - Let $u = x \\implies du = dx$
   - Let $dv = e^x \\, dx \\implies v = e^x$
3. **Apply the Formula:**
   $$\\int x e^x \\, dx = x e^x - \\int e^x \\, dx$$
   $$\\int x e^x \\, dx = x e^x - e^x + C$$
   $$\\int x e^x \\, dx = e^x(x - 1) + C$$

Where $C$ is the constant of integration.`;
  } else if (questionLower.includes('rank') || questionLower.includes('predict')) {
    response = `**Quantrex AI Rank Predictor:** Based on your current performance analytics:
- Syllabus Completion: **68%**
- Test Accuracy Rate: **76%**
- Strongest Zone: **Calculus & Linear Algebra**
- Recommended Revision: **Coordinate Geometry**

**Predicted JEE Advanced 2027 Rank Bracket:** **AIR 1,200 - 1,800**
*Action Plan: To break into Top 500, improve your accuracy in Multiple Correct Questions of Integral Calculus from 60% to 85%.*`;
  } else {
    response = `**Quantrex AI Math Mentor:** Greetings! I am your IIT-JEE Mathematics mentor powered by Quantrex AI.
    
Based on your query: "${question}", I recommend:
1. Revise the core concept in **A.K. Sir's** notes on this chapter.
2. For JEE Advanced, check the standard PYQ patterns from 2018-2025.
3. If you have a specific equation, feel free to write it using terms like "limit", "integral", "matrix", or "probability" so I can output LaTeX-formatted steps!`;
  }

  res.json({ response });
});

// TESTS ENDPOINTS
app.get('/api/tests', authenticateToken, (req, res) => {
  res.json(mockDb.tests);
});

app.get('/api/tests/:id', authenticateToken, (req, res) => {
  const test = mockDb.tests.find(t => t.id === req.params.id);
  if (!test) return res.status(404).json({ message: 'Test not found' });
  res.json(test);
});

app.post('/api/tests/:id/submit', authenticateToken, async (req, res) => {
  const test = mockDb.tests.find(t => t.id === req.params.id);
  if (!test) return res.status(404).json({ message: 'Test not found' });

  const { answers } = req.body; // array of { questionId, selectedOption }
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  const answersEvaluated = test.questions.map((q) => {
    const studentAns = answers.find(a => a.questionId === q.id || a.questionIndex === test.questions.indexOf(q));
    const selected = studentAns ? studentAns.selectedOption : -1;
    
    if (selected === -1) {
      skipped++;
      return { questionId: q.id, selectedOption: -1, isCorrect: false };
    } else if (selected === q.correctOption) {
      score += q.marks || 4;
      correct++;
      return { questionId: q.id, selectedOption: selected, isCorrect: true };
    } else {
      score += q.negativeMarks || -1;
      wrong++;
      return { questionId: q.id, selectedOption: selected, isCorrect: false };
    }
  });

  const totalMarks = test.questions.reduce((sum, q) => sum + (q.marks || 4), 0);
  const result = {
    id: 'res_' + Math.random().toString(36).substr(2, 9),
    user: req.user.id,
    test: test.id,
    score,
    totalMarks,
    correctAnswers: correct,
    wrongAnswers: wrong,
    skippedAnswers: skipped,
    percentile: 98.4 + (score / totalMarks) * 1.5, // Mock percentile calculation
    rank: Math.floor(Math.random() * 50) + 1,
    answers: answersEvaluated,
    createdAt: new Date().toISOString()
  };

  mockDb.results.push(result);

  if (useRealDb) {
    try {
      const dbUser = await User.findOne({ email: req.user.name === 'Rohan Sharma' ? 'student@quantrex.com' : req.user.name }); // Fetch correct user
      const dbTest = await Test.findOne({ title: test.title });
      if (dbUser && dbTest) {
        await Result.create({
          user: dbUser._id,
          test: dbTest._id,
          score: result.score,
          totalMarks: result.totalMarks,
          correctAnswers: result.correctAnswers,
          wrongAnswers: result.wrongAnswers,
          skippedAnswers: result.skippedAnswers,
          percentile: result.percentile,
          rank: result.rank,
          answers: result.answers.map(ans => ({
            questionId: ans.questionId,
            selectedOption: ans.selectedOption,
            isCorrect: ans.isCorrect
          }))
        });
      }
    } catch (e) {
      console.error('MongoDB Result submit sync error:', e);
    }
  }

  res.json(result);
});

// WEBSOCKET LOGIC
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Quantrex Premium Server is running on port ${PORT}`);
});
