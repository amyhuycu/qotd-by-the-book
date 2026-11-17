
// ==========================================
// CONFIGURATION
// ==========================================

// Paste your published Google Sheets CSV URL here.

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6TSGPp8Cn0UGahathfzyc0NLjRM15pSTe_qPFNbENJRarayixqOjaR2bUDRkVmcBQ6agscBpOiCXE/pub?gid=0&single=true&output=csv"

// ==========================================
// WEBSITE ELEMENTS
// ==========================================

const quoteElement = document.getElementById("quote");

const bookElement = document.getElementById("book");

const authorElement = document.getElementById("author");

const button = document.getElementById("newQuoteBtn");

const counter = document.getElementById("counter");


// ==========================================
// VARIABLES
// ==========================================

let quotes = [];

let currentIndex = -1;


// ==========================================
// LOAD QUOTES FROM GOOGLE SHEETS
// ==========================================


async function loadQuotes() {

  try {

      button.disabled = true;
      quoteElement.textContent = "Loading your quotes...";

      const response = await fetch(SHEET_URL);

      if (!response.ok) {
          throw new Error(
              "Google Sheets returned status " + response.status
          );
      }

      const csvText = await response.text();

      console.log("CSV received:", csvText.slice(0, 500));

      // Check that we received CSV rather than an HTML page.
      if (csvText.trim().startsWith("<")) {
          throw new Error(
              "Received HTML instead of CSV. Check your published URL."
          );
      }

      const result = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim()
      });

      console.log("Parsed spreadsheet:", result.data);

      // Check column names.
      const headers = result.meta.fields || [];

      const requiredColumns = [
          "ID",
          "Quote",
          "Author",
          "Book",
          "Tags"
      ];

      const missingColumns = requiredColumns.filter(
          column => !headers.includes(column)
      );

      if (missingColumns.length > 0) {
          throw new Error(
              "Missing columns: " + missingColumns.join(", ")
          );
      }

      // Convert spreadsheet rows into quote objects.
      quotes = result.data.map(row => ({

          id: row["ID"]?.trim() || "",

          quote: row["Quote"]?.trim() || "",

          author: row["Author"]?.trim() || "",

          book: row["Book"]?.trim() || "",

          tags: row["Tags"]
              ?.split(",")
              .map(tag => tag.trim())
              .filter(Boolean) || []

      })).filter(item => item.id && item.quote);

      if (quotes.length === 0) {
          throw new Error("No valid quotes found in your sheet.");
      }

      showNewQuote();

      console.log("Successfully loaded", quotes.length, "quotes.");

  } catch (error) {

      console.error("Quote loading error:", error);

      quoteElement.textContent = error.message;

      bookElement.textContent = "";
      authorElement.textContent = "";
      counter.textContent = "";

  } finally {

      button.disabled = quotes.length === 0;

  }

}


// ==========================================
// DISPLAY A RANDOM QUOTE
// ==========================================

function showNewQuote() {

    if (quotes.length === 0) return;

    let newIndex;


    // Avoid showing the same quote twice consecutively.

    if (quotes.length === 1) {

        newIndex = 0;

    } else {

        do {

            newIndex = Math.floor(Math.random() * quotes.length);

        } while (newIndex === currentIndex);

    }


    currentIndex = newIndex;


    // Get selected quote.

    const selected = quotes[currentIndex];


    // Update website.

    quoteElement.textContent = selected.quote;

    bookElement.textContent = selected.book;

    authorElement.textContent = selected.author;


    // Update quote counter.

    counter.textContent =
        `Quote ${selected.id} · ${quotes.length} quotes in collection`;

}


// ==========================================
// BUTTON EVENT
// ==========================================

button.addEventListener("click", showNewQuote);


// ==========================================
// START WEBSITE
// ==========================================

loadQuotes();
