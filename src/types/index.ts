export interface User {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  role: 'student' | 'admin' | 'teacher';
  avatar?: string;
  enrolledCourseIds?: string[];
  streakDays?: number;
  xpPoints?: number;
  hasPurchasedUltimate?: boolean;
}

export interface Question {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  subject?: 'Physics' | 'Chemistry' | 'Mathematics' | 'General';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface TestSeries {
  id: string;
  title: string;
  examType: 'JEE Main' | 'JEE Advanced' | 'NEET' | 'CUET' | 'Class 12' | 'Class 11' | 'Class 10' | 'Class 9' | 'NDA';
  durationMinutes: number;
  totalMarks: number;
  questionCount: number;
  questions: Question[];
}

export interface AttemptResult {
  testId: string;
  userId: string;
  score: number;
  totalMarks: number;
  accuracyPercentage: number;
  predictedAIR?: number;
  percentile?: number;
  timeSpentSeconds: number;
  submittedAt: string;
  answers: Record<number, number | string>;
}

export interface CourseBatch {
  id: string;
  title: string;
  subtitle: string;
  examCategory: string;
  priceINR: number;
  originalPriceINR: number;
  instructorName: string;
  features: string[];
}
