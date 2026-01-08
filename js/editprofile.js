document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userJSON = localStorage.getItem("user");

  if (!token || !userJSON) {
    location.href = "login.html";
    return;
  }

  const user = JSON.parse(userJSON);

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const saveBtn = document.getElementById("save-btn");
  const userPfp = document.getElementById("user-pfp");
  const usernameCont = document.getElementById("username-container");

  let isSaving = false;

  const errorText = document.createElement("p");
  errorText.style.color = "red";
  errorText.style.fontSize = "14px";
  errorText.style.marginTop = "8px";
  usernameCont.parentNode.insertBefore(errorText, usernameCont);

  const originalUsername = user.username || "";
  usernameInput.value = originalUsername;
  passwordInput.value = "";

  userPfp.src =
    typeof user.profile_image === "string" && user.profile_image.trim() !== ""
      ? user.profile_image
      : "images/after-login/homepage/blank-profile.png";

  userPfp.onerror = () => {
    userPfp.src = "images/after-login/homepage/blank-profile.png";
  };

  const updateButtonState = () => {
    if (isSaving) {
      saveBtn.disabled = true;
      saveBtn.style.opacity = "0.5";
      return;
    }

    const usernameChanged = usernameInput.value.trim() !== originalUsername;
    const passwordChanged = passwordInput.value.trim() !== "";

    if (usernameChanged || passwordChanged) {
      saveBtn.disabled = false;
      saveBtn.style.opacity = "1";
    } else {
      saveBtn.disabled = true;
      saveBtn.style.opacity = "0.5";
    }
  };

  updateButtonState();

  usernameInput.addEventListener("input", updateButtonState);
  passwordInput.addEventListener("input", updateButtonState);

  saveBtn.addEventListener("click", async () => {
    if (isSaving) return;

    errorText.textContent = "";

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username && !password) {
      errorText.textContent = "No changes to save.";
      return;
    }

    try {
      isSaving = true;
      updateButtonState();

      const payload = {};
      if (username !== originalUsername) payload.username = username;
      if (password) payload.password = password;

      const response = await fetch(
        "https://tarmeezacademy.com/api/v1/updatePorfile",
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        errorText.textContent = result.message || "Update failed.";
        return;
      }

      localStorage.setItem("user", JSON.stringify({ ...user, ...result.data }));

      location.href = "profile.html";
    } catch (err) {
      console.error(err);
      errorText.textContent = "Server error. Try again later.";
    } finally {
      isSaving = false;
      updateButtonState();
    }
  });
});
