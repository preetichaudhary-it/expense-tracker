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


// 3 . Session Termination (Logout)
// --------------------------------------------------------------------------
logoutBtn.addEventListener("click", function() {
  // Remove the currentUser session key
  localStorage.removeItem("dailySpend_currentUser");
  
  // Redirect back to login page
  window.location.href = "login.html";
});
