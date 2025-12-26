function checkLogin() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.log("Not logged in");
    } else {
    }
}

async function loadPosts() {
    const token = localStorage.getItem("token");
    const response = await fetch("https://tarmeezacademy.com/api/v1/posts?limit=20", {
        headers: {
            "Authorization": `Bearer ${token || ""}`
        }
    });

    const data = await response.json();
    const posts = data.data;

    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";

    for (const post of posts) {
        const author = post.author;
        const content = `
            <div class="posts">
                <div class="pfp-box">
                    <div>
                        <img class="pfp" src="${author.profile_image}">
                    </div>
                    <div>
                        <span class="name">${author.name}</span>
                        <p class="user">@${author.username}<span class="guest-time"> • ${post.created_at}</span></p>
                    </div>
                </div>

                <p class="title">${post.title || ""}</p>
                
                <img src="${post.image}" class="pic">

                <div class="react">
                    <div class="likes-btn">
                        <img src="images/after-login/homepage/like.svg" alt="heart" class="react-icon">
                        <span>0</span>
                    </div>
                    <button class="comments-btn">
                        <img src="images/after-login/homepage/comment.svg" alt="comment" class="react-icon">
                        <span>${post.comments_count}</span>
                    </button>
                    <button class="shares-btn">
                        <img src="images/after-login/homepage/share.svg" alt="share" class="react-icon">
                    </button>
                </div>
            </div>
        `;
        contentDiv.innerHTML += content;
    }
}

checkLogin();
loadPosts();
