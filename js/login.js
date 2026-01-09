async function loginBtn(event) {
  event.preventDefault();

  const username = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;
  const loginBtn = document.getElementById("login-btn");
  const errorText = document.getElementById("login-error");

  loginBtn.textContent = "Loading...";
  loginBtn.disabled = true;
  loginBtn.style.opacity = 0.5;
  loginBtn.style.cursor = "not-allowed";

  errorText.textContent = "";

  const params = { username, password };
  const url = "https://tarmeezacademy.com/api/v1/login";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      errorText.textContent = data.message || "Login failed";
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "home.html";
  } catch (error) {
    console.log("Login failed:", error);
    if (!errorText.textContent) {
      errorText.textContent = "Password or username is incorrect.";
    }
  } finally {
    loginBtn.textContent = "Login";
    loginBtn.disabled = false;
    loginBtn.style.opacity = 1;
    loginBtn.style.cursor = "pointer";
  }
}

async function logout() {
  const token = localStorage.getItem("token");
  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.innerHTML = `
            <img src="images/after-login/navbar/logout.svg" alt="Log out icon">
            <span>Logging Out...</span>
        `;
  logoutBtn.disabled = true;
  logoutBtn.style.opacity = "0.5";
  logoutBtn.style.cursor = "not-allowed";

  try {
    const response = await fetch("https://tarmeezacademy.com/api/v1/logout", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Logout failed");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Logout failed, try again.");
  } finally {
    logoutBtn.innerHTML = `
            <img src="images/after-login/navbar/logout.svg" alt="Log out icon">
            <span>Log Out</span>
        `;
    logoutBtn.disabled = false;
    logoutBtn.style.opacity = "1";
    logoutBtn.style.cursor = "pointer";
  }
}

const token = localStorage.getItem("token");
const page = window.location.pathname.split("/").pop();
const protectedPages = ["home.html", "profile.html", "editprofile.html"];
const authPages = ["index.html", "login.html", "signup.html"];

if (!token && protectedPages.includes(page)) {
  window.location.href = "index.html";
}

if (token && authPages.includes(page)) {
  window.location.href = "home.html";
}
