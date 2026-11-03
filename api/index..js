// Mengambil data buku dari LocalStorage atau menginisialisasi array kosong
let books = JSON.parse(localStorage.getItem('library_books')) || [
  { id: 1, title: 'Pemrograman Web Modern', author: 'Syamil Al Faruq', year: 2026, category: 'Teknologi' },
  { id: 2, title: 'Petualangan Rimba', author: 'Ahmad Zakaria', year: 2023, category: 'Fiksi' }
];

// Element selector
const bookForm = document.getElementById('bookForm');
const bookList = document.getElementById('bookList');
const bookCount = document.getElementById('bookCount');

// Fungsi Render Buku ke Tabel
function renderBooks() {
  bookList.innerHTML = '';
  
  if (books.length === 0) {
    bookList.innerHTML = `
      <tr>
        <td colspan="5" class="py-6 text-center text-slate-400">Belum ada buku tersimpan.</td>
      </tr>
    `;
  } else {
    books.forEach((book, index) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50 transition';
      row.innerHTML = `
        <td class="py-3 px-2 font-medium text-slate-800">${escapeHtml(book.title)}</td>
        <td class="py-3 px-2 text-slate-600">${escapeHtml(book.author)}</td>
        <td class="py-3 px-2 text-slate-600">${book.year}</td>
        <td class="py-3 px-2">
          <span class="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded font-medium">${escapeHtml(book.category)}</span>
        </td>
        <td class="py-3 px-2 text-center">
          <button onclick="deleteBook(${book.id})" class="text-red-500 hover:text-red-700 font-medium text-xs bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition">
            Hapus
          </button>
        </td>
      `;
      bookList.appendChild(row);
    });
  }

  // Update jumlah total buku
  bookCount.textContent = `${books.length} Buku`;
  
  // Simpan ke LocalStorage
  localStorage.setItem('library_books', JSON.stringify(books));
}

// Fungsi Tambah Buku
bookForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const year = document.getElementById('year').value;
  const category = document.getElementById('category').value;

  if (!title || !author || !year) return;

  const newBook = {
    id: Date.now(),
    title,
    author,
    year: parseInt(year),
    category
  };

  books.push(newBook);
  renderBooks();
  bookForm.reset();
});

// Fungsi Hapus Buku
function deleteBook(id) {
  books = books.filter(book => book.id !== id);
  renderBooks();
}

// Security Helper: Helper untuk melepaskan HTML Special Characters
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Initial render saat halaman dimuat
document.addEventListener('DOMContentLoaded', renderBooks);