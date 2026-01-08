document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file");
  const fileFront = document.getElementById("file-front");
  const fileBox = document.getElementById("profile-file-box");
  fileBox.addEventListener("click", () => {
    fileInput.click();
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      fileFront.value = fileInput.files[0].name;
    } else {
      fileFront.value = "";
    }
  });
});

async function signupBtn(event) {
  event.preventDefault();
  const createBtn = document.getElementById("createBtn");
  const errorText = document.getElementById("signup-error");
  createBtn.textContent = "Loading...";
  createBtn.disabled = true;
  createBtn.style.opacity = 0.5;
  createBtn.style.cursor = "not-allowed";

  errorText.textContent = "";
  const name = document.getElementById("name").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const fileInput = document.getElementById("file");

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      errorText.textContent = "Only PNG, JPG, and JPEG images are allowed.";
      createBtn.textContent = "Create Account";
      createBtn.disabled = false;
      return;
    }
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);
  if (fileInput.files.length > 0) {
    formData.append("image", fileInput.files[0]);
  }

  try {
    const response = await fetch("https://tarmeezacademy.com/api/v1/register", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      errorText.textContent = data.message || "Signup failed";
      throw new Error(data.message || "Signup failed");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "home.html";
    } else {
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Signup failed:", error);
  } finally {
    createBtn.textContent = "Create Account";
    createBtn.disabled = false;
    createBtn.style.opacity = 1;
    createBtn.style.cursor = "pointer";
  }
}
