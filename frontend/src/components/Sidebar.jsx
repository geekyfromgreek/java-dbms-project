import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Users, CalendarCheck, GraduationCap, BarChart3, Sparkles } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

const Sidebar = () => {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const navItems = [
    { to: '/students', icon: <Users size={20} />, label: 'Students', color: 'rgba(59, 130, 246, 0.4)' },
    { to: '/attendance', icon: <CalendarCheck size={20} />, label: 'Attendance', color: 'rgba(16, 185, 129, 0.4)' },
    { to: '/grades', icon: <GraduationCap size={20} />, label: 'Grades', color: 'rgba(168, 85, 247, 0.4)' },
    { to: '/reports', icon: <BarChart3 size={20} />, label: 'Reports', color: 'rgba(245, 158, 11, 0.4)' },
    { to: '/query', icon: <Sparkles size={20} />, label: 'AI Query', color: 'rgba(139, 92, 246, 0.4)' },
  ];

  useEffect(() => {
    const currentIdx = navItems.findIndex(item => location.pathname === item.to);
    if (currentIdx !== -1) setActiveIndex(currentIdx);
  }, [location.pathname]);

  const currentIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  return (
    <aside className="w-66 glass-panel border-r border-white/5 h-screen sticky top-0 flex gap-1 flex-col z-20">
      <div className="p-8 pb-4">
        <h1 className="text-2xl font-black bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent tracking-tight">
          STUDENT DBMS
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-[2px] w-8 bg-blue-500 rounded-full"></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Management System</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-8 relative" onMouseLeave={() => setHoveredIndex(null)}>
        {/* The Magnifying Lens */}
        <div 
          className="menu-lens"
          style={{ 
            top: `${currentIndex * 64}px`, 
            opacity: 1,
            '--spotlight-color': navItems[currentIndex]?.color || 'rgba(255,255,255,0.1)'
          }}
        ></div>

        <div className="space-y-3 relative z-10">
          {navItems.map((item, index) => (
            <NavLink 
              key={item.to} 
              to={item.to}
              onMouseEnter={() => setHoveredIndex(index)}
              className={({ isActive }) => `block h-[52px] ${currentIndex === index ? 'magnified' : ''}`}
            >
              <SpotlightCard 
                mode="item" 
                color={item.color}
                className="rounded-xl h-full flex items-center"
              >
                <div className={`flex items-center gap-4 px-4 py-3 w-full transition-all duration-500 magnify-content ${currentIndex === index ? 'text-white' : 'text-slate-400'}`}>
                  <div className={`magnify-icon transition-all duration-500 ${currentIndex === index ? 'text-blue-400' : ''}`}>
                    {item.icon}
                  </div>
                  <span className="font-bold tracking-wide uppercase text-xs">{item.label}</span>
                </div>
              </SpotlightCard>
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="p-4 m-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-2xl">
        <div className="text-sm text-slate-400">
          <p className="font-bold text-slate-200 mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            System Status
          </p>
          <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5 shadow-inner">
            <span className="text-[9px] font-black font-mono text-slate-500 uppercase">Database</span>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-emerald-400 uppercase">Live</span>
               <div className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
