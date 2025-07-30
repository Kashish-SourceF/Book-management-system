//calculating age of book
function calculateBookAge(pubDate) {
  const publicationDate = new Date(pubDate);
  const today = new Date();

 
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
    //  no. of days in previous month
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

  if (!ageString && days >= 0)
  ageString = `${days} day${days !== 1 ? "s" : ""} `;

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
    .then(books => books.forEach(book => addBookToTable(book)))
    .catch(error => console.error('Error fetching books:', error));
});

//  Handle form submit (both add & update)
bookForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const isbn = document.getElementById('isbn').value.trim();
  const pubDate = document.getElementById('pubDate').value;
  const genre = document.getElementById('genre').value.trim();

  const anyFieldEmpty = !title || !author || !isbn || !pubDate || !genre;
  const isbnNotNumber = isbn && isNaN(isbn);

  if (anyFieldEmpty && isbnNotNumber) {
    alert("Please fill all fields and make sure ISBN is a number.");
    return;
  }
  if (anyFieldEmpty) {
    alert("Please fill in all the fields.");
    return;
  }
  if (isbnNotNumber) {
    alert("ISBN must be a number.");
    return;
  }

  const newBook = { title, author, isbn, pubDate, genre };

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


