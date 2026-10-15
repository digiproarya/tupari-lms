/**
 * Content Studio - Core Content Engine + AI Enhancement Layer
 * 
 * Arsitektur dua lapis:
 * - Lapis 1: Core Content Engine (manual editor, selalu tersedia)
 * - Lapis 2: AI Enhancement Layer (opsional, dengan fallback)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiService, GenerationRequest, AIStatus } from '../services/ai';
import { api } from '../services/api';
import {
  Sparkles, FileText, HelpCircle, BookOpen, GraduationCap,
  Wand2, Download, Eye, Save, Loader2, CheckCircle2,
  ArrowRight, ArrowLeft, BookMarked, Lightbulb, AlertCircle,
  Wifi, WifiOff, Edit3, Zap
} from 'lucide-react';

type GenerationType = 'materi' | 'soal' | 'lkpd' | 'buku';
type EditorMode = 'ai' | 'manual';

export default function ContentStudioPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<GenerationType | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('manual');
  const [aiStatus, setAiStatus] = useState<AIStatus>({
    available: false,
    provider: 'none',
  });
  const [config, setConfig] = useState<Partial<GenerationRequest>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Check AI status on mount
  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    const status = await aiService.checkStatus();
    setAiStatus(status);
  };

  const generationTypes = [
    {
      id: 'materi' as GenerationType,
      title: 'Materi Pembelajaran',
      description: 'Buat materi lengkap dengan penjelasan, contoh, dan ilustrasi',
      icon: <FileText size={32} className="text-blue-500" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'soal' as GenerationType,
      title: 'Bank Soal',
      description: 'Buat soal PG, esai dengan berbagai tingkat kesukaran',
      icon: <HelpCircle size={32} className="text-green-500" />,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'lkpd' as GenerationType,
      title: 'LKPD',
      description: 'Buat lembar kerja peserta didik dengan aktivitas interaktif',
      icon: <GraduationCap size={32} className="text-orange-500" />,
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'buku' as GenerationType,
      title: 'Buku Ajar',
      description: 'Susun buku ajar dari materi yang telah dibuat',
      icon: <BookMarked size={32} className="text-rose-500" />,
      color: 'from-rose-500 to-rose-600',
      featured: true,
    },
  ];

  const subjects = [
    'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS',
    'Pendidikan Pancasila', 'Seni Budaya', 'PJOK', 'Informatika'
  ];

  const handleTypeSelect = (type: GenerationType) => {
    setSelectedType(type);
    setConfig({ type, useAI: aiStatus.available });
    setCurrentStep(2);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const request: GenerationRequest = {
        ...config,
        useAI: editorMode === 'ai' && aiStatus.available,
      } as GenerationRequest;

      const result = await aiService.generate(request);
      
      if (result.success && result.data) {
        setGeneratedContent(result.data);
        setCurrentStep(3);
      } else {
        alert('Gagal generate konten: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Terjadi kesalahan saat generate konten');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent || !user) return;

    try {
      // Save to backend based on type
      let response;
      
      switch (selectedType) {
        case 'materi':
          response = await api.materials.create({
            ...generatedContent,
            teacherId: user.id,
            schoolId: user.activeSchoolId,
          });
          break;
        case 'soal':
          // Save questions to bank
          response = await api.questions.create({
            ...generatedContent,
            teacherId: user.id,
            schoolId: user.activeSchoolId,
          });
          break;
        case 'lkpd':
          // Save as material with type 'lkpd'
          response = await api.materials.create({
            ...generatedContent,
            type: 'lkpd',
            teacherId: user.id,
            schoolId: user.activeSchoolId,
          });
          break;
        case 'buku':
          // Save as special material type 'buku'
          response = await api.materials.create({
            ...generatedContent,
            type: 'buku',
            teacherId: user.id,
            schoolId: user.activeSchoolId,
          });
          break;
      }

      if (response?.success) {
        alert('Konten berhasil disimpan!');
        // Navigate to appropriate page
        window.location.hash = selectedType === 'soal' ? '/bank-soal' : '/materi';
      } else {
        alert('Gagal menyimpan: ' + (response?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Terjadi kesalahan saat menyimpan');
    }
  };

  const handleExport = (format: string) => {
    // Export logic here
    alert(`Export ke ${format.toUpperCase()} - Fitur akan segera tersedia`);
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Studio</h1>
              <p className="text-gray-500 dark:text-gray-400">Buat materi, soal, LKPD, dan buku ajar</p>
            </div>
          </div>

          {/* AI Status Indicator */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            aiStatus.available 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }`}>
            {aiStatus.available ? (
              <>
                <Wifi size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  AI Aktif ({aiStatus.provider})
                </span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Mode Manual
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      {selectedType && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(step => (
            <React.Fragment key={step}>
              <div className={`flex items-center gap-2 ${currentStep >= step ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  currentStep >= step ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {currentStep > step ? <CheckCircle2 size={18} /> : step}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {step === 1 ? 'Pilih Tipe' : step === 2 ? 'Konfigurasi' : 'Hasil'}
                </span>
              </div>
              {step < 3 && <ArrowRight size={20} className="text-gray-300 dark:text-gray-600" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step 1: Select Type */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {generationTypes.map(type => (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-lg transition-all text-left group ${
                type.featured ? 'ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-gray-900' : ''
              }`}
            >
              {type.featured && (
                <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                  ⭐ UNGGULAN
                </div>
              )}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {type.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{type.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Configuration */}
      {currentStep === 2 && selectedType && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Konfigurasi {generationTypes.find(t => t.id === selectedType)?.title}
          </h2>

          {/* Editor Mode Toggle */}
          {aiStatus.available && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Mode Editor</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditorMode('manual')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      editorMode === 'manual'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Edit3 size={16} className="inline mr-1" /> Manual
                  </button>
                  <button
                    onClick={() => setEditorMode('ai')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      editorMode === 'ai'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Sparkles size={16} className="inline mr-1" /> AI Assist
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {editorMode === 'ai' 
                  ? 'AI akan membantu generate konten. Anda tetap bisa edit hasilnya.'
                  : 'Buat konten secara manual dengan template yang tersedia.'}
              </p>
            </div>
          )}

          {!aiStatus.available && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-300 mb-1">AI Tidak Tersedia</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    {aiStatus.lastError || 'AI service tidak tersedia. Anda tetap bisa membuat konten secara manual.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <select
                value={config.subject || ''}
                onChange={e => setConfig({ ...config, subject: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Pilih Mata Pelajaran</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                value={config.grade || ''}
                onChange={e => setConfig({ ...config, grade: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Pilih Kelas</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                  <option key={g} value={g}>Kelas {g}</option>
                ))}
              </select>
            </div>

            {/* Topic/Chapter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Topik / Bab
              </label>
              <input
                type="text"
                value={config.topic || ''}
                onChange={e => setConfig({ ...config, topic: e.target.value })}
                placeholder="Contoh: Pecahan dan Desimal"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* CP/TP for specific types */}
            {(selectedType === 'materi' || selectedType === 'lkpd') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capaian Pembelajaran (CP)
                  </label>
                  <textarea
                    value={config.cp || ''}
                    onChange={e => setConfig({ ...config, cp: e.target.value })}
                    placeholder="Tuliskan CP yang ingin dicapai..."
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tujuan Pembelajaran (TP)
                  </label>
                  <textarea
                    value={config.tp || ''}
                    onChange={e => setConfig({ ...config, tp: e.target.value })}
                    placeholder="Tuliskan tujuan pembelajaran..."
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </>
            )}

            {/* Question-specific config */}
            {selectedType === 'soal' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jumlah Soal
                  </label>
                  <input
                    type="number"
                    value={config.questionCount || 5}
                    onChange={e => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
                    min={1}
                    max={50}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tingkat Kesukaran
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'low', label: 'Mudah', color: 'green' },
                      { id: 'medium', label: 'Sedang', color: 'yellow' },
                      { id: 'high', label: 'Sulit', color: 'orange' },
                      { id: 'hots', label: 'HOTS', color: 'red' },
                    ].map(diff => (
                      <button
                        key={diff.id}
                        onClick={() => setConfig({ ...config, difficulty: diff.id as any })}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          config.difficulty === diff.id
                            ? `border-${diff.color}-500 bg-${diff.color}-50 dark:bg-${diff.color}-900/20`
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => { setCurrentStep(1); setSelectedType(null); }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft size={18} /> Kembali
            </button>
            <button
              onClick={handleGenerate}
              disabled={!config.subject || !config.grade || isGenerating}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                editorMode === 'ai' && aiStatus.available
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {editorMode === 'ai' && aiStatus.available ? (
                    <>
                      <Wand2 size={18} />
                      Generate dengan AI
                    </>
                  ) : (
                    <>
                      <Edit3 size={18} />
                      Buat Manual
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {currentStep === 3 && generatedContent && (
        <div className="space-y-6">
          <div className={`rounded-xl p-4 flex items-center gap-3 ${
            generatedContent.usedAI 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          }`}>
            {generatedContent.usedAI ? (
              <>
                <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-medium text-green-900 dark:text-green-300">Konten Berhasil Di-Generate dengan AI!</h3>
                  <p className="text-sm text-green-800 dark:text-green-400">Silakan review, edit jika perlu, lalu save</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 size={24} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-300">Template Berhasil Dibuat!</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400">Silakan edit dan lengkapi konten sesuai kebutuhan</p>
                </div>
              </>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preview</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Edit3 size={16} /> {isEditing ? 'Selesai Edit' : 'Edit'}
              </button>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                {JSON.stringify(generatedContent, null, 2)}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft size={18} /> Edit Konfigurasi
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
            >
              <Save size={18} /> Save ke Library
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              <Download size={18} /> Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
