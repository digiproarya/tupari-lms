import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BookOpen, Calendar, Target, GitBranch, FileText, Plus, Edit2, Eye, Download, Loader2, Database, Save } from 'lucide-react';

type SubTab = 'kalender' | 'cp' | 'tp' | 'atp' | 'prota' | 'promes' | 'modul';

interface PlanningDoc {
  id: string;
  type: string;
  title: string;
  subject?: string;
  grade?: number;
  content: string;
  status: 'draft' | 'final' | 'published';
  updatedAt: string;
}

export default function PerencanaanPage() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<SubTab>('cp');
  const [documents, setDocuments] = useState<PlanningDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState<PlanningDoc | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [activeTab, user?.activeSchoolId]);

  const loadDocuments = async () => {
    if (!user?.activeSchoolId) return;
    
    setLoading(true);
    try {
      const response = await api.planning.getAll(user.activeSchoolId, activeTab);
      if (response.success && Array.isArray(response.data)) {
        setDocuments(response.data as PlanningDoc[]);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: SubTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'kalender', label: 'Kalender', icon: <Calendar size={16} />, desc: 'Kalender pendidikan & minggu efektif' },
    { id: 'cp', label: 'CP', icon: <Target size={16} />, desc: 'Capaian Pembelajaran' },
    { id: 'tp', label: 'TP', icon: <Target size={16} />, desc: 'Tujuan Pembelajaran' },
    { id: 'atp', label: 'ATP', icon: <GitBranch size={16} />, desc: 'Alur Tujuan Pembelajaran' },
    { id: 'prota', label: 'Prota', icon: <Calendar size={16} />, desc: 'Program Tahunan' },
    { id: 'promes', label: 'Promes', icon: <Calendar size={16} />, desc: 'Program Semester' },
    { id: 'modul', label: 'Modul Ajar', icon: <BookOpen size={16} />, desc: 'Modul ajar & RPP' },
  ];

  const handleCreateNew = () => {
    const newDoc: PlanningDoc = {
      id: `doc_${Date.now()}`,
      type: activeTab,
      title: `Dokumen ${tabs.find(t => t.id === activeTab)?.label} Baru`,
      content: '',
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };
    setEditingDoc(newDoc);
  };

  const handleSave = async () => {
    if (!editingDoc || !user?.activeSchoolId) return;
    
    const updated = { ...editingDoc, updatedAt: new Date().toISOString() };
    
    try {
      let response;
      if (editingDoc.id.startsWith('doc_')) {
        // New document
        response = await api.planning.create({
          ...updated,
          schoolId: user.activeSchoolId,
          teacherId: user.id,
        });
      } else {
        // Update existing
        response = await api.planning.update(editingDoc.id, updated);
      }
      
      if (response.success) {
        await loadDocuments();
        setEditingDoc(null);
      }
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleExport = (doc: PlanningDoc) => {
    const content = `# ${doc.title}\n\n${doc.content}\n\n---\nDibuat: ${new Date(doc.updatedAt).toLocaleString('id-ID')}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocs = documents.filter(d => d.type === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Memuat dokumen perencanaan...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perencanaan Pembelajaran</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola CP, TP, ATP, Prota, Promes, dan Modul Ajar</p>
        </div>
        {hasPermission('material.manage') && (
          <button onClick={handleCreateNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
            <Plus size={18} /> Buat Dokumen
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Current Tab Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
          {tabs.find(t => t.id === activeTab)?.label}
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-400">
          {tabs.find(t => t.id === activeTab)?.desc}
        </p>
      </div>

      {/* Editor Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Dokumen</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul</label>
                <input type="text" value={editingDoc.title}
                  onChange={e => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konten</label>
                <textarea value={editingDoc.content}
                  onChange={e => setEditingDoc({ ...editingDoc, content: e.target.value })}
                  rows={15}
                  placeholder={activeTab === 'cp' ? 'Tuliskan Capaian Pembelajaran...' :
                              activeTab === 'tp' ? 'Tuliskan Tujuan Pembelajaran...' :
                              activeTab === 'atp' ? 'Tuliskan Alur Tujuan Pembelajaran...' :
                              activeTab === 'prota' ? 'Tuliskan Program Tahunan...' :
                              activeTab === 'promes' ? 'Tuliskan Program Semester...' :
                              activeTab === 'modul' ? 'Tuliskan Modul Ajar...' :
                              'Tuliskan konten di sini...'}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={editingDoc.status}
                  onChange={e => setEditingDoc({ ...editingDoc, status: e.target.value as any })}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="draft">Draft</option>
                  <option value="final">Final</option>
                  <option value="published">Dipublikasi</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button onClick={() => setEditingDoc(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                Batal
              </button>
              <button onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                <Save size={16} /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Belum ada dokumen {tabs.find(t => t.id === activeTab)?.label}</p>
            <p className="text-sm mt-1">Klik "Buat Dokumen" untuk memulai</p>
          </div>
        ) : (
          filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FileText size={20} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{doc.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Terakhir diupdate: {new Date(doc.updatedAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    doc.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    doc.status === 'final' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {doc.status === 'published' ? 'Terbit' : doc.status === 'final' ? 'Final' : 'Draft'}
                  </span>
                  <button onClick={() => handleExport(doc)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-green-500">
                    <Download size={14} />
                  </button>
                  <button onClick={() => setEditingDoc(doc)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
