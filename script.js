
// FALLBACK function (kept from your original) — used if a plain object sneaks in
function calculateBookAge_fallback(pubDate) {
  const publicationDate = new Date(pubDate);
  const today = new Date();

  if (isNaN(publicationDate)) return "Invalid date";
  if (publicationDate.toDateString() === today.toDateString()) return "Published Today";
  if (publicationDate > today) return "Not Published Yet";

  let years = today.getFullYear() - publicationDate.getFullYear();
  let months = today.getMonth() - publicationDate.getMonth();
  let days = today.getDate() - publicationDate.getDate();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  let ageString = "";
  if (years > 0) ageString += `${years} year${years > 1 ? "s" : ""}`;
  if (months > 0) ageString += (ageString ? ", " : "") + `${months} month${months > 1 ? "s" : ""}`;
  if (!ageString && days > 0) ageString = `${days} day${days !== 1 ? "s" : ""}`;

  return ageString;
}

class BookManager {
  constructor(apiUrl = 'http://localhost:3000/books') {
    this.API_URL = apiUrl;
    this.books = [];                 // holds class instances (BaseBook/EBook/PrintedBook)
    this.currentEditingId = null;    // id being edited (null if adding)
    this.rowBeingEdited = null;      // DOM <tr> being edited (for in-place updates)
  }

  // initialize: load & bind events
  async init() {
    await this.loadBooks();
    this.setupEventListeners();
  }

  // ---- FETCH and INSTANCE CREATION ----
  async loadBooks() {
    try {
      const res = await fetch(this.API_URL);
      if (!res.ok) throw new Error('Failed to fetch books');
      const raw = await res.json();
      this.books = raw.map(b => this.createBookInstance(b));
      this.renderTable();
    } catch (err) {
      console.error('Error loading books:', err);
    }
  }

  createBookInstance(bookData = {}) {
    // bookData might come from API (with id) or from form (no id for new)
    if (bookData.bookType === 'ebook') {
      return new EBook(
        bookData.id, bookData.title, bookData.author, bookData.isbn,
        bookData.pubDate, bookData.genre, bookData.price, bookData.fileSize
      );
    }
    if (bookData.bookType === 'printed') {
      return new PrintedBook(
        bookData.id, bookData.title, bookData.author, bookData.isbn,
        bookData.pubDate, bookData.genre, bookData.price, bookData.pages
      );
    }
    return new BaseBook(
      bookData.id, bookData.title, bookData.author, bookData.isbn,
      bookData.pubDate, bookData.genre, bookData.price, bookData.bookType || ''
    );
  }

  // helper to safely get age (will call class method when available)
  getBookAge(book) {
    if (book && typeof book.calculateBookAge === 'function') return book.calculateBookAge();
    // fallback for plain objects
    return calculateBookAge_fallback(book.pubDate);
  }

  // ---- ADD / UPDATE / DELETE ----
  async addBook(formData) {
    // formData is a plain object (no id) or may be compiled from createBookInstance earlier
    const instance = this.createBookInstance(formData);
    // Prepare payload (plain object) for API
    const payload = {
      title: instance.title,
      author: instance.author,
      isbn: instance.isbn,
      pubDate: instance.pubDate,
      genre: instance.genre,
      price: instance.price,
      bookType: instance.bookType || ''
    };
    if (instance.bookType === 'ebook') payload.fileSize = instance.fileSize;
    if (instance.bookType === 'printed') payload.pages = instance.pages;

    try {
      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to add book');
      const added = await res.json();
      this.books.push(this.createBookInstance(added));
      this.renderTable();
      alert(`Book "${added.title}" added!`);
      document.getElementById('bookForm').reset();
    } catch (err) {
      console.error('Error adding book:', err);
      alert('Something went wrong while adding the book.');
    }
  }

  async updateBook(id, formData) {
    // Build payload (plain object)
    const payload = {
      title: formData.title,
      author: formData.author,
      isbn: formData.isbn,
      pubDate: formData.pubDate,
      genre: formData.genre,
      price: formData.price,
      bookType: formData.bookType || ''
    };
    if (formData.bookType === 'ebook') payload.fileSize = formData.fileSize || null;
    if (formData.bookType === 'printed') payload.pages = formData.pages || null;

    try {
      const res = await fetch(`${this.API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update book');
      const updated = await res.json();

      // Replace local instance
      const idx = this.books.findIndex(b => String(b.id) === String(updated.id));
      if (idx !== -1) {
        this.books[idx] = this.createBookInstance(updated);
      } else {
        // if not found, just push
        this.books.push(this.createBookInstance(updated));
      }

      this.renderTable();
      alert(`Book "${updated.title}" updated successfully!`);
      document.getElementById('bookForm').reset();
      document.getElementById('submitBtn').textContent = 'Add Book';
      this.currentEditingId = null;
      this.rowBeingEdited = null;
    } catch (err) {
      console.error('Error updating book:', err);
      alert('Failed to update book on server.');
    }
  }

  async deleteBook(id, rowRef) {
    // remove from UI immediately (like your original behavior)
    if (rowRef) rowRef.remove();
    this.books = this.books.filter(b => String(b.id) !== String(id));

    try {
      await fetch(`${this.API_URL}/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete book from server:', err);
    }
  }

  // ---- RENDERING ----
  renderTable(bookArray = null) {
    const arr = bookArray || this.books;
    const tableBody = document.querySelector('#bookTable tbody');
    tableBody.innerHTML = '';
    arr.forEach(book => this.addRow(book));
  }

  // add single row (keeps your existing table cell structure + classes)
  addRow(book) {
    const tableBody = document.querySelector('#bookTable tbody');
    const row = document.createElement('tr');
    row.dataset.id = book.id;

    // Title
    const titleCell = document.createElement('td');
    titleCell.textContent = book.title || '';
    titleCell.className = 'text-left px-4 py-2 border';
    row.appendChild(titleCell);

    // Author
    const authorCell = document.createElement('td');
    authorCell.textContent = book.author || '';
    authorCell.className = 'text-left px-4 py-2 border';
    row.appendChild(authorCell);

    // ISBN
    const isbnCell = document.createElement('td');
    isbnCell.textContent = book.isbn || '';
    isbnCell.className = 'text-center px-4 py-2 border';
    row.appendChild(isbnCell);

    // Pub Date
    const pubDateCell = document.createElement('td');
    pubDateCell.textContent = book.pubDate || '';
    pubDateCell.className = 'text-center px-4 py-2 border';
    row.appendChild(pubDateCell);

    // Genre
    const genreCell = document.createElement('td');
    genreCell.textContent = book.genre || '';
    genreCell.className = 'text-center px-4 py-2 border';
    row.appendChild(genreCell);

    // Price (formatted with INR symbol)
    const priceCell = document.createElement('td');
    const p = book.price !== undefined && book.price !== null ? book.price : '';
    priceCell.textContent = p === '' ? '' : `₹${Number(p).toLocaleString('en-IN')}`;
    priceCell.className = 'text-center px-4 py-2 border';
    row.appendChild(priceCell);

    // Age
    const ageCell = document.createElement('td');
    ageCell.textContent = this.getBookAge(book);
    ageCell.className = 'text-center px-4 py-2 border';
    row.appendChild(ageCell);

   
  // Details - show pages for printed, fileSize for ebook, else blank
  const detailsCell = document.createElement('td');
  if (book.bookType === 'ebook') {
    detailsCell.textContent = book.fileSize ? ` EBook(${ book.fileSize}MB)` : '';
  } else if (book.bookType === 'printed') {
    detailsCell.textContent = book.pages ? `Printed(${book.pages}pages)` : '';
  } else {
    detailsCell.textContent = '';
  }
  detailsCell.className = 'text-center px-4 py-2 border';
  row.appendChild(detailsCell);

    // Actions
    const actionsCell = document.createElement('td');
    actionsCell.className = 'text-center px-4 py-2 border';

    // Edit
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2';
    actionsCell.appendChild(editButton);

    editButton.addEventListener('click', () => {
      // set editing state
      this.currentEditingId = book.id;
      this.rowBeingEdited = row;

      // Fill the form
      document.getElementById('title').value = book.title || '';
      document.getElementById('author').value = book.author || '';
      document.getElementById('isbn').value = book.isbn || '';
      document.getElementById('pubDate').value = book.pubDate || '';
      document.getElementById('genre').value = book.genre || '';
      document.getElementById('price').value = book.price !== undefined && book.price !== null ? book.price : '';

      // Book type & subfields
      const ebookRadio = document.getElementById('ebookRadio');
      const printedRadio = document.getElementById('printedRadio');
      const ebookFields = document.getElementById('ebookFields');
      const printedFields = document.getElementById('printedFields');
      const fileSizeInput = document.getElementById('fileSizeMB');
      const pagesInput = document.getElementById('pages');

      // Clear selection & fields
      ebookRadio.checked = false;
      printedRadio.checked = false;
      ebookFields.classList.add('hidden');
      printedFields.classList.add('hidden');
      fileSizeInput.value = '';
      pagesInput.value = '';

      if (book.bookType === 'ebook') {
        ebookRadio.checked = true;
        ebookFields.classList.remove('hidden');
        fileSizeInput.value = book.fileSize || '';
      } else if (book.bookType === 'printed') {
        printedRadio.checked = true;
        printedFields.classList.remove('hidden');
        pagesInput.value = book.pages || '';
      } else {
        // leave both unselected
      }

      document.getElementById('submitBtn').textContent = 'Update Book';
    });

    // Delete
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded';
    actionsCell.appendChild(deleteButton);

    deleteButton.addEventListener('click', () => {
      // If currently editing this row, clear edit state
      if (this.rowBeingEdited === row) {
        this.rowBeingEdited = null;
        this.currentEditingId = null;
        document.getElementById('bookForm').reset();
        document.getElementById('submitBtn').textContent = 'Add Book';
      }

      // Remove from UI & local array & server
      this.deleteBook(book.id, row);
    });

    row.appendChild(actionsCell);
    tableBody.appendChild(row);
  }

  // ---- UI + Event Listeners ----
  setupEventListeners() {
    // form submit (add / update)
    document.getElementById('bookForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      // collect values
      const title = document.getElementById('title').value.trim();
      const author = document.getElementById('author').value.trim();
      const isbn = document.getElementById('isbn').value.trim();
      const pubDate = document.getElementById('pubDate').value;
      const genre = document.getElementById('genre').value.trim();
      const priceRaw = document.getElementById('price').value.trim();
      const price = priceRaw === '' ? '' : Number(priceRaw);

      // bookType radio (may be undefined)
      const bookTypeRadio = document.querySelector('input[name="bookType"]:checked');
      const bookType = bookTypeRadio ? bookTypeRadio.value : '';

      const fileSizeRaw = document.getElementById('fileSizeMB')?.value.trim() || '';
      const pagesRaw = document.getElementById('pages')?.value.trim() || '';

      // VALIDATION (keeps your existing checks + pages/fileSize checks depending on bookType)
      const validationErrors = [];
      if (!title) validationErrors.push("Title is required");
      if (!author) validationErrors.push("Author is required");
      if (!isbn) validationErrors.push("ISBN is required");
      if (!pubDate) validationErrors.push("Publication Date is required");
      if (!genre) validationErrors.push("Genre is required");
      if (isbn && !/^\d{10,13}$/.test(isbn)) validationErrors.push("ISBN must be 10–13 digits");

      // book-type-specific validation
      if (bookType === 'ebook') {
        if (!fileSizeRaw) validationErrors.push("File size is required for EBook");
        else if (!/^\d+(\.\d+)?$/.test(fileSizeRaw)) validationErrors.push("File size must be a number (e.g. 1 or 1.5)");
      } else if (bookType === 'printed') {
        if (!pagesRaw) validationErrors.push("Pages are required for Printed Book");
        else if (!/^\d+$/.test(pagesRaw)) validationErrors.push("Pages must be a whole number");
      }

      if (validationErrors.length > 0) {
        alert(validationErrors.join('\n'));
        return;
      }

      // build data object (do NOT set id when adding; set id only when updating)
      const formData = {
        title,
        author,
        isbn,
        pubDate,
        genre,
        price,
        bookType
      };
      if (bookType === 'ebook') formData.fileSize = Number(fileSizeRaw);
      if (bookType === 'printed') formData.pages = parseInt(pagesRaw, 10);

      if (this.currentEditingId) {
        // update flow
        await this.updateBook(this.currentEditingId, formData);
      } else {
        // add flow
        await this.addBook(formData);
      }
    });

    // Search input (keeps your existing behaviour)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        const filtered = this.books.filter(book => {
          const title = (book.title || '').toString().toLowerCase();
          const author = (book.author || '').toString().toLowerCase();
          const isbn = (book.isbn || '').toString().toLowerCase();
          const pubDate = (book.pubDate || '').toString().toLowerCase();
          const genre = (book.genre || '').toString().toLowerCase();
          const price = (book.price || '').toString().toLowerCase();
          return title.includes(q) || author.includes(q) || isbn.includes(q) || pubDate.includes(q) || genre.includes(q) || price.includes(q);
        });
        this.renderTable(filtered);
      });
    }

    // Sorting config (converts your earlier sortConfig into manager calls)
    const sortConfig = [
      { field: 'title', btnId: 'titleSortBtn', dropdownId: 'titleDropdown', headerId: 'titleHeaderText' },
      { field: 'author', btnId: 'authorSortBtn', dropdownId: 'authorDropdown', headerId: 'authorHeaderText' },
      { field: 'isbn', btnId: 'isbnSortBtn', dropdownId: 'isbnDropdown', headerId: 'isbnHeaderText' },
      { field: 'pubDate', btnId: 'pubDateSortBtn', dropdownId: 'pubDateDropdown', headerId: 'pubDateHeaderText' },
      { field: 'genre', btnId: 'genreSortBtn', dropdownId: 'genreDropdown', headerId: 'genreHeaderText' },
      { field: 'price', btnId: 'priceSortBtn', dropdownId: 'priceDropdown', headerId: 'priceHeaderText' },
      { field: 'age', btnId: 'ageSortBtn', dropdownId: 'ageDropdown', headerId: 'ageHeaderText' }
    ];

    sortConfig.forEach(({ field, btnId, dropdownId, headerId }) => {
      const btn = document.getElementById(btnId);
      const dropdown = document.getElementById(dropdownId);
      const header = document.getElementById(headerId);

      if (btn && dropdown) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('hidden');
        });

        const buttons = dropdown.querySelectorAll('button');
        buttons.forEach(button => {
          button.addEventListener('click', () => {
            const direction = button.getAttribute('data-sort');
            this.sortBooksBy(field, direction);
            dropdown.classList.add('hidden');
          });
        });
      }

      if (header) {
        header.addEventListener('click', () => this.resetToOriginalOrder());
      }
    });

    // Click anywhere hides dropdowns (same as your code)
    document.addEventListener('click', () => {
      sortConfig.forEach(({ dropdownId }) => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) dropdown.classList.add('hidden');
      });
    });

    // Radio toggle logic (allow deselect) - reuses your earlier approach
    const printedRadio = document.getElementById("printedRadio");
    const ebookRadio = document.getElementById("ebookRadio");
    const printedFields = document.getElementById("printedFields");
    const ebookFields = document.getElementById("ebookFields");

    if (printedRadio && ebookRadio && printedFields && ebookFields) {
      printedFields.classList.add("hidden");
      ebookFields.classList.add("hidden");

      function hideAllFields() {
        printedFields.classList.add("hidden");
        ebookFields.classList.add("hidden");
      }

      printedRadio.addEventListener("click", () => {
        if (printedRadio.dataset.checked === "true") {
          printedRadio.checked = false;
          printedRadio.dataset.checked = "false";
          hideAllFields();
        } else {
          printedRadio.dataset.checked = "true";
          ebookRadio.dataset.checked = "false";
          printedFields.classList.remove("hidden");
          ebookFields.classList.add("hidden");
        }
      });

      ebookRadio.addEventListener("click", () => {
        if (ebookRadio.dataset.checked === "true") {
          ebookRadio.checked = false;
          ebookRadio.dataset.checked = "false";
          hideAllFields();
        } else {
          ebookRadio.dataset.checked = "true";
          printedRadio.dataset.checked = "false";
          ebookFields.classList.remove("hidden");
          printedFields.classList.add("hidden");
        }
      });
    }
  }

  // ---- Sorting / Reset ----
  sortBooksBy(field, direction) {
    const isNumericField = field === 'isbn' || field === 'price';
    const isDate = field === 'pubDate';
    const isAge = field === 'age';

    this.books.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (isAge) {
        valA = new Date() - new Date(a.pubDate);
        valB = new Date() - new Date(b.pubDate);
      } else if (isDate) {
        valA = new Date(valA);
        valB = new Date(valB);
      } else if (isNumericField) {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.renderTable();
  }

  async resetToOriginalOrder() {
    await this.loadBooks(); // re-fetch from server (same as before)
  }
}

/* -------------------- INIT -------------------- */
// Create manager and init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const manager = new BookManager();
  manager.init();

  // Expose for debugging in console if you want
  window.bookManager = manager;
});
