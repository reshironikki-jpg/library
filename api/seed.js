const admin = require('firebase-admin');

// Inisialisasi Firebase Admin SDK menggunakan Environment Variables Vercel
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined,
    })
  });
}

const db = admin.firestore();

// Data contoh untuk mengisi perpustakaan yang masih kosong
const CONTOH_BUKU = [
  { title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', year: 1980, category: 'Fiksi' },
  { title: 'Laskar Pelangi', author: 'Andrea Hirata', year: 2005, category: 'Fiksi' },
  { title: 'Clean Code', author: 'Robert C. Martin', year: 2008, category: 'Teknologi' },
  { title: 'Sapiens: Riwayat Singkat Umat Manusia', author: 'Yuval Noah Harari', year: 2011, category: 'Sejarah' },
  { title: 'Algoritma dan Pemrograman', author: 'Rinaldi Munir', year: 2016, category: 'Teknologi' }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Seeding mengubah data, jadi hanya menerima POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ success: false, message: 'Gunakan POST untuk mengisi data contoh' });
  }

  try {
    const booksRef = db.collection('books');

    // Aman dijalankan berulang: berhenti kalau koleksi sudah punya data
    const existing = await booksRef.limit(1).get();
    if (!existing.empty) {
      return res.status(200).json({
        success: true,
        seeded: 0,
        message: 'Koleksi buku sudah berisi data, seeding dilewati.'
      });
    }

    const batch = db.batch();
    CONTOH_BUKU.forEach(book => {
      batch.set(booksRef.doc(), {
        ...book,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await batch.commit();

    return res.status(201).json({
      success: true,
      seeded: CONTOH_BUKU.length,
      message: `${CONTOH_BUKU.length} buku contoh berhasil ditambahkan.`,
      data: CONTOH_BUKU
    });
  } catch (error) {
    console.error('Seed Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengisi data contoh',
      error: error.message
    });
  }
};
