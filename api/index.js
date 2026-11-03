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

module.exports = async (req, res) => {
  // Atur CORS agar dapat diakses oleh frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;

  try {
    // Endpoint: GET /api/books (Mengambil daftar buku)
    if (method === 'GET' && (url === '/api' || url === '/api/books' || url === '/')) {
      const snapshot = await db.collection('books').orderBy('createdAt', 'desc').get();
      const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ success: true, data: books });
    }

    // Endpoint: POST /api/books (Menambah buku baru)
    if (method === 'POST' && (url === '/api' || url === '/api/books' || url === '/')) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { title, author, year, category } = JSON.parse(body);
          if (!title || !author) {
            return res.status(400).json({ success: false, message: 'Judul dan Penulis wajib diisi!' });
          }

          const newBook = {
            title,
            author,
            year: parseInt(year) || new Date().getFullYear(),
            category: category || 'Umum',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          };

          const docRef = await db.collection('books').add(newBook);
          return res.status(201).json({ success: true, id: docRef.id, message: 'Buku berhasil ditambahkan!' });
        } catch (err) {
          return res.status(400).json({ success: false, message: 'Format JSON tidak valid' });
        }
      });
      return;
    }

    // Endpoint: DELETE /api/books?id=xxx (Menghapus buku berdasarkan ID)
    if (method === 'DELETE') {
      const urlParams = new URL(req.url, `http://${req.headers.host}`);
      const id = urlParams.searchParams.get('id');
      
      if (!id) {
        return res.status(400).json({ success: false, message: 'ID buku diperlukan!' });
      }

      await db.collection('books').doc(id).delete();
      return res.status(200).json({ success: true, message: 'Buku berhasil dihapus!' });
    }

    return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error.message });
  }
};