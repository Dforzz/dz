const enterScreen = document.getElementById("enter-screen");
const mainContent = document.getElementById("main-content");
const music = document.getElementById("bg-music");
const musicBtn = document.getElementById("music-btn");
const musicIcon = musicBtn.querySelector("i");

// Saat user klik di mana saja di layar
enterScreen.addEventListener("click", () => {
  enterScreen.style.display = "none";
  mainContent.style.display = "block";
  document.body.classList.remove("entering");

  // Mulai musik setelah interaksi user
  music.play().catch(() => console.log("Music autoplay blocked"));
});

// Tombol mute/unmute musik
musicBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play();
    musicIcon.classList.remove("fa-volume-mute");
    musicIcon.classList.add("fa-volume-up");
  } else if (music.muted) {
    music.muted = false;
    musicIcon.classList.remove("fa-volume-mute");
    musicIcon.classList.add("fa-volume-up");
  } else {
    music.muted = true;
    musicIcon.classList.remove("fa-volume-up");
    musicIcon.classList.add("fa-volume-mute");
  }
});
