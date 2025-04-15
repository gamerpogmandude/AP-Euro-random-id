let terms = [];
let blacklist = new Set();

const termDisplay = document.getElementById("term-display");
const termListDiv = document.getElementById("term-list");

const randomizeBtn = document.getElementById("randomize-btn");
const resetBtn = document.getElementById("reset-btn");
const addTermBtn = document.getElementById("add-term-btn");
const categorySelect = document.getElementById("category-select");  // Category dropdown

const newTermInput = document.getElementById("new-term");
const newCategoryInput = document.getElementById("new-category");
const fileInput = document.getElementById("file-input");

// Load data from localStorage
function loadData() {
  const storedTerms = localStorage.getItem("terms");
  const storedBlacklist = localStorage.getItem("blacklist");

  if (storedTerms) {
    terms = JSON.parse(storedTerms);
  }

  if (storedBlacklist) {
    blacklist = new Set(JSON.parse(storedBlacklist));
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem("terms", JSON.stringify(terms));
  localStorage.setItem("blacklist", JSON.stringify([...blacklist]));
}

// Render terms grouped by category
function renderTermList() {
  const categories = {};

  terms.forEach(term => {
    if (!categories[term.category]) {
      categories[term.category] = [];
    }
    categories[term.category].push(term);
  });

  termListDiv.innerHTML = "";

  // Update the category dropdown
  categorySelect.innerHTML = '<option value="">All Categories</option>';
  for (const category in categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  }

  // Render the terms
  for (const category in categories) {
    const section = document.createElement("div");
    section.classList.add("category");

    const heading = document.createElement("h3");
    heading.textContent = category;
    section.appendChild(heading);

    const ul = document.createElement("ul");
    categories[category].forEach(term => {
      const li = document.createElement("li");
      li.textContent = term.name;

      if (blacklist.has(term.name)) {
        li.classList.add("blacklisted");
        li.title = "Click to unblacklist";
      }

      li.addEventListener("click", () => {
        if (blacklist.has(term.name)) {
          blacklist.delete(term.name);
        } else {
          blacklist.add(term.name);
        }
        saveData();
        renderTermList();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = terms.findIndex(t => t.name === term.name);
        if (index !== -1) {
          terms.splice(index, 1);
          saveData();
          renderTermList();
        }
      });

      li.appendChild(deleteBtn);
      ul.appendChild(li);
    });

    section.appendChild(ul);
    termListDiv.appendChild(section);
  }
}

// Random term selection (by category or from all categories)
randomizeBtn.addEventListener("click", () => {
  const selectedCategory = categorySelect.value;
  let availableTerms = terms.filter(term => !blacklist.has(term.name));

  if (selectedCategory) {
    // Filter terms by selected category
    availableTerms = availableTerms.filter(term => term.category === selectedCategory);
  }

  if (availableTerms.length === 0) {
    termDisplay.textContent = "No available terms to select!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * availableTerms.length);
  const selectedTerm = availableTerms[randomIndex];

  termDisplay.textContent = `${selectedTerm.name} (${selectedTerm.category})`;
  blacklist.add(selectedTerm.name);
  saveData();
  renderTermList();
});

// Reset blacklist
resetBtn.addEventListener("click", () => {
  blacklist.clear();
  saveData();
  renderTermList();
  termDisplay.textContent = "Blacklist reset. Ready to go!";
});

// Add a new term
addTermBtn.addEventListener("click", () => {
  const termName = newTermInput.value.trim();
  const category = newCategoryInput.value.trim() || "Uncategorized";

  if (!termName) return;

  // Avoid duplicate names
  if (terms.some(term => term.name.toLowerCase() === termName.toLowerCase())) {
    alert("That term already exists.");
    return;
  }

  terms.push({ name: termName, category });
  saveData();
  renderTermList();

  newTermInput.value = "";
  newCategoryInput.value = "";
});

// Import terms from a file
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const importedTerms = JSON.parse(event.target.result);

      if (Array.isArray(importedTerms)) {
        terms = [...terms, ...importedTerms];
        saveData();
        renderTermList();
      } else {
        alert("Invalid file format. Please upload a valid JSON file.");
      }
    } catch (error) {
      alert("Error reading file: " + error.message);
    }
  };

  reader.readAsText(file);
});

// Initialize
loadData();
renderTermList();
