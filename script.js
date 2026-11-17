
// ==========================================
// GOOGLE SHEETS CONFIGURATION
// ==========================================

// Paste your published Google Sheets CSV URL here.

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6TSGPp8Cn0UGahathfzyc0NLjRM15pSTe_qPFNbENJRarayixqOjaR2bUDRkVmcBQ6agscBpOiCXE/pub?gid=0&single=true&output=csv";


// ==========================================
// WEBSITE ELEMENTS
// ==========================================

const quoteElement = document.getElementById("quote");

const bookElement = document.getElementById("book");

const authorElement = document.getElementById("author");

const tagsElement = document.getElementById("tags");

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

        quoteElement.textContent = "Loading your quotes...";

        button.disabled = true;

        // Fetch the published Google Sheets CSV.

        const response = await fetch(SHEET_URL);

        if (!response.ok) {

            throw new Error(
                "Google Sheets returned status " + response.status
            );

        }

        const csvText = await response.text();

        console.log("CSV received:", csvText.slice(0, 500));


        // Parse CSV.

        const result = Papa.parse(csvText, {

            header: true,

            skipEmptyLines: true,

            transformHeader: header => header.trim()

        });


        // Check CSV parsing errors.

        if (result.errors.length > 0) {

            console.warn("CSV parsing warnings:", result.errors);

        }


        // Check column names.

        const headers = result.meta.fields || [];

        console.log("CSV headers:", headers);

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
                "Missing spreadsheet columns: " +
                missingColumns.join(", ")
            );

        }


        // Convert spreadsheet rows into quote objects.

        quotes = result.data

            .map((row, index) => ({

                // Use existing ID or generate one automatically.

                id: row["ID"]?.trim() ||
                    `Q${String(index + 1).padStart(3, "0")}`,

                quote: row["Quote"]?.trim() || "",

                author: row["Author"]?.trim() || "",

                book: row["Book"]?.trim() || "",

                tags: row["Tags"]

                    ?.split(",")

                    .map(tag => tag.trim())

                    .filter(Boolean) || []

            }))

            // Keep rows that have quote text.

            .filter(item => item.quote);


        console.log("Successfully loaded quotes:", quotes);


        // Check if any quotes were found.

        if (quotes.length === 0) {

            throw new Error(
                "No quotes found. Check that your Quotes tab contains quote text."
            );

        }


        // Display the first random quote.

        showNewQuote();


    } catch (error) {

        console.error("Quote loading error:", error);

        quoteElement.textContent =
            "Oops! " + error.message;

        bookElement.textContent = "";

        authorElement.textContent = "";

        tagsElement.replaceChildren();

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

            newIndex = Math.floor(
                Math.random() * quotes.length
            );

        } while (newIndex === currentIndex);

    }


    currentIndex = newIndex;


    // Get selected quote.

    const selected = quotes[currentIndex];


    // Display quote.

    quoteElement.textContent = selected.quote;


    // Display book title.

    bookElement.textContent = selected.book;


    // Display author.

    authorElement.textContent = selected.author;


    // ======================================
    // DISPLAY TAGS
    // ======================================

    // Clear tags from the previous quote.

    tagsElement.replaceChildren();


    // Create a tag element for each tag.

    selected.tags.forEach(tag => {

        const tagElement = document.createElement("span");

        tagElement.className = "tag";

        tagElement.textContent = tag;

        tagsElement.appendChild(tagElement);

    });


    // ======================================
    // UPDATE QUOTE COUNTER
    // ======================================

    // Do not display the quote ID.

    counter.textContent =
        `${quotes.length} quotes in collection`;

}


// ==========================================
// NEW QUOTE BUTTON
// ==========================================

button.addEventListener("click", showNewQuote);


// ==========================================
// START WEBSITE
// ==========================================

loadQuotes();
