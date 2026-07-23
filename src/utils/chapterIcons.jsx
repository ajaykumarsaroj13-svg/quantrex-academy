import React from 'react';
import Functions from 'lucide-react/dist/esm/icons/function-square';
import Calculator from 'lucide-react/dist/esm/icons/calculator';
import Binary from 'lucide-react/dist/esm/icons/binary';
import Grid from 'lucide-react/dist/esm/icons/grid';
import Compass from 'lucide-react/dist/esm/icons/compass';
import Box from 'lucide-react/dist/esm/icons/box';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Atom from 'lucide-react/dist/esm/icons/atom';
import FlaskConical from 'lucide-react/dist/esm/icons/flask-conical';
import Flame from 'lucide-react/dist/esm/icons/flame';
import Magnet from 'lucide-react/dist/esm/icons/magnet';
import Scale from 'lucide-react/dist/esm/icons/scale';
import Sun from 'lucide-react/dist/esm/icons/sun';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Award from 'lucide-react/dist/esm/icons/award';
import PieChart from 'lucide-react/dist/esm/icons/pie-chart';

import logoMainsImg from '../assets/logo_mains.png';
import logoAdvancedImg from '../assets/logo_advanced.png';
import logoNdaImg from '../assets/logo_nda.png';
import logoImg from '../assets/logo.png';

/**
 * Returns a custom colorful Lucide icon component based on chapter or topic name
 */
export function getChapterIcon(chapterName = '', className = "w-5 h-5") {
  const name = String(chapterName).toLowerCase();

  if (name.includes('set') || name.includes('relation') || name.includes('function')) {
    return <Functions className={`${className} text-blue-400`} />;
  }
  if (name.includes('log') || name.includes('exponential')) {
    return <Calculator className={`${className} text-amber-400`} />;
  }
  if (name.includes('quadratic') || name.includes('equation')) {
    return <Binary className={`${className} text-emerald-400`} />;
  }
  if (name.includes('sequence') || name.includes('series') || name.includes('progression')) {
    return <Activity className={`${className} text-purple-400`} />;
  }
  if (name.includes('binomial') || name.includes('theorem')) {
    return <Sparkles className={`${className} text-pink-400`} />;
  }
  if (name.includes('matrix') || name.includes('determinant')) {
    return <Grid className={`${className} text-indigo-400`} />;
  }
  if (name.includes('complex') || name.includes('number')) {
    return <Compass className={`${className} text-cyan-400`} />;
  }
  if (name.includes('vector') || name.includes('3d') || name.includes('geometry')) {
    return <Box className={`${className} text-teal-400`} />;
  }
  if (name.includes('limit') || name.includes('derivative') || name.includes('integral') || name.includes('calculus')) {
    return <Zap className={`${className} text-yellow-400`} />;
  }
  if (name.includes('stat') || name.includes('probab')) {
    return <PieChart className={`${className} text-rose-400`} />;
  }
  if (name.includes('physic') || name.includes('motion') || name.includes('work') || name.includes('force') || name.includes('gravitat')) {
    return <Magnet className={`${className} text-sky-400`} />;
  }
  if (name.includes('optic') || name.includes('wave') || name.includes('light')) {
    return <Sun className={`${className} text-amber-300`} />;
  }
  if (name.includes('chem') || name.includes('organic') || name.includes('acid') || name.includes('base') || name.includes('element')) {
    return <FlaskConical className={`${className} text-emerald-300`} />;
  }
  if (name.includes('thermo') || name.includes('heat') || name.includes('energy')) {
    return <Flame className={`${className} text-orange-400`} />;
  }
  if (name.includes('atom') || name.includes('nuclear') || name.includes('structure')) {
    return <Atom className={`${className} text-violet-400`} />;
  }
  if (name.includes('gat') || name.includes('english') || name.includes('general')) {
    return <Shield className={`${className} text-emerald-500`} />;
  }
  if (name.includes('unit') || name.includes('measure')) {
    return <Scale className={`${className} text-blue-300`} />;
  }

  return <BookOpen className={`${className} text-blue-400`} />;
}

/**
 * Returns exam logo badge for JEE Main, JEE Advanced, or NDA
 */
export function getExamBadge(examKey = '', size = "w-6 h-6") {
  const exam = String(examKey).toLowerCase();
  if (exam.includes('advanced')) {
    return <img src={logoAdvancedImg} alt="JEE Advanced" className={`${size} rounded-full object-contain bg-white/10 p-0.5 border border-amber-400/40 shadow-sm`} />;
  }
  if (exam.includes('main')) {
    return <img src={logoMainsImg} alt="JEE Main" className={`${size} rounded-full object-contain bg-white/10 p-0.5 border border-blue-400/40 shadow-sm`} />;
  }
  if (exam.includes('nda')) {
    return <img src={logoNdaImg} alt="NDA" className={`${size} rounded-full object-contain bg-white/10 p-0.5 border border-emerald-400/40 shadow-sm`} />;
  }
  return <img src={logoImg} alt="Quantrex" className={`${size} rounded-full object-contain bg-white/10 p-0.5 border border-white/20 shadow-sm`} />;
}
