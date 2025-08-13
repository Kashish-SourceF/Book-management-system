class BaseBook {
  constructor(id, title, author, isbn, pubDate, genre, price, bookType = '') {
    this.id = id;
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.pubDate = pubDate;
    this.genre = genre;
    this.price = price;
    this.bookType = bookType;
  }

  // Calculate how old the book is
  calculateBookAge() {
    const publicationDate = new Date(this.pubDate);
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
}

class EBook extends BaseBook {
  constructor(id, title, author, isbn, pubDate, genre, price, fileSize) {
    super(id, title, author, isbn, pubDate, genre, price, 'ebook');
    this.fileSize = fileSize;
  }
}

class PrintedBook extends BaseBook {
  constructor(id, title, author, isbn, pubDate, genre, price, pages) {
    super(id, title, author, isbn, pubDate, genre, price, 'printed');
    this.pages = pages;
  }
}
