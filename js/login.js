// 1. Session Check
// If a user is already logged in, redirect them directly to the dashboard (index.html)
if (localStorage.getItem("dailySpend_currentUser")) {
  window.location.href = "index.html";
}

// 2. Select DOM Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const alertDiv = document.getElementById("alert");

// 3. Alert Display Helper Function
function showAlert(message, type) {
    alertDiv.textContent = message;
    alertDiv.style.display = "block"; // Show the alert div

    // Remove existing styles to avoid overlapping states
    alertDiv.classList.remove("alert-danger", "alert-success");

    // Apply the appropriate CSS class based on the type
    if (type === "danger") {
        alertDiv.classList.add("alert-danger");
    } else if (type === "success") {
        alertDiv.classList.add("alert-success");
    }
}

// 4. Form Submit Event Listener
loginForm.addEventListener("submit", function(event) {
    // Prevent the default browser reload action when submitting a form
    event.preventDefault(); 

    // Retrieve input values
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Basic validation to check for empty fields
    if (email === "" || password === "") {
        showAlert("Please fill in all fields.", "danger");
        return;
    }

    // Retrieve the list of registered users from Local Storage
    let users = localStorage.getItem("dailySpend_users");
    if (users === null) {
        users = []; // No users have registered yet
    } else {
        users = JSON.parse(users); // Convert the stored string to a JS array
    }

    // Search for a user with the matching email and password
    let matchedUser = null;
    for (let i = 0; i < users.length; i++) {
        if (users[i].email.toLowerCase() === email.toLowerCase() && users[i].password === password) {
            matchedUser = users[i];
            break; // Stop loop once match is found
        }
    }

    // Verify if a user match was found
    if (matchedUser) {
        // Save user details to Local Storage to represent the "active session"
        // We only save the user ID, Full Name, and Email (not the password) for safety
        const sessionUser = {
            id: matchedUser.id,
            fullName: matchedUser.fullName,
            email: matchedUser.email
        };   

        localStorage.setItem("dailySpend_currentUser", JSON.stringify(sessionUser));
    
        // Show success alert and redirect to dashboard
        showAlert("Login successful! Redirecting...", "success");

        // Clear form inputs
        loginForm.reset();

        // Redirect to dashboard page (index.html) after a 1.2-second delay
        setTimeout(function() {
            window.location.href = "index.html";
        }, 1200);

    } else {
        // If no match, display authentication error
        showAlert("Invalid email or password. Please try again.", "danger");
    }
});
