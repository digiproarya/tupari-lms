import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FileText, Video, Link2, Image, Plus, Search, Eye, Edit2, Trash2, Clock, Loader2, Database, Upload, X, MessageSquare } from 'lucide-react';
import type { Material, Subject, Class } from '../types';
import { uploadFile, validateFile, formatFileSize } from '../utils/upload';
import CommentSection from '../components/CommentSection';

export default function MateriPage() {
  const { user, hasPermission } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    classId: '',
    file: null as File | null,
  });
  const [commentMaterial, setCommentMaterial] = useState<Material | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.activeSchoolId) return;
      setLoading(true);
      try {
        const [materialsData, subjectsData, classesData] = await Promise.all([
          api.materials.getAll(user.activeSchoolId) as Promise<Material[] | null>,
          api.subjects.getAll(user.activeSchoolId) as Promise<Subject[] | null>,
          api.classes.getAll(user.activeSchoolId) as Promise<Class[] | null>,
        ]);
        if (materialsData) setMaterials(materialsData);
        if (subjectsData) setSubjects(subjectsData);
        if (classesData) setClasses(classesData);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.activeSchoolId]);

  const filtered = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={18} className="text-red-500" />;
      case 'video': return <Video size={18} className="text-purple-500" />;
      case 'link': return <Link2 size={18} className="text-blue-500" />;
      case 'image': return <Image size={18} className="text-green-500" />;
      default: return <FileText size={18} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Terbit</span>;
      case 'draft': return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">Draft</span>;
      case 'archived': return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Arsip</span>;
      default: return null;
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.subjectId || !uploadForm.classId) {
      alert('Mohon lengkapi semua field dan pilih file');
      return;
    }

    const validation = validateFile(uploadForm.file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);
    try {
      // Upload file ke Drive
      const uploadResult = await uploadFile(uploadForm.file, 'materi');
      
      if (!uploadResult.success) {
        alert('Gagal upload file: ' + uploadResult.error);
        return;
      }

      // Simpan metadata materi
      const newMaterial = {
        title: uploadForm.title,
        description: uploadForm.description,
        subjectId: uploadForm.subjectId,
        classId: uploadForm.classId,
        teacherId: user?.id || '',
        type: uploadForm.file.type.startsWith('video/') ? 'video' as const : 
              uploadForm.file.type.startsWith('image/') ? 'image' as const : 'pdf' as const,
        content: uploadResult.fileUrl || '',
        status: 'draft' as const,
        publishDate: '',
        createdAt: new Date().toISOString(),
      };

      // Call API untuk simpan materi
      const response = await api.materials.create(newMaterial);

      if (response.success) {
        // Reset form dan tutup modal
        setUploadForm({ title: '', description: '', subjectId: '', classId: '', file: null });
        setShowUploadModal(false);
        alert('Materi berhasil ditambahkan!');
        
        // Refresh data
        if (user?.activeSchoolId) {
          const materialsData = await api.materials.getAll(user.activeSchoolId) as Material[] | null;
          if (materialsData) setMaterials(materialsData);
        }
      } else {
        alert('Gagal menyimpan materi: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat upload');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat materi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Materi Pembelajaran</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola dan distribusikan materi kepada siswa</p>
        </div>
        {hasPermission('material.manage') && (
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} /> Tambah Materi
          </button>
        )}
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ Terhubung ke Google Sheets — <strong>{materials.length}</strong> materi
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari materi..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="all">Semua Status</option>
          <option value="published">Terbit</option>
          <option value="draft">Draft</option>
          <option value="archived">Arsip</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Belum ada materi</p>
            <p className="text-sm mt-1">Tambahkan materi pembelajaran untuk kelas Anda</p>
          </div>
        ) : (
          filtered.map(material => (
            <div key={material.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {getTypeIcon(material.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{material.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {subjects.find(s => s.id === material.subjectId)?.name} • {classes.find(c => c.id === material.classId)?.name}
                    </p>
                  </div>
                </div>
                {getStatusBadge(material.status)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{material.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  {material.publishDate ? new Date(material.publishDate).toLocaleDateString('id-ID') : 'Belum diterbitkan'}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setCommentMaterial(material)}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-purple-500"
                    title="Diskusi"
                  >
                    <MessageSquare size={14} />
                  </button>
                  <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Eye size={14} /></button>
                  {hasPermission('material.manage') && (
                    <>
                      <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={14} /></button>
                      <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Materi</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Materi *</label>
                <input 
                  type="text" 
                  value={uploadForm.title}
                  onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Contoh: Pengenalan Pecahan"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea 
                  value={uploadForm.description}
                  onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Deskripsi singkat tentang materi ini"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mata Pelajaran *</label>
                  <select 
                    value={uploadForm.subjectId}
                    onChange={e => setUploadForm({ ...uploadForm, subjectId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Pilih Mapel</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kelas *</label>
                  <select 
                    value={uploadForm.classId}
                    onChange={e => setUploadForm({ ...uploadForm, classId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File Materi *</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  {uploadForm.file ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{uploadForm.file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatFileSize(uploadForm.file.size)}</p>
                      <button 
                        onClick={() => setUploadForm({ ...uploadForm, file: null })}
                        className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Hapus file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Klik untuk pilih file atau drag & drop</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">PDF, Video, Gambar, Dokumen (Max 50MB)</p>
                      <input 
                        type="file" 
                        onChange={handleFileSelect}
                        accept=".pdf,.mp4,.webm,.jpg,.jpeg,.png,.gif,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button 
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Materi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Section Modal */}
      {commentMaterial && (
        <CommentSection
          materialId={commentMaterial.id}
          materialTitle={commentMaterial.title}
          isOpen={!!commentMaterial}
          onClose={() => setCommentMaterial(null)}
        />
      )}
    </div>
  );
}
