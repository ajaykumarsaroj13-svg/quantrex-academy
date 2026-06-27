import React from 'react';
import { renderToString } from 'react-dom/server';
import AdminDashboard from './src/pages/AdminDashboard.jsx';

try {
  console.log('Render:', renderToString(React.createElement(AdminDashboard, {
    user: {name: 'Admin'},
    courses: [],
    syllabus: {},
    toppers: []
  })));
} catch (e) {
  console.error('CRASH:', e);
}
