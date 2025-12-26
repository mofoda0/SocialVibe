async function loginBtn(){
    const username = document.getElementById("username-input").value;
    const password = document.getElementById("password-input").value;

    const params = {username, password};
    const url = "https://tarmeezacademy.com/api/v1/login";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        });

        if (!response.ok){
            throw new Error("Login failed");
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "../html/after-login/home.html";
    }catch (error){
        console.error("Login failed:", error);
        alert("Invalid username or password");
    }
}

function logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../../index.html";
}
