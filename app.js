/* ============================================
   MEL'S WORLD — app.js
   1. 📸 Photobooth Gemas (Polaroid & Stiker)
   2. 🎰 Gacha (Slot Machine)
   3. 💖 Manjain Mel (Interactive Tamagotchi & Love Meter)
   ============================================ */

// ---- Default Photo data with face crop positions & metadata ----
const DEFAULT_PHOTOS = [
  { src:'A1.jpeg',    pos:'center 26%', title:'Mel Manis 🍓',     mood:'Gemas & Centil 💅' },
  { src:'A2.jpeg',    pos:'center 38%', title:'Mel Rebahan 🌸',   mood:'Pengen Dimanja 🥺' },
  { src:'A3.jpeg',    pos:'center 20%', title:'Mel Kiss Face 💋', mood:'Sayang Banget 🥰' },
  { src:'photo1.jpeg',pos:'center 22%', title:'Mel Helm Gemas 🛵', mood:'Siap Diajak Jalan 🛵' },
  { src:'photo2.jpeg',pos:'62% 28%',   title:'Mel Pegang Pipi 🌸', mood:'Pose Imut 🌸' },
  { src:'photo3.jpeg',pos:'center 26%', title:'Mel Minum Kopi ☕', mood:'Ngopi Cantik ☕' },
  { src:'photo4.jpeg',pos:'center 20%', title:'Mel Kacamata 👓',  mood:'Pinter & Lucu 🤓' },
];

let PHOTOS = loadPhotos();

function loadPhotos(){
  try {
    const stored = localStorage.getItem('mel_photos_custom_v3');
    if(stored){
      const parsed = JSON.parse(stored);
      if(Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch(e){}
  return JSON.parse(JSON.stringify(DEFAULT_PHOTOS));
}

function savePhotos(){
  try {
    localStorage.setItem('mel_photos_custom_v3', JSON.stringify(PHOTOS));
  } catch(e){}
}

let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast-box');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
  }, 2300);
}

function setFace(el, idx, prop='backgroundImage') {
  const p = PHOTOS[idx % PHOTOS.length];
  el.style.backgroundImage  = `url('${p.src}')`;
  el.style.backgroundSize   = 'cover';
  el.style.backgroundPosition = p.pos;
}

const rand  = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const randF = (a,b) => Math.random()*(b-a)+a;

// ============================================
// WEB AUDIO SFX (no external audio files needed)
// ============================================
let actx;
const ga = () => { if(!actx) actx = new (window.AudioContext||window.webkitAudioContext)(); };

function sfx(freq1, freq2, dur, type='sine', vol=0.13) {
  try {
    ga();
    const o=actx.createOscillator(), g=actx.createGain();
    o.type=type; o.connect(g); g.connect(actx.destination);
    o.frequency.setValueAtTime(freq1, actx.currentTime);
    if(freq2) o.frequency.exponentialRampToValueAtTime(freq2, actx.currentTime+dur);
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime+dur+0.05);
    o.start(); o.stop(actx.currentTime+dur+0.05);
  } catch(e){}
}

const sfxCatch   = () => sfx(600, 1100, 0.1, 'sine', 0.14);
const sfxDing    = () => sfx(880, 1320, 0.18, 'sine', 0.11);
const sfxPurr    = () => sfx(440, 620, 0.15, 'sine', 0.13);
const sfxGombal  = () => sfx(587, 880, 0.22, 'sine', 0.12);

function sfxShutter() {
  sfx(900, 300, 0.05, 'square', 0.14);
  setTimeout(() => sfx(600, 150, 0.08, 'sawtooth', 0.12), 65);
}

function sfxBoba() {
  [0, 0.06, 0.12].forEach((d, i) => {
    setTimeout(() => sfx(420 + i*110, 680 + i*90, 0.06, 'sine', 0.11), d*1000);
  });
}

function sfxCake() {
  sfx(340, 520, 0.07, 'triangle', 0.13);
  setTimeout(() => sfx(520, 780, 0.09, 'sine', 0.11), 80);
}

function sfxSparkle() {
  [0, 0.05, 0.10, 0.15].forEach((d, i) => {
    setTimeout(() => sfx([880, 1100, 1320, 1760][i], null, 0.11, 'sine', 0.08), d*1000);
  });
}

function sfxJackpot() {
  [0,.12,.24,.36].forEach((d,i)=>{
    setTimeout(()=>sfx([523,659,784,1047][i],null,0.22,'sine',0.1), d*1000);
  });
}

// ============================================
// CURSOR TRAIL
// ============================================
const trailC = document.getElementById('trail-canvas');
const trailX = trailC.getContext('2d');
let tdots=[];
function resizeTrail(){ trailC.width=innerWidth; trailC.height=innerHeight; }
resizeTrail(); window.addEventListener('resize', resizeTrail);

document.addEventListener('mousemove', e=>{
  tdots.push({x:e.clientX, y:e.clientY, life:1, s:randF(2.5,6), h:rand(340,365)%360});
  if(tdots.length>50) tdots.shift();
});
(function drawTrail(){
  trailX.clearRect(0,0,trailC.width,trailC.height);
  for(let i=tdots.length-1;i>=0;i--){
    const d=tdots[i]; d.life-=0.035;
    if(d.life<=0){tdots.splice(i,1);continue;}
    trailX.beginPath();
    trailX.arc(d.x,d.y,d.s*d.life,0,Math.PI*2);
    trailX.fillStyle=`hsla(${d.h},55%,72%,${d.life*0.5})`;
    trailX.fill();
  }
  requestAnimationFrame(drawTrail);
})();

// ============================================
// CONFETTI
// ============================================
const confC=document.getElementById('confetti-canvas');
const confX=confC.getContext('2d');
let confPcs=[], confGo=false;
function resizeConf(){ confC.width=innerWidth; confC.height=innerHeight; }
resizeConf(); window.addEventListener('resize', resizeConf);

function fireConfetti(){
  confPcs=[];
  const cols=['#e8c5c1','#f5d5cb','#d4a5a5','#ffb7b2','#ffdac1','#b5ead7','#c7ceea','#f0d080'];
  for(let i=0;i<120;i++) confPcs.push({
    x:innerWidth/2+rand(-140,140), y:innerHeight/2,
    vx:randF(-7,7), vy:randF(-14,-4),
    w:rand(5,12), h:rand(3,7),
    c:cols[rand(0,cols.length-1)],
    r:rand(0,360), rv:randF(-7,7),
    g:0.24, life:1
  });
  if(!confGo){ confGo=true; animConf(); }
}
function animConf(){
  confX.clearRect(0,0,confC.width,confC.height);
  let alive=false;
  confPcs.forEach(p=>{
    p.x+=p.vx; p.vy+=p.g; p.y+=p.vy;
    p.r+=p.rv; p.life-=0.007;
    if(p.life<=0||p.y>confC.height+40) return;
    alive=true;
    confX.save();
    confX.translate(p.x,p.y);
    confX.rotate(p.r*Math.PI/180);
    confX.globalAlpha=p.life;
    confX.fillStyle=p.c;
    confX.fillRect(-p.w/2,-p.h/2,p.w,p.h);
    confX.restore();
  });
  if(alive) requestAnimationFrame(animConf);
  else { confGo=false; confX.clearRect(0,0,confC.width,confC.height); }
}

// ============================================
// EMOJI RAIN
// ============================================
const rainBox=document.getElementById('emoji-rain');
const RAINS=['🌸','✿','🦋','💫','🌷','⭐','🍃'];
setInterval(()=>{
  const s=document.createElement('span');
  s.className='rain-drop';
  s.textContent=RAINS[rand(0,RAINS.length-1)];
  s.style.left=rand(0,100)+'%';
  s.style.animationDuration=randF(7,14)+'s';
  s.style.fontSize=rand(14,24)+'px';
  rainBox.appendChild(s);
  s.addEventListener('animationend',()=>s.remove());
},1100);

// ============================================
// CLICK POP
// ============================================
const POPS=['✦','♡','✿','⭐','◇','♔'];
document.addEventListener('click',e=>{
  if(e.target.closest('button') || e.target.closest('.placed-sticker')) return;
  const p=document.createElement('span');
  p.className='click-pop';
  p.textContent=POPS[rand(0,POPS.length-1)];
  p.style.left=e.clientX+'px'; p.style.top=e.clientY+'px';
  document.body.appendChild(p);
  setTimeout(()=>p.remove(),560);
});

// ============================================
// LANDING
// ============================================
document.querySelectorAll('.orbit-face').forEach(el=>{
  setFace(el, parseInt(el.dataset.idx));
});

let cIdx = 0;
const cImgA=document.getElementById('center-img-a');
const cImgB=document.getElementById('center-img-b');
let cActive=cImgA, cInact=cImgB;
function applyCenterCrop(img,idx){
  const p = PHOTOS[idx % PHOTOS.length];
  if(p) img.style.objectPosition = p.pos;
}
if(PHOTOS.length > 0){
  cIdx = Math.min(6, PHOTOS.length - 1);
  cImgA.src = PHOTOS[cIdx].src;
  applyCenterCrop(cImgA, cIdx);
  cImgB.src = PHOTOS[(cIdx + 1) % PHOTOS.length].src;
  applyCenterCrop(cImgB, (cIdx + 1) % PHOTOS.length);
}

const cycleLanding=()=>{
  if(PHOTOS.length === 0) return;
  cIdx=(cIdx+1)%PHOTOS.length;
  cInact.src=PHOTOS[cIdx].src;
  applyCenterCrop(cInact,cIdx);
  cInact.classList.add('active');
  cActive.classList.remove('active');
  [cActive,cInact]=[cInact,cActive];
};
setInterval(cycleLanding,2600);
document.querySelector('.center-photo').addEventListener('click',()=>{ cycleLanding(); sfxDing(); });

function enterPlayground(){
  const l=document.getElementById('landing');
  const pg=document.getElementById('playground');
  l.style.transition='all 0.45s ease';
  l.style.opacity='0'; l.style.transform='scale(1.05)';
  setTimeout(()=>{
    l.classList.remove('active');
    l.style.opacity=''; l.style.transform='';
    pg.classList.add('active');
    initPhotobooth();
    initGacha();
    initManjain();
  },430);
}

// ============================================
// TAB SWITCHING
// ============================================
function switchTab(name){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${name}"]`).classList.add('active');
  document.getElementById('tab-'+name).classList.add('active');
  sfxDing();
}

function showFloat(parent, x, y, txt){
  const f=document.createElement('div');
  f.className='float-pts';
  f.textContent=txt;
  f.style.left=x+'px'; f.style.top=y+'px';
  parent.appendChild(f);
  setTimeout(()=>f.remove(),750);
}

// ============================================
// 1. 📸 PHOTOBOOTH GEMAS (POLAROID & STIKER)
// ============================================
let pbPhotoIdx = 0;
let pbFilterIdx = 0;
const PB_FILTERS = ['filter-normal', 'filter-blush', 'filter-golden', 'filter-vintage', 'filter-glow'];
const PB_FILTER_NAMES = ['Normal', 'Soft Blush 🌸', 'Golden ☀️', 'Vintage 🎞️', 'Glow ✨'];

function initPhotobooth(){
  pbPhotoIdx = 0;
  pbFilterIdx = 0;
  updatePhotoboothPhoto();
}

function updatePhotoboothPhoto(){
  const p = PHOTOS[pbPhotoIdx];
  const img = document.getElementById('pb-main-img');
  img.src = p.src;
  img.style.objectPosition = p.pos;
  document.getElementById('pb-photo-title').textContent = p.title;
  document.getElementById('pb-photo-idx').textContent = `${pbPhotoIdx + 1} / ${PHOTOS.length}`;
}

function nextPhoto(){
  pbPhotoIdx = (pbPhotoIdx + 1) % PHOTOS.length;
  updatePhotoboothPhoto();
  sfxDing();
}

function prevPhoto(){
  pbPhotoIdx = (pbPhotoIdx - 1 + PHOTOS.length) % PHOTOS.length;
  updatePhotoboothPhoto();
  sfxDing();
}

function cycleFilter(){
  pbFilterIdx = (pbFilterIdx + 1) % PB_FILTERS.length;
  const img = document.getElementById('pb-main-img');
  PB_FILTERS.forEach(f => img.classList.remove(f));
  img.classList.add(PB_FILTERS[pbFilterIdx]);
  document.getElementById('pb-filter-name').textContent = PB_FILTER_NAMES[pbFilterIdx];
  sfxDing();
}

function addSticker(type){
  const layer = document.getElementById('pb-sticker-layer');
  const sticker = document.createElement('div');
  sticker.className = 'placed-sticker';

  // Spawn position around photo center
  const rx = rand(30, 70);
  const ry = rand(30, 70);
  sticker.style.left = rx + '%';
  sticker.style.top = ry + '%';

  if(type === 'tag-gemas'){
    sticker.classList.add('tag');
    sticker.textContent = '🏷️ 100% Gemas';
  } else if(type === 'tag-sayang'){
    sticker.classList.add('tag', 'sayang');
    sticker.textContent = '🏷️ Punya Ayang 🥰';
  } else if(type === 'tag-bidadari'){
    sticker.classList.add('tag', 'bidadari');
    sticker.textContent = '🏷️ Bidadari Bumi ✨';
  } else {
    sticker.textContent = type;
  }

  // Remove button on hover
  const rem = document.createElement('span');
  rem.className = 'remove-btn';
  rem.textContent = '✕';
  rem.title = 'Hapus stiker';
  rem.onclick = (e) => {
    e.stopPropagation();
    sticker.remove();
    sfxDing();
  };
  sticker.appendChild(rem);

  makeStickerDraggable(sticker, layer);
  layer.appendChild(sticker);
  sfxSparkle();
}

function makeStickerDraggable(el, container){
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  const onStart = (clientX, clientY) => {
    isDragging = true;
    const rect = el.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    initialLeft = rect.left - contRect.left + rect.width / 2;
    initialTop = rect.top - contRect.top + rect.height / 2;
    startX = clientX;
    startY = clientY;
  };

  const onMove = (clientX, clientY) => {
    if(!isDragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    const contRect = container.getBoundingClientRect();

    let newX = initialLeft + dx;
    let newY = initialTop + dy;

    newX = Math.max(12, Math.min(contRect.width - 12, newX));
    newY = Math.max(12, Math.min(contRect.height - 12, newY));

    el.style.left = newX + 'px';
    el.style.top = newY + 'px';
  };

  const onEnd = () => { isDragging = false; };

  el.addEventListener('mousedown', e => {
    if(e.target.classList.contains('remove-btn')) return;
    e.preventDefault();
    onStart(e.clientX, e.clientY);

    const onMouseMove = ev => onMove(ev.clientX, ev.clientY);
    const onMouseUp = () => {
      onEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  // Touch support for mobile devices
  el.addEventListener('touchstart', e => {
    if(e.target.classList.contains('remove-btn')) return;
    const t = e.touches[0];
    onStart(t.clientX, t.clientY);
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    if(!isDragging) return;
    if(e.cancelable) e.preventDefault();
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  }, { passive: false });

  el.addEventListener('touchend', onEnd);
  el.addEventListener('touchcancel', onEnd);
}

function clearStickers(){
  document.getElementById('pb-sticker-layer').innerHTML = '';
  sfxDing();
}

function handlePhotoUpload(event){
  const files = event.target.files;
  if(!files || files.length === 0) return;

  let loaded = 0;
  for(let i=0; i<files.length; i++){
    const file = files[i];
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhoto = {
        src: e.target.result,
        pos: 'center center',
        title: 'Mel Cantik ' + (PHOTOS.length + 1) + ' ✨',
        mood: 'Gaya Baru 💖'
      };
      PHOTOS.push(newPhoto);
      loaded++;
      if(loaded === files.length){
        savePhotos();
        pbPhotoIdx = PHOTOS.length - 1;
        syncPhotosAllFeatures();
        sfxDing();
        fireConfetti();
        showToast('Foto baru berhasil ditambahkan! 📸✨');
      }
    };
    reader.readAsDataURL(file);
  }
  event.target.value = '';
}

function deleteCurrentPhoto(){
  if(PHOTOS.length <= 1){
    showToast('Minimal harus ada 1 foto tersisa ya! 🥺');
    return;
  }
  const title = PHOTOS[pbPhotoIdx].title;
  if(!confirm(`Hapus "${title}" dari koleksi Mel? 🗑️`)) return;

  PHOTOS.splice(pbPhotoIdx, 1);
  savePhotos();
  pbPhotoIdx = Math.max(0, Math.min(pbPhotoIdx, PHOTOS.length - 1));
  manjainIdx = Math.max(0, Math.min(manjainIdx, PHOTOS.length - 1));
  syncPhotosAllFeatures();
  sfxDing();
  showToast('Foto berhasil dihapus 🗑️');
}

function resetDefaultPhotos(){
  if(!confirm('Kembalikan semua foto ke foto bawaan Mel? ↺')) return;
  PHOTOS = JSON.parse(JSON.stringify(DEFAULT_PHOTOS));
  savePhotos();
  pbPhotoIdx = 0;
  manjainIdx = 0;
  syncPhotosAllFeatures();
  sfxDing();
  showToast('Foto dikembalikan ke default! ↺');
}

function syncPhotosAllFeatures(){
  updatePhotoboothPhoto();
  updateManjainPhoto();
  initGacha();
  document.querySelectorAll('.orbit-face').forEach(el => {
    const idx = parseInt(el.dataset.idx);
    setFace(el, idx % PHOTOS.length);
  });
}

function takeSnapshot(){
  const flash = document.getElementById('camera-flash');
  flash.classList.add('flash');
  sfxShutter();

  setTimeout(() => {
    flash.classList.remove('flash');
    fireConfetti();
    renderAndDownloadPolaroid();
  }, 140);
}

function renderAndDownloadPolaroid(){
  const p = PHOTOS[pbPhotoIdx];

  const canvas = document.createElement('canvas');
  // High-res Polaroid canvas dimensions
  const cw = 720;
  const ch = 920;
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    drawPolaroidCardAndExport(ctx, img, cw, ch);
  };
  img.onerror = () => {
    const fallback = new Image();
    fallback.onload = () => drawPolaroidCardAndExport(ctx, fallback, cw, ch);
    fallback.src = p.src;
  };
  img.src = p.src;
}

function drawPolaroidCardAndExport(ctx, img, cw, ch){
  const p = PHOTOS[pbPhotoIdx];

  // 1. Draw Ivory Paper Polaroid Frame
  ctx.save();
  ctx.fillStyle = '#fbf9f5';
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  roundRect(ctx, 20, 20, cw - 40, ch - 40, 24);
  ctx.fill();
  ctx.restore();

  // Subtle border around frame
  ctx.strokeStyle = 'rgba(230, 194, 191, 0.45)';
  ctx.lineWidth = 2;
  roundRect(ctx, 20, 20, cw - 40, ch - 40, 24);
  ctx.stroke();

  // 2. Top Pin ✿
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#d4a9a4';
  ctx.fillText('✿', cw / 2, 45);

  // 3. Photo Area inside frame
  const photoX = 50;
  const photoY = 70;
  const photoW = cw - 100; // 620
  const photoH = 700;      // 700

  ctx.save();
  roundRect(ctx, photoX, photoY, photoW, photoH, 14);
  ctx.clip();

  // Filter effect
  const filterClass = PB_FILTERS[pbFilterIdx];
  if (filterClass === 'filter-blush') {
    ctx.filter = 'saturate(1.22) contrast(1.05) brightness(1.04) hue-rotate(-8deg)';
  } else if (filterClass === 'filter-golden') {
    ctx.filter = 'sepia(0.28) saturate(1.35) brightness(1.06)';
  } else if (filterClass === 'filter-vintage') {
    ctx.filter = 'contrast(1.15) brightness(0.96) saturate(0.85) sepia(0.25)';
  } else if (filterClass === 'filter-glow') {
    ctx.filter = 'brightness(1.14) contrast(1.1) saturate(1.25)';
  } else {
    ctx.filter = 'none';
  }

  // Object-fit: cover with p.pos
  const scale = Math.max(photoW / img.naturalWidth, photoH / img.naturalHeight);
  const sW = img.naturalWidth * scale;
  const sH = img.naturalHeight * scale;

  let xPct = 0.5, yPct = 0.5;
  const parts = p.pos.split(' ');
  if (parts[0] !== 'center') xPct = parseFloat(parts[0]) / 100;
  if (parts[1] && parts[1] !== 'center') yPct = parseFloat(parts[1]) / 100;

  const dx = photoX - (sW - photoW) * xPct;
  const dy = photoY - (sH - photoH) * yPct;

  ctx.drawImage(img, dx, dy, sW, sH);
  ctx.restore();

  // 4. Placed Stickers inside photo area
  const layer = document.getElementById('pb-sticker-layer');
  const wrapper = document.getElementById('pb-photo-wrapper');
  const wRect = wrapper.getBoundingClientRect();

  layer.querySelectorAll('.placed-sticker').forEach(sticker => {
    const sRect = sticker.getBoundingClientRect();
    const rx = (sRect.left - wRect.left + sRect.width / 2) / wRect.width;
    const ry = (sRect.top - wRect.top + sRect.height / 2) / wRect.height;

    const sx = photoX + rx * photoW;
    const sy = photoY + ry * photoH;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    if (sticker.classList.contains('tag')) {
      const text = sticker.childNodes[0].textContent.trim();
      ctx.font = 'bold 22px "Space Grotesk", sans-serif';
      const textWidth = ctx.measureText(text).width;
      const tagW = textWidth + 36;
      const tagH = 36;

      const grad = ctx.createLinearGradient(sx - tagW/2, sy - tagH/2, sx + tagW/2, sy + tagH/2);
      if (sticker.classList.contains('sayang')) {
        grad.addColorStop(0, '#a18cd1'); grad.addColorStop(1, '#fbc2eb');
      } else if (sticker.classList.contains('bidadari')) {
        grad.addColorStop(0, '#f6d365'); grad.addColorStop(1, '#fda085');
      } else {
        grad.addColorStop(0, '#ff758c'); grad.addColorStop(1, '#ff7eb3');
      }
      ctx.fillStyle = grad;
      roundRect(ctx, sx - tagW/2, sy - tagH/2, tagW, tagH, 18);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      roundRect(ctx, sx - tagW/2, sy - tagH/2, tagW, tagH, 18);
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, sx, sy + 1);
    } else {
      const emoji = sticker.childNodes[0].textContent.trim();
      ctx.font = '54px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, sx, sy);
    }
    ctx.restore();
  });

  // 5. Bottom Caption & Subtitle inside Polaroid frame
  ctx.save();
  ctx.font = 'bold 24px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#362d2b';
  ctx.textAlign = 'center';
  ctx.fillText("✿ Mel's Cutest Angle ✿", cw / 2, ch - 92);

  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#8c827e';
  ctx.fillText(`${p.title} • Today & Forever 💖`, cw / 2, ch - 60);
  ctx.restore();

  // 6. Direct Download to device with frame included!
  try {
    const dataUrl = ctx.canvas.toDataURL('image/png');
    const safeTitle = p.title.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Mel_Polaroid_${safeTitle}.png`;

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    sfxDing();
    showToast('📸 Polaroid berhasil disimpan ke perangkat! 🎉');
  } catch(err) {
    console.warn("Export error:", err);
    showToast('Gagal menyimpan foto 🥺');
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// ============================================
// 2. 🎰 GACHA
// ============================================
let gachaSpinning=false, gachaJackpots=0;

function initGacha(){
  for(let i=0;i<3;i++) setFace(document.querySelector(`#reel-${i} .reel-face`), rand(0,PHOTOS.length-1));
}

function spinGacha(){
  if(gachaSpinning) return;
  gachaSpinning=true;
  document.getElementById('gacha-btn').disabled=true;
  document.getElementById('gacha-result').textContent='...';
  document.querySelectorAll('.reel').forEach(r=>r.classList.remove('match','stopped'));

  // Fair & rewarding jackpot logic
  const willJackpot = Math.random() < 0.28;
  const chosenIdx = rand(0, PHOTOS.length - 1);
  const results = willJackpot
    ? [chosenIdx, chosenIdx, chosenIdx]
    : [rand(0, PHOTOS.length - 1), rand(0, PHOTOS.length - 1), rand(0, PHOTOS.length - 1)];

  const reels=[0,1,2].map(i=>{
    const reel=document.getElementById(`reel-${i}`);
    const face=reel.querySelector('.reel-face');
    reel.classList.add('spinning');
    const iv=setInterval(()=>setFace(face,rand(0,PHOTOS.length-1)), 65);
    return {reel,face,iv};
  });

  [1100,2000,2900].forEach((delay,i)=>{
    setTimeout(()=>{
      clearInterval(reels[i].iv);
      setFace(reels[i].face, results[i]);
      reels[i].reel.classList.remove('spinning');
      reels[i].reel.classList.add('stopped');
      sfxDing();
      if(i===2) setTimeout(()=>resolveGacha(results), 280);
    }, delay);
  });
}

function resolveGacha(r){
  const res=document.getElementById('gacha-result');
  const [a,b,c]=r;
  if(a===b && b===c){
    res.textContent='🎉 JACKPOT!!'; gachaJackpots++;
    document.getElementById('gacha-jackpot-count').textContent=gachaJackpots;
    document.querySelectorAll('.reel').forEach(r=>r.classList.add('match'));
    sfxJackpot(); fireConfetti();

    // Show Winning Modal with clear photo
    setTimeout(() => {
      const modal = document.getElementById('gacha-win-modal');
      const winImg = document.getElementById('gacha-win-img');
      const winTitle = document.getElementById('gacha-win-title');
      winImg.src = PHOTOS[a].src;
      winImg.style.objectPosition = PHOTOS[a].pos;
      winTitle.textContent = `${PHOTOS[a].title} Terpilih!`;
      modal.classList.remove('hidden');
    }, 600);

  } else if(a===b||b===c||a===c){
    res.textContent='😏 hampiiir~';
    if(a===b||a===c) document.getElementById('reel-0').classList.add('match');
    if(a===b||b===c) document.getElementById('reel-1').classList.add('match');
    if(b===c||a===c) document.getElementById('reel-2').classList.add('match');
  } else {
    const msgs=['coba lagi~','belum rezeki 😅','spin terus!','next pasti jackpot!','ayo lagi!'];
    res.textContent=msgs[rand(0,msgs.length-1)];
  }
  gachaSpinning=false;
  document.getElementById('gacha-btn').disabled=false;
}

function closeGachaModal(){
  document.getElementById('gacha-win-modal').classList.add('hidden');
  sfxDing();
}

// ============================================
// 3. 💖 MANJAIN MEL (INTERACTIVE LOVE METER)
// ============================================
let manjainIdx = 0;
let loveScore = 25;

const GOMBALAN_LIST = [
  "Kecantikan Mel hari ini melanggar undang-undang keimutan! 🚨💖",
  "Mel itu kayak boba, manis, kenyal, dan bikin candu tiap hari! 🧋✨",
  "Wajah secantik Mel dilarang cemberut walau cuma sedetik! 👸🌸",
  "Tahu nggak kenapa bintang malam ini redup? Karena kalah silau sama senyum Mel! 🌟",
  "Peringatan medis: Menatap mata Mel lebih dari 3 detik menyebabkan salting akut! 🙈💓",
  "Mel, kamu capek nggak? Soalnya lari-lari terus di pikiran ayang! 🏃‍♀️💨",
  "Kalau Mel jadi bunga, ayang rela jadi lebahnya selamanya! 🐝🌸",
  "Definisi bidadari bumi = Mel! Titik no debat! 👑✨",
  "Senyum Mel itu obat dari segala rasa lelah dunia! 💖🥰"
];

function initManjain(){
  manjainIdx = 0;
  updateManjainPhoto();
  updateLoveMeter();
}

function updateManjainPhoto(){
  const p = PHOTOS[manjainIdx];
  const img = document.getElementById('manjain-img');
  img.src = p.src;
  img.style.objectPosition = p.pos;
  document.getElementById('mel-mood-tag').textContent = `✨ Mood: ${p.mood}`;
}

function nextManjainPhoto(){
  manjainIdx = (manjainIdx + 1) % PHOTOS.length;
  updateManjainPhoto();
  sfxDing();
}

function updateLoveMeter(){
  const fill = document.getElementById('love-bar-fill');
  const pctText = document.getElementById('love-pct-text');
  const statusText = document.getElementById('love-status-text');

  fill.style.width = loveScore + '%';
  pctText.textContent = loveScore + '%';

  if(loveScore < 35){
    statusText.textContent = 'Butuh Dimanja 🥺';
  } else if(loveScore < 65){
    statusText.textContent = 'Mulai Senyum 🙂';
  } else if(loveScore < 95){
    statusText.textContent = 'Senang Banget 🥰';
  } else {
    statusText.textContent = 'GEMAS OVERLOAD! 💥💖';
  }
}

function pamperMel(action){
  const imgBox = document.getElementById('mel-img-box');
  const speechText = document.getElementById('mel-speech-text');

  imgBox.classList.remove('bounce');
  void imgBox.offsetWidth; // trigger reflow
  imgBox.classList.add('bounce');

  let gain = 15;
  let particle = '💖';
  let speech = '';

  if(action === 'boba'){
    sfxBoba();
    gain = 16;
    particle = '🧋';
    const bobaQuotes = [
      "Segerrr bangeeet! Mood Mel langsung naik 100%! 🧋✨",
      "Makasih boba manisnya ayang, nyam seger pol! 😋🧋",
      "Boba kesukaan Mel! Ayang emang paling pengertian dehh 🥰"
    ];
    speech = bobaQuotes[rand(0, bobaQuotes.length - 1)];

  } else if(action === 'cake'){
    sfxCake();
    gain = 15;
    particle = '🍰';
    const cakeQuotes = [
      "Nyamm manis banget! Mel makin gemas & hepi! 🍰😋",
      "Awww kue manis buat Mel yang paling manis se-dunia! 🍰💖",
      "Enak bangett! Besok suapin kue lagi ya ayang~ 🥰"
    ];
    speech = cakeQuotes[rand(0, cakeQuotes.length - 1)];

  } else if(action === 'pat'){
    sfxPurr();
    gain = 12;
    particle = '💆‍♀️';
    const patQuotes = [
      "Ehehe dielus-elus kepalanya... nyaman bgt jangan berhenti ya ayang 🥰",
      "Uuuu enak dipuk-puk... Mel jadi ngantuk manja 😴💖",
      "Dielus gini bikin Mel salting brutal! 👉👈✨"
    ];
    speech = patQuotes[rand(0, patQuotes.length - 1)];

  } else if(action === 'flower'){
    sfxSparkle();
    gain = 18;
    particle = '🌸';
    const flowerQuotes = [
      "Aaaa so sweet bangett! Bunganya cantik kaya Mel ya? 🌸💖",
      "Makasih bunganya ayang! Mel makin cinta dehh! 💐✨",
      "Hati Mel langsung berbunga-bunga kaya musim semi! 🌺🥰"
    ];
    speech = flowerQuotes[rand(0, flowerQuotes.length - 1)];

  } else if(action === 'gombal'){
    sfxGombal();
    gain = 15;
    particle = '💌';
    speech = GOMBALAN_LIST[rand(0, GOMBALAN_LIST.length - 1)];
  }

  speechText.textContent = speech;
  spawnFloatingFx(particle);

  loveScore = Math.min(100, loveScore + gain);
  updateLoveMeter();

  if(loveScore >= 100){
    setTimeout(celebrateLove, 500);
  }
}

function spawnFloatingFx(symbol){
  const fxBox = document.getElementById('manjain-floating-fx');
  for(let i=0; i<4; i++){
    const el = document.createElement('div');
    el.className = 'floating-fx-item';
    el.textContent = symbol;
    el.style.left = rand(25, 75) + '%';
    el.style.top = rand(40, 75) + '%';
    el.style.setProperty('--dx', rand(-40, 40) + 'px');
    el.style.setProperty('--rot', rand(-30, 30) + 'deg');
    fxBox.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }
}

function celebrateLove(){
  fireConfetti();
  sfxJackpot();
  const modal = document.getElementById('love-celebration-modal');
  const img = document.getElementById('celebrate-img');
  img.src = PHOTOS[rand(0, PHOTOS.length - 1)].src;
  modal.classList.remove('hidden');
}

function closeLoveCelebration(){
  document.getElementById('love-celebration-modal').classList.add('hidden');
  loveScore = 35;
  updateLoveMeter();
  sfxDing();
}

// Spacebar confetti
document.addEventListener('keydown',e=>{
  const pg=document.getElementById('playground');
  if(e.key===' ' && pg.classList.contains('active')){
    fireConfetti();
  }
});
