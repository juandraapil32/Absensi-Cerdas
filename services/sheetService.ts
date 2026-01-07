import { AttendanceRecord, Student } from "../types";

interface SheetPayload {
  date: string;
  className: string;
  records: {
    name: string;
    nis: string;
    status: string;
    note: string;
  }[];
}

export const sendToGoogleSheets = async (
  scriptUrl: string,
  className: string,
  students: Student[],
  attendance: Record<string, AttendanceRecord>,
  dateString: string
): Promise<{ success: boolean; message: string }> => {
  if (!scriptUrl) {
    return { success: false, message: "URL Script Google Sheets belum diatur." };
  }

  // Format date specifically for ID locale if it's a YYYY-MM-DD string
  let formattedDate = dateString;
  try {
    if (dateString) {
        const dateObj = new Date(dateString);
        formattedDate = dateObj.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
  } catch (e) {
    // fallback to original string if parse fails
  }

  const records = students.map(student => {
    const record = attendance[student.id];
    return {
      name: student.name,
      nis: student.nis,
      status: record ? record.status : 'Alpa', // Default to Alpa if not marked
      note: record?.note || ''
    };
  });

  const payload: SheetPayload = {
    date: formattedDate,
    className,
    records
  };

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { success: true, message: "Data berhasil dikirim ke Google Sheets!" };
    } else {
      return { success: false, message: "Gagal mengirim data. Periksa URL Script." };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan koneksi (CORS/Network)." };
  }
};