const drawCanvas = document.querySelector("#drawCanvas");
const ctx = drawCanvas.getContext("2d");
const clearBtn = document.querySelector("#clearBtn");
const submitBtn = document.querySelector("#submitBtn");
const canvasHint = document.querySelector("#canvasHint");
const colorButtons = document.querySelectorAll(".color-button");
const aiRows = [...document.querySelectorAll(".console-row")];
const reviewList = document.querySelector("#reviewList");
const queueCount = document.querySelector("#queueCount");
const ledScreen = document.querySelector("#ledScreen");
const screenMessage = document.querySelector("#screenMessage");
const liveCount = document.querySelector("#liveCount");
const totalCount = document.querySelector("#totalCount");
const sampleBtn = document.querySelector("#sampleBtn");
const clearScreenBtn = document.querySelector("#clearScreenBtn");
const aigcBtn = document.querySelector("#aigcBtn");
const aigcStatus = document.querySelector("#aigcStatus");
const aigcProgress = document.querySelector("#aigcProgress");
const aigcFilm = document.querySelector("#aigcFilm");
const aigcThumbnails = document.querySelector("#aigcThumbnails");
const aigcGenProgress = document.querySelector("#aigcGenProgress");
const aigcGenBar = document.querySelector("#aigcGenBar");
const aigcGenPercent = document.querySelector("#aigcGenPercent");
const aigcGenStatus = document.querySelector("#aigcGenStatus");
const modeManual = document.querySelector("#modeManual");
const modeAuto = document.querySelector("#modeAuto");
const modeDesc = document.querySelector("#modeDesc");
let autoMode = false;
const flowSteps = [...document.querySelectorAll(".flow-step")];
const particleCanvas = document.querySelector("#particleCanvas");
const particleCtx = particleCanvas.getContext("2d");

let currentColor = "#111827";
let drawing = false;
let hasInk = false;
let queue = [];
let totalApproved = 0;
let liveItems = new Map();
let itemId = 1;
let particles = [];
let aigcRunning = false;
let selectedCategory = null;

const animationTypes = [
  // 人物
  { label: "角色行走", effect: "walk", form: "creature", cat: "creature", note: "角色在屏幕左右行走，帶踢腿擺動。" },
  { label: "角色跳躍", effect: "jump", form: "creature", cat: "creature", note: "角色原地跳躍，有起跳及落地感。" },
  { label: "角色舞蹈", effect: "dance", form: "creature", cat: "creature", note: "角色左右搖擺，帶有節奏感。" },
  { label: "角色揮手", effect: "wave", form: "creature", cat: "creature", note: "角色上下揮手打招呼。" },
  { label: "角色暈頭", effect: "dizzy", form: "creature", cat: "creature", note: "角色暈眩打轉，眼睛冒出星星。" },
  { label: "角色發呆", effect: "idle", form: "creature", cat: "creature", note: "角色輕微呼吸起伏，偶爾眨眼。" },
  { label: "大眼睛", effect: "big-eye", form: "zoom-breathe", cat: "creature", note: "圖案放大眼睛效果，瞳孔黑白分明。" },
  { label: "大嘴巴", effect: "big-mouth", form: "bounce", cat: "creature", note: "嘴巴張合動畫，仿卡通誇張效果。" },
  { label: "傾斜搖晃", effect: "tilt-sway", form: "float", cat: "creature", note: "作品左右傾斜搖擺。" },
  { label: "陰影晃動", effect: "shadow-dance", form: "creature", cat: "creature", note: "影子在地面晃動陪襯。" },
  { label: "縮時效果", effect: "timelapse", form: "bounce", cat: "creature", note: "作品快速變化，如縮時攝影。" },
  { label: "3D翻轉", effect: "flip-3d", form: "zoom-breathe", cat: "creature", note: "作品 3D 翻轉展示。" },
  // 動物
  { label: "動物跑動", effect: "walk", form: "creature", cat: "animal", note: "動物在屏幕左右跑動。" },
  { label: "動物跳躍", effect: "jump", form: "creature", cat: "animal", note: "動物原地跳躍，有活力。" },
  { label: "動物搖擺", effect: "dance", form: "creature", cat: "animal", note: "動物左右搖擺，可愛生動。" },
  { label: "動物暈頭", effect: "dizzy", form: "creature", cat: "animal", note: "動物暈眩打轉，趣怪可愛。" },
  { label: "動物發呆", effect: "idle", form: "creature", cat: "animal", note: "動物輕微呼吸起伏，靜態萌。" },
  { label: "大眼睛", effect: "big-eye", form: "zoom-breathe", cat: "animal", note: "放大眼睛效果，萌翻全場。" },
  { label: "動物彈跳", effect: "spring", form: "bounce", cat: "animal", note: "彈簧式跳躍，活力十足。" },
  { label: "動物漂浮", effect: "float", form: "energy", cat: "animal", note: "能量化漂浮，夢幻感。" },
  { label: "動物旋轉", effect: "spin", form: "orbit", cat: "animal", note: "原地自轉，趣怪效果。" },
  { label: "動物呼吸", effect: "breathe", form: "zoom-breathe", cat: "animal", note: "均勻放大縮小，萌爆呼吸。" },
  { label: "動物閃爍", effect: "twinkle", form: "energy", cat: "animal", note: "光亮閃爍，精靈感。" },
  { label: "動物顏色", effect: "rainbow", form: "aura", cat: "animal", note: "七彩變化，絢麗奪目。" },
  { label: "動物火星", effect: "stardust", form: "energy", cat: "animal", note: "星塵散發，夢幻特效。" },
  { label: "動物泡泡", effect: "bubble", form: "float", cat: "animal", note: "泡泡漂浮，童話感。" },
  // 文字/符號
  { label: "脈搏光環", effect: "glow", form: "aura", cat: "symbol", note: "心形或符號發出脈衝光環。" },
  { label: "能量漂浮", effect: "float", form: "energy", cat: "symbol", note: "抽象線條化為能量體，粒子漂移。" },
  { label: "彈跳文字", effect: "bounce", form: "caption", cat: "symbol", note: "文字彈跳演出，有起落節奏。" },
  { label: "掃光特效", effect: "sweep", form: "caption", cat: "symbol", note: "光帶掠過文字，帶有節奏掃描。" },
  { label: "閃爍特效", effect: "twinkle", form: "energy", cat: "symbol", note: "光亮閃爍，如星光眨眼。" },
  { label: "漂浮白雲", effect: "cloud", form: "float", cat: "symbol", note: "白雲飄入畫面，悠悠漂浮。" },
  { label: "閃電效果", effect: "lightning", form: "energy", cat: "symbol", note: "鋸齒閃電在作品外圍跳動。" },
  { label: "彩虹光譜", effect: "rainbow", form: "aura", cat: "symbol", note: "七彩光環包裹圖案，徐徐轉動。" },
  { label: "心跳脈動", effect: "heartbeat", form: "aura", cat: "symbol", note: "光環随心跳节奏缩放发光。" },
  { label: "波浪起伏", effect: "wave-anim", form: "caption", cat: "symbol", note: "文字如波浪高低起伏。" },
  { label: "旋渦效果", effect: "vortex", form: "orbit", cat: "symbol", note: "作品被吸入旋渦效果中。" },
  { label: "霓虹閃爍", effect: "neon-flicker", form: "caption", cat: "symbol", note: "文字變成霓虹燈，閃爍發光。" },
  { label: "故障效果", effect: "glitch", form: "caption", cat: "symbol", note: "數碼故障風格，錯位色彩。" },
  { label: "軌道旋轉", effect: "spin", form: "orbit", cat: "symbol", note: "加入雙軌道線，圖案在內旋轉。" },
  { label: "縮放呼吸", effect: "zoom-breathe", form: "zoom-breathe", cat: "symbol", note: "整體均勻放大縮小。" },
  { label: "齒輪轉動", effect: "gear-spin", form: "orbit", cat: "symbol", note: "齒輪帶動作品一起轉動。" },
  { label: "齒輪反轉", effect: "gear-reverse", form: "orbit", cat: "symbol", note: "齒輪反向轉動，效果錯位。" },
  { label: "宇宙星雲", effect: "nebula", form: "aura", cat: "symbol", note: "星雲色彩在作品周圍緩慢流動。" },
  { label: "黑洞引力", effect: "blackhole", form: "vortex", cat: "symbol", note: "作品被吸入黑洞效果。" },
  { label: "離心力", effect: "centrifugal", form: "orbit", cat: "symbol", note: "作品被離心力甩向外圍。" },
  { label: "泡泡飄逸", effect: "bubble", form: "float", cat: "symbol", note: "彩色泡泡從作品飄出。" },
  { label: "火焰效果", effect: "fire", form: "energy", cat: "symbol", note: "火焰在作品底部燃燒。" },
  { label: "流星滑落", effect: "shooting-star", form: "energy", cat: "symbol", note: "流星拖着光尾划過屏幕。" },
];

const sampleDrawings = [
  { image: makeSampleSvg("YW", "#155eef", "text"), animation: animationTypes.find((a) => a.effect === "bounce" && a.cat === "symbol") },
  { image: makeSampleSvg("❤", "#e11d48", "heart"), animation: animationTypes.find((a) => a.effect === "glow" && a.cat === "symbol") },
  { image: makeSampleSvg("★", "#f59e0b", "star"), animation: animationTypes.find((a) => a.effect === "spin" && a.cat === "symbol") },
  { image: makeSampleSvg("Hi", "#16a34a", "text"), animation: animationTypes.find((a) => a.effect === "neon-flicker" && a.cat === "symbol") },
];

function setupCanvas() {
  ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 8;
}

function getPoint(event) {
  const rect = drawCanvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  return {
    x: ((clientX - rect.left) / rect.width) * drawCanvas.width,
    y: ((clientY - rect.top) / rect.height) * drawCanvas.height,
  };
}

function startDraw(event) {
  event.preventDefault();
  drawing = true;
  hasInk = true;
  canvasHint.classList.add("is-hidden");
  const point = getPoint(event);
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
}

function draw(event) {
  if (!drawing) return;
  event.preventDefault();
  const point = getPoint(event);
  ctx.strokeStyle = currentColor;
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
}

function stopDraw() {
  drawing = false;
}

function clearCanvas() {
  setupCanvas();
  hasInk = false;
  canvasHint.classList.remove("is-hidden");
}

function setActiveFlow(name) {
  flowSteps.forEach((step) => step.classList.toggle("is-active", step.dataset.flow === name));
}

function setConsoleStage(index) {
  aiRows.forEach((row, rowIndex) => {
    row.classList.toggle("is-done", rowIndex < index);
    row.classList.toggle("is-running", rowIndex === index);
  });
}

function resetConsole() {
  aiRows.forEach((row, index) => {
    row.classList.toggle("is-done", index === 0);
    row.classList.remove("is-running");
  });
}

function randomAnimation() {
  const pool = selectedCategory
    ? animationTypes.filter((a) => a.cat === selectedCategory)
    : animationTypes;
  return pool[Math.floor(Math.random() * pool.length)];
}

function submitDrawing() {
  if (!hasInk) {
    flashHint("請先畫一個圖案或文字");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = autoMode ? "AI 審核中..." : "AI 處理中...";
  setActiveFlow("ai");
  setConsoleStage(1);

  const image = extractCreatureImage();
  const animation = randomAnimation();
  const id = itemId++;

  window.setTimeout(() => setConsoleStage(2), 550);
  window.setTimeout(() => setConsoleStage(3), 1100);
  window.setTimeout(() => {
    if (autoMode) {
      // Auto mode: simulate AI content check then auto-approve
      const aiPassed = Math.random() > 0.05; // 95% pass rate simulation
      if (aiPassed) {
        const fakeItem = { id, image, animation, createdAt: new Date() };
        queue.unshift(fakeItem);
        renderQueue();
        // Auto-approve immediately
        queue = queue.filter((entry) => entry.id !== id);
        addToScreen(fakeItem);
        setActiveFlow("screen");
        // Show brief "AI 自動通過" flash
        const statusEl = document.querySelector(".review-list");
        if (statusEl) {
          const flash = document.createElement("div");
          flash.className = "auto-pass-flash";
          flash.textContent = "✅ AI 自動通過";
          flash.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#16a34a;color:white;padding:8px 20px;border-radius:8px;font-weight:700;font-size:14px;z-index:9999;animation:fadeOut 1.5s forwards";
          document.body.appendChild(flash);
          setTimeout(() => flash.remove(), 1500);
        }
      } else {
        // AI blocked - show rejected flash
        const flash = document.createElement("div");
        flash.textContent = "⚠️ AI 審核攔截，內容不合規範";
        flash.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#dc2626;color:white;padding:8px 20px;border-radius:8px;font-weight:700;font-size:14px;z-index:9999;animation:fadeOut 2s forwards";
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 2000);
      }
    } else {
      // Manual mode: add to review queue
      queue.unshift({
        id,
        image,
        animation,
        createdAt: new Date(),
      });
      renderQueue();
      setActiveFlow("review");
    }

    clearCanvas();
    submitBtn.disabled = false;
    submitBtn.textContent = "提交作品";
    resetConsole();
  }, 1650);
}

function flashHint(text) {
  canvasHint.textContent = text;
  canvasHint.classList.remove("is-hidden");
  window.setTimeout(() => {
    if (!hasInk) canvasHint.textContent = "用滑鼠或手指在這裡畫畫";
  }, 1200);
}

function renderQueue() {
  queueCount.textContent = String(queue.length);

  if (queue.length === 0) {
    reviewList.innerHTML = '<p class="empty-state">暫時未有新作品</p>';
    return;
  }

  reviewList.innerHTML = queue
    .map(
      (item) => `
        <article class="review-item" data-id="${item.id}">
          <img src="${item.image}" alt="待審核作品 ${item.id}">
          <div class="review-meta">
            <strong>${item.animation.label}</strong>
            <p>${item.animation.note}</p>
            <div class="review-actions">
              <button class="approve-btn" type="button" data-action="approve" data-id="${item.id}">批准上屏</button>
              <button class="reject-btn" type="button" data-action="reject" data-id="${item.id}">拒絕</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function handleReviewClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const item = queue.find((entry) => entry.id === id);
  queue = queue.filter((entry) => entry.id !== id);

  if (button.dataset.action === "approve" && item) {
    addToScreen(item);
    setActiveFlow("screen");
  }

  renderQueue();
}

function addToScreen(item) {
  screenMessage.classList.add("is-hidden");

  const art = document.createElement("div");
  const size = randomInt(82, 145);
  const maxX = Math.max(60, ledScreen.clientWidth - size - 40);
  const maxY = Math.max(90, ledScreen.clientHeight - size - 50);
  const x = randomInt(30, maxX);
  const y = randomInt(70, maxY);

  // 隨機動畫速度 + 延遲，令每件作品有「個性」
  const duration = (2 + Math.random() * 2.5).toFixed(2);
  const delay = (Math.random() * 3).toFixed(2);
  const speed = (2800 + Math.random() * 3200).toFixed(0);

  art.className = `live-art ${item.animation.effect} form-${item.animation.form}`;
  art.dataset.id = String(item.id);
  art.style.setProperty("--size", `${size}px`);
  art.style.setProperty("--x", `${x}px`);
  art.style.setProperty("--y", `${y}px`);
  art.style.setProperty("--speed", `${speed}ms`);
  art.style.animationDuration = `${duration}s`;
  art.style.animationDelay = `${delay}s`;
  art.innerHTML = renderLiveArt(item);
  ledScreen.appendChild(art);

  totalApproved += 1;
  liveItems.set(item.id, art);
  updateStats();
  // 華麗粒子效果
  burstParticles(x + size / 2, y + size / 2, 36);
  burstParticles(x + size / 2, y + size / 2, 24);
  createComet(x + size / 2, y + size / 2);
  createComet(x + size / 2, y + size / 2);

  const ttl = randomInt(10000, 16000);
  window.setTimeout(() => removeScreenItem(item.id), ttl);
}

function removeScreenItem(id) {
  const art = liveItems.get(id);
  if (!art) return;

  art.classList.add("fade-out");
  window.setTimeout(() => {
    art.remove();
    liveItems.delete(id);
    updateStats();
    if (liveItems.size === 0) screenMessage.classList.remove("is-hidden");
  }, 720);
}

function updateStats() {
  liveCount.textContent = String(liveItems.size);
  totalCount.textContent = String(totalApproved);
}

function clearScreen() {
  liveItems.forEach((art) => art.remove());
  liveItems.clear();
  updateStats();
  screenMessage.classList.remove("is-hidden");
  setActiveFlow("draw");
}

function runAigcDemo() {
  if (aigcRunning) return;

  aigcRunning = true;
  aigcBtn.disabled = true;
  aigcBtn.textContent = "生成中...";
  aigcFilm.classList.remove("is-playing");
  aigcProgress.dataset.stage = "1";
  aigcStatus.textContent = "Step 1/4 · 正在揀選 3 件精選作品...";

  // Collect thumbnail previews from current screen items
  const thumbs = [];
  let i = 0;
  liveItems.forEach((art) => {
    const img = art.querySelector("img");
    if (img && i < 3) {
      thumbs.push(img.src);
      i++;
    }
  });
  if (thumbs.length === 0) {
    // Fallback sample thumbnails
    thumbs.push(sampleDrawings[0].image, sampleDrawings[1].image, sampleDrawings[2].image);
  }
  aigcThumbnails.innerHTML = thumbs
    .map((src) => `<img src="${src}" alt="精選作品">`)
    .join("");
  aigcGenProgress.style.display = "block";
  aigcGenBar.style.width = "0%";
  aigcGenPercent.textContent = "0%";

  window.setTimeout(() => {
    aigcProgress.dataset.stage = "2";
    aigcStatus.textContent = "Step 2/4 · 素材去底及風格分析中...";
    animateGenBar(0, 35, 600);
  }, 700);

  window.setTimeout(() => {
    aigcProgress.dataset.stage = "3";
    aigcStatus.textContent = "Step 3/4 · AI 理解動作及場景編排中...";
    animateGenBar(35, 68, 700);
  }, 1400);

  window.setTimeout(() => {
    aigcProgress.dataset.stage = "4";
    aigcStatus.textContent = "Step 4/4 · Sora 2 影片生成中，預計 45 秒...";
    animateGenBar(68, 92, 900);
  }, 2200);

  window.setTimeout(() => {
    animateGenBar(92, 100, 400);
  }, 3100);

  window.setTimeout(() => {
    aigcStatus.textContent = "✅ 影片生成完成！正在載入預覽...";
    aigcGenStatus.textContent = "完成！";
    aigcProgress.dataset.stage = "5";
  }, 3550);

  window.setTimeout(() => {
    aigcGenProgress.style.display = "none";
    playAigcFilm();
  }, 4300);
}

function animateGenBar(from, to, duration) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const pct = from + (to - from) * Math.min(elapsed / duration, 1);
    aigcGenBar.style.width = `${pct}%`;
    aigcGenPercent.textContent = `${Math.round(pct)}%`;
    if (elapsed < duration) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function playAigcFilm() {
  aigcFilm.classList.add("is-playing");
  screenMessage.classList.add("is-hidden");
  burstParticles(ledScreen.clientWidth * 0.5, ledScreen.clientHeight * 0.52);
  window.setTimeout(() => {
    aigcFilm.classList.remove("is-playing");
    aigcRunning = false;
    aigcBtn.disabled = false;
    aigcBtn.textContent = "生成精選影片 Demo";
    aigcStatus.textContent = "Ready · 可再生成下一條 highlight 影片";
    aigcProgress.dataset.stage = "0";
    aigcGenStatus.textContent = "生成中";
    if (liveItems.size === 0) screenMessage.classList.remove("is-hidden");
  }, 8200);
}

function createComet(x, y) {
  const comet = document.createElement("div");
  comet.className = "comet";
  comet.style.setProperty("--start-x", `${x}px`);
  comet.style.setProperty("--start-y", `${y}px`);
  comet.style.setProperty("--end-x", `${randomInt(40, ledScreen.clientWidth - 40)}px`);
  comet.style.setProperty("--end-y", `${randomInt(70, ledScreen.clientHeight - 50)}px`);
  ledScreen.appendChild(comet);
  window.setTimeout(() => comet.remove(), 1300);
}

function addSample() {
  const sample = sampleDrawings[Math.floor(Math.random() * sampleDrawings.length)];
  addToScreen({
    id: itemId++,
    image: sample.image,
    animation: sample.animation,
    createdAt: new Date(),
  });
  setActiveFlow("screen");
}

function renderLiveArt(item) {
  const image = `<img src="${item.image}" alt="已上屏作品 ${item.id}">`;

  if (item.animation.form === "creature") {
    return `
      <div class="creature-shadow"></div>
      <div class="creature-body">
        ${image}
        <span class="creature-eye eye-left"></span>
        <span class="creature-eye eye-right"></span>
        <span class="creature-foot foot-left"></span>
        <span class="creature-foot foot-right"></span>
      </div>
    `;
  }

  if (item.animation.form === "orbit") {
    return `
      <div class="orbit-ring ring-one"></div>
      <div class="orbit-ring ring-two"></div>
      <div class="art-core symbol-core">${image}</div>
    `;
  }

  if (item.animation.form === "aura") {
    return `
      <div class="aura-halo"></div>
      <div class="art-core aura-core">${image}</div>
    `;
  }

  if (item.animation.form === "caption") {
    return `
      <div class="caption-sweep"></div>
      <div class="art-core caption-core">${image}</div>
    `;
  }

  if (item.animation.form === "zoom-breathe") {
    return `
      <div class="aura-halo"></div>
      <div class="art-core zoom-core">${image}</div>
    `;
  }

  if (item.animation.form === "vortex") {
    return `
      <div class="orbit-ring ring-one"></div>
      <div class="orbit-ring ring-two"></div>
      <div class="art-core vortex-core">${image}</div>
    `;
  }

  return `
    <div class="energy-trail trail-one"></div>
    <div class="energy-trail trail-two"></div>
    <div class="art-core energy-core">${image}</div>
  `;
}

function makeSampleSvg(text, color, type) {
  const shape =
    type === "heart"
      ? `<text x="100" y="128" text-anchor="middle" font-size="112" fill="${color}">${text}</text>`
      : type === "star"
        ? `<text x="100" y="132" text-anchor="middle" font-size="118" fill="${color}">${text}</text>`
        : `<text x="100" y="116" text-anchor="middle" font-size="64" font-weight="800" fill="${color}">${text}</text>`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      ${shape}
      <path d="M42 154 C72 178, 126 174, 158 150" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function extractCreatureImage() {
  const imageData = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
  const { data, width, height } = imageData;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];
      if (alpha > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (minX > maxX || minY > maxY) return drawCanvas.toDataURL("image/png");

  const padding = 18;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  const cropCanvas = document.createElement("canvas");
  const cropCtx = cropCanvas.getContext("2d");
  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;
  cropCtx.putImageData(ctx.getImageData(minX, minY, cropWidth, cropHeight), 0, 0);
  return cropCanvas.toDataURL("image/png");
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setupParticles() {
  const rect = ledScreen.getBoundingClientRect();
  particleCanvas.width = Math.max(1, Math.floor(rect.width));
  particleCanvas.height = Math.max(1, Math.floor(rect.height));
}

function burstParticles(x, y, count = 24) {
  const colors = ["#06b6d4", "#f59e0b", "#ff6b6b", "#ffd700", "#00ffcc", "#ff69b4", "#87ceeb", "#dda0dd"];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 2 + Math.random() * 6;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomInt(28, 60),
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function animateParticles() {
  particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles = particles.filter((particle) => particle.life > 0);
  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.02;
    particle.life -= 1;

    particleCtx.globalAlpha = Math.max(0, particle.life / 52);
    particleCtx.fillStyle = particle.color;
    particleCtx.beginPath();
    particleCtx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    particleCtx.fill();
  });
  particleCtx.globalAlpha = 1;
  requestAnimationFrame(animateParticles);
}

drawCanvas.addEventListener("mousedown", startDraw);
drawCanvas.addEventListener("mousemove", draw);
window.addEventListener("mouseup", stopDraw);
drawCanvas.addEventListener("touchstart", startDraw, { passive: false });
drawCanvas.addEventListener("touchmove", draw, { passive: false });
window.addEventListener("touchend", stopDraw);

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    colorButtons.forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    currentColor = button.dataset.color;
  });
});

clearBtn.addEventListener("click", clearCanvas);
submitBtn.addEventListener("click", submitDrawing);
reviewList.addEventListener("click", handleReviewClick);
sampleBtn.addEventListener("click", addSample);
clearScreenBtn.addEventListener("click", clearScreen);
aigcBtn.addEventListener("click", runAigcDemo);
window.addEventListener("resize", setupParticles);

modeManual.addEventListener("click", () => {
  autoMode = false;
  modeManual.classList.add("is-active");
  modeAuto.classList.remove("is-active");
  modeDesc.textContent = "高峰期模式 · 現場人員點選核准，100% 過濾風險";
  modeDesc.style.background = "#f0f9ff";
  modeDesc.style.color = "#0369a1";
});

modeAuto.addEventListener("click", () => {
  autoMode = true;
  modeAuto.classList.add("is-active");
  modeManual.classList.remove("is-active");
  modeDesc.textContent = "非高峰期模式 · AI 敏感詞及圖像過濾，24 小時無人值守自動更新";
  modeDesc.style.background = "#f0fdf4";
  modeDesc.style.color = "#166534";
});

document.querySelectorAll(".cat-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("is-selected"));
    btn.classList.add("is-selected");
    selectedCategory = btn.dataset.cat;
  });
});

setupCanvas();
setupParticles();
animateParticles();

window.setTimeout(addSample, 700);
window.setTimeout(addSample, 1200);
