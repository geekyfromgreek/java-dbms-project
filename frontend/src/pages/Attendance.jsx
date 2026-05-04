import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import SpotlightCard from '../components/SpotlightCard';
import { Edit2, Trash2, Check, X, CalendarCheck, ClipboardList } from 'lucide-react';

/**
 * Attendance Page
 * Manages student attendance records using JOIN queries to display student names.
 */
const Attendance = () => {
  // --- State Management ---
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ 
    student_id: '', 
    date: new Date().toISOString().split('T')[0], 
    status: 'Present' 
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ status: 'Present', date: '' });
  const [loading, setLoading] = useState(true);

  // --- API Calls ---

  // Fetch attendance records and student list
  const fetchData = async () => {
    try {
      setLoading(true);
      const [attRes, stdRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/students')
      ]);
      setAttendanceRecords(attRes.data);
      setStudents(stdRes.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle marking attendance (INSERT INTO attendance)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.date || !formData.status) return;
    
    try {
      await api.post('/attendance', formData);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to mark attendance');
    }
  };

  // Handle record deletion (DELETE FROM attendance)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      await api.delete(`/attendance/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete attendance');
    }
  };

  // --- Inline Editing Logic ---
  const startEdit = (record) => {
    setEditingId(record.id);
    setEditData({ status: record.status, date: record.date.split('T')[0] });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // Save updated record (UPDATE attendance SET ...)
  const handleUpdate = async (id) => {
    try {
      await api.put(`/attendance/${id}`, editData);
      setEditingId(null);
      fetchData();
    } catch (error) {
      alert('Failed to update attendance');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Section */}
      <header className="opacity-0 animate-fade-in stagger-1">
        <h2 className="text-4xl font-black text-white tracking-tight">ATTENDANCE</h2>
        <div className="flex items-center gap-3 mt-2">
          <div className="h-1 w-12 bg-emerald-500 rounded-full"></div>
          <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">Mark daily attendance and list records (CRUD Operations)</p>
        </div>
      </header>

      {/* Mark Attendance Form Section */}
      <SpotlightCard color="rgba(16, 185, 129, 0.2)" className="rounded-3xl overflow-hidden border border-white/5 opacity-0 animate-fade-in stagger-2">
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6 text-emerald-400 flex items-center gap-2">
            <CalendarCheck size={20} className="text-emerald-500" />
            Record Attendance
          </h3>
          <form className="flex flex-wrap gap-6 items-end" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Select Student</label>
              <select 
                className="bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all backdrop-blur-md"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              >
                <option value="" className="bg-slate-900">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900">{s.name} ({s.roll_number})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
               <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Date</label>
              <input 
                type="date" 
                className="bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all backdrop-blur-md"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-[150px]">
               <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Status</label>
              <select 
                className="bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all backdrop-blur-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Present" className="bg-slate-900">Present</option>
                <option value="Absent" className="bg-slate-900">Absent</option>
              </select>
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-500 shadow-xl shadow-emerald-500/20 active:scale-95">
              <span>INSERT</span>
            </button>
          </form>
        </div>
      </SpotlightCard>

      {/* Attendance Table Section */}
      <SpotlightCard color="rgba(16, 185, 129, 0.1)" className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl opacity-0 animate-fade-in stagger-3">
        <div className="glass-card">
          <div className="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-white/[0.02]">
            <div>
              <h3 className="text-xl font-bold text-slate-100 italic tracking-tight flex items-center gap-2">
                <ClipboardList size={18} className="text-emerald-400" />
                Database View: <span className="text-emerald-400">attendance</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-mono">Real-time attendance tracking</p>
            </div>
            <span className="hidden lg:inline-block text-[10px] font-black font-mono bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 uppercase tracking-widest shadow-inner">
              SELECT a.*, s.name FROM attendance a JOIN students s
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">Record ID</th>
                  <th className="px-8 py-5">Student Name</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-500 animate-pulse">Synchronizing database...</td></tr>
                ) : attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.05] transition-all duration-300 group">
                    <td className="px-8 py-5 text-emerald-400 font-mono text-sm font-black tracking-tighter">ATT-{record.id.toString().padStart(3, '0')}</td>
                    <td className="px-8 py-5 text-slate-200 font-bold group-hover:pl-4 transition-all duration-500">{record.name}</td>
                    <td className="px-8 py-5 text-slate-400 font-mono text-sm font-bold tracking-tighter">
                      {editingId === record.id ? (
                        <input 
                          type="date" 
                          className="bg-black/40 border border-emerald-500/30 rounded-lg px-2 py-1 text-slate-200 outline-none"
                          value={editData.date}
                          onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        />
                      ) : (
                        new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {editingId === record.id ? (
                        <select 
                          className="bg-black/40 border border-emerald-500/30 rounded-lg px-2 py-1 text-slate-200 outline-none"
                          value={editData.status}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        >
                          <option value="Present" className="bg-slate-900">Present</option>
                          <option value="Absent" className="bg-slate-900">Absent</option>
                        </select>
                      ) : (
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'}`}>
                          {record.status}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex justify-end gap-2">
                        {editingId === record.id ? (
                          <>
                            <button onClick={() => handleUpdate(record.id)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors">
                              <Check size={16} />
                            </button>
                            <button onClick={cancelEdit} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(record)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors opacity-0 group-hover:opacity-100">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(record.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && attendanceRecords.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center text-slate-500 italic font-medium">No records found in the attendance register.</td>
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

export default Attendance;
