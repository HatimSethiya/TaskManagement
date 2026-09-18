document.addEventListener("DOMContentLoaded", function () {

    const logoutForm =
        document.getElementById("logoutForm");

    const logoutButton =
        document.getElementById("logoutButton");

    if (!logoutForm || !logoutButton) {
        return;
    }

    logoutForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (logoutButton.disabled) {
            return;
        }

        logoutButton.disabled = true;

        try {

            const response = await fetch(
                logoutForm.action,
                {
                    method: "POST",
                    body: new FormData(logoutForm)
                }
            );

            const result = await response.json();

            if (!response.ok) {

                alert(
                    result.message ||
                    "Logout failed."
                );

                logoutButton.disabled = false;
                return;
            }

            window.location.href =
                result.redirectUrl ||
                "/Account/Login";

        }
        catch (error) {

            console.error(
                "Logout error:",
                error
            );

            alert(
                "Something went wrong while logging out."
            );

            logoutButton.disabled = false;
        }
    });
});