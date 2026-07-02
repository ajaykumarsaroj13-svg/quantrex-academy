import { connectToDatabase, User } from './utils/db.js';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, name, fatherName, email, phone, password, studentClass, targetExam, otp } = req.body;

  try {
    await connectToDatabase();

    // 1. SIGNUP / REGISTER
    if (action === 'register') {
      if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: 'Name, email, phone, and password are required' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email or phone number already exists' });
      }

      const newUser = new User({
        name,
        fatherName,
        email,
        phone,
        password: hashPassword(password),
        classLevel: studentClass || '12th',
        targetExam: targetExam || 'JEE Main'
      });

      await newUser.save();

      // Return user data (omit password)
      const userResponse = newUser.toObject();
      delete userResponse.password;

      return res.status(201).json({
        token: `jwt_session_${newUser._id}_${Date.now()}`,
        user: userResponse
      });
    }

    // 2. PASSWORD LOGIN
    if (action === 'login') {
      if (!phone || !password) {
        return res.status(400).json({ error: 'Phone number and password are required' });
      }

      const user = await User.findOne({ phone });
      if (!user || user.password !== hashPassword(password)) {
        return res.status(400).json({ error: 'Invalid phone number or password' });
      }

      // Update last active
      user.lastActive = new Date();
      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(200).json({
        token: `jwt_session_${user._id}_${Date.now()}`,
        user: userResponse
      });
    }

    // 3. OTP LOGIN (Simulated or verified)
    if (action === 'login-otp') {
      if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
      }

      // Demo OTP is 7892
      if (otp !== '7892') {
        return res.status(400).json({ error: 'Invalid OTP code' });
      }

      let user = await User.findOne({ phone });
      
      // If user does not exist, create a new one automatically for quick onboarding
      if (!user) {
        user = new User({
          name: 'Premium Student',
          phone,
          email: `${phone}@quantrex.com`,
          password: hashPassword('dummy_otp_pass')
        });
        await user.save();
      } else {
        user.lastActive = new Date();
        await user.save();
      }

      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(200).json({
        token: `jwt_session_${user._id}_${Date.now()}`,
        user: userResponse
      });
    }

    return res.status(400).json({ error: 'Invalid action parameter' });

  } catch (err) {
    console.error('Auth API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
