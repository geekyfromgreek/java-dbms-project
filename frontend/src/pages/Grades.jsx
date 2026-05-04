import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import SpotlightCard from '../components/SpotlightCard';
import { Edit2, Trash2, Check, X, GraduationCap, TableProperties, Plus } from 'lucide-react';

/**
 * Grades Page
 * Features a dynamic subject selection menu and full CRUD support for student marks.
 */
const Grades = () => {
  // --- State Management ---
  const [gradesRecords, setGradesRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({ student_id: '', subject: '', marks: '' });
  const [isNewSubject, setIsNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ subject: '', marks: '' });
  const [loading, setLoading] = useState(true);

  // --- API Calls ---

  // Fetch all required data (Grades, Students, and unique Subjects list)
  const fetchData = async () => {
    try {
      setLoading(true);
      const [gradesRes, studentsRes, subjectsRes] = await Promise.all([
        api.get('/grades'),
        api.get('/students'),
        api.get('/subjects')
      ]);
      setGradesRecords(gradesRes.data);
      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error fetching grades data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle grade submission (INSERT INTO grades)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSubject = isNewSubject ? newSubjectName : formData.subject;
    if (!formData.student_id || !finalSubject || formData.marks === '') return;

    try {
      await api.post('/grades', {
        student_id: parseInt(formData.student_id),
        subject: finalSubject,
        marks: parseInt(formData.marks),
      });
      // Reset form
      setFormData({ student_id: '', subject: '', marks: '' });
      setIsNewSubject(false);
      setNewSubjectName('');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add grade');
    }
  };

  // Handle grade deletion (DELETE FROM grades)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grade record?')) return;
    try {
      await api.delete(`/grades/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete grade');
    }
  };

  // --- Inline Editing Logic ---
  const startEdit = (record) => {
    setEditingId(record.id);
    setEditData({ subject: record.subject, marks: record.marks });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // Save updated grade (UPDATE grades SET ...)
  const handleUpdate = async (id) => {
    try {
      await api.put(`/grades/${id}`, editData);
      setEditingId(null);
      fetchData();
    } catch (error) {
      alert('Failed to update grade');
    }
  };

  // Handle subject dropdown change
  const handleSubjectChange = (e) => {
    const value = e.target.value;
    if (value === 'ADD_NEW') {
      setIsNewSubject(true);
      setFormData({ ...formData, subject: '' });
    } else {
      setIsNewSubject(false);
      setFormData({ ...formData, subject: value });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Section */}
      <header className="opacity-0 animate-fade-in stagger-1">
        <h2 className="text-4xl font-black text-white tracking-tight">GRADES</h2>
        <div className="flex items-center gap-3 mt-2">
          <div className="h-1 w-12 bg-purple-500 rounded-full"></div>
          <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">Record marks and list grades (CRUD Operations)</p>
        </div>
      </header>

      {/* Enter Marks Form Section */}
      <SpotlightCard color="rgba(168, 85, 247, 0.2)" className="rounded-3xl overflow-hidden border border-white/5 opacity-0 animate-fade-in stagger-2">
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6 text-purple-400 flex items-center gap-2">
            <GraduationCap size={20} className="text-purple-500" />
            Enter Subject Marks
          </h3>
          <form className="flex flex-wrap gap-6 items-end" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Select Student</label>
              <select 
                className="bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all backdrop-blur-md"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              >
                <option value="" className="bg-slate-900">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900">{s.name} ({s.roll_number})</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
               <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Subject</label>
               {isNewSubject ? (
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder-slate-600 backdrop-blur-md flex-1"
                      placeholder="Enter new subject..."
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      autoFocus
                    />
                    <button 
                      type="button" 
                      onClick={() => setIsNewSubject(false)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400"
                      title="Back to list"
                    >
                      <X size={18} />
                    </button>
                 </div>
               ) : (
                 <select 
                    className="bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all backdrop-blur-md"
                    value={formData.subject}
                    onChange={handleSubjectChange}
                  >
                    <option value="" className="bg-slate-900">-- Select Subject --</option>
                    {subjects.map(sub => (
                      <option key={sub} value={sub} className="bg-slate-900">{sub}</option>
                    ))}
                    <option value="ADD_NEW" className="bg-purple-900/50 text-purple-300 font-bold">+ Add New Subject</option>
                  </select>
               )}
            </div>

            <div className="flex flex-col gap-2 flex-1 min-w-[150px]">
               <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Marks Obtained</label>
              <input 
                type="number" 
                min="0"
                max="100"
                className="bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder-slate-600 backdrop-blur-md"
                placeholder="0 - 100"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
              />
            </div>
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-500 shadow-xl shadow-purple-500/20 active:scale-95 flex items-center gap-2">
              <span>INSERT</span>
            </button>
          </form>
        </div>
      </SpotlightCard>

      {/* Database Table Section */}
      <SpotlightCard color="rgba(168, 85, 247, 0.1)" className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl opacity-0 animate-fade-in stagger-3">
        <div className="glass-card">
          <div className="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-white/[0.02]">
            <div>
              <h3 className="text-xl font-bold text-slate-100 italic tracking-tight flex items-center gap-2">
                <TableProperties size={18} className="text-purple-400" />
                Database View: <span className="text-purple-400">grades JOIN students</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-mono">Relational data representation</p>
            </div>
            <span className="hidden md:inline-block text-[10px] font-black font-mono bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full border border-purple-500/20 uppercase tracking-widest shadow-inner">
              SELECT g.*, s.name FROM grades g JOIN students s
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">Record ID</th>
                  <th className="px-8 py-5">Student Name</th>
                  <th className="px-8 py-5">Subject</th>
                  <th className="px-8 py-5">Marks</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-500 animate-pulse">Fetching records...</td></tr>
                ) : gradesRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.05] transition-all duration-300 group">
                    <td className="px-8 py-5 text-purple-400 font-mono text-sm font-black tracking-tighter">GR-{record.id.toString().padStart(3, '0')}</td>
                    <td className="px-8 py-5 text-slate-200 font-bold group-hover:pl-4 transition-all duration-500">
                      {record.name}
                      <span className="text-[10px] text-slate-500 font-mono ml-2 block">ID: {record.roll_number}</span>
                    </td>
                    <td className="px-8 py-5 text-slate-400 font-medium uppercase tracking-tighter text-sm">
                      {editingId === record.id ? (
                        <input 
                          type="text" 
                          className="bg-black/40 border border-purple-500/30 rounded-lg px-2 py-1 text-slate-200 outline-none w-full"
                          value={editData.subject}
                          onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                        />
                      ) : (
                        record.subject
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {editingId === record.id ? (
                        <input 
                          type="number" 
                          className="bg-black/40 border border-purple-500/30 rounded-lg px-2 py-1 text-slate-200 outline-none w-20"
                          value={editData.marks}
                          onChange={(e) => setEditData({ ...editData, marks: e.target.value })}
                        />
                      ) : (
                        <>
                          <span className="font-black text-xl text-white tracking-tighter">{record.marks}</span>
                          <span className="text-slate-500 text-[10px] font-bold ml-1">/100</span>
                        </>
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
                            <button onClick={() => startEdit(record)} className="p-2 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-colors opacity-0 group-hover:opacity-100">
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
                {!loading && gradesRecords.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center text-slate-500 italic font-medium">No academic records found in the database.</td>
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

export default Grades;
