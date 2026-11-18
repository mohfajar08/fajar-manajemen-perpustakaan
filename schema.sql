DROP TABLE IF EXISTS reviews, loan_extensions, loans, announcements, books, categories, users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'pegawai', 'mahasiswa')),
    nim VARCHAR(30) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) UNIQUE NOT NULL,
    kode VARCHAR(20) UNIQUE NOT NULL,
    deskripsi TEXT
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    penulis VARCHAR(100) NOT NULL,
    penerbit VARCHAR(100) NOT NULL,
    tahun_terbit INT NOT NULL,
    category_id INT NOT NULL REFERENCES categories(id),
    stok_total INT NOT NULL CHECK (stok_total >= 0),
    stok_tersedia INT NOT NULL CHECK (stok_tersedia >= 0),
    durasi_maks_hari INT NOT NULL DEFAULT 7,
    denda_per_hari INT NOT NULL DEFAULT 1000 CHECK (denda_per_hari >= 0),
    cover_url TEXT
);

CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    konten TEXT NOT NULL,
    kategori VARCHAR(20) NOT NULL CHECK (kategori IN ('Operasional', 'Layanan', 'Acara')),
    tanggal_rilis DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
    author_id INT REFERENCES users(id)
);

CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    book_id INT NOT NULL REFERENCES books(id),
    status VARCHAR(30) NOT NULL DEFAULT 'Menunggu Konfirmasi'
        CHECK (status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam', 'Ditolak', 'Selesai')),
    tanggal_pengajuan TIMESTAMP DEFAULT NOW(),
    tanggal_pinjam DATE,
    jatuh_tempo DATE,
    tanggal_kembali DATE,
    alasan_penolakan TEXT,
    jumlah_denda INT DEFAULT 0,
    status_denda VARCHAR(20) DEFAULT 'Tidak Ada'
        CHECK (status_denda IN ('Tidak Ada', 'Tertunggak', 'Lunas')),
    processed_by INT REFERENCES users(id)
);

CREATE TABLE loan_extensions (
    id SERIAL PRIMARY KEY,
    loan_id INT NOT NULL REFERENCES loans(id),
    status VARCHAR(30) NOT NULL DEFAULT 'Perpanjangan Diajukan'
        CHECK (status IN ('Perpanjangan Diajukan', 'Perpanjangan Disetujui', 'Perpanjangan Ditolak')),
    tanggal_pengajuan TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    loan_id INT UNIQUE NOT NULL REFERENCES loans(id),
    user_id INT NOT NULL REFERENCES users(id),
    book_id INT NOT NULL REFERENCES books(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    komentar TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);