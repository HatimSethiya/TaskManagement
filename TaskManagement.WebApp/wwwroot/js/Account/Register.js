document.addEventListener("DOMContentLoaded", () => {

    const registerForm =
        document.getElementById("registerForm");

    if (!registerForm) {
        return;
    }


    /*
     * ========================================
     * INPUTS
     * ========================================
     */

    const fullNameInput =
        document.getElementById("FullName");

    const emailInput =
        document.getElementById("Email");

    const passwordInput =
        document.getElementById("Password");

    const confirmPasswordInput =
        document.getElementById("ConfirmPassword");


    /*
     * ========================================
     * BUTTON
     * ========================================
     */

    const registerButton =
        document.getElementById("registerButton");

    const registerButtonText =
        document.getElementById("registerButtonText");

    const registerSpinner =
        document.getElementById("registerSpinner");


    /*
     * ========================================
     * MESSAGE
     * ========================================
     */

    const registerMessage =
        document.getElementById("registerMessage");


    /*
     * ========================================
     * ERRORS
     * ========================================
     */

    const fullNameError =
        document.getElementById("fullNameError");

    const emailError =
        document.getElementById("emailError");

    const passwordError =
        document.getElementById("passwordError");

    const confirmPasswordError =
        document.getElementById("confirmPasswordError");


    /*
     * ========================================
     * PASSWORD TOGGLES
     * ========================================
     */

    const togglePassword =
        document.getElementById("togglePassword");

    const toggleConfirmPassword =
        document.getElementById("toggleConfirmPassword");


    /*
     * ========================================
     * FORM SUBMIT
     * ========================================
     */

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearErrors();
            clearMessage();


            const fullName =
                fullNameInput.value.trim();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            /*
             * ====================================
             * CLIENT VALIDATION
             * ====================================
             */

            let isValid = true;


            if (!fullName) {

                fullNameError.textContent =
                    "Please enter your full name.";

                isValid = false;

            }
            else if (fullName.length < 2) {

                fullNameError.textContent =
                    "Name must contain at least 2 characters.";

                isValid = false;

            }


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
                    "Please create a password.";

                isValid = false;

            }
            else {

                const passwordValidation =
                    validatePassword(password);


                if (!passwordValidation.valid) {

                    passwordError.textContent =
                        passwordValidation.message;

                    isValid = false;

                }

            }


            if (!confirmPassword) {

                confirmPasswordError.textContent =
                    "Please confirm your password.";

                isValid = false;

            }
            else if (password !== confirmPassword) {

                confirmPasswordError.textContent =
                    "Passwords do not match.";

                isValid = false;

            }


            if (!isValid) {
                return;
            }


            /*
             * ====================================
             * ANTI-FORGERY TOKEN
             * ====================================
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


            const token =
                tokenElement.value;


            /*
             * ====================================
             * REQUEST DATA
             * ====================================
             */

            const registerData = {

                fullName: fullName,

                email: email,

                password: password,

                confirmPassword: confirmPassword

            };


            setLoading(true);


            try {

                /*
                 * ASYNC FETCH
                 */

                const response =
                    await fetch(
                        "/Account/Register",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "RequestVerificationToken":
                                    token

                            },

                            body:
                                JSON.stringify(
                                    registerData
                                )

                        }
                    );


                const result =
                    await response.json();


                /*
                 * =================================
                 * SERVER ERROR
                 * =================================
                 */

                if (!response.ok) {

                    showError(
                        result.message ||
                        "Registration failed. Please try again."
                    );

                    return;
                }


                /*
                 * =================================
                 * SUCCESS
                 * =================================
                 */

                showSuccess(
                    result.message ||
                    "Account created successfully."
                );


                /*
                 * =================================
                 * REDIRECT
                 * =================================
                 */

                setTimeout(() => {

                    window.location.href =
                        result.redirectUrl ||
                        "/Account/Login";

                }, 1000);


            }
            catch (error) {

                console.error(
                    "Registration request failed:",
                    error
                );

                showError(
                    "Unable to connect to the server. Please try again."
                );

            }
            finally {

                setLoading(false);

            }

        }
    );


    /*
     * ========================================
     * PASSWORD TOGGLE
     * ========================================
     */

    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            () => {

                toggleInputVisibility(
                    passwordInput,
                    togglePassword
                );

            }
        );

    }


    if (toggleConfirmPassword) {

        toggleConfirmPassword.addEventListener(
            "click",
            () => {

                toggleInputVisibility(
                    confirmPasswordInput,
                    toggleConfirmPassword
                );

            }
        );

    }


    /*
     * ========================================
     * TOGGLE INPUT
     * ========================================
     */

    function toggleInputVisibility(
        input,
        button
    ) {

        const shouldShow =
            input.type === "password";


        input.type =
            shouldShow
                ? "text"
                : "password";


        button.setAttribute(
            "aria-label",
            shouldShow
                ? "Hide password"
                : "Show password"
        );

    }


    /*
     * ========================================
     * PASSWORD VALIDATION
     * ========================================
     */

    function validatePassword(password) {

        if (password.length < 6) {

            return {
                valid: false,
                message:
                    "Password must be at least 6 characters."
            };

        }


        if (!/[A-Z]/.test(password)) {

            return {
                valid: false,
                message:
                    "Password must contain an uppercase letter."
            };

        }


        if (!/[a-z]/.test(password)) {

            return {
                valid: false,
                message:
                    "Password must contain a lowercase letter."
            };

        }


        if (!/[0-9]/.test(password)) {

            return {
                valid: false,
                message:
                    "Password must contain a number."
            };

        }


        return {
            valid: true,
            message: ""
        };

    }


    /*
     * ========================================
     * EMAIL VALIDATION
     * ========================================
     */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    /*
     * ========================================
     * LOADING
     * ========================================
     */

    function setLoading(isLoading) {

        registerButton.disabled =
            isLoading;


        if (isLoading) {

            registerButtonText.textContent =
                "Creating account...";

            registerSpinner.classList.remove(
                "d-none"
            );

        }
        else {

            registerButtonText.textContent =
                "Create account";

            registerSpinner.classList.add(
                "d-none"
            );

        }

    }


    /*
     * ========================================
     * ERROR MESSAGE
     * ========================================
     */

    function showError(message) {

        registerMessage.className =
            "alert alert-danger account-alert";

        registerMessage.textContent =
            message;

        registerMessage.classList.remove(
            "d-none"
        );

    }


    /*
     * ========================================
     * SUCCESS MESSAGE
     * ========================================
     */

    function showSuccess(message) {

        registerMessage.className =
            "alert alert-success account-alert";

        registerMessage.textContent =
            message;

        registerMessage.classList.remove(
            "d-none"
        );

    }


    /*
     * ========================================
     * CLEAR MESSAGE
     * ========================================
     */

    function clearMessage() {

        registerMessage.classList.add(
            "d-none"
        );

        registerMessage.textContent = "";

    }


    /*
     * ========================================
     * CLEAR ERRORS
     * ========================================
     */

    function clearErrors() {

        fullNameError.textContent = "";

        emailError.textContent = "";

        passwordError.textContent = "";

        confirmPasswordError.textContent = "";

    }

});