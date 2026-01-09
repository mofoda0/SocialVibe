document.addEventListener("DOMContentLoaded", () => {
  const currentUserJSON = localStorage.getItem("user");
  const userProfileImg = document.getElementById("user-profile");

  if (!currentUserJSON) return;

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
