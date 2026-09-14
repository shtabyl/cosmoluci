const API_URL = "http://127.0.0.1:8000";

async function getCurrentAdmin() {

    const response = await fetch(`${API_URL}/api/admin/auth/me`, {
        method: "GET",
        credentials: "include"
    });

    console.log("auth/me status:", response.status);

    const data = await response.json();

    console.log("auth/me response:", data);

    if (!response.ok) {
        return null;
    }

    return data;
}


export async function requireAdmin() {

    const admin =
        await getCurrentAdmin();


    console.log("requireAdmin result:", admin);

    if (!admin) {
        console.log("No authenticated admin, redirecting to login");
        window.location.href =
            "login.html";

        return null;

    }


    return admin;

}

async function loginAdmin(
    username,
    password
) {

    const response = await fetch(
        `${API_URL}/api/admin/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                username,
                password
            })
        }
    );


    let data = null;

    try {

        data = await response.json();

    } catch (error) {

        // Ответ не содержит JSON.
        // Обработаем ниже через status.

    }


    if (!response.ok) {

        const message =
            data?.detail ||
            "Не удалось выполнить вход";

        throw new Error(message);

    }


    return data;

}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.querySelector("#login-form");


        if (!form) {

            return;

        }


        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const message =
                    document.querySelector(
                        "#login-message"
                    );


                message.hidden = true;
                message.textContent = "";


                const username =
                    document.querySelector(
                        "#username"
                    ).value.trim();


                const password =
                    document.querySelector(
                        "#password"
                    ).value;


                try {

                    await loginAdmin(
                        username,
                        password
                    );


                    window.location.href =
                        "index.html";


                } catch (error) {

                    console.error(
                        "Login failed:",
                        error
                    );


                    message.textContent =
                        error.message;

                    message.hidden = false;

                }

            }
        );

    }
);