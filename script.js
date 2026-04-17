const enterScreen = document.getElementById("enter-screen");
const mainContent = document.getElementById("main-content");
const music = document.getElementById("bg-music");
const musicBtn = document.getElementById("music-btn");
const musicIcon = musicBtn.querySelector("i");

// Saat user klik di mana saja di layar
enterScreen.addEventListener("click", () => {
  // Smooth fade out
  enterScreen.style.opacity = "0";
  enterScreen.style.visibility = "hidden";
  
  setTimeout(() => {
    enterScreen.style.display = "none";
  }, 800);

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

// ==========================================
// NEW EFFECTS: 3D Tilt & Neon Tail
// ==========================================

const card = document.querySelector(".biolink-container");
const banner = document.querySelector(".banner");

// 1. Create and inject Neon Tail Canvas
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
Object.assign(canvas.style, {
  position: "fixed",
  top: "0", left: "0", 
  width: "100%", height: "100%",
  pointerEvents: "none", 
  zIndex: "10"
});
document.body.appendChild(canvas);

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

let mouse = { x: width/2, y: height/2 };
let trail = [];
const maxTrail = 45;

// 2. Mouse Move Listener for both Tilt & Neon Tail
document.addEventListener("mousemove", (e) => {
  // Update mouse position for Neon Tail
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  // 3D Tilt for Card (only on larger screens & if entered)
  if (window.innerWidth > 768 && enterScreen.style.display === "none") {
    let xAxis = (window.innerWidth / 2 - e.pageX) / 40;
    let yAxis = (window.innerHeight / 2 - e.pageY) / 40;
    card.style.transform = `translateY(0) perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  }
});

let lastMouse = { x: width/2, y: height/2 };
let globalOpacity = 0;
let sparks = [];

function drawTail() {
  ctx.clearRect(0, 0, width, height);
  if (enterScreen.style.display !== "none") {
    requestAnimationFrame(drawTail);
    return;
  }

  // Calculate mouse speed for fade in/out
  let dx = mouse.x - lastMouse.x;
  let dy = mouse.y - lastMouse.y;
  let dist = dx*dx + dy*dy;
  lastMouse = { x: mouse.x, y: mouse.y };
  
  // Target opacity fades in quickly when moving, fades out very slowly when still
  let targetOpacity = dist > 2 ? 1 : 0;
  let fadeSpeed = targetOpacity === 1 ? 0.15 : 0.015;
  globalOpacity += (targetOpacity - globalOpacity) * fadeSpeed;

  trail.push({ x: mouse.x, y: mouse.y });
  if (trail.length > maxTrail) {
    trail.shift();
  }

  if (trail.length > 1 && globalOpacity > 0.05) {
    let isGlitch = Math.random() < 0.05; // 5% chance of glitch per frame
    
    // Spawn spark particles if moving
    if (dist > 4 && Math.random() < 0.5) {
      sparks.push({ 
        x: mouse.x, 
        y: mouse.y, 
        vx: (Math.random() - 0.5) * 4, 
        vy: (Math.random() - 0.5) * 4, 
        life: 1 
      });
    }
    
    for (let i = 1; i < trail.length; i++) {
        let p1 = trail[i-1];
        let p2 = trail[i];
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        
        // Blink Glitch offset at the head of the tail
        let applyGlitch = isGlitch && i > trail.length - 5;
        let ox = applyGlitch ? (Math.random() - 0.5) * 12 : 0;
        let oy = applyGlitch ? (Math.random() - 0.5) * 12 : 0;
        
        ctx.lineTo(p2.x + ox, p2.y + oy);
        
        // Fade effect based on trail length & movement opacity
        let ratio = i / trail.length; 
        
        // Flash white occasionally during a glitch
        let isFlash = applyGlitch && Math.random() > 0.5;
        let rColor = isFlash ? 255 : 37;
        let gColor = isFlash ? 255 : 244;
        let bColor = isFlash ? 255 : 238;
        
        let finalAlpha = ratio * globalOpacity;
        
        ctx.strokeStyle = `rgba(${rColor}, ${gColor}, ${bColor}, ${finalAlpha})`; // Neon Cyan
        ctx.lineWidth = 1.5 * ratio; // Tip is max 1.5px thick (tidak terlalu tebal)
        ctx.lineCap = "round";
        ctx.shadowBlur = isFlash ? 20 : 10 * ratio;
        ctx.shadowColor = isFlash ? "#FFF" : "#25F4EE";
        ctx.stroke();
    }
  }

  // Process and Draw Sparkles
  for (let i = sparks.length - 1; i >= 0; i--) {
    let s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 0.03; // decay rate
    
    if (s.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }
    
    ctx.beginPath();
    ctx.arc(s.x, s.y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${s.life * globalOpacity})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#FFF";
    ctx.fill();
  }

  requestAnimationFrame(drawTail);
}
drawTail();

// Smooth return on hover out
card.addEventListener("mouseenter", () => {
  card.style.transition = "none"; // disable transition for snappy follow
});

card.addEventListener("mouseleave", () => {
  card.style.transition = "all 0.5s ease"; // re-enable transition 
  card.style.transform = `translateY(0) perspective(1000px) rotateY(0deg) rotateX(0deg)`;
});
