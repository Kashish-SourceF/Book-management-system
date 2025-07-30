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

// //promise for server request
// function simulateServerRequest(book) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       if (book.title && book.author && book.isbn && book.pubDate && book.genre) {
//         resolve(`Book "${book.title}" added successfully!`);
//       } else {
//         reject("Server validation failed. All fields are required.");
//       }
//     }, 1000);
//   });
// }





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
titleCell.className = 'text-left px-4 py-2 border';
row.appendChild(titleCell);


//**AUTHOR
  const authorCell = document.createElement('td');
  authorCell.textContent = author;
  authorCell.className = 'text-left px-4 py-2 border';
  row.appendChild(authorCell);

//**ISBN
  const isbnCell = document.createElement('td');
  isbnCell.textContent = isbn;
  isbnCell.className = 'text-center px-4 py-2 border';
  row.appendChild(isbnCell);

//**PUBLICATION
  const pubDateCell = document.createElement('td');
  pubDateCell.textContent = pubDate;
  pubDateCell.className = 'text-center px-4 py-2 border';
  row.appendChild(pubDateCell);
  
//**GENRE
  const genreCell = document.createElement('td');
  genreCell.textContent = genre;
  genreCell.className = 'text-center px-4 py-2 border';
  row.appendChild(genreCell);

//**AGE 
  const ageCell = document.createElement('td');
  ageCell.textContent = calculateBookAge(pubDate);
  ageCell.className = 'text-center px-4 py-2 border';
  row.appendChild(ageCell);

//**ACTION
  const actionsCell = document.createElement('td');
  actionsCell.className = 'text-center px-4 py-2 border';

  //edit button
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.className = 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2';
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
    // Change button text to "Update Book"
    document.getElementById('submitBtn').textContent = 'Update Book';
  });

  //delete button
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded';
  actionsCell.appendChild(deleteButton);
    //delete action
    deleteButton.addEventListener('click', ()=> {
    row.remove();  
    });
  row.appendChild(actionsCell);
  tableBody.appendChild(row);

bookForm.reset();

});












// let allApiBooks = []; // memory to store all fetched books globally

// // Fetch external data from API
// function fetchExternalBooks() {
//   fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")  // limit to 5 books
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Failed to fetch API books");
//       }
//       return response.json();
//     })
//     .then((data) => {
//       allApiBooks = data;          // save full data for future filtering
//       displayExternalBooks(data);  // initial full display
//     })
//     .catch((error) => {
//       console.error("API Error:", error);
//     });
// }

// // Display books in table
// function displayExternalBooks(books) {
//   const apiTableBody = document.querySelector("#apiBookTable tbody");
//   apiTableBody.innerHTML = ""; // clear old table content

//   books.forEach((book) => {
//     const row = document.createElement("tr");

//     const titleCell = document.createElement("td");
//     titleCell.textContent = book.title;
//     titleCell.className = 'text-left px-4 py-2 border';
//     row.appendChild(titleCell);

//     const authorCell = document.createElement("td");
//     authorCell.textContent = ` ${book.userId}`;
//     authorCell.className = 'text-center px-4 py-2 border';
//     row.appendChild(authorCell);

//     apiTableBody.appendChild(row);
//   });
// }

// // Filter books based on input
// function filterBooks(keyword) {
//   const filtered = allApiBooks.filter((book) => {
//     const lowerKeyword = keyword.toLowerCase();
//     return (
//       book.title.toLowerCase().startsWith(lowerKeyword) ||book.title.toLowerCase().includes(lowerKeyword) ||  String(book.userId).includes(lowerKeyword)
//     );
//   });

//   displayExternalBooks(filtered); // display only matching books
// }

// // Listen for search input
// const searchInput = document.getElementById("searchInput");
// searchInput.addEventListener("input", (e) => {
//   const keyword = e.target.value.trim();
//   filterBooks(keyword); // filter display as user types
// });

// // Trigger API fetch on page load
// window.addEventListener("load", fetchExternalBooks);





// // Select elements
// const titleHeaderText = document.getElementById("titleHeaderText");
// const titleSortBtn = document.getElementById("titleSortBtn");
// const titleSortDropdown = document.getElementById("titleSortDropdown");
// let originalBookOrder = []; // To store original rows for resetting

// // Save original table rows on load
// window.addEventListener("load", () => {
//   const rows = Array.from(document.querySelectorAll("#bookTable tbody tr"));
//   originalBookOrder = rows.map(row => row.cloneNode(true));
// });

// // Show dropdown on button click
// titleSortBtn.addEventListener("click", (e) => {
//   e.stopPropagation(); // Prevent click from reaching body
//   titleSortDropdown.classList.toggle("hidden");
// });

// // Hide dropdown if clicked outside
// document.body.addEventListener("click", () => {
//   titleSortDropdown.classList.add("hidden");
// });

// // Sorting function
// function sortBooksByTitle(order = "asc") {
//   const tbody = document.querySelector("#bookTable tbody");
//   const rows = Array.from(tbody.querySelectorAll("tr"));

//   rows.sort((a, b) => {
//     const titleA = a.children[0].textContent.toLowerCase();
//     const titleB = b.children[0].textContent.toLowerCase();
//     return order === "asc"
//       ? titleA.localeCompare(titleB)
//       : titleB.localeCompare(titleA);
//   });

//   tbody.innerHTML = "";
//   rows.forEach(row => tbody.appendChild(row));
// }

// // Handle dropdown sort option click
// titleSortDropdown.querySelectorAll("button").forEach(button => {
//   button.addEventListener("click", (e) => {
//     const sortOrder = e.target.getAttribute("data-sort");
//     sortBooksByTitle(sortOrder);
//     titleSortDropdown.classList.add("hidden");
//   });
// });

// // Reset to original order on clicking "Title" text
// titleHeaderText.addEventListener("click", () => {
//   const tbody = document.querySelector("#bookTable tbody");
//   tbody.innerHTML = "";
//   originalBookOrder.forEach(row => tbody.appendChild(row.cloneNode(true)));
// });
