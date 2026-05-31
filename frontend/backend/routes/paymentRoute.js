import express from 'express';
import Razorpay from 'razorpay';
import Stripe from 'stripe';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, Course, Order } from '../models/schemas.js';

export const paymentRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'quantrex_super_secret_key_2026';

// Local JWT Authentication Middleware
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

// ==========================================
// 1. RAZORPAY PAYMENT GATEWAY INTEGRATION
// ==========================================

// Create Razorpay Order
paymentRouter.post('/razorpay/create-order', authenticateToken, async (req, res) => {
  const { courseId } = req.body;
  
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      // Fallback local search if Mongoose is not used
      return res.status(404).json({ message: 'Course not found' });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      // Return simulation flags if keys are missing (developer sandbox mode)
      return res.json({
        simulated: true,
        amount: course.price * 100,
        currency: 'INR',
        receipt: 'rec_' + Math.random().toString(36).substr(2, 9)
      });
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    const options = {
      amount: course.price * 100, // amount in paisa
      currency: 'INR',
      receipt: 'rec_order_' + Math.random().toString(36).substr(2, 9)
    };

    const order = await razorpay.orders.create(options);
    res.json({ ...order, simulated: false });

  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay payment order' });
  }
});

// Verify Razorpay Payment Signature (Security Webhook)
paymentRouter.post('/razorpay/verify-signature', authenticateToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_secret) {
    // Sandbox simulated verification
    return res.json({ success: true, message: 'Simulated payment verified' });
  }

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Grant course access to student
      const user = await User.findById(req.user.id);
      const course = await Course.findById(courseId);
      
      if (user && course) {
        // Save Order log
        await Order.create({
          user: user._id,
          course: course._id,
          amount: course.price,
          status: 'completed',
          paymentProvider: 'Razorpay',
          transactionId: razorpay_payment_id,
          signature: razorpay_signature
        });

        // Add to user course references
        await User.findByIdAndUpdate(user._id, {
          $addToSet: { purchasedCourses: course._id }
        });
      }

      res.json({ success: true, message: 'Payment signature verified successfully.' });
    } else {
      res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }
  } catch (error) {
    console.error('Razorpay Signature Verification Error:', error);
    res.status(500).json({ message: 'Failed to verify Razorpay signature' });
  }
});

// ==========================================
// 2. STRIPE PAYMENT GATEWAY INTEGRATION
// ==========================================

// Create Stripe Checkout Session
paymentRouter.post('/stripe/create-checkout', authenticateToken, async (req, res) => {
  const { courseId, successUrl, cancelUrl } = req.body;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!stripeSecret) {
      // Standalone simulation checkout
      return res.json({
        simulated: true,
        checkoutUrl: successUrl || '/dashboard'
      });
    }

    const stripe = new Stripe(stripeSecret);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: course.title,
            description: course.description
          },
          unit_amount: course.price * 100
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: successUrl || 'http://localhost:3000/student-dashboard',
      cancel_url: cancelUrl || 'http://localhost:3000/',
      metadata: {
        userId: req.user.id,
        courseId: courseId
      }
    });

    res.json({ id: session.id, checkoutUrl: session.url, simulated: false });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ message: 'Failed to initiate Stripe Checkout Session' });
  }
});

// Stripe Webhook Endpoint (Listens for checkout.session.completed)
paymentRouter.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !webhookSecret) {
    return res.status(400).send('Stripe Keys not configured.');
  }

  const stripe = new Stripe(stripeSecret);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe Webhook Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const courseId = session.metadata.courseId;

    try {
      const user = await User.findById(userId);
      const course = await Course.findById(courseId);

      if (user && course) {
        // Save Order
        await Order.create({
          user: user._id,
          course: course._id,
          amount: course.price,
          status: 'completed',
          paymentProvider: 'Stripe',
          transactionId: session.id
        });

        // Add to user course references
        await User.findByIdAndUpdate(userId, {
          $addToSet: { purchasedCourses: course._id }
        });
      }
    } catch (e) {
      console.error('Error updating purchase reference during Stripe webhook:', e);
    }
  }

  res.json({ received: true });
});
