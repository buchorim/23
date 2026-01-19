// Error messages dalam Bahasa Indonesia
export const ERROR_MESSAGES = {
    // Network errors
    NETWORK_ERROR: 'Koneksi terputus. Periksa koneksi internet kamu.',
    TIMEOUT_ERROR: 'Waktu permintaan habis. Coba lagi.',

    // Auth errors
    AUTH_INVALID: 'Akses admin tidak valid.',
    AUTH_EXPIRED: 'Sesi admin telah berakhir. Silakan login ulang.',

    // CRUD errors
    SAVE_FAILED: 'Gagal menyimpan dokumen. Perubahan kamu belum tersimpan.',
    DELETE_FAILED: 'Gagal menghapus. Dokumen mungkin masih digunakan.',
    LOAD_FAILED: 'Gagal memuat data. Coba refresh halaman.',

    // Upload errors
    UPLOAD_FAILED: 'Gagal mengupload file.',
    UPLOAD_SIZE_EXCEEDED: 'Ukuran file terlalu besar. Maksimal 50MB.',
    UPLOAD_TYPE_INVALID: 'Tipe file tidak didukung.',

    // Document errors
    DOCUMENT_NOT_FOUND: 'Dokumen tidak ditemukan.',
    DOCUMENT_CREATE_FAILED: 'Gagal membuat dokumen baru.',
    DOCUMENT_UPDATE_FAILED: 'Gagal memperbarui dokumen.',

    // Category errors
    CATEGORY_NOT_FOUND: 'Kategori tidak ditemukan.',
    CATEGORY_CREATE_FAILED: 'Gagal membuat kategori baru.',
    CATEGORY_DELETE_HAS_DOCS: 'Tidak bisa menghapus kategori yang masih memiliki dokumen.',

    // Validation errors
    TITLE_REQUIRED: 'Judul dokumen wajib diisi.',
    SLUG_EXISTS: 'Slug sudah digunakan. Pilih yang lain.',
    SLUG_INVALID: 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.',

    // Generic errors
    UNKNOWN_ERROR: 'Terjadi kesalahan. Coba lagi nanti.',
    SERVER_ERROR: 'Terjadi kesalahan pada server. Tim kami sedang memperbaikinya.',
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

export function getErrorMessage(code: ErrorCode): string {
    return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

// Error page content
export const ERROR_PAGES = {
    404: {
        title: 'Halaman Tidak Ditemukan',
        message: 'Dokumen yang kamu cari tidak ada atau sudah dihapus.',
        buttonText: 'Kembali ke Beranda',
    },
    500: {
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan pada server. Tim kami sedang memperbaikinya.',
        buttonText: 'Coba Lagi',
    },
} as const;
