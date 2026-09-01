document
    .getElementById("verifyForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const otp =
            document.getElementById("otp").value.trim();

        const message =
            document.getElementById("message");

        message.style.color = "red";

        // Get email stored during login
        const email = localStorage.getItem("email");

        if (!email) {

            message.innerText = "Email not found. Please login again.";

            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/verify/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        otp: otp
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                message.style.color = "green";
                message.innerText = data.message;

                // Save login session
                localStorage.setItem("loggedIn", "true");

                // Redirect to dashboard
                setTimeout(() => {

                    window.location.href = "/dashboard";

                }, 1000);

            }
            else {

                message.innerText =
                    data.detail || data.message;

            }

        }
        catch (error) {

            console.log(error);

            message.innerText =
                "Unable to connect to server.";

        }

    });