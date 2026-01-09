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
    const { data } = await fetchWithRetry(
      `https://tarmeezacademy.com/api/v1/users/${userId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

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

    const primaryBtn = document.getElementById("primary-action");
    const secondaryBtn = document.getElementById("secondary-action");
    const profileBtn = document.getElementById("profile-button");
    const followerCounter = document.getElementById("followers-count");
    const followingCounter = document.getElementById("following-count");
    const profileBio = document.getElementById("profile-bio");
    const profileNav = document.getElementById("pfp-btn");
    const profileNavImg = document.getElementById("pfp-img");

    if (userId == currentUser.id) {
      profileBtn.style.display = "flex";

      followerCounter.style.display = "none";
      followingCounter.style.display = "none";
      profileBio.textContent = `Welcome to my profile!`;

      primaryBtn.textContent = "Edit Profile";
      primaryBtn.onclick = () => (location.href = "editprofile.html");

      secondaryBtn.textContent = "Share Profile";
      secondaryBtn.onclick = () => {
        navigator.clipboard.writeText(`${window.location.origin}/profile.html?id=${userId}`);
        secondaryBtn.textContent = "Copied";
        secondaryBtn.disabled = true;
        secondaryBtn.style.opacity = 0.5;
        secondaryBtn.style.cursor = "not-allowed";

        setTimeout(() => {
          secondaryBtn.textContent = "Share Profile";
          secondaryBtn.disabled = false;
          secondaryBtn.style.opacity = 1;
          secondaryBtn.style.cursor = "pointer";
        }, 2000);
      };
    } else {
      followerCounter.style.display = "flex";
      followingCounter.style.display = "flex";
      profileBio.textContent = "Food & Travel Lover 🍳✈️";

      profileNav.classList.add("non-active");
      profileNav.classList.remove("active");
      profileNavImg.src = "images/after-login/navbar/profile.icon.svg";

      profileBtn.style.display = "none";
      primaryBtn.textContent = "Follow";
      secondaryBtn.textContent = "Message";
    }

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
  container.style.display = "flex";

  try {
    const { data } = await fetchWithRetry(
      `https://tarmeezacademy.com/api/v1/users/${userId}/posts`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

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

      const isOwner = post.author?.id === currentUser.id;

      const manageButton = isOwner
        ? `
      <button class="post-manage">
        <img src="images/after-login/homepage/manage-post.svg">
      </button>
      `
        : "";

      postBox.innerHTML = `
                <div class="box-container">
                    <div class="pfp-box">
                        <div>
                            <img class="pfp" src="${authorImg}" alt="pfp" onerror="this.src='images/after-login/homepage/blank-profile.png'" >
                        </div>
                        <div>
                            <span class="name">${authorName}</span>
                            <p class="user">@${authorUsername}<span class="guest-time"> • ${createdAt}</span></p>
                        </div>
                    </div>
                    ${manageButton}                        
                    <div class="post-editor" style="display: none;">
                        <button class="edit-post">
                            <img src="images/home/edit-icon.svg">
                            <span>Edit Post</span>
                        </button>

                        <button class="delete-post">
                            <img src="images/home/delete-icon.svg">
                            <span>Delete Post</span>
                        </button>

                            <button class="share-post">
                                <img src="images/home/share-icon.svg">
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
                        <img src="images/after-login/homepage/like.svg" alt="heart" class="react-icon">
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
      editor.style.display = "none";
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
        await fetchWithRetry(
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
        await fetchWithRetry(
          `https://tarmeezacademy.com/api/v1/posts/${postEl.dataset.postId}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

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

async function fetchWithRetry(url, options = {}, retries = 3, timeout = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorText}`
        );
      }

      return await response.json();
    } catch (err) {
      console.warn(`Attempt ${attempt} failed for ${url}: ${err.message}`);

      if (attempt === retries) {
        throw new Error(
          `Request failed after ${retries} attempts: ${err.message}`
        );
      }

      const delay = 1000 * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

document.addEventListener("DOMContentLoaded", loadProfile);
