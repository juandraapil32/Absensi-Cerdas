import React, { useState, useRef } from 'react';
import { AppConfig, Student } from '../types';
import { X, Plus, Trash2, HelpCircle, Upload, FileText } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (config: AppConfig) => void;
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  students,
  onUpdateStudents,
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNis, setNewStudentNis] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddStudent = () => {
    if (newStudentName.trim() && newStudentNis.trim()) {
      const newStudent: Student = {
        id: Date.now().toString(),
        name: newStudentName,
        nis: newStudentNis,
      };
      onUpdateStudents([...students, newStudent]);
      setNewStudentName('');
      setNewStudentNis('');
    }
  };

  const handleDeleteStudent = (id: string) => {
    onUpdateStudents(students.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
          alert("File kosong atau tidak dapat dibaca.");
          return;
      }

      // Normalize line endings to \n
      const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = normalizedText.split('\n');
      
      const newStudents: Student[] = [];
      let separator = ',';

      // Simple detection: check first non-empty line
      const firstLine = lines.find(l => l.trim().length > 0);
      if (firstLine) {
          const commaCount = (firstLine.match(/,/g) || []).length;
          const semiCount = (firstLine.match(/;/g) || []).length;
          if (semiCount > commaCount) {
              separator = ';';
          }
      }
      
      lines.forEach((line) => {
        const cleanedLine = line.trim();
        if (!cleanedLine) return;

        let parts = cleanedLine.split(separator);
        
        // Fallback: if header detection failed or mixed, try the other separator if current yields 1 part
        if (parts.length < 2) {
             if (separator === ',' && cleanedLine.includes(';')) parts = cleanedLine.split(';');
             else if (separator === ';' && cleanedLine.includes(',')) parts = cleanedLine.split(',');
        }
        
        const cleanParts = parts.map(p => p.trim().replace(/^"|"$/g, '').trim());

        if (cleanParts.length >= 2) {
            const name = cleanParts[0];
            const nis = cleanParts[1];

            // Filter out obvious header rows
            const isHeader = ['name', 'nama', 'nama siswa', 'student'].some(h => name.toLowerCase().includes(h)) && 
                             ['nis', 'nomor', 'id', 'induk'].some(h => nis.toLowerCase().includes(h));

            if (name && nis && !isHeader) {
                 newStudents.push({
                     id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                     name: name,
                     nis: nis
                 });
            }
        }
      });

      if (newStudents.length > 0) {
        if(window.confirm(`Ditemukan ${newStudents.length} siswa. Tambahkan ke daftar?`)) {
            onUpdateStudents([...students, ...newStudents]);
        }
      } else {
        alert("Gagal membaca data. Pastikan format file CSV adalah: Nama, NIS");
      }
      
      if(fileInputRef.current) fileInputRef.current.value = '';
    };
    
    reader.onerror = () => {
        alert("Terjadi kesalahan saat membaca file.");
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Pengaturan
                  </h3>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* General Settings */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">Nama Kelas</label>
                  <input
                    type="text"
                    value={localConfig.className}
                    onChange={(e) => setLocalConfig({ ...localConfig, className: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Contoh: XII IPA 1"
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">URL Script Google Sheets</label>
                    <button 
                      onClick={() => setShowHelp(!showHelp)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Cara Buat
                    </button>
                  </div>
                  <input
                    type="text"
                    value={localConfig.sheetScriptUrl}
                    onChange={(e) => setLocalConfig({ ...localConfig, sheetScriptUrl: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="https://script.google.com/macros/s/..."
                  />
                  {showHelp && (
                    <div className="mt-2 p-2 bg-blue-50 text-xs text-blue-800 rounded border border-blue-200">
                      1. Buka Google Sheets baru.<br/>
                      2. Klik Extensions &gt; Apps Script.<br/>
                      3. Paste kode script dari menu Panduan.<br/>
                      4. Deploy sebagai Web App (Access: Anyone).
                    </div>
                  )}
                </div>

                <hr className="my-4" />

                {/* Student Management */}
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">Daftar Siswa</h4>
                    
                    {/* CSV Upload Button */}
                    <div>
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100"
                            title="Format CSV: Nama, NIS"
                        >
                            <Upload className="h-3 w-3 mr-1" />
                            Import CSV
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nama Siswa"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="NIS"
                    value={newStudentNis}
                    onChange={(e) => setNewStudentNis(e.target.value)}
                    className="w-24 border border-gray-300 rounded-md py-2 px-3 text-sm"
                  />
                  <button
                    onClick={handleAddStudent}
                    disabled={!newStudentName || !newStudentNis}
                    className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto border rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <li key={student.id} className="py-2 px-3 flex justify-between items-center text-sm">
                        <span>{student.name} ({student.nis})</span>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                    {students.length === 0 && (
                      <li className="p-3 text-center text-gray-500 text-xs">Belum ada data siswa</li>
                    )}
                  </ul>
                </div>
                
                <div className="mt-2 text-[10px] text-gray-500 bg-gray-50 p-2 rounded">
                    <span className="font-bold">Tips Import:</span> Pastikan file CSV memiliki kolom A (Nama) dan B (NIS). Jika gagal, coba Save As "CSV (Comma delimited)" di Excel.
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;