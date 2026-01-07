import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const scriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rawData = e.postData.contents;
  var data = JSON.parse(rawData);
  var time = new Date().toLocaleString('id-ID');
  
  // Header Check (Optional - makes first row headers if empty)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Kelas", "Nama", "NIS", "Status", "Keterangan"]);
  }

  if(data.records) {
    data.records.forEach(function(r) {
       sheet.appendRow([time, data.className, r.name, r.nis, r.status, r.note]);
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({'result': 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                Panduan Penggunaan
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-2 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              
              {/* Step 1 */}
              <section>
                <h4 className="font-semibold text-indigo-600 mb-2">1. Persiapan Awal</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Buka menu <strong>Pengaturan (ikon Gear)</strong> di pojok kanan atas.</li>
                  <li>Isi <strong>Nama Kelas</strong>.</li>
                  <li>Masukkan data siswa (Nama & NIS) satu per satu.</li>
                </ul>
              </section>

              {/* Step 2 */}
              <section>
                <h4 className="font-semibold text-indigo-600 mb-2">2. Integrasi Google Sheets (Wajib untuk Simpan Data)</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Agar data kehadiran tersimpan, ikuti langkah ini:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-1">
                    <li>Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google Sheets Baru</a>.</li>
                    <li>Klik menu <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.</li>
                    <li>Hapus kode yang ada, lalu tempel kode di bawah ini:</li>
                  </ol>
                  
                  <div className="relative mt-2">
                    <pre className="bg-gray-800 text-gray-100 p-3 rounded-md text-xs font-mono overflow-x-auto">
                      {scriptCode}
                    </pre>
                    <button 
                      onClick={handleCopy}
                      className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition"
                      title="Salin Kode"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <ol className="list-decimal list-inside space-y-2 ml-1 mt-2">
                    <li>Klik tombol <strong>Deploy</strong> (biru) di kanan atas &gt; <strong>New Deployment</strong>.</li>
                    <li>Pilih icon Gear (kiri script type) &gt; pilih <strong>Web app</strong>.</li>
                    <li>Isi Description: "Absensi".</li>
                    <li>
                      <strong>PENTING:</strong> Pada bagian <em>Who has access</em>, pilih <strong>Anyone</strong>.
                    </li>
                    <li>Klik <strong>Deploy</strong>. Salin <strong>Web App URL</strong> yang muncul.</li>
                    <li>Tempel URL tersebut di menu <strong>Pengaturan</strong> aplikasi ini.</li>
                  </ol>
                </div>
              </section>

              {/* Step 3 */}
              <section>
                <h4 className="font-semibold text-indigo-600 mb-2">3. Cara Menggunakan</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Tandai kehadiran siswa dengan mengklik ikon (Hadir, Sakit, Izin, Alpa).</li>
                  <li>Untuk Sakit/Izin, Anda bisa menambahkan catatan khusus pada kolom yang muncul.</li>
                  <li>Klik <strong>Analisis AI Harian</strong> untuk mendapatkan laporan teks otomatis.</li>
                  <li>Klik <strong>Kirim ke Sheets</strong> untuk menyimpan data ke Excel online Anda.</li>
                </ul>
              </section>

            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;