document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    const emailInput = document.getElementById("Email");
    const passwordInput = document.getElementById("Password");
    const rememberMeInput = document.getElementById("RememberMe");

    const loginButton = document.getElementById("loginButton");
    const loginButtonText = document.getElementById("loginButtonText");
    const loginSpinner = document.getElementById("loginSpinner");

    const loginMessage = document.getElementById("loginMessage");

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    const togglePassword =
        document.getElementById("togglePassword");


    /*
     * ========================================
     * LOGIN SUBMIT
     * ========================================
     */

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearErrors();
        clearMessage();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeInput.checked;


        /*
         * CLIENT-SIDE VALIDATION
         */

        let isValid = true;

        if (!email) {

            emailError.textContent =
                "Please enter your email.";

            isValid = false;

        }
        else if (!isValidEmail(email)) {

            emailError.textContent =
                "Please enter a valid email address.";

            isValid = false;

        }


        if (!password) {

            passwordError.textContent =
                "Please enter your password.";

            isValid = false;

        }


        if (!isValid) {
            return;
        }


        /*
         * GET ANTI-FORGERY TOKEN
         */

        const tokenElement =
            document.querySelector(
                'input[name="__RequestVerificationToken"]'
            );


        if (!tokenElement) {

            showError(
                "Security token is missing. Please refresh the page."
            );

            return;
        }


        const token = tokenElement.value;


        /*
         * REQUEST DATA
         */

        const loginData = {
            email: email,
            password: password,
            rememberMe: rememberMe
        };


        setLoading(true);


        try {

            /*
             * ASYNC FETCH REQUEST
             */

            const response = await fetch("/Account/Login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "RequestVerificationToken": token
                },

                body: JSON.stringify(loginData)

            });


            const result = await response.json();


            /*
             * SERVER ERROR
             */

            if (!response.ok) {

                showError(
                    result.message ||
                    "Invalid email or password."
                );

                return;
            }


            /*
             * SUCCESS
             */

            showSuccess(
                result.message ||
                "Login successful."
            );


            /*
             * REDIRECT
             */

            setTimeout(() => {

                window.location.href =
                    result.redirectUrl ||
                    "/Home/Index";

            }, 600);


        }
        catch (error) {

            console.error(
                "Login request failed:",
                error
            );

            showError(
                "Unable to connect to the server. Please try again."
            );

        }
        finally {

            setLoading(false);

        }

    });


    /*
     * ========================================
     * PASSWORD VISIBILITY
     * ========================================
     */

    if (togglePassword) {

        togglePassword.addEventListener("click", () => {

            const isPassword =
                passwordInput.type === "password";


            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";


            togglePassword.textContent =
                isPassword
                    ? "◉"
                    : "◉";


            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        });

    }


    /*
     * ========================================
     * LOADING STATE
     * ========================================
     */

    function setLoading(isLoading) {

        loginButton.disabled = isLoading;


        if (isLoading) {

            loginButtonText.textContent =
                "Signing in...";

            loginSpinner.classList.remove(
                "d-none"
            );

        }
        else {

            loginButtonText.textContent =
                "Sign in";

            loginSpinner.classList.add(
                "d-none"
            );

        }

    }


    /*
     * ========================================
     * VALID EMAIL
     * ========================================
     */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    /*
     * ========================================
     * ERROR
     * ========================================
     */

    function showError(message) {

        loginMessage.className =
            "alert alert-danger account-alert";

        loginMessage.textContent =
            message;

        loginMessage.classList.remove(
            "d-none"
        );

    }


    /*
     * ========================================
     * SUCCESS
     * ========================================
     */

    function showSuccess(message) {

        loginMessage.className =
            "alert alert-success account-alert";

        loginMessage.textContent =
            message;

        loginMessage.classList.remove(
            "d-none"
        );

    }


    /*
     * ========================================
     * CLEAR MESSAGE
     * ========================================
     */

    function clearMessage() {

        loginMessage.classList.add(
            "d-none"
        );

        loginMessage.textContent = "";

    }


    /*
     * ========================================
     * CLEAR ERRORS
     * ========================================
     */

    function clearErrors() {

        emailError.textContent = "";
        passwordError.textContent = "";

    }

});