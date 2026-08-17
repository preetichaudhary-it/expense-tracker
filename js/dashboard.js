// -----------------1. Auth Guard (Verify Session) ---------------------------
// Retrieve the active user session from Local Storage
const sessionData = localStorage.getItem("dailySpend_currentUser");

// If no active user session exists, redirect immediately to the login page
if (!sessionData) {
  window.location.href = "login.html";
}

// Parse the logged-in user details
const currentUser = JSON.parse(sessionData);

// Set welcome text on the header
document.getElementById("welcomeText").textContent = "Welcome, " + currentUser.fullName + "!";


//---------------2. Select DOM Elements ----------------------------------------------
const logoutBtn = document.getElementById("logoutBtn");

// Statistic Displays
const totalIncomeDisplay = document.getElementById("totalIncome");
const totalExpensesDisplay = document.getElementById("totalExpenses");
const currentBalanceDisplay = document.getElementById("currentBalance");

// Transaction Form Elements
const transactionForm = document.getElementById("transactionForm");
const formTitle = document.getElementById("formTitle");
const editingIdInput = document.getElementById("editingId");
const transTitleInput = document.getElementById("transTitle");
const transAmountInput = document.getElementById("transAmount");
const transTypeSelect = document.getElementById("transType");
const transCategorySelect = document.getElementById("transCategory");
const transDateInput = document.getElementById("transDate");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Filter Elements
const searchInput = document.getElementById("searchVal");
const filterCategorySelect = document.getElementById("filterCategory");
const filterTypeSelect = document.getElementById("filterType");

// List Container
const transactionListContainer = document.getElementById("transactionList");

//-------------------- 3. State Management (Transaction List per User) ------------
// scoping transactions to the current user using a user-specific storage key.
// Example: "dailySpend_transactions_john@example.com"
const transactionStorageKey = "dailySpend_transactions_" + currentUser.email;

// Read existing transactions from Local Storage, defaulting to empty array if none exist
let transactions = [];
const savedTransactions = localStorage.getItem(transactionStorageKey);
if (savedTransactions !== null) {
  transactions = JSON.parse(savedTransactions);
}

// -------------------4. Calculations and Dynamic Display Logic ---------------------------------------
// Recalculates totals (Income, Expense, Balance) based on ALL transactions for the user
function calculateSummary() {
  let totalIncome = 0;
  let totalExpenses = 0;

  // Loop through all transactions to sum up income and expenses
  for (let i = 0; i < transactions.length; i++) {
    const item = transactions[i];
    const amount = parseFloat(item.amount);

    if (item.type === "income") {
      totalIncome += amount;
    } else if (item.type === "expense") {
      totalExpenses += amount;
    }
  }

  const currentBalance = totalIncome - totalExpenses;

  // Update DOM elements with formatted currency (e.g. Rs. 1,234.56)
  totalIncomeDisplay.textContent = "Rs. " + totalIncome.toFixed(2);
  totalExpensesDisplay.textContent = "Rs. " + totalExpenses.toFixed(2);

  // Format current balance (show minus sign if negative)
  if (currentBalance >= 0) {
    currentBalanceDisplay.textContent = "Rs. " + currentBalance.toFixed(2);
  } else {
    // Math.abs turns a negative number into positive for formatting (e.g. -$45.00)
    currentBalanceDisplay.textContent = "-Rs. " + Math.abs(currentBalance).toFixed(2);
  }
}

// Filters and renders transactions inside the history panel
function renderTransactions() {
  // Get current values from filter inputs
  const searchTerm = searchInput.value.toLowerCase().trim();
  const categoryFilter = filterCategorySelect.value;
  const typeFilter = filterTypeSelect.value;

  // Filter array based on search, category, and type
  const filteredTransactions = transactions.filter(function(item) {
    // 1. Search term check: match title (case insensitive)
    const matchesSearch = item.title.toLowerCase().includes(searchTerm);
    
    // 2. Category check: matches selection or "all"
    const matchesCategory = (categoryFilter === "all") || (item.category === categoryFilter);
    
    // 3. Type check: matches selection or "all"
    const matchesType = (typeFilter === "all") || (item.type === typeFilter);

    // Item must satisfy all three filter conditions
    return matchesSearch && matchesCategory && matchesType;
  });

  // Check if there are items to display after filtering
  if (filteredTransactions.length === 0) {
    // Clear container and show the empty state message
    transactionListContainer.innerHTML = `
      <div class="empty-state" id="emptyState">
        No transactions found. Add a transaction or adjust your filters!
      </div>
    `;
    return;
  }

  // Clear previous list contents
  transactionListContainer.innerHTML = "";

  // Loop through filtered list and build layout templates for each transaction
  for (let i = 0; i < filteredTransactions.length; i++) {
    const item = filteredTransactions[i];
    
    // Format amount sign and choose styling class based on transaction type
    let amountSign = "-";
    let amountClass = "amount-expense";
    if (item.type === "income") {
      amountSign = "+";
      amountClass = "amount-income";
    }

    // Format date string to readable format (YYYY-MM-DD to standard viewing format)
    const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    // Create the HTML structure for each item row
    // Inside, embed inline SVGs for Edit (Pencil) and Delete (Trash) buttons
    const transactionRow = `
      <div class="transaction-item">
        <div class="trans-details">
          <span class="trans-title">${item.title}</span>
          <div class="trans-meta">
            <span class="trans-category">${item.category}</span>
            <span class="trans-date">${formattedDate}</span>
          </div>
        </div>
        <div class="trans-right">
          <span class="trans-amount ${amountClass}">${amountSign}Rs. ${parseFloat(item.amount).toFixed(2)}</span>
          <div class="trans-actions">
            <!-- Edit Button -->
            <button class="btn-icon btn-edit" title="Edit Transaction" onclick="editTransaction(${item.id})">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            </button>
            <!-- Delete Button -->
            <button class="btn-icon btn-delete" title="Delete Transaction" onclick="deleteTransaction(${item.id})">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Append the constructed item row into  wrapper
    transactionListContainer.insertAdjacentHTML("beforeend", transactionRow);
  }
}

// Full interface update refresh logic
function updateDashboard() {
  calculateSummary();
  renderTransactions();
}

// ---------------5. Create and Update (Form Handler) ---------------------
// --------------------------------------------------------------------------
transactionForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent standard page refresh

  // Grab form input values
  const editingId = editingIdInput.value;
  const title = transTitleInput.value.trim();
  const amount = parseFloat(transAmountInput.value);
  const type = transTypeSelect.value;
  const category = transCategorySelect.value;
  const date = transDateInput.value;

  // Basic Validation checks
  if (title === "" || isNaN(amount) || amount <= 0 || type === "" || category === "" || date === "") {
    alert("Please fill out all fields with valid details. Amount must be greater than zero.");
    return;
  }

  if (editingId !== "") {
    // --- EDIT MODE: Update existing item ---
    const targetId = parseInt(editingId);

    // Find the item in our array matching targetId and update it
    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].id === targetId) {
        transactions[i].title = title;
        transactions[i].amount = amount;
        transactions[i].type = type;
        transactions[i].category = category;
        transactions[i].date = date;
        break;
      }
    }

    // Reset Form Editing UI States
    editingIdInput.value = "";
    formTitle.textContent = "Add New Transaction";
    submitBtn.textContent = "Add Transaction";
    cancelBtn.style.display = "none";

  } else {
    // --- ADD MODE: Create new transaction ---
    const newTransaction = {
      id: Date.now(), // Generate a unique timestamp identifier
      title: title,
      amount: amount,
      type: type,
      category: category,
      date: date
    };

    // Push new item into transactions array
    transactions.push(newTransaction);
  }

  // Save the modified array back to Local Storage
  localStorage.setItem(transactionStorageKey, JSON.stringify(transactions));

  // Reset all fields in the form
  transactionForm.reset();

  // Refresh user interface
  updateDashboard();
});

// 5. Filters Event Listeners
// --------------------------------------------------------------------------
// Update list instantly when search text is typed
searchInput.addEventListener("input", renderTransactions);

// Update list instantly when Category selection changes
filterCategorySelect.addEventListener("change", renderTransactions);

// Update list instantly when Type selection changes
filterTypeSelect.addEventListener("change", renderTransactions);


// 6. Session Termination (Logout)
// --------------------------------------------------------------------------
logoutBtn.addEventListener("click", function() {
  // Remove the currentUser session key
  localStorage.removeItem("dailySpend_currentUser");
  
  // Redirect back to login page
  window.location.href = "login.html";
});

// 7. Initial Dashboard Load Execution
// --------------------------------------------------------------------------
// Trigger statistical checks and list render immediately on load
updateDashboard();