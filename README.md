# Easy.Store Documentation Platform

Platform dokumentasi dinamis untuk produk digital store dengan rich text editor, media upload, dan real-time search.

## Fitur Utama

- **Rich Text Editor** - 40+ fitur formatting (bold, italic, heading, list, table, dll)
- **Media Upload** - Upload gambar & video dengan progress bar
- **YouTube Embed** - Sisipkan video YouTube langsung
- **Real-time Search** - Pencarian dokumen secara langsung
- **Category Management** - Kelola kategori produk
- **Admin Mode** - Akses admin via URL parameter
- **Responsive Design** - Tampilan optimal di semua device
- **Error Handling** - Halaman 404 & error dengan pesan Indonesia

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Editor**: Tiptap
- **Icons**: Lucide React
- **Hosting**: Vercel

## Setup

### 1. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Buka SQL Editor dan jalankan `supabase-migration.sql`
3. Copy URL dan API keys dari Settings > API

### 2. Environment Variables

Edit `.env.local` dengan credentials Supabase kamu:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

ADMIN_EMAIL=admin@easy.store
ADMIN_PASSWORD=secret123
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Admin Access

Untuk mengakses mode admin, tambahkan parameter `?admin=BASE64` ke URL.

**Contoh:**
```
http://localhost:3000?admin=YWRtaW5AZWFzeS5zdG9yZTpzZWNyZXQxMjM=
```

Format: `?admin=BASE64(email:password)`

Kamu bisa generate token dengan:
```javascript
btoa('admin@easy.store:secret123')
// Output: YWRtaW5AZWFzeS5zdG9yZTpzZWNyZXQxMjM=
```

## Deploy ke Vercel

1. Push repository ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan Environment Variables di Vercel Settings
4. Deploy

## Struktur Project

```
src/
├── app/
│   ├── api/
│   │   ├── categories/route.ts
│   │   ├── documents/route.ts
│   │   └── upload/route.ts
│   ├── [slug]/
│   │   ├── page.tsx
│   │   └── DocumentDetail.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── error.tsx
├── components/
│   ├── Editor/
│   │   ├── TiptapEditor.tsx
│   │   ├── Toolbar.tsx
│   │   └── UploadProgress.tsx
│   ├── Header.tsx
│   ├── SearchBar.tsx
│   ├── DocumentCard.tsx
│   ├── Modal.tsx
│   └── Toast.tsx
├── hooks/
│   ├── useAdmin.ts
│   └── useToast.tsx
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   └── errors.ts
└── types/
    └── database.ts
```

## License

MIT
