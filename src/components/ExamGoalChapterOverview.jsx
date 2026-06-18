import React, { useState } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Target from 'lucide-react/dist/esm/icons/target';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Filter from 'lucide-react/dist/esm/icons/filter';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Bookmark from 'lucide-react/dist/esm/icons/bookmark';

export default function ExamGoalChapterOverview({ chapter, onBack, onLaunchPractice }) {
  const [activeTab, setActiveTab] = useState('all');

  const stats = {
    correct: 0,
    wrong: 0,
    accuracy: '0%',
    timeSpent: '0h 0m'
  };

  const tabs = [
    { id: 'all', label: 'All Questions', count: 121 },
    { id: 'mistakes', label: 'Mistakes', count: 0 },
    { id: 'topic', label: 'Topic Wise' },
    { id: 'buckets', label: 'Buckets' },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'analytics', label: 'Analytics' }
  ];

  const questions = [
    { id: 1, text: "Let R be a relation on R, given by R = {(a, b): 3a - 3b + \\sqrt{7} is an irrational number}. Then R is", year: "JEE Main 2024", type: "Single Choice" },
    { id: 2, text: "If R is a relation on the set of natural numbers N defined by R = {(x, y) : x^2 - 4xy + 3y^2 = 0}, then R is", year: "JEE Main 2023", type: "Single Choice" },
    { id: 3, text: "Let S = {1, 2, 3, 4, 5, 6}. Then the number of one-one functions f: S -> S such that f(k) != k for exactly 3 values of k is", year: "JEE Main 2022", type: "Numerical" }
  ];

  return (
    <div className="bg-white min-h-full rounded-xl overflow-hidden flex flex-col font-sans">
      {/* Header Tabs */}
      <div className="border-b border-gray-200 bg-gray-50 flex items-center px-4 overflow-x-auto">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full mr-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === t.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                {t.count}
              </span>
            )}
            {t.icon && <t.icon className="w-4 h-4" />}
          </button>
        ))}
      </div>

      <div className="p-6 bg-gray-50/50 flex-1">
        {/* Stats Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{chapter.title || 'Sets and Relation'}</h2>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Correct</div>
                  <div className="text-lg font-bold text-gray-800">{stats.correct}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Wrong</div>
                  <div className="text-lg font-bold text-gray-800">{stats.wrong}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Accuracy</div>
                  <div className="text-lg font-bold text-gray-800">{stats.accuracy}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Time Spent</div>
                  <div className="text-lg font-bold text-gray-800">{stats.timeSpent}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 shrink-0">
            {/* onLaunchPractice(chapter, mode) -> mode can be 'test' or 'practice' */}
            <button 
              onClick={() => onLaunchPractice(chapter, 'test')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              Take Test
            </button>
            <button 
              onClick={() => onLaunchPractice(chapter, 'practice')}
              className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              Resume Practice
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            Difficulty <ChevronDown className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            Evaluation <ChevronDown className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            Question Types <ChevronDown className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2 ml-auto">
            <Filter className="w-4 h-4" /> All Filters
          </button>
        </div>

        {/* Question List Preview */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Question {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">{q.shift || q.title || q.year}</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium border border-blue-100">{q.type}</span>
                </div>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed font-medium">
                {q.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
