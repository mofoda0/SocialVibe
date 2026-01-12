document.addEventListener("DOMContentLoaded", () => {
  const currentUserJSON = localStorage.getItem("user");
  const userProfileImg = document.getElementById("user-profile");

  if (!currentUserJSON || !userProfileImg) return;

  const currentUser = JSON.parse(currentUserJSON);

  if (
    typeof currentUser.profile_image === "string" &&
    currentUser.profile_image.trim() !== ""
  ) {
    userProfileImg.onerror = () => {
      userProfileImg.src = "images/after-login/homepage/blank-profile.png";
    };
    userProfileImg.src = currentUser.profile_image;
  } else {
    userProfileImg.src = "images/after-login/homepage/blank-profile.png";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    hamburger.classList.toggle("open");
    navMenu.classList.toggle("menu-open");
  });

  document.addEventListener("click", (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      hamburger.classList.remove("open");
      navMenu.classList.remove("menu-open");
    }
  });
});
