let currentPage = 1;
let isLoading = false;

const authToken = localStorage.getItem("token");
const isLoggedIn = !!authToken;

let currentUser = null;
if (isLoggedIn) {
  try {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    console.warn("No current user found in localStorage");
    currentUser = null;
  }
}

async function loadPosts() {
  const errorHandlingText = document.getElementById("posts-errorHandling");
  if (isLoading) return;
  isLoading = true;

  try {
    const data = await fetchWithRetry(
      `https://tarmeezacademy.com/api/v1/posts?limit=20&page=${currentPage}`
    );
    const posts = data.data;

    if (currentPage === 1) {
      document.getElementById("content").innerHTML = "";
      errorHandlingText.textContent = "";
    }

    for (const post of posts) {
      const author = post.author;

      const profileImg =
        typeof author.profile_image === "string" &&
        author.profile_image.trim() !== ""
          ? author.profile_image
          : "images/after-login/homepage/blank-profile.png";

      const postImg =
        typeof post.image === "string" && post.image.trim() !== ""
          ? `<img src="${post.image}" class="pic">`
          : "";

      const menuButton =
        isLoggedIn && currentUser && author.id === currentUser.id
          ? `<button class="post-manage">
                        <img src="images/after-login/homepage/manage-post.svg">
                   </button>`
          : "";

      const content = `
                <div class="posts" data-post-id="${post.id}">
                    <div class="box-container">
                        <div class="pfp-box">
                            <div>
                                <img class="pfp" src="${profileImg}" ${
        isLoggedIn
          ? `onclick="goToProfile(${author.id})"`
          : `onclick="location.href='login.html'"`
      } onerror="this.src='images/after-login/homepage/blank-profile.png'" style="cursor:pointer">
                            </div>
                            <div>
                                <span class="name" ${
                                  isLoggedIn
                                    ? `onclick="goToProfile(${author.id})"`
                                    : `onclick="location.href='login.html'"`
                                }>${author.name}</span>
                                <p class="user">
                                    @${author.username}
                                    <span class="guest-time"> • ${
                                      post.created_at
                                    }</span>
                                </p>
                            </div>
                        </div>

                        ${menuButton}

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

                    ${postImg}

                    <div class="react">
                        <div class="likes-btn">
                            <img src="images/after-login/homepage/like.svg" class="react-icon">
                        </div>

                        <button class="comments-btn" ${
                          !isLoggedIn
                            ? `onclick="location.href='login.html'"`
                            : ""
                        }>
                            <img src="images/after-login/homepage/comment.svg" class="react-icon">
                            <span>${post.comments_count}</span>
                        </button>

                        <button class="shares-btn">
                            <img src="images/after-login/homepage/share.svg" class="react-icon">
                        </button>
                    </div>

                    ${
                      isLoggedIn
                        ? `<div class="comments-container" style="display:none"></div>`
                        : ""
                    }
                </div>
            `;

      document.getElementById("content").innerHTML += content;
    }

    currentPage++;
    setupPostMenus();
    setupCommentButtons();
  } catch (err) {
    console.error(err);
    errorHandlingText.textContent = "Failed to load posts";
  } finally {
    isLoading = false;
  }
}

function goToProfile(userId) {
  window.location.href = `profile.html?id=${userId}`;
}

function setupPostMenus() {
  document.querySelectorAll(".post-manage").forEach((btn) => {
    const postEl = btn.closest(".posts");
    const editor = postEl.querySelector(".post-editor");
    const titleP = postEl.querySelector(".title");
    const textarea = postEl.querySelector(".edit-title");
    const btnsContainer = postEl.querySelector(".title-btns");
    const errorEl = postEl.querySelector(".edit-error");

    btn.onclick = (e) => {
      e.stopPropagation();
      editor.style.display = editor.style.display === "flex" ? "none" : "flex";
    };

    document.addEventListener("click", (e) => {
      if (!editor.contains(e.target) && editor.style.display === "flex") {
        editor.style.display = "none";
      }
    });

    const editBtn = editor.querySelector(".edit-post");
    editBtn.onclick = () => {
      textarea.value = titleP.textContent;
      titleP.style.display = "none";
      textarea.style.display = "block";
      btnsContainer.style.display = "flex";
      editor.style.display = "none";
    };

    const shareBtn = editor.querySelector(".share-post");
    shareBtn.onclick = async () => {
      navigator.clipboard.writeText(
        `https://tarmeezacademy.com/api/v1/posts/${postEl.dataset.postId}`
      );
      shareBtn.innerHTML = `
          <img src="images/home/share-icon.svg">
          <span>Copied</span>
        `;
      shareBtn.disabled = true;
      shareBtn.style.opacity = 0.5;
      shareBtn.style.cursor = "not-allowed";

      setTimeout(() => {
        shareBtn.innerHTML = `
            <img src="images/home/share-icon.svg">
            <span>Share</span>
          `;
        shareBtn.disabled = false;
        shareBtn.style.opacity = 1;
        shareBtn.style.cursor = "pointer";
      }, 2000);
    };

    const saveBtn = btnsContainer.querySelector(".save-edit");
    saveBtn.onclick = async () => {
      const newBody = textarea.value.trim();
      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;
      saveBtn.style.opacity = "0.5";
      saveBtn.style.cursor = "not-allowed";

      if (!newBody) {
        errorEl.textContent = "Title content cannot be empty.";
        errorEl.style.display = "block";
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
        saveBtn.style.opacity = "1";
        saveBtn.style.cursor = "pointer";
        return;
      }

      if (newBody === titleP.textContent) {
        textarea.style.display = "none";
        btnsContainer.style.display = "none";
        titleP.style.display = "block";
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
        saveBtn.style.opacity = "1";
        saveBtn.style.cursor = "pointer";
        errorEl.textContent = "";
        errorEl.style.display = "none";
        return;
      }

      errorEl.textContent = "";

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
        textarea.style.display = "none";
        btnsContainer.style.display = "none";
        titleP.style.display = "block";
      } catch (err) {
        console.error(err);
      } finally {
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
        saveBtn.style.opacity = "1";
        saveBtn.style.cursor = "pointer";
        errorEl.textContent = "";
        errorEl.style.display = "none";
      }
    };

    const cancelBtn = btnsContainer.querySelector(".cancel-edit");
    cancelBtn.onclick = () => {
      textarea.style.display = "none";
      btnsContainer.style.display = "none";
      titleP.style.display = "block";
      errorEl.textContent = "";
      errorEl.style.display = "none";
    };

    const deleteBtn = editor.querySelector(".delete-post");
    deleteBtn.onclick = async () => {
      deleteBtn.innerHTML = `
            <img src="images/home/delete-icon.svg">
            <span>Deleting...</span>
        `;
      deleteBtn.disabled = true;
      deleteBtn.style.opacity = "0.5";
      deleteBtn.style.cursor = "not-allowed";

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
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Failed to delete post");
      } finally {
        deleteBtn.innerHTML = `
                    <img src="images/home/delete-icon.svg">
                    <span>Delete Post</span>
                `;
        deleteBtn.disabled = false;
        deleteBtn.style.opacity = "1";
        deleteBtn.style.cursor = "pointer";
      }
    };
  });
}

function setupCommentButtons() {
  if (!isLoggedIn || !currentUser) return;

  document.querySelectorAll(".comments-btn").forEach((btn) => {
    btn.onclick = async (e) => {
      const postEl = e.target.closest(".posts");
      const postId = postEl.dataset.postId;
      const container = postEl.querySelector(".comments-container");

      if (container.style.display === "block") {
        container.style.display = "none";
        return;
      }

      if (!container.dataset.loaded) {
        container.style.display = "block";
        container.innerHTML = `<div class="loading-animation">
                    <img src="images/animation/spinner-60px.gif">
                </div>`;

        try {
          await loadComments(postId, container);
          container.dataset.loaded = "true";
        } catch (err) {
          container.innerHTML = `<p style="color:red">Failed to load comments</p>`;
        }
      } else {
        container.style.display = "block";
      }
    };
  });
}

async function loadComments(postId, container) {
  container.innerHTML = `<div class="loading-animation">
        <img id="posts-errorHandling" src="images/animation/spinner-60px.gif">
    </div>`;

  try {
    const data = await fetchWithRetry(
      `https://tarmeezacademy.com/api/v1/posts/${postId}`
    );
    let comments = data.data.comments;
    comments = comments.slice().reverse();

    let html = `<div class="comments">`;
    if (isLoggedIn && currentUser)
      html += `<div class="write-comment-container"></div>`;

    comments.forEach((c) => {
      const commentPfp =
        typeof c.author.profile_image === "string" &&
        c.author.profile_image.trim() !== ""
          ? c.author.profile_image
          : "images/after-login/homepage/blank-profile.png";

      html += `
                <div class="read-comments">
                    <div class="read-comment">
                        <img class="comments-pfp" src="${commentPfp}" onerror="this.src='images/after-login/homepage/blank-profile.png'" onclick="goToProfile(${c.author.id})">
                        <div class="read-text">
                            <div class="text-top">
                                <p onclick="goToProfile(${c.author.id})" style="cursor:pointer;">${c.author.name}</p>
                                <span>${c.body}</span>
                            </div>
                            <div class="text-bottom">
                                <p id="message-date">Now</p>
                                <div id="message-likes">
                                    <img src="images/after-login/homepage/message-like.svg">
                                    <span>Like</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    });

    html += `</div>`;
    container.innerHTML = html;

    if (isLoggedIn && currentUser) {
      const writeContainer = container.querySelector(
        ".write-comment-container"
      );
      setupWriteComment(postId, writeContainer, currentUser);
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load comments</p>";
  }
}

function setupWriteComment(postId, container, currentUser) {
  container.innerHTML = `
        <div class="write-comment">
            <img class="comments-pfp"
                 src="${
                   typeof currentUser.profile_image === "string" &&
                   currentUser.profile_image.trim() !== ""
                     ? currentUser.profile_image
                     : "images/after-login/homepage/blank-profile.png"
                 }"
                 onerror="this.src='images/after-login/homepage/blank-profile.png'">
            <input type="text" placeholder="Write a comment..." id="comment-input-${postId}">
            <button class="post-btn" id="comment-btn-${postId}" disabled style="opacity: 0.5; cursor: not-allowed;">Post</button>
        </div>
    `;

  const input = document.getElementById(`comment-input-${postId}`);
  const btn = document.getElementById(`comment-btn-${postId}`);

  input.addEventListener("input", () => {
    if (input.value.trim() === "") {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    } else {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  });

  btn.addEventListener("click", async () => {
    btn.textContent = "Posting..";
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";

    const body = input.value.trim();
    if (!body) return;

    try {
      await fetchWithRetry(
        `https://tarmeezacademy.com/api/v1/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ body }),
        }
      );

      input.value = "";
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";

      await loadComments(postId, container.parentElement);
    } catch (err) {
      console.error(err);
      alert("Failed to post comment");
    }
  });
}

loadPosts();

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

let ticking = false;

window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        loadPosts();
      }
      ticking = false;
    });
    ticking = true;
  }
});
