# Sistem Manajemen Perpustakaan

Aplikasi web manajemen perpustakaan kampus dengan peran Admin, Pegawai, Mahasiswa, dan Guest.
Dibangun dengan Next.js (JavaScript, Tailwind CSS) dan PostgreSQL dengan raw SQL.

## Fitur
- Register mahasiswa (email kampus `.ac.id`), login, dan logout dengan password di-hash (bcryptjs) dan sesi cookie
- Proteksi halaman berdasarkan peran lewat `proxy.js` (pengganti `middleware` di Next.js 16)
- Katalog buku: pencarian, filter kategori, dan pengurutan
- Detail buku dengan ulasan dan rating
- Pengajuan peminjaman, persetujuan atau penolakan pegawai, dan pengembalian (stok diperbarui lewat transaksi SQL)
- Denda keterlambatan otomatis, pencatatan lunas, dan blokir pinjam jika ada denda tertunggak
- Perpanjangan masa pinjam dengan persetujuan pegawai
- CRUD buku oleh pegawai
- Dashboard mahasiswa, dan homepage dengan 5 buku terpopuler

## Cara menjalankan

### 1. Prasyarat
Node.js 20 atau lebih baru dan PostgreSQL.

### 2. Siapkan database
Buat database kosong bernama `library_db`, lalu jalankan:

```
psql -U postgres -d library_db -f schema.sql
psql -U postgres -d library_db -f seed.sql
```

### 3. Konfigurasi
Buat file `.env.local` di folder utama:

```
DATABASE_URL=postgresql://postgres:PASSWORD_ANDA@localhost:5432/library_db
SESSION_SECRET=isi_dengan_teks_acak_panjang
```

Kunci acak dapat dibuat dengan:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Jalankan aplikasi

```
npm install
npm run dev
```

Buka http://localhost:3000

## Akun uji
Akun dibuat lewat halaman `/register` (khusus mahasiswa), karena password disimpan sebagai hash.
Untuk membuat akun pegawai atau admin, daftar dulu lewat `/register`, lalu ubah perannya:

```
psql -U postgres -d library_db -c "UPDATE users SET role = 'pegawai' WHERE email = 'EMAIL_AKUN';"
psql -U postgres -d library_db -c "UPDATE users SET role = 'admin' WHERE email = 'EMAIL_AKUN';"
```

Setelah peran diubah, login ulang.

## Struktur singkat
- `app/` halaman dan route handler (App Router)
- `lib/db.js` koneksi PostgreSQL, `lib/session.js` pembuatan dan verifikasi sesi
- `proxy.js` proteksi halaman berdasarkan peran
- `schema.sql` dan `seed.sql` skema dan data awal database