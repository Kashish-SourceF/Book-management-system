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


  // EDIT mode — update existing row instead of adding new one
  if (rowBeingEdited !== null) {
    const cells = rowBeingEdited.querySelectorAll('td');
    cells[0].textContent = title;
    cells[1].textContent = author;
    cells[2].textContent = isbn;
    cells[3].textContent = pubDate;
    cells[4].textContent = genre;
    cells[5].textContent = calculateBookAge(pubDate) ;


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

//**AGE 
  const ageCell = document.createElement('td');
  ageCell.textContent = calculateBookAge(pubDate);
  row.appendChild(ageCell);

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

});
