# Spesifikasi Desain: Kurir Sepeda (Bicycle Messenger Platform)

- **Tanggal**: 2026-10-14
- **Status**: Draft Disetujui
- **Pendekatan**: Unified Responsive Web App dengan Multi-Role Switcher

---

## 1. Ringkasan Eksekutif & Tujuan

**Kurir Sepeda** adalah aplikasi web pengiriman barang instan berbasis pesepeda kota (*urban bicycle messenger*). Platform ini terinspirasi dari kultur kurir sepeda perkotaan yang lincah menembus kemacetan, ramah lingkungan, dan efisien untuk pengantaran dokumen serta paket kecil antar-kantor/bisnis.

Aplikasi ini menyatukan tiga peran utama dalam satu ekosistem interaktif:
1. **Pemesan (Customer)**: Melakukan pemesanan instan, memeriksa kelayakan rute sepeda, menghitung estimasi tarif dan penghematan karbon, serta memantau status kurir secara real-time.
2. **Kurir (Rider)**: Menerima pesanan masuk di radar terdekat, memperbarui tonggak status pengiriman via aksi 1-ketukan (*1-tap milestone*), dan memantau statistik jarak gowes harian.
3. **Admin / Dispatcher**: Memantau armada pesepeda aktif, seluruh status pesanan kota, dan total akumulasi penghematan emisi gas buang karbon.

---

## 2. Batasan Fisik & Aturan Bisnis (Core Constraints)

1. **Radius Jarak Maksimal**: **8.0 km** per pengiriman.
   * Rationale: Menjaga keselamatan fisik pesepeda dan menjamin kecepatan waktu antar di area perkotaan.
   * Jika jarak $> 8.0\text{ km}$, sistem mengunci tombol pesan dan menampilkan pemberitahuan ramah keselamatan pesepeda.
2. **Bobot & Dimensi Maksimal**: **5.0 kg** (harus muat dalam tas punggung kurir / *messenger bag* / *pannier*).
   * Kategori yang diizinkan: Dokumen/Surat Resmi, Map Berkas, Sampel Produk Ringan, Paket Pakaian/Kotak Kecil.
3. **Formula Tarif Sepeda**:
   * Tarif Dasar (Base Fare $\le 2\text{ km}$): **Rp 15.000**
   * Tarif per km berikutnya: **Rp 3.500 / km**
4. **Formula Metrik Eko / Emisi Karbon**:
   * Rata-rata emisi sepeda motor perkotaan: $\approx 120\text{ gram CO}_2\text{ / km}$.
   * Formula penghematan karbon: $\text{CO}_2\text{ Saved (g)} = \text{Jarak (km)} \times 120$.

---

## 3. Arsitektur Sistem & Aliran Data

### 3.1 Unified Multi-Role Single Page App
Aplikasi beroperasi sebagai SPA yang ditenagai oleh **Pusat State Reaktif (Unified Reactive Store)**. Seluruh komponen tampilan berlangganan (*subscribe*) pada state store bersama, memungkinkan pembaruan instan lintas-tampilan tanpa reload halaman.

```
       +--------------------------------------------------------+
       |             Top Navigation & Role Switcher             |
       |       [ 👤 Pemesan ]   [ 🚴 Kurir ]   [ 🏢 Admin ]      |
       +--------------------------------------------------------+
                                   |
                                   v
       +--------------------------------------------------------+
       |                  Central Reactive Store                |
       |  - orders: Order[]                                     |
       |  - riders: Rider[]                                     |
       |  - activeRole: 'customer' | 'rider' | 'admin'          |
       |  - metrics: { totalCo2Saved, completedOrders }         |
       +--------------------------------------------------------+
            ^                     ^                     ^
            |                     |                     |
     [Customer View]         [Rider View]          [Admin View]
     - Form Booking          - Radar Order         - Live Fleet Table
     - Kalkulator CO2        - 1-Tap Milestone     - Order Matrix
     - Live Tracking         - Odometer Gowes      - Eco City Counter
```

### 3.2 Siklus Hidup Pesanan (Order Lifecycle)
1. `pending`: Pesanan dibuat oleh Pemesan, menunggu penerimaan oleh kurir.
2. `accepted`: Kurir menerima pesanan melalui tombol radar.
3. `picking_up`: Kurir sedang gowes menuju titik penjemputan.
4. `in_transit`: Barang telah masuk tas kurir dan kurir sedang gowes menuju titik antar.
5. `delivered`: Barang telah diterima oleh pihak tujuan, pengantaran selesai.
6. `cancelled`: Pesanan dibatalkan sebelum barang diambil kurir.

---

## 4. Desain Antarmuka & Identitas Visual

### 4.1 Identitas Visual (Urban Utilitarian / Athletic Hi-Vis)
* **Warna Latar**: *Deep Asphalt* (`#0F172A`), *Slate Surface* (`#1E293B`), *Border* (`#334155`).
* **Warna Aksen Utama**: *Hi-Vis Courier Amber* (`#F59E0B`), *Electric Yellow* (`#FACC15`).
* **Warna Eko & Sukses**: *Emerald Green* (`#10B981`).
* **Tipografi**: Modern Geometric Sans-serif (`Inter` / `system-ui`) dengan bobot tebal untuk judul dan angka monospaced untuk metrik speedometer/odometer.

### 4.2 Spesifikasi Komponen

#### A. Role Switcher (`roleSwitcher.js`)
* Posisi: Fixed di bagian atas layar (*dock header*).
* Elemen: 3 tombol pill selektor peran dengan badge counter pesanan aktif.

#### B. Customer View (`customerView.js`)
* **Booking Card**:
  * Input Lokasi Jemput & Antar (dengan pilihan titik favorit perkantoran).
  * Selector Jenis Paket: Dokumen, Berkas, Paket Ringan.
  * Odometer Jarak & Kalkulator Tarif instan.
  * **Eco-Badge**: Menghitung real-time gram $\text{CO}_2$ yang dihemat.
  * Tombol Aksi: `Kirim Sekarang (Gowes Ekspres)` (dinonaktifkan jika jarak $> 8\text{ km}$).
* **Active Order Tracking Card**:
  * Stepper progres: *Mencari Kurir* $\to$ *Menuju Lokasi* $\to$ *Dalam Tas* $\to$ *Terkirim*.
  * Kartu kurir yang bertugas: Foto avatar, nama, jenis sepeda (Track Bike / Road Bike / Cargo), dan tombol kontak.

#### C. Rider View (`riderView.js`)
* **Rider Status Header**:
  * Toggle Switcher: *Siap Gowes (Online)* / *Istirahat (Offline)*.
  * Odometer Harian: Total KM Gowes, Total Antaran Sukses, Total Komisi.
* **Radar Order Terdekat**:
  * Daftar kartu pesanan berstatus `pending` dalam radius jangkauan.
  * Detail kartu: Titik jemput $\to$ antar, jarak km, jenis barang, dan upah kurir.
* **Tombol Aksi 1-Tap Besar**:
  * Mengubah status pesanan secara sekuensial dengan ketukan mudah (tinggi tombol $\ge 52\text{px}$):
    * `[ Terima Pesanan ]` $\to$ `[ Tiba di Titik Jemput ]` $\to$ `[ Paket Masuk Tas & Mulai Gowes ]` $\to$ `[ Selesai Antar ]`.
  * Tombol darurat: `[ Laporkan Kendala / Ban Bocor ]` untuk melepas pesanan jika kurir terhambat.

#### D. Admin / Dispatcher View (`adminView.js`)
* **KPI Metrics Ribbon**:
  * Total Pesanan Aktif, Kurir Siaga (*Available*), Kurir Bertugas (*En Route*), Total $\text{CO}_2$ Terhemat Hari Ini.
* **Tabel Pesanan Terpadu**:
  * Kolom: Order ID, Waktu, Pemesan, Rute, Jenis Barang, Status, Kurir Bertugas, Aksi (*Re-dispatch* jika darurat).
* **Panel Armada (Fleet Status)**:
  * Memantau daftar kurir terdaftar beserta ketersediaan dan rute yang sedang ditempuh.

---

## 5. Penanganan Kasus Khusus (Edge Cases & Error Handling)

1. **Jarak Melebihi Batas**:
   * Validasi terjadi di sisi klien sebelum submit form.
   * Pesan informatif: *"Jarak pengiriman X km melebihi batas operasional kurir sepeda (maksimal 8.0 km). Kami menjaga keselamatan dan kecepatan layanan pesepeda."*
2. **Tidak Ada Kurir Aktif**:
   * Order tetap berstatus `pending`.
   * Layar pemesan menampilkan animasi radar pencarian dengan estimasi waktu tunggu, disertai tombol batalkan pesanan tanpa biaya pembatalan.
   * Dashboard Dispatcher menampilkan indikator peringatan (*unassigned orders alert*).
3. **Pembatalan Pesanan**:
   * Pemesan hanya dapat membatalkan saat status masih `pending` atau `accepted`.
   * Setelah status menjadi `in_transit`, pembatalan dikunci untuk mencegah paket hilang di jalan.
4. **Kendala Fisik Kurir di Jalan**:
   * Jika kurir menekan `Laporkan Kendala`, status pesanan dikembalikan ke `pending` dengan prioritas tinggi di radar kurir lain, dan Dispatcher menerima notifikasi darurat.

---

## 6. Struktur Direktori & Rencana Implementasi

```text
kurir-sepeda/
├── index.html                 # HTML shell, container role dock & main content
├── package.json               # Konfigurasi dependensi Vite
├── vite.config.js             # Konfigurasi dasar Vite
├── src/
│   ├── main.js                # Bootstrap aplikasi & inisialisasi state awal
│   ├── styles/
│   │   ├── variables.css      # Design tokens (warna, font, spacing, shadows)
│   │   ├── main.css           # Shell styling, role switcher, dan layout dasar
│   │   ├── customer.css       # Layout & styling komponen pemesan
│   │   ├── rider.css          # Layout & styling komponen kurir (mobile-friendly)
│   │   └── admin.css          # Layout & styling dashboard admin
│   ├── state/
│   │   ├── store.js           # Central reactive state manager & observer pattern
│   │   └── actions.js         # Fungsi aksi pembaruan state
│   ├── components/
│   │   ├── roleSwitcher.js    # Komponen switcher navigasi peran
│   │   ├── customerView.js    # Komponen pemesan & form order
│   │   ├── riderView.js       # Komponen kurir & tombol aksi 1-tap
│   │   └── adminView.js       # Komponen dashboard dispatcher
│   └── utils/
│       ├── calculator.js      # Kalkulasi tarif, jarak km, dan penghematan CO2
│       └── mockData.js        # Data awal kurir pesepeda & lokasi CBD
└── tests/
    └── calculator.test.js     # Unit test validasi batasan, tarif, dan formula CO2
```

---

## 7. Rencana Verifikasi & Pengujian (Testing Plan)

1. **Unit Testing (`calculator.test.js`)**:
   * Uji batas jarak: Input $\le 8\text{ km}$ valid; input $> 8\text{ km}$ tidak valid.
   * Uji batas bobot: Input $\le 5\text{ kg}$ valid; input $> 5\text{ kg}$ tidak valid.
   * Uji tarif: $2\text{ km} \to \text{Rp 15.000}$; $5\text{ km} \to \text{Rp 25.500}$.
   * Uji formula $\text{CO}_2$: $5\text{ km} \to 600\text{ gram CO}_2$ terselamatkan.
2. **End-to-End User Journey Simulation**:
   * Pemesan membuat pesanan dari Menara Sudirman ke Gedung Kuningan ($3.5\text{ km}$).
   * Pesanan seketika muncul di radar tampilan Kurir.
   * Kurir menerima pesanan dan menekan milestone hingga `delivered`.
   * Tampilan Admin seketika merefleksikan peningkatan total pesanan selesai dan akumulasi meter $\text{CO}_2$.
3. **Accessibility & Responsive Verification**:
   * Tombol tindakan pada Rider View terverifikasi memiliki area klik minimal $48 \times 48\text{px}$.
   * Rasio kontras teks kuning amber pada latar aspal memenuhi standar WCAG AA.
