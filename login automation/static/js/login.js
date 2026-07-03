document
.getElementById("loginForm")
.addEventListener("submit", async function(event){

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");

    message.style.color = "red";

    try{

        const response = await fetch(
            "/login/",
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    email:email,

                    password:password

                })

            }
        );

        const data = await response.json();
        if (response.ok) {

            message.style.color = "green";

            message.innerText = data.message;

            // Store email for OTP verification
            localStorage.setItem("email", email);

            setTimeout(() => {

                window.location.href = "/verify-page";

            }, 1000);

        }
        else{

            message.innerText =
                data.detail || "Login Failed.";

        }

    }
    catch(error){

        message.innerText =
            "Unable to connect to server.";

    }

});