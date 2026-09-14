async function getCurrentAdmin() {

    try {

        const response = await fetch(
            `${API_URL}/api/admin/auth/me`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (!response.ok) {

            return null;

        }


        return await response.json();

    } catch (error) {

        console.error(
            "Failed to check authentication:",
            error
        );

        return null;

    }

}

export async function requireAdmin() {

    const admin =
        await getCurrentAdmin();


    if (!admin) {

        window.location.href =
            "login.html";

        return null;

    }


    return admin;

}