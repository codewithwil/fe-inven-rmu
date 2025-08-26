#!/bin/bash
# save this as create-pages.sh and run: chmod +x create-pages.sh && ./create-pages.sh

# Create directory structure
mkdir -p src/app/profil/tentang-perusahaan
mkdir -p src/app/profil/visi-misi
mkdir -p src/app/profil/sejarah
mkdir -p src/app/profil/struktur-organisasi

mkdir -p src/app/solusi/simpan-pinjam
mkdir -p src/app/solusi/sembako
mkdir -p src/app/solusi/kegiatan-sosial

mkdir -p src/app/berita/berita-terbaru
mkdir -p src/app/berita/kegiatan-kami

mkdir -p src/app/sustainability/lingkungan
mkdir -p src/app/sustainability/sosial
mkdir -p src/app/sustainability/tata-kelola

mkdir -p src/app/daftar-anggota

# Create main Profil page
cat > src/app/profil/page.tsx << 'EOF'
export default function Profil() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Profil RMU</h1>
            <p className="text-xl text-gray-600">Informasi lengkap tentang Profil RMU</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Welcome to the Profil RMU section.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Tentang Perusahaan page
cat > src/app/profil/tentang-perusahaan/page.tsx << 'EOF'
export default function TentangPerusahaan() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tentang Perusahaan</h1>
            <p className="text-xl text-gray-600">Informasi tentang perusahaan RMU</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Informasi lengkap tentang perusahaan akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Visi Misi page
cat > src/app/profil/visi-misi/page.tsx << 'EOF'
export default function VisiMisi() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Visi & Misi</h1>
            <p className="text-xl text-gray-600">Visi dan misi RMU untuk masa depan</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Visi</h2>
                  <p className="text-gray-600">Visi perusahaan akan ditampilkan di sini.</p>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Misi</h2>
                  <p className="text-gray-600">Misi perusahaan akan ditampilkan di sini.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Sejarah page
cat > src/app/profil/sejarah/page.tsx << 'EOF'
export default function Sejarah() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sejarah</h1>
            <p className="text-xl text-gray-600">Perjalanan sejarah RMU dari masa ke masa</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Timeline sejarah perusahaan akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Struktur Organisasi page
cat > src/app/profil/struktur-organisasi/page.tsx << 'EOF'
export default function StrukturOrganisasi() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Struktur Organisasi</h1>
            <p className="text-xl text-gray-600">Struktur organisasi dan kepemimpinan RMU</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Bagan struktur organisasi akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create main Solusi page
cat > src/app/solusi/page.tsx << 'EOF'
export default function Solusi() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Solusi RMU</h1>
            <p className="text-xl text-gray-600">Berbagai solusi yang kami tawarkan</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Daftar solusi yang tersedia akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Simpan Pinjam page
cat > src/app/solusi/simpan-pinjam/page.tsx << 'EOF'
export default function SimpanPinjam() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Simpan Pinjam</h1>
            <p className="text-xl text-gray-600">Layanan simpan pinjam untuk anggota</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Informasi layanan simpan pinjam akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Sembako page
cat > src/app/solusi/sembako/page.tsx << 'EOF'
export default function Sembako() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sembako</h1>
            <p className="text-xl text-gray-600">Program penyediaan sembako untuk anggota</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Informasi program sembako akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Kegiatan Sosial page
cat > src/app/solusi/kegiatan-sosial/page.tsx << 'EOF'
export default function KegiatanSosial() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Kegiatan Sosial</h1>
            <p className="text-xl text-gray-600">Program kegiatan sosial RMU</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Informasi kegiatan sosial akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create main Berita page
cat > src/app/berita/page.tsx << 'EOF'
export default function Berita() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Berita</h1>
            <p className="text-xl text-gray-600">Berita terkini dari RMU</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Daftar berita terbaru akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Berita Terbaru page
cat > src/app/berita/berita-terbaru/page.tsx << 'EOF'
export default function BeritaTerbaru() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Berita Terbaru</h1>
            <p className="text-xl text-gray-600">Berita dan pengumuman terkini</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Berita terbaru akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Kegiatan Kami page
cat > src/app/berita/kegiatan-kami/page.tsx << 'EOF'
export default function KegiatanKami() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Kegiatan Kami</h1>
            <p className="text-xl text-gray-600">Dokumentasi kegiatan dan acara RMU</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Galeri kegiatan akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create main Sustainability page
cat > src/app/sustainability/page.tsx << 'EOF'
export default function Sustainability() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sustainability</h1>
            <p className="text-xl text-gray-600">Komitmen RMU terhadap keberlanjutan</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Informasi program sustainability akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Lingkungan page
cat > src/app/sustainability/lingkungan/page.tsx << 'EOF'
export default function Lingkungan() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Lingkungan</h1>
            <p className="text-xl text-gray-600">Program pelestarian lingkungan</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Informasi program lingkungan akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Sosial page
cat > src/app/sustainability/sosial/page.tsx << 'EOF'
export default function Sosial() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sosial</h1>
            <p className="text-xl text-gray-600">Program tanggung jawab sosial</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Informasi program sosial akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Tata Kelola page
cat > src/app/sustainability/tata-kelola/page.tsx << 'EOF'
export default function TataKelola() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tata Kelola</h1>
            <p className="text-xl text-gray-600">Sistem tata kelola perusahaan</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Informasi tata kelola akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Daftar Anggota page
cat > src/app/daftar-anggota/page.tsx << 'EOF'
export default function DaftarAnggota() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Daftar Anggota</h1>
            <p className="text-xl text-gray-600">Formulir pendaftaran anggota baru</p>
          </header>
          <main className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600">Formulir pendaftaran akan ditampilkan di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
EOF

echo "All pages created successfully!"
echo ""
echo "Created the following structure:"
echo "├── src/app/profil/"
echo "│   ├── page.tsx"
echo "│   ├── tentang-perusahaan/page.tsx"
echo "│   ├── visi-misi/page.tsx"
echo "│   ├── sejarah/page.tsx"
echo "│   └── struktur-organisasi/page.tsx"
echo "├── src/app/solusi/"
echo "│   ├── page.tsx"
echo "│   ├── simpan-pinjam/page.tsx"
echo "│   ├── sembako/page.tsx"
echo "│   └── kegiatan-sosial/page.tsx"
echo "├── src/app/berita/"
echo "│   ├── page.tsx"
echo "│   ├── berita-terbaru/page.tsx"
echo "│   └── kegiatan-kami/page.tsx"
echo "├── src/app/sustainability/"
echo "│   ├── page.tsx"
echo "│   ├── lingkungan/page.tsx"
echo "│   ├── sosial/page.tsx"
echo "│   └── tata-kelola/page.tsx"
echo "└── src/app/daftar-anggota/"
echo "    └── page.tsx"
echo ""
echo "Now you can customize each page with your specific content!"