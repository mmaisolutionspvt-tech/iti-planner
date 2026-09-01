document
.getElementById("signupForm")
.addEventListener("submit", async function(event){

    event.preventDefault();

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirm_password").value;

    const message =
        document.getElementById("message");

    message.style.color = "red";

    // ------------------------
    // Validation
    // ------------------------

    if(password !== confirmPassword){

        message.innerText = "Passwords do not match.";

        return;
    }

    try{

        const response = await fetch(
            "/signup/",
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    name:name,

                    email:email,

                    password:password

                })

            }
        );

        const data = await response.json();

        if(response.ok){

            message.style.color = "green";

            message.innerText = data.message;

            setTimeout(function(){

                window.location.href="/login-page";

            },2000);

        }
        else{

            message.innerText =
                data.detail || "Signup Failed.";

        }

    }
    catch(error){

        message.innerText =
            "Unable to connect to server.";

    }

});