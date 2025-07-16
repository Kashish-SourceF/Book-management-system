const bookForm = document.getElementById('bookForm');
let rowBeingEdited = null;


bookForm.addEventListener('submit',  (event)=> {         //  function (event) -this is a older way to write functions modern way is using arroy functions
  event.preventDefault();

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const isbn = document.getElementById('isbn').value.trim();
  const pubDate = document.getElementById('pubDate').value;
  const genre = document.getElementById('genre').value.trim();

  const anyFieldEmpty = !title || !author || !isbn || !pubDate || !genre;
  const isbnNotNumber = isbn && isNaN(isbn);

  //error messages
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


  // ✅ EDIT mode — update existing row instead of adding new one
  if (rowBeingEdited) {
    const cells = rowBeingEdited.querySelectorAll('td');
    cells[0].textContent = title;
    cells[1].textContent = author;
    cells[2].textContent = isbn;
    cells[3].textContent = pubDate;
    cells[4].textContent = genre;

    rowBeingEdited = null;
    bookForm.reset();
    document.getElementById('submitBtn').textContent = 'Add Book';
    return;
  }

  alert(`Book "${title}" added successfully!`);


const tableBody = document.querySelector('#bookTable tbody');

const row = document.createElement('tr');

//**TITLE
const titleCell = document.createElement('td');
  titleCell.textContent = title;
  row.appendChild(titleCell);

//**AUTHOR
  const authorCell = document.createElement('td');
  authorCell.textContent = author;
  row.appendChild(authorCell);

//**ISBN
  const isbnCell = document.createElement('td');
  isbnCell.textContent = isbn;
  row.appendChild(isbnCell);

//**PUBLICATION
  const pubDateCell = document.createElement('td');
  pubDateCell.textContent = pubDate;
  row.appendChild(pubDateCell);

//**GENRE
  const genreCell = document.createElement('td');
  genreCell.textContent = genre;
  row.appendChild(genreCell);

//**ACTION
  const actionsCell = document.createElement('td');
  //edit button
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  actionsCell.appendChild(editButton);
    //edit action
     editButton.addEventListener('click', () => {
    rowBeingEdited = row;
    const cells = row.querySelectorAll('td');
    document.getElementById('title').value = cells[0].textContent;
    document.getElementById('author').value = cells[1].textContent;
    document.getElementById('isbn').value = cells[2].textContent;
    document.getElementById('pubDate').value = cells[3].textContent;
    document.getElementById('genre').value = cells[4].textContent;
    
    // ✅ Change button text to "Update Book"
    document.getElementById('submitBtn').textContent = 'Update Book';
  });

  //delete button
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  actionsCell.appendChild(deleteButton);
    //delete action
    deleteButton.addEventListener('click', ()=> {
    row.remove();  
    });

  row.appendChild(actionsCell);


tableBody.appendChild(row);

bookForm.reset();
console.log("Kashish");
});
