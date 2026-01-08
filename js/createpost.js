document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user"));

  const postTextarea = document.getElementById("post-textarea");
  const postBtn = document.querySelector(".post-btn");
  const fileInput = document.getElementById("post-file-input");
  const imageUploadBtn = document.getElementById("image-upload");
  const postImageDiv = document.querySelector(".post-image");
  const imgPreview = document.getElementById("img-preview");
  const imgUrlText = document.getElementById("img-url");

  const postErrorText = document.createElement("p");
  postErrorText.id = "post-error";
  postErrorText.style.color = "red";
  postImageDiv.parentNode.insertBefore(postErrorText, postImageDiv.nextSibling);

  const userPfp = document.querySelector(".add-post .pfp");
  if (
    typeof userData?.profile_image === "string" &&
    userData.profile_image.trim() !== ""
  ) {
    userPfp.onerror = () => {
      userPfp.src = "images/after-login/homepage/blank-profile.png";
    };
    userPfp.src = userData.profile_image;
  } else {
    userPfp.src = "images/after-login/homepage/blank-profile.png";
  }

  const updatePostBtnState = () => {
    if (postTextarea.value.trim() !== "" || fileInput.files.length > 0) {
      postBtn.style.opacity = "1";
      postBtn.disabled = false;
    } else {
      postBtn.style.opacity = "0.5";
      postBtn.disabled = true;
    }
  };
  postTextarea.addEventListener("input", updatePostBtnState);

  imageUploadBtn.addEventListener("click", (event) => {
    event.preventDefault();
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        postErrorText.textContent =
          "Invalid image type. Only PNG, JPG, JPEG allowed.";
        fileInput.value = "";
        postImageDiv.style.display = "none";
        updatePostBtnState();
        return;
      }

      postErrorText.textContent = "";
      postImageDiv.style.display = "flex";
      imgPreview.src = URL.createObjectURL(file);
      imgUrlText.textContent = file.name;
    } else {
      postImageDiv.style.display = "none";
      postErrorText.textContent = "";
    }
    updatePostBtnState();
  });

  postBtn.addEventListener("click", async () => {
    const bodyText = postTextarea.value.trim();
    if (!bodyText && fileInput.files.length === 0) return;

    postBtn.innerHTML = `
            <img src="images/after-login/homepage/post.svg" alt="post button">
            <span>Posting...</span>
        `;
    postBtn.disabled = true;
    postErrorText.textContent = "";

    const formData = new FormData();
    formData.append("body", bodyText);
    if (fileInput.files[0]) formData.append("image", fileInput.files[0]);

    try {
      const response = await fetch("https://tarmeezacademy.com/api/v1/posts", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        postErrorText.textContent = data.message || "Failed to create post";
        throw new Error(data.message || "Failed to create post");
      }

      window.location.reload();
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      postBtn.innerHTML = `
            <img src="images/after-login/homepage/post.svg" alt="post button">
            <span>Post</span>
        `;
      postBtn.disabled = false;
    }
  });

  updatePostBtnState();
});
