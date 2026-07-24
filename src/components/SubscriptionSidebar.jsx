import React from 'react';
import { LayoutDashboard, FileText, BookOpen, GraduationCap, PlaySquare, User, MessageSquare, Ticket, Download } from 'lucide-react';

const SubscriptionSidebar = () => {
  const currentPath = '/dashboard';

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Tests', icon: <FileText size={18} />, path: '/dashboard/tests' },
    { name: 'Study Notes', icon: <BookOpen size={18} />, path: '/dashboard/notes' },
    { name: 'My Course', icon: <GraduationCap size={18} />, path: '/dashboard/courses' },
    { name: 'Video Classes', icon: <PlaySquare size={18} />, path: '/dashboard/videos' },
    { name: 'My Profile', icon: <User size={18} />, path: '/dashboard/profile' },
    { name: 'Contact Us', icon: <MessageSquare size={18} />, path: '/dashboard/contact' },
    { name: 'Redeem Coupon', icon: <Ticket size={18} />, path: '/dashboard/redeem' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed top-0 left-0">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 p-6 border-b border-gray-100">
        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-black text-xl italic">Q</div>
        <span className="font-bold text-lg">
          <span className="text-gray-800">Quantrex</span>
          <br/>
          <span className="text-green-500 text-xs tracking-wider uppercase font-black">eConnect</span>
        </span>
      </div>

      {/* Menu Options */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Features</div>
        
        <div className="px-4 mb-4">
          <div className="flex items-center gap-3 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg cursor-pointer">
             <div className="bg-purple-600 text-white p-1 rounded-md"><LayoutDashboard size={14} /></div>
             <span className="font-semibold text-sm flex-1">Quantrex AI</span>
             <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
          </div>
        </div>

        <div className="px-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">Menu</div>
        
        <ul className="space-y-1 px-4">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <li key={item.name}>
                <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <span className={isActive ? 'text-purple-600' : 'text-gray-400'}>{item.icon}</span>
                  {item.name}
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Download App Promo */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center mb-2">
              <Download size={16} className="text-white" />
            </div>
            <h4 className="font-bold text-sm mb-1">Download Our Mobile App</h4>
            <p className="text-xs text-purple-200 mb-3">Get easy access to all features.</p>
            <button className="w-full bg-white/20 hover:bg-white/30 transition-colors py-1.5 rounded text-xs font-bold">Download Now</button>
          </div>
          {/* Abstract circles */}
          <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full border-4 border-white/10"></div>
          <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full border-2 border-white/10"></div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSidebar;
