// ----------------------------
// Check Login Status
// ----------------------------
const isLoggedIn = localStorage.getItem("loggedIn");

if (isLoggedIn !== "true") {

    window.location.href = "/login-page";

}

// ----------------------------
// Show Current Date & Time
// ----------------------------
function updateDateTime() {

    const now = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };

    document.getElementById("today").innerHTML =
        now.toLocaleString("en-IN", options);

}

// Show immediately
updateDateTime();

// Update every second
setInterval(updateDateTime, 1000);

// ----------------------------
// Logout
// ----------------------------
document
    .getElementById("logoutBtn")
    .addEventListener("click", function () {

        // Remove login session
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("email");

        alert("Logged out successfully.");

        window.location.href = "/login-page";

    });