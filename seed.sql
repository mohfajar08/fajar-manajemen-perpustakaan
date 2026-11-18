INSERT INTO categories (nama, kode, deskripsi) VALUES
('Teknologi Informasi', 'TI-100', 'Buku pemrograman, jaringan, dan basis data'),
('Hukum', 'HK-200', 'Buku hukum dan perundang-undangan'),
('Kedokteran', 'KD-300', 'Buku ilmu kedokteran dan kesehatan'),
('Sastra & Bahasa', 'SB-400', 'Novel, puisi, dan kajian bahasa');

INSERT INTO books (judul, isbn, penulis, penerbit, tahun_terbit, category_id, stok_total, stok_tersedia, durasi_maks_hari, denda_per_hari, cover_url) VALUES
('Pemrograman Web dengan JavaScript', '9786020001001', 'Budi Raharjo', 'Informatika', 2022, 1, 5, 5, 7, 1000, NULL),
('Basis Data Relasional', '9786020001002', 'Siti Aminah', 'Andi Offset', 2021, 1, 4, 4, 7, 1000, NULL),
('Jaringan Komputer Dasar', '9786020001003', 'Agus Wibowo', 'Erlangga', 2020, 1, 3, 3, 7, 1500, NULL),
('Pengantar Ilmu Hukum', '9786020002001', 'Sudikno Mertokusumo', 'Liberty', 2019, 2, 3, 3, 14, 2000, NULL),
('Hukum Pidana Indonesia', '9786020002002', 'Moeljatno', 'Bumi Aksara', 2018, 2, 2, 2, 14, 2000, NULL),
('Anatomi Manusia', '9786020003001', 'Dewi Kartika', 'EGC', 2023, 3, 3, 3, 7, 2500, NULL),
('Farmakologi Dasar', '9786020003002', 'Rahmat Hidayat', 'EGC', 2022, 3, 2, 2, 7, 2500, NULL),
('Laskar Pelangi', '9786020004001', 'Andrea Hirata', 'Bentang Pustaka', 2008, 4, 4, 4, 7, 1000, NULL),
('Bumi Manusia', '9786020004002', 'Pramoedya Ananta Toer', 'Lentera Dipantara', 2005, 4, 3, 3, 7, 1000, NULL),
('Negeri 5 Menara', '9786020004003', 'Ahmad Fuadi', 'Gramedia', 2009, 4, 4, 4, 7, 1000, NULL);

INSERT INTO announcements (judul, konten, kategori, tanggal_rilis, status) VALUES
('Jadwal Layanan Selama Libur Semester', 'Perpustakaan tetap buka pada hari kerja pukul 08.00-15.00 selama libur semester.', 'Operasional', '2026-11-10', 'Published'),
('Pengadaan Buku Baru Semester Genap', 'Perpustakaan menambah koleksi buku Teknologi Informasi dan Kedokteran.', 'Layanan', '2026-11-12', 'Published'),
('Workshop Literasi Digital', 'Workshop terbuka untuk seluruh mahasiswa, pendaftaran di meja sirkulasi.', 'Acara', '2026-11-15', 'Published'),
('Draft: Perubahan Aturan Denda', 'Rancangan perubahan tarif denda, belum final.', 'Layanan', '2026-11-18', 'Draft');