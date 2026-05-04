import React, { useState } from 'react';
import api from '../utils/api';
import { Sparkles, AlertCircle, Database, CheckCircle2, Code2, Send, Loader2 } from 'lucide-react';

const CustomQuery = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [results, setResults] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSQL, setShowSQL] = useState(false);

  const handleQuery = async (overridePrompt = null) => {
    const currentPrompt = overridePrompt || prompt;
    
    if (!currentPrompt.trim()) {
      setError('Please type a question or SQL query.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    setResults(null);
    setColumns([]);
    setGeneratedSQL('');
    setShowSQL(false);

    try {
      const response = await api.post('/ai-query', { prompt: currentPrompt });
      const data = response.data;
      
      setGeneratedSQL(data.sql || '');
      setShowSQL(true);

      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        setColumns(Object.keys(data.results[0]));
        setResults(data.results);
        setSuccess(`${data.results.length} row(s) returned.`);
      } else {
        setResults([]);
        setSuccess('Query executed successfully. 0 rows returned.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong.');
      if (err.response?.data?.sql) {
        setGeneratedSQL(err.response.data.sql);
        setShowSQL(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
            <Sparkles size={32} className="text-violet-400" />
            Query Assistant
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Ask questions in plain English or type raw SQL queries.</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10">
          <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
            What do you want to know?
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='e.g. "Show all students" or "SELECT * FROM grades"'
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-slate-200 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-600"
              disabled={loading}
            />
            <button
              onClick={() => handleQuery()}
              disabled={loading}
              className="btn-primary bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {loading ? 'Executing...' : 'Run Query'}
            </button>
          </div>

          {/* Example prompts */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              'Show all students',
              'Who is the top student',
              'Show me the grading list',
              'Attendance summary',
              'Average marks per subject'
            ].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setPrompt(example);
                  handleQuery(example);
                }}
                className="text-xs bg-white/5 hover:bg-violet-500/10 text-slate-400 hover:text-violet-300 px-3 py-1.5 rounded-lg border border-white/5 hover:border-violet-500/20 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated SQL */}
      {showSQL && generatedSQL && (
        <div className="glass-panel rounded-2xl p-5 border border-white/10 animate-fade-in">
          <button 
            onClick={() => setShowSQL(!showSQL)}
            className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider mb-3"
          >
            <Code2 size={16} className="text-violet-400" />
            Generated SQL
          </button>
          <pre className="bg-black/50 rounded-xl p-4 text-sm text-violet-300 font-mono overflow-x-auto border border-white/5">
            {generatedSQL}
          </pre>
        </div>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl flex items-start gap-3 backdrop-blur-md animate-fade-in">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm">Error</h4>
            <p className="text-sm mt-1 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-xl flex items-center gap-3 backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="shrink-0" size={20} />
          <p className="font-bold text-sm">{success}</p>
        </div>
      )}

      {/* Results Table */}
      {results && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col animate-fade-in">
           <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Database size={16} className="text-violet-400" />
                Results
              </h3>
           </div>
           
           <div className="p-0 overflow-x-auto">
             {results.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      {columns.map((col, index) => (
                        <th key={index} className="px-6 py-4 border-b border-white/5 text-xs font-black text-slate-400 uppercase tracking-wider bg-black/20 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-white/[0.02] transition-colors group">
                        {columns.map((col, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                            {row[col] === null ? (
                              <span className="text-slate-600 italic">NULL</span>
                            ) : typeof row[col] === 'object' ? (
                              JSON.stringify(row[col])
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
             ) : (
               <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                  <Database size={48} className="mb-4 opacity-20" />
                  <p>No results to display.</p>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

export default CustomQuery;
