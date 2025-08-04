let allBooks = []; // To store all books fetched from the server will be updated when sorting


//calculating age of book
function calculateBookAge(pubDate) {
  const publicationDate = new Date(pubDate);
  const today = new Date();

  // Check for invalid date
  if (isNaN(publicationDate)) return "Invalid date";

  // Check if published today
  if (publicationDate.toDateString() === today.toDateString()) {
    return "Published Today";
  }

  // Check for future date
  if (publicationDate > today) {
    return "Not Published Yet";
  }

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
  if (years > 0)
    ageString += `${years} year${years > 1 ? "s" : ""}`;

  if (months > 0)
    ageString += (ageString ? ", " : "") + `${months} month${months > 1 ? "s" : ""}`;

  if (!ageString && days > 0)
    ageString = `${days} day${days !== 1 ? "s" : ""}`;

  return ageString;
}

const bookForm = document.getElementById('bookForm');
let rowBeingEdited = null;
let currentEditingId = null;

// Base API URL
const API_URL = 'http://localhost:3000/books';

// Load existing data from JSON Server
window.addEventListener('DOMContentLoaded', () => {
  fetch(API_URL)
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch books');
      return response.json();
    })
    .then(books => {
      allBooks = [...books];       // working copy

  renderTable(allBooks); // Render all books initially
})
 .catch(error => console.error('Error fetching books:', error));
});

//search  input event listener
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();

  const filteredBooks = allBooks.filter(book => {
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.isbn.toLowerCase().includes(query) ||
      book.pubDate.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query)
    );
  });

  renderTable(filteredBooks);
});

 
 bookForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const isbn = document.getElementById('isbn').value.trim();
  const pubDate = document.getElementById('pubDate').value;
  const genre = document.getElementById('genre').value.trim();
 
  // form submission error handling 
  const validationErrors = [];

if (!title) validationErrors.push("Title is required.");
if (!author) validationErrors.push("Author is required.");
if (!isbn) validationErrors.push("ISBN is required.");
if (!pubDate) validationErrors.push("Publication Date is required.");
if (!genre) validationErrors.push("Genre is required.");
if (isbn && isNaN(isbn)) validationErrors.push("ISBN must be a number.");

if (validationErrors.length > 0) {
  alert(validationErrors.join('\n')); // Show all errors at once
  return;
}

  const newBook = { title, author, isbn, pubDate, genre };


// Set the ID manually if you're not editing
if (!currentEditingId) {
  const maxId = allBooks.reduce((max, book) => Math.max(max, parseInt(book.id) || 0), 0);
  newBook.id = maxId + 1;
}


  //  If editing an existing book
  if (currentEditingId) {
    fetch(`${API_URL}/${currentEditingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBook)
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update book');
        return response.json();
      })
      .then(updatedBook => {
        alert(`Book "${updatedBook.title}" updated successfully!`);

        // Update the book in allBooks array
       const index = allBooks.findIndex(book => book.id === updatedBook.id);
       if (index !== -1) {
       allBooks[index] = updatedBook;
  }

        if (rowBeingEdited) {
        const cells = rowBeingEdited.querySelectorAll('td');
        cells[0].textContent = updatedBook.title;
        cells[1].textContent = updatedBook.author;
        cells[2].textContent = updatedBook.isbn;
        cells[3].textContent = updatedBook.pubDate;
        cells[4].textContent = updatedBook.genre;
        cells[5].textContent = calculateBookAge(updatedBook.pubDate);
      }
        bookForm.reset();
        document.getElementById('submitBtn').textContent = 'Add Book';
        currentEditingId = null;
        rowBeingEdited = null;
      })
      .catch(error => {
        console.error('Error updating book:', error);
        alert('Failed to update book on server.');
      });

  } else {
    // Add new book (POST)
    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBook)
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to add book');
        return response.json();
      })
      .then(addedBook => {
        alert(`Book "${addedBook.title}" added successfully!`);
        bookForm.reset();
        addBookToTable(addedBook);
        allBooks.push(addedBook); // after successful POST

      })
      .catch(error => {
        console.error('Error:', error);
        alert('Something went wrong while adding the book.');
      });
  }
});
function addBookToTable(book) {
  const tableBody = document.querySelector('#bookTable tbody');
  const row = document.createElement('tr');


  // Title
  const titleCell = document.createElement('td');
  titleCell.textContent = book.title;
  titleCell.className = 'text-left px-4 py-2 border';
  row.appendChild(titleCell);

  // Author
  const authorCell = document.createElement('td');
  authorCell.textContent = book.author;
  authorCell.className = 'text-left px-4 py-2 border';
  row.appendChild(authorCell);

  // ISBN
  const isbnCell = document.createElement('td');
  isbnCell.textContent = book.isbn;
  isbnCell.className = 'text-center px-4 py-2 border';
  row.appendChild(isbnCell);

  // Publication Date
  const pubDateCell = document.createElement('td');
  pubDateCell.textContent = book.pubDate;
  pubDateCell.className = 'text-center px-4 py-2 border';
  row.appendChild(pubDateCell);

  // Genre
  const genreCell = document.createElement('td');
  genreCell.textContent = book.genre;
  genreCell.className = 'text-center px-4 py-2 border';
  row.appendChild(genreCell);

  // Age
  const ageCell = document.createElement('td');
  ageCell.textContent = calculateBookAge(book.pubDate);
  ageCell.className = 'text-center px-4 py-2 border';
  row.appendChild(ageCell);

  // Actions
  const actionsCell = document.createElement('td');
  actionsCell.className = 'text-center px-4 py-2 border';

  // Edit button
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.className = 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2';
  actionsCell.appendChild(editButton);

editButton.addEventListener('click', () => {
  currentEditingId = book.id; //  save the ID of the book being edited
  rowBeingEdited= row;

  document.getElementById('title').value = book.title;
  document.getElementById('author').value = book.author;
  document.getElementById('isbn').value = book.isbn;
  document.getElementById('pubDate').value = book.pubDate;
  document.getElementById('genre').value = book.genre;
  document.getElementById('submitBtn').textContent = 'Update Book';
});


  // Delete button
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded';
  actionsCell.appendChild(deleteButton);

  deleteButton.addEventListener('click', () => {
  // If the row being deleted is currently being edited
  if (rowBeingEdited === row) {
    rowBeingEdited = null;
    bookForm.reset();
    document.getElementById('submitBtn').textContent = 'Add Book';
  }
  row.remove();
  allBooks = allBooks.filter(b => b.id !== book.id);


  // Remove data from JSON Server
  fetch(`http://localhost:3000/books/${book.id}`, {
    method: 'DELETE'
  }).catch(error => {
    console.error("Failed to delete from server:", error);
  });
 
});


  row.appendChild(actionsCell);
  tableBody.appendChild(row);
}

function renderTable(bookArray) {
  const tableBody = document.querySelector('#bookTable tbody');
  tableBody.innerHTML = ""; // Clear existing rows

  bookArray.forEach(book => addBookToTable(book)); // Add rows
}

function sortBooksBy(field, direction) {
  const isNumeric = field === 'isbn';
  const isDate = field === 'pubDate';
  const isAge = field === 'age';

  allBooks.sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    if (isAge) {
      valA = new Date() - new Date(a.pubDate);
      valB = new Date() - new Date(b.pubDate);
    } else if (isDate) {
      valA = new Date(valA);
      valB = new Date(valB);
    } else if (isNumeric) {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
    } else {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  renderTable(allBooks);
}

//restore original order of table after sorting 
function resetToOriginalOrder() {
  fetch(API_URL)
    .then(res => {
      if (!res.ok) throw new Error("Failed to re-fetch books");
      return res.json();
    })
    .then(freshBooks => {
      allBooks = [...freshBooks];        // Update working copy
      renderTable(freshBooks);           // Display latest data
    })
    .catch(err => console.error("Reset failed:", err));
}


// Map of header field names to their associated button/dropdown elements
const sortConfig = [
  { field: 'title', btnId: 'titleSortBtn', dropdownId: 'titleDropdown', headerId: 'titleHeaderText' },
  { field: 'author', btnId: 'authorSortBtn', dropdownId: 'authorDropdown', headerId: 'authorHeaderText' },
  { field: 'isbn', btnId: 'isbnSortBtn', dropdownId: 'isbnDropdown', headerId: 'isbnHeaderText' },
  { field: 'pubDate', btnId: 'pubDateSortBtn', dropdownId: 'pubDateDropdown', headerId: 'pubDateHeaderText' },
  { field: 'genre', btnId: 'genreSortBtn', dropdownId: 'genreDropdown', headerId: 'genreHeaderText' },
  { field: 'age', btnId: 'ageSortBtn', dropdownId: 'ageDropdown', headerId: 'ageHeaderText' }
];

// Attach event listeners to each ▼ button and dropdown
sortConfig.forEach(({ field, btnId, dropdownId, headerId }) => {
  const btn = document.getElementById(btnId);
  const dropdown = document.getElementById(dropdownId);
  const header = document.getElementById(headerId);

  if (btn && dropdown) {
    // Toggle dropdown visibility
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent global click handler from hiding it
      dropdown.classList.toggle('hidden');
    });

    // Sort when clicking dropdown option
    const buttons = dropdown.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const direction = button.getAttribute('data-sort');
        sortBooksBy(field, direction);
        dropdown.classList.add('hidden');
      });
    });
  }

  if (header) {
    // Clicking on column text resets the table to original order
    header.addEventListener('click', (e) => {
      resetToOriginalOrder();
    });
  }
});

// Hide all dropdowns when clicking elsewhere
document.addEventListener('click', () => {
  sortConfig.forEach(({ dropdownId }) => {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) dropdown.classList.add('hidden');
  });
});
