import { GoogleGenAI } from "@google/genai";
import { DailySummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAttendanceReport = async (summary: DailySummary, className: string): Promise<string> => {
  try {
    const prompt = `
      Bertindaklah sebagai asisten administrasi sekolah yang profesional.
      Buatkan laporan ringkas dan sopan untuk Wali Kelas ${className} berdasarkan data kehadiran hari ini:
      
      Tanggal: ${summary.date}
      Total Siswa: ${summary.totalStudents}
      Hadir: ${summary.present}
      Sakit: ${summary.sick}
      Izin: ${summary.permission}
      Alpa (Tanpa Keterangan): ${summary.absent}
      
      Catatan Khusus:
      ${summary.notes.length > 0 ? summary.notes.join(', ') : '-'}
      
      Berikan analisis singkat tentang tren kehadiran hari ini dan saran jika ada banyak siswa yang tidak hadir.
      Gunakan Bahasa Indonesia yang formal namun mudah dibaca.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Gagal membuat laporan.";
  } catch (error) {
    console.error("Error generating report:", error);
    return "Maaf, terjadi kesalahan saat menghubungi asisten AI.";
  }
};