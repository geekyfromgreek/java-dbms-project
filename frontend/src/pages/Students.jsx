import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import SpotlightCard from '../components/SpotlightCard';
import { Edit2, Trash2, Check, X, UserPlus, Database } from 'lucide-react';

/**
 * Students Page
 * Demonstrates CRUD operations (Create, Read, Update, Delete) on the 'students' table.
 */
const Students = () => {
  // --- State Management ---
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ name: '', roll_number: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', roll_number: '' });
  const [loading, setLoading] = useState(true);

  // --- API Calls ---

  // Fetch all students (SELECT * FROM students)
  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle new student submission (INSERT INTO students)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.roll_number) return;
    
    try {
      await api.post('/students', formData);
      setFormData({ name: '', roll_number: '' });
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add student');
    }
  };

  // Handle student deletion (DELETE FROM students)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student? All related attendance and grades will also be removed.')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (error) {
      alert('Failed to delete student');
    }
  };

  // --- Inline Editing Logic ---
  const startEdit = (student) => {
    setEditingId(student.id);
    setEditData({ name: student.name, roll_number: student.roll_number });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', roll_number: '' });
  };

  // Save updated student (UPDATE students SET ...)
  const handleUpdate = async (id) => {
    try {
      await api.put(`/students/${id}`, editData);
      setEditingId(null);
      fetchStudents();
    } catch (error) {
      alert('Failed to update student');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Section */}
      <header className="opacity-0 animate-fade-in stagger-1">
        <h2 className="text-4xl font-black text-white tracking-tight">STUDENTS</h2>
        <div className="flex items-center gap-3 mt-2">
          <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
          <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">Manage student records (CRUD Operations)</p>
        </div>
      </header>

      {/* Add Student Form Section */}
      <SpotlightCard color="rgba(59, 130, 246, 0.2)" className="rounded-3xl overflow-hidden border border-white/5 opacity-0 animate-fade-in stagger-2">
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-2">
            <UserPlus size={20} className="text-blue-500" />
            Add New Student
          </h3>
          <form className="flex flex-wrap gap-6 items-end" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Full Name</label>
              <input 
                type="text" 
                className="bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-600 backdrop-blur-md"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Roll Number</label>
              <input 
                type="text" 
                className="bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-600 backdrop-blur-md"
                placeholder="e.g. 101"
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-500 shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2">
              <span>INSERT</span>
            </button>
          </form>
        </div>
      </SpotlightCard>

      {/* Database Table Section */}
      <SpotlightCard color="rgba(59, 130, 246, 0.1)" className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl opacity-0 animate-fade-in stagger-3">
        <div className="glass-card">
          <div className="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-white/[0.02]">
            <div>
              <h3 className="text-xl font-bold text-slate-100 italic tracking-tight flex items-center gap-2">
                <Database size={18} className="text-blue-400" />
                Database View: <span className="text-blue-400">students</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-mono">Real-time table representation</p>
            </div>
            <span className="text-[10px] font-black font-mono bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20 uppercase tracking-widest shadow-inner">
              SELECT * FROM students
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">ID (PK)</th>
                  <th className="px-8 py-5">Name</th>
                  <th className="px-8 py-5">Roll Number</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="4" className="px-8 py-12 text-center text-slate-500 animate-pulse">Loading data...</td></tr>
                ) : students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.05] transition-all duration-300 group">
                    <td className="px-8 py-5 text-blue-400 font-mono text-sm font-black tracking-tighter">{student.id.toString().padStart(3, '0')}</td>
                    <td className="px-8 py-5">
                      {editingId === student.id ? (
                        <input 
                          type="text" 
                          className="bg-black/40 border border-blue-500/30 rounded-lg px-3 py-1 text-slate-200 outline-none focus:border-blue-500 w-full"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          autoFocus
                        />
                      ) : (
                        <span className="text-slate-200 font-bold group-hover:pl-2 transition-all duration-500">{student.name}</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {editingId === student.id ? (
                        <input 
                          type="text" 
                          className="bg-black/40 border border-blue-500/30 rounded-lg px-3 py-1 text-slate-200 outline-none focus:border-blue-500 w-full"
                          value={editData.roll_number}
                          onChange={(e) => setEditData({ ...editData, roll_number: e.target.value })}
                        />
                      ) : (
                        <span className="text-slate-400 font-mono font-bold">{student.roll_number}</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === student.id ? (
                          <>
                            <button onClick={() => handleUpdate(student.id)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors" title="Save">
                              <Check size={16} />
                            </button>
                            <button onClick={cancelEdit} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors" title="Cancel">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(student)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors opacity-0 group-hover:opacity-100 transition-opacity" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(student.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors opacity-0 group-hover:opacity-100 transition-opacity" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-12 text-center text-slate-500 italic font-medium">The database table is currently empty.</td>
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

export default Students;
