async function loadPosts() {
    const response = await fetch("https://tarmeezacademy.com/api/v1/posts?limit=20");
    const data = await response.json();

    const posts = data.data;
    document.getElementById("content").innerHTML = "";

    for (post of posts) {
        console.log(posts);

        const author = post.author;
        let content = `
            <div class="posts">
                <div class="pfp-box">
                    <div>
                        <img class="pfp" src=${author.profile_image}>
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
        document.getElementById("content").innerHTML += content;
    }
}

loadPosts();
