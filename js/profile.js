async function loadProfile() {
  const authToken = localStorage.getItem("token");
  const currentUserJSON = localStorage.getItem("user");

  const loading = document.getElementById("loading");
  const profileContainer = document.querySelector(".profile-container");
  const profileError = document.getElementById("profile-error");
  const userPostsContainer = document.getElementById("user-posts");

  loading.innerHTML = `<img src="images/animation/spinner-60px.gif">`;

  if (!authToken || !currentUserJSON) {
    if (loading) loading.style.display = "none";
    if (profileError) {
      profileError.textContent = "You must be logged in.";
      profileError.style.display = "block";
    }
    return;
  }

  const currentUser = JSON.parse(currentUserJSON);
  const userId =
    new URLSearchParams(window.location.search).get("id") || currentUser.id;

  try {
    const response = await fetch(
      `https://tarmeezacademy.com/api/v1/users/${userId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch user profile");

    const { data } = await response.json();

    const profileImageSrc =
      typeof data.profile_image === "string" && data.profile_image.trim() !== ""
        ? data.profile_image
        : "images/after-login/homepage/blank-profile.png";

    document.getElementById("profile-name").textContent = data.name;
    document.getElementById("profile-username").textContent =
      "@" + data.username;
    const profileImage = document.getElementById("profile-image");
    profileImage.src = profileImageSrc;
    profileImage.onerror = () =>
      (profileImage.src = "images/after-login/homepage/blank-profile.png");

    const editBtn = document.getElementById("edit-profile");
    editBtn.style.display = userId == currentUser.id ? "inline-block" : "none";

    const counter = document.getElementById("counter");
    counter.textContent = data.posts_count || 0;

    profileContainer.style.display = "block";

    await loadUserPosts(userId, authToken, userPostsContainer, currentUser);
  } catch (err) {
    console.error("Error loading profile:", err);
    if (profileError) {
      profileError.textContent =
        "Failed to load profile. Please try again later.";
      profileError.style.display = "block";
    }
  } finally {
    if (loading) loading.style.display = "none";
  }
}

async function loadUserPosts(userId, authToken, container, currentUser) {
  if (!container) return;

  container.innerHTML = "";
  container.style.display = "block";

  try {
    const response = await fetch(
      `https://tarmeezacademy.com/api/v1/users/${userId}/posts`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch user posts");

    const { data } = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:gray;">No posts yet.</p>`;
      return;
    }

    data.forEach((post) => {
      const postBox = document.createElement("div");
      postBox.classList.add("posts-box");
      postBox.dataset.postId = post.id;

      const authorImg =
        typeof post.author?.profile_image === "string" &&
        post.author.profile_image.trim() !== ""
          ? post.author.profile_image
          : "images/after-login/homepage/blank-profile.png";

      const authorName = post.author?.name;
      const authorUsername = post.author?.username;
      const createdAt = post.created_at;

      const postImage =
        typeof post.image === "string" && post.image.trim() !== ""
          ? `<img src="${post.image}" class="pic" onerror="this.src='images/after-login/homepage/blank-profile.png'">`
          : "";

      postBox.innerHTML = `
                <div class="box-container">
                    <div class="pfp-box">
                        <div>
                            <img class="pfp" src="${authorImg}" alt="pfp" onerror="this.src='images/after-login/homepage/blank-profile.png'">
                        </div>
                        <div>
                            <span class="name">${authorName}</span>
                            <p class="user">@${authorUsername}<span class="guest-time"> • ${createdAt}</span></p>
                        </div>
                    </div>
                    <button class="post-manage">
                        <img src="images/after-login/homepage/manage-post.svg">
                    </button>
                        
                    <div class="post-editor" style="display: none;">
                        <button class="edit-post">
                            <img src="../images/home/edit-icon.svg">
                            <span>Edit Post</span>
                        </button>

                        <button class="delete-post">
                            <img src="../images/home/delete-icon.svg">
                            <span>Delete Post</span>
                        </button>

                            <button class="share-post">
                                <img src="../images/home/share-icon.svg">
                                <span>Share</span>
                            </button>
                        </div>
                    </div>

                    <div class="title-container">
                        <p class="edit-error" style="display:none;color:red;text-align:center;"></p>
                        <p class="title">${post.body || ""}</p>
                        <textarea class="edit-title" style="display: none;"></textarea>
                        <div class="title-btns" style="display: none;">
                            <button class="save-edit">Save</button>
                            <button class="cancel-edit">Cancel</button>
                        </div>
                    </div>



                ${postImage}
                <div class="react">
                    <div class="likes-btn">
                        <img src="images/after-login/homepage/like-red.svg" alt="heart" class="react-icon">
                    </div>
                    <button class="comments-btn">
                        <img src="images/after-login/homepage/comment.svg" alt="comment" class="react-icon">
                        <span>${post.comments_count || 0}</span>
                    </button>
                    <button class="shares-btn">
                        <img src="images/after-login/homepage/share.svg" alt="share" class="react-icon">
                    </button>
                </div>
            `;

      container.appendChild(postBox);
    });

    setupProfilePostMenus(container, authToken);
  } catch (err) {
    console.error("Error loading user posts:", err);
    container.innerHTML = `<p style="color:red; text-align:center;">Failed to load posts.</p>`;
  }
}

function setupProfilePostMenus(container, authToken) {
  const posts = container.querySelectorAll(".posts-box");

  posts.forEach((postEl) => {
    const manageBtn = postEl.querySelector(".post-manage");
    if (!manageBtn) return;

    const editor = postEl.querySelector(".post-editor");
    const titleP = postEl.querySelector(".title");
    const textarea = postEl.querySelector(".edit-title");
    const btnsContainer = postEl.querySelector(".title-btns");
    const errorP = postEl.querySelector(".edit-error");

    const editBtn = editor.querySelector(".edit-post");
    const deleteBtn = editor.querySelector(".delete-post");

    manageBtn.onclick = (e) => {
      e.stopPropagation();
      editor.style.display = editor.style.display === "flex" ? "none" : "flex";
    };

    editBtn.onclick = () => {
      errorP.style.display = "none";
      titleP.style.display = "none";
      textarea.style.display = "block";
      textarea.value = titleP.textContent;
      btnsContainer.style.display = "flex";
    };

    const saveBtn = btnsContainer.querySelector(".save-edit");
    const cancelBtn = btnsContainer.querySelector(".cancel-edit");

    saveBtn.onclick = async () => {
      const newBody = textarea.value.trim();
      if (!newBody) {
        errorP.textContent = "Post cannot be empty";
        errorP.style.display = "block";
        return;
      }

      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;

      try {
        const res = await fetch(
          `https://tarmeezacademy.com/api/v1/posts/${postEl.dataset.postId}`,
          {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ body: newBody }),
          }
        );

        if (!res.ok) throw new Error("Failed to save post");

        titleP.textContent = newBody;
        titleP.style.display = "block";
        textarea.style.display = "none";
        btnsContainer.style.display = "none";
        editor.style.display = "none";
        errorP.style.display = "none";
      } catch (err) {
        console.error(err);
        errorP.textContent = "Failed to save post. Try again.";
        errorP.style.display = "block";
      } finally {
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
      }
    };

    cancelBtn.onclick = () => {
      textarea.style.display = "none";
      btnsContainer.style.display = "none";
      titleP.style.display = "block";
      errorP.style.display = "none";
    };

    deleteBtn.onclick = async () => {
      deleteBtn.textContent = "Deleting...";
      deleteBtn.disabled = true;

      try {
        const res = await fetch(
          `https://tarmeezacademy.com/api/v1/posts/${postEl.dataset.postId}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to delete post");

        postEl.remove();
      } catch (err) {
        console.error(err);
        errorP.textContent = "Failed to delete post. Try again.";
        errorP.style.display = "block";
        deleteBtn.textContent = "Delete Post";
        deleteBtn.disabled = false;
      }
    };
  });
}

document.addEventListener("DOMContentLoaded", loadProfile);
