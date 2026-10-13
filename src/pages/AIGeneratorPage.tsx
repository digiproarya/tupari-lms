/**
 * AI Content Generation Engine
 * 
 * Fitur unggulan TUPARI LMS:
 * - Auto-generate materi pembelajaran
 * - Auto-generate soal (Low/Medium/HOTS)
 * - Auto-generate modul ajar
 * - Auto-generate bahan ajar
 * - Auto-generate draf buku
 * 
 * Semua konten bisa di-export ke PDF, DOCX, atau HTML
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, FileText, HelpCircle, BookOpen, GraduationCap,
  Wand2, Download, Eye, Save, Loader2, CheckCircle2,
  ArrowRight, ArrowLeft, Settings2, BookMarked, Lightbulb
} from 'lucide-react';

type GenerationType = 'materi' | 'soal' | 'modul' | 'bahan_ajar' | 'buku';

interface GenerationConfig {
  type: GenerationType;
  subject: string;
  grade: number;
  chapter?: string;
  topic?: string;
  cp?: string;
  tp?: string;
  difficulty?: 'low' | 'medium' | 'high' | 'hots';
  questionCount?: number;
  questionTypes?: string[];
  duration?: number;
  format?: 'pdf' | 'docx' | 'html';
}

export default function AIGeneratorPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<GenerationType | null>(null);
  const [config, setConfig] = useState<Partial<GenerationConfig>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const generationTypes = [
    {
      id: 'materi' as GenerationType,
      title: 'Materi Pembelajaran',
      description: 'Generate materi lengkap dengan penjelasan, contoh, dan ilustrasi',
      icon: <FileText size={32} className="text-blue-500" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'soal' as GenerationType,
      title: 'Bank Soal',
      description: 'Generate soal PG, esai, interaktif dengan berbagai tingkat kesukaran',
      icon: <HelpCircle size={32} className="text-green-500" />,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'modul' as GenerationType,
      title: 'Modul Ajar',
      description: 'Generate modul ajar lengkap sesuai Kurikulum Merdeka',
      icon: <BookOpen size={32} className="text-purple-500" />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'bahan_ajar' as GenerationType,
      title: 'Bahan Ajar',
      description: 'Generate bahan ajar (presentasi, handout, LKPD)',
      icon: <GraduationCap size={32} className="text-orange-500" />,
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'buku' as GenerationType,
      title: 'Draf Buku',
      description: 'Generate draf buku lengkap per semester (fitur unggulan)',
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
    setConfig({ type, format: 'pdf' });
    setCurrentStep(2);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation (in real app, this calls backend API)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock generated content
    const mockContent: Record<string, any> = {
      materi: {
        title: `${config.topic || 'Topik'} - Kelas ${config.grade}`,
        sections: [
          { title: 'Pendahuluan', content: 'Materi ini akan membahas...' },
          { title: 'Konsep Dasar', content: 'Konsep utama adalah...' },
          { title: 'Contoh', content: 'Berikut contoh...' },
          { title: 'Latihan', content: 'Kerjakan soal berikut...' },
        ],
      },
      soal: {
        title: `Bank Soal ${config.subject} Kelas ${config.grade}`,
        questions: Array.from({ length: config.questionCount || 10 }, (_, i) => ({
          id: `q${i + 1}`,
          type: i % 2 === 0 ? 'multiple_choice' : 'essay',
          question: `Soal nomor ${i + 1} tentang ${config.topic}`,
          options: i % 2 === 0 ? ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'] : undefined,
          answer: `Jawaban soal ${i + 1}`,
          difficulty: config.difficulty || 'medium',
          points: 10,
        })),
      },
      modul: {
        title: `Modul Ajar ${config.subject} Kelas ${config.grade}`,
        sections: [
          { title: 'Informasi Umum', content: '...' },
          { title: 'Capaian Pembelajaran', content: config.cp || '...' },
          { title: 'Tujuan Pembelajaran', content: config.tp || '...' },
          { title: 'Kegiatan Pembelajaran', content: '...' },
          { title: 'Asesmen', content: '...' },
        ],
      },
      bahan_ajar: {
        title: `Bahan Ajar ${config.subject} Kelas ${config.grade}`,
        sections: [
          { title: 'Pengantar', content: '...' },
          { title: 'Materi Inti', content: '...' },
          { title: 'Rangkuman', content: '...' },
        ],
      },
      buku: {
        title: `Draf Buku ${config.subject} Kelas ${config.grade}`,
        sections: [
          { title: 'Kata Pengantar', content: '...' },
          { title: 'Daftar Isi', content: '...' },
          { title: 'Bab 1', content: '...' },
        ],
      },
    };
    
    setGeneratedContent(mockContent[selectedType!] || {});
    setIsGenerating(false);
    setCurrentStep(3);
  };

  const handleExport = (format: string) => {
    // In real app, this calls backend to generate file
    alert(`Exporting to ${format.toUpperCase()}... (Fitur ini akan terhubung ke backend GAS)`);
  };

  const handleSave = () => {
    // In real app, this saves to database
    alert('Content saved to library! (Fitur ini akan terhubung ke backend GAS)');
    navigate('/materi');
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Content Generator</h1>
            <p className="text-gray-500 dark:text-gray-400">Generate materi, soal, modul, dan draf buku secara otomatis</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            {(selectedType === 'materi' || selectedType === 'soal' || selectedType === 'bahan_ajar') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bab / Topik
                  </label>
                  <input
                    type="text"
                    value={config.chapter || ''}
                    onChange={e => setConfig({ ...config, chapter: e.target.value })}
                    placeholder="Contoh: Pecahan dan Desimal"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sub-Topik (opsional)
                  </label>
                  <input
                    type="text"
                    value={config.topic || ''}
                    onChange={e => setConfig({ ...config, topic: e.target.value })}
                    placeholder="Contoh: Penjumlahan Pecahan"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* CP/TP for Modul */}
            {selectedType === 'modul' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capaian Pembelajaran (CP)
                  </label>
                  <textarea
                    value={config.cp || ''}
                    onChange={e => setConfig({ ...config, cp: e.target.value })}
                    placeholder="Tuliskan CP yang ingin dicapai..."
                    rows={3}
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
                    rows={3}
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
                    value={config.questionCount || 10}
                    onChange={e => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
                    min={1}
                    max={100}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tingkat Kesukaran
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'low', label: 'Low (Mudah)', color: 'green' },
                      { id: 'medium', label: 'Medium', color: 'yellow' },
                      { id: 'high', label: 'High (Sulit)', color: 'orange' },
                      { id: 'hots', label: 'HOTS', color: 'red' },
                    ].map(diff => (
                      <button
                        key={diff.id}
                        onClick={() => setConfig({ ...config, difficulty: diff.id as any })}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          config.difficulty === diff.id
                            ? `border-${diff.color}-500 bg-${diff.color}-50 dark:bg-${diff.color}-900/20 text-${diff.color}-700 dark:text-${diff.color}-400`
                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                        }`}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipe Soal
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Pilihan Ganda', 'Esai', 'Drag-Drop', 'Matching', 'Isian'].map(type => (
                      <label key={type} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Book-specific config */}
            {selectedType === 'buku' && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                <h3 className="font-medium text-rose-900 dark:text-rose-300 mb-2 flex items-center gap-2">
                  <Lightbulb size={18} /> Fitur Unggulan: Draf Buku Otomatis
                </h3>
                <p className="text-sm text-rose-800 dark:text-rose-400 mb-3">
                  Sistem akan generate draf buku lengkap berdasarkan mata pelajaran dan kelas yang dipilih. 
                  Buku akan mencakup: Kata Pengantar, Daftar Isi, Bab 1-10 (dengan materi, contoh, latihan), 
                  Glosarium, dan Daftar Pustaka.
                </p>
                <div>
                  <label className="block text-sm font-medium text-rose-900 dark:text-rose-300 mb-1">
                    Jumlah Bab
                  </label>
                  <input
                    type="number"
                    value={10}
                    readOnly
                    className="w-full px-4 py-2 rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format Output
              </label>
              <div className="flex gap-2">
                {['pdf', 'docx', 'html'].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setConfig({ ...config, format: fmt as any })}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      config.format === fmt
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
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
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Generate {generationTypes.find(t => t.id === selectedType)?.title}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {currentStep === 3 && generatedContent && (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-300">Content Berhasil Di-Generate!</h3>
              <p className="text-sm text-green-800 dark:text-green-400">Silakan review, edit jika perlu, lalu save atau export</p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preview</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Eye size={16} /> Full Preview
              </button>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <h2>{generatedContent.title}</h2>
              {generatedContent.sections?.map((section: any, idx: number) => (
                <div key={idx} className="mb-4">
                  <h3>{section.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{section.content}</p>
                </div>
              ))}
              {generatedContent.questions?.map((q: any, idx: number) => (
                <div key={q.id} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">{idx + 1}. {q.question}</p>
                  {q.options && (
                    <div className="space-y-1 ml-4">
                      {q.options.map((opt: string, i: number) => (
                        <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                          {String.fromCharCode(65 + i)}. {opt}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
              onClick={() => handleExport(config.format || 'pdf')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              <Download size={18} /> Export {config.format?.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
