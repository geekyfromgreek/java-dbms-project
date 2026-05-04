import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import SpotlightCard from '../components/SpotlightCard';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [reportsRes, studentsRes] = await Promise.all([
        api.get('/reports'),
        api.get('/students')
      ]);
      // Sort by avg marks descending for ranking
      const sorted = reportsRes.data.sort((a, b) => (b.avg_marks || 0) - (a.avg_marks || 0));
      setReports(sorted);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const topPerformer = reports.length > 0 ? reports[0] : null;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="opacity-0 animate-fade-in stagger-1">
        <h2 className="text-4xl font-black text-white tracking-tight">REPORTS</h2>
        <div className="flex items-center gap-3 mt-2">
          <div className="h-1 w-12 bg-amber-500 rounded-full"></div>
          <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">Analytics and Performance aggregation (COUNT, AVG, GROUP BY)</p>
        </div>
      </header>

      {/* Top Cards for summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SpotlightCard color="rgba(99, 102, 241, 0.2)" className="rounded-3xl border border-white/5 opacity-0 animate-fade-in stagger-2">
          <div className="glass-card p-8 flex items-center justify-between">
            <div>
               <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Total Students</p>
               <h4 className="text-4xl font-black text-white">{students.length}</h4>
               <p className="text-[10px] text-slate-500 mt-4 font-mono uppercase tracking-tighter">SELECT COUNT(id)</p>
            </div>
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 rotate-12">
               <span className="text-indigo-400 text-2xl font-black">#</span>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard color="rgba(245, 158, 11, 0.2)" className="rounded-3xl border border-white/5 opacity-0 animate-fade-in stagger-3">
          <div className="glass-card p-8 flex items-center justify-between">
            <div>
               <p className="text-amber-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Top Performer</p>
               <h4 className="text-2xl font-black text-white truncate max-w-[140px]">{topPerformer ? topPerformer.name : '—'}</h4>
               <p className="text-[10px] text-slate-500 mt-4 font-mono uppercase tracking-tighter">ORDER BY marks DESC</p>
            </div>
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 rotate-12">
               <span className="text-amber-400 text-2xl font-black">★</span>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard color="rgba(16, 185, 129, 0.2)" className="rounded-3xl border border-white/5 opacity-0 animate-fade-in stagger-4">
          <div className="glass-card p-8 flex items-center justify-between">
            <div>
               <p className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Avg Attendance</p>
               <h4 className="text-4xl font-black text-white">
                {reports.length > 0 
                  ? (reports.reduce((sum, r) => sum + (parseFloat(r.attendance_percentage) || 0), 0) / reports.length).toFixed(1) + '%'
                  : '—'
                }
               </h4>
               <p className="text-[10px] text-slate-500 mt-4 font-mono uppercase tracking-tighter">AVG(percentage)</p>
            </div>
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 rotate-12">
               <span className="text-emerald-400 text-2xl font-black">✓</span>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Reports Table */}
      <SpotlightCard color="rgba(245, 158, 11, 0.1)" className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl opacity-0 animate-fade-in stagger-5">
        <div className="glass-card">
          <div className="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-white/[0.02]">
            <div>
              <h3 className="text-xl font-bold text-slate-100 italic tracking-tight">Consolidated <span className="text-amber-400">Database Analytics</span></h3>
              <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-tighter">Aggregated relational view</p>
            </div>
            <span className="text-[10px] font-black font-mono bg-amber-500/10 text-amber-400 px-4 py-2 rounded-full border border-amber-500/20 uppercase tracking-[0.2em] shadow-inner">
              SELECT ... GROUP BY student_id
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">Rank</th>
                  <th className="px-8 py-5">Student Discovery</th>
                  <th className="px-8 py-5">Attendance Velocity</th>
                  <th className="px-8 py-5">Avg Marks</th>
                  <th className="px-8 py-5 text-center">Modules</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-500 animate-pulse">Running complex aggregation...</td></tr>
                ) : reports.map((report, index) => (
                  <tr key={report.id} className="hover:bg-white/[0.05] transition-all duration-300 group">
                    <td className="px-8 py-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-500 ${index === 0 ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110' : index === 1 ? 'bg-slate-300 text-black' : index === 2 ? 'bg-amber-800 text-white' : 'bg-white/5 text-slate-400'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-200 font-bold group-hover:pl-10 transition-all duration-500">
                      {report.name} 
                      <span className="text-[10px] text-slate-500 font-mono ml-2 block uppercase tracking-tighter">Roll: {report.roll_number}</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[120px] bg-white/5 rounded-full h-1.5 overflow-hidden">
                             <div 
                               className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${
                                 parseFloat(report.attendance_percentage) >= 75 ? 'bg-emerald-500 text-emerald-500' 
                                 : parseFloat(report.attendance_percentage) >= 50 ? 'bg-amber-500 text-amber-500' 
                                 : 'bg-rose-500 text-rose-500'
                               }`}
                               style={{ width: `${report.attendance_percentage || 0}%`}}
                             ></div>
                          </div>
                          <span className="text-sm font-black text-slate-300 font-mono">
                            {report.attendance_percentage != null ? parseFloat(report.attendance_percentage).toFixed(1) : '0.0'}%
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-amber-400 text-lg font-black tracking-tighter">
                          {report.avg_marks != null ? parseFloat(report.avg_marks).toFixed(1) : '—'}
                        </span>
                        <div className="w-12 h-1 bg-amber-400/20 rounded-full mt-1"></div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-slate-500 text-[10px] font-black font-mono border border-white/5 px-3 py-1.5 rounded-lg bg-white/[0.02]">
                        {report.subjects_count || 0} ITEMS
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && reports.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center text-slate-500 italic font-medium">The data warehouse is currently empty.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
};

export default Reports;
