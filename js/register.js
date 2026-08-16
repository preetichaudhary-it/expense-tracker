// 1. Session Check
// If a user is already logged in, redirect them directly to the dashboard (index.html)
if (localStorage.getItem("dailySpend_currentUser")) {
  window.location.href = "index.html";
}

// 2. Select DOM Elements using document.getElementById to reference elements from HTML file
const registerForm = document.getElementById("registerForm");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const alertDiv = document.getElementById("alert");

// 3. Alert Display Helper Function
// Shows alert banner with custom message and type ('danger' or 'success')
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
// Listen to the submit event to execute the validation code
registerForm.addEventListener("submit", function(event) {
    // Prevent the default browser reload action when submitting a form
    event.preventDefault();

    // Retrieve input values and trim white spaces from start/end
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // --- Input Validations ---

    // Check if any field is empty
    if (fullName === "" || email === "" || password === "" || confirmPassword === "") {
        showAlert("All fields are required.", "danger");
        return;
    }

    // Validate Email Format using a simple Regular Expression (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert("Please enter a valid email address.", "danger");
        return;
    }

    // Check Password Length (must be at least 6 characters)
    if (password.length < 6) {
        showAlert("Password must be at least 6 characters long.", "danger");
        return;
    }

    // Check if Passwords match
    if (password !== confirmPassword) {
        showAlert("Passwords do not match. Please try again.", "danger");
        return;
    }

    // --- Local Storage Operations ---

    // Retrieve existing users from Local Storage.
    // Since Local Storage only stores strings, we must parse the string back into a JS array using JSON.parse()
    // If no users exist yet, default to an empty array []
    let users = localStorage.getItem("dailySpend_users");
    if (users === null) {
        users = [];
    } else {
        users = JSON.parse(users);
    }

    // Check if the email is already registered in our users array
    // We use a simple loop (or array.find) to look for a matching email
    let emailExists = false;
    for (let i = 0; i < users.length; i++) {
        if (users[i].email.toLowerCase() === email.toLowerCase()) {
            emailExists = true;
            break;
        }
    }

    if (emailExists) {
        showAlert("This email is already registered.", "danger");
        return;
    }

    // Create a new user object
    // (In a real-world app, passwords should be hashed on a server.
    // For this beginner-focused local project, we store the password in plain text.)
    const newUser = {
        id: Date.now(), // Generate a unique timestamp ID
        fullName: fullName,
        email: email,
        password: password
    };

    // Add the new user to our users array
    users.push(newUser);  

    // Save the updated users array back to Local Storage
    // We must convert the JS array into a string using JSON.stringify()
    localStorage.setItem("dailySpend_users", JSON.stringify(users));

    // Show Success Alert
    showAlert("Account created successfully! Redirecting to login...", "success");

    // Reset the form input fields
    registerForm.reset();

    // Redirect to login page after a 1.5-second delay so the user can see the success message
    setTimeout(function() {
        window.location.href = "login.html";
    }, 1500);
}); 