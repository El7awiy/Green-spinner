
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d', { alpha: true });

const addBtn = document.getElementById('addBtn');
const itemInput = document.getElementById('itemInput');
const weightInput = document.getElementById('weightInput');
const itemsList = document.getElementById('itemsList');

const spinBtn = document.getElementById('spinBtn');
const quickPickBtn = document.getElementById('quickPickBtn');
const clearBtn = document.getElementById('clearBtn');

const resultModal = document.getElementById('resultModal');
const resultText = document.getElementById('resultText');
const closeModal = document.getElementById('closeModal');
const spinAgain = document.getElementById('spinAgain');

const DEFAULT_ITEMS = [
  { text: "مشاهدة فيلم", weight: 10 },
  { text: "خروج مع الأصحاب", weight: 8 },
  { text: "قراءة كتاب", weight: 6 },
  { text: "لعب", weight: 4 },
  { text: "تعلم شيء جديد", weight: 7 }
];

let items = JSON.parse(localStorage.getItem('spin_items_v2') || 'null') || DEFAULT_ITEMS.slice();

const palette = ['#18b24a','#1ed760','#12a23e','#0e8a34','#24d06f','#19b255','#0fb23f','#0da83b'];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', () => {
  resizeCanvas();
  drawWheel();
});

function drawWheel(rotation = currentRotation) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const size = Math.min(w, h);
  const cx = w/2, cy = h/2;
  const radius = size * 0.45;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const totalWeight = Math.max(1, items.reduce((s,it)=>s + (parseFloat(it.weight)||0), 0));
  const n = items.length || 1;
  let startAngle = rotation - Math.PI/2;

  for (let i=0;i<n;i++){
    const it = items[i];
    const angle = ( (parseFloat(it.weight)||0) / totalWeight ) * Math.PI * 2;
    const endAngle = startAngle + angle;

    const color = palette[i % palette.length];
    const grad = ctx.createRadialGradient(cx - radius*0.2, cy - radius*0.25, radius*0.05, cx, cy, radius);
    grad.addColorStop(0, lighten(color, 0.18));
    grad.addColorStop(1, color);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.stroke();

    const bisector = (startAngle + endAngle) / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(bisector + Math.PI/2);
    const text = it.text || "فارغ";
    ctx.fillStyle = "rgba(3, 120, 22, 0.62)";
    const fontSize = Math.max(12, Math.floor(radius * 0.11));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    const tx = 0;
    const ty = -radius * 0.28;
    wrapText(ctx, text, tx, ty, radius * 0.62, fontSize + 4);
    ctx.restore();

    ctx.save();
    const badgeAngle = bisector;
    const bx = cx + Math.cos(badgeAngle) * (radius * 0.7);
    const by = cy + Math.sin(badgeAngle) * (radius * 0.7);
    ctx.fillStyle = "rgba(0, 93, 11, 0.81)";
    ctx.beginPath();
    ctx.arc(bx, by, 20, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = "#033f1cff";
    ctx.font = `600 12px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(String(parseInt(it.weight||0)) + "%", bx, by+4);
    ctx.restore();

    startAngle = endAngle;
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radius*0.18, 0, Math.PI*2);
  const kgrad = ctx.createRadialGradient(cx - radius*0.03, cy - radius*0.03, 1, cx, cy, radius*0.18);
  kgrad.addColorStop(0, 'rgba(255,255,255,0.9)');
  kgrad.addColorStop(0.3, 'rgba(255,255,255,0.15)');
  kgrad.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = kgrad;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx - radius*0.15, cy - radius*0.35, radius*0.95, -1.5, -0.4);
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.stroke();
}

function lighten(hex, amt){
  const c = hex.replace('#','');
  const r = Math.min(255, parseInt(c.substring(0,2),16) + Math.floor(255*amt));
  const g = Math.min(255, parseInt(c.substring(2,4),16) + Math.floor(255*amt));
  const b = Math.min(255, parseInt(c.substring(4,6),16) + Math.floor(255*amt));
  return `rgb(${r},${g},${b})`;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight){
  const words = text.split(' ');
  let line = '';
  let offsetY = 0;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y + offsetY);
      line = words[n] + ' ';
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y + offsetY);
}

function renderList(){
  itemsList.innerHTML = '';
  items.forEach((it, idx) => {
    const li = document.createElement('li');

    const left = document.createElement('div'); left.className = 'item-left';
    const title = document.createElement('div'); title.className = 'item-title'; title.textContent = it.text;
    const meta = document.createElement('div'); meta.className = 'item-meta'; meta.textContent = `نسبة: ${it.weight || 0}`;
    left.appendChild(title);
    left.appendChild(meta);

    const actions = document.createElement('div'); actions.className = 'item-actions';

    const inc = document.createElement('button'); inc.className='small-btn'; inc.textContent='↑';
    inc.onclick = ()=>{ items.splice(idx-1,0,items.splice(idx,1)[0]); saveAndRedraw(); };

    const dec = document.createElement('button'); dec.className='small-btn'; dec.textContent='↓';
    dec.onclick = ()=>{ if(idx<items.length-1){ items.splice(idx+1,0,items.splice(idx,1)[0]); saveAndRedraw(); } };

    const edit = document.createElement('button'); edit.className='small-btn'; edit.textContent='تعديل';
    edit.onclick = ()=>{ openEditPrompt(idx); };

    const del = document.createElement('button'); del.className='small-btn'; del.textContent='حذف';
    del.onclick = ()=>{ if(confirm('حذف العنصر؟')){ items.splice(idx,1); saveAndRedraw(); } };

    actions.appendChild(inc); actions.appendChild(dec); actions.appendChild(edit); actions.appendChild(del);

    li.appendChild(left);
    li.appendChild(actions);
    itemsList.appendChild(li);
  });
}

function openEditPrompt(idx){
  const it = items[idx];
  const newText = prompt('نص العنصر:', it.text);
  if(newText === null) return;
  let newWeight = prompt('النسبة (عدد صحيح أكبر من 0):', String(it.weight || 1));
  if(newWeight === null) return;
  newWeight = parseInt(newWeight) || 1;
  items[idx] = { text: newText.trim() || it.text, weight: Math.max(1, newWeight) };
  saveAndRedraw();
}

function saveAndRedraw(){
  localStorage.setItem('spin_items_v2', JSON.stringify(items));
  renderList();
  drawWheel();
}

function weightedPickIndex(){
  const total = items.reduce((s,it)=> s + (parseFloat(it.weight)||0), 0);
  const rnd = Math.random() * total;
  let acc = 0;
  for(let i=0;i<items.length;i++){
    acc += (parseFloat(items[i].weight)||0);
    if(rnd <= acc) return i;
  }
  return items.length - 1;
}

let isSpinning = false;
let currentRotation = 0; // radians

function spinWheel(){
  if(isSpinning || items.length === 0) return;
  isSpinning = true;
  spinBtn.disabled = true;

  const targetIdx = weightedPickIndex();

  const totalWeight = items.reduce((s,it)=> s + (parseFloat(it.weight)||0), 0);
  let angleStart = 0;
  for(let i=0;i<targetIdx;i++){
    angleStart += (parseFloat(items[i].weight)||0) / totalWeight * Math.PI * 2;
  }
  const angleSize = (parseFloat(items[targetIdx].weight)||0) / totalWeight * Math.PI * 2;

  const within = Math.random() * angleSize;
  const desiredAngle = angleStart + within; // 0..2PI


  const currentMod = ((currentRotation % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
  const targetRotationAbsolute = ( -Math.PI/2 - desiredAngle ); // wheel rotation to bring desiredAngle to top
  const extra = (3 + Math.floor(Math.random()*4)) * Math.PI * 2; // 3-6 rotations
  let delta = targetRotationAbsolute - currentMod + extra;

  const duration = 4500 + Math.random()*2000; // ms
  const start = performance.now();
  const startRot = currentRotation;

  function easeOutCubic(t){ return 1 - Math.pow(1-t, 3); }

  function frame(now){
    const elapsed = now - start;
    let t = Math.min(1, elapsed / duration);
    const eased = easeOutCubic(t);
    currentRotation = startRot + delta * eased;

    const tilt = Math.sin(eased * Math.PI) * 8; // degrees
    const wheelFrame = document.querySelector('.wheel-frame');
    wheelFrame.style.transform = `rotateX(14deg) rotateY(${tilt}deg) rotateZ(0deg)`;

    drawWheel(currentRotation);

    if(t < 1) {
      requestAnimationFrame(frame);
    } else {
      isSpinning = false;
      spinBtn.disabled = false;
      wheelFrame.style.transform = `rotateX(12deg) rotateY(0deg)`;
      const landedAngle = ( (-currentRotation + Math.PI/2) % (Math.PI*2) + Math.PI*2 ) % (Math.PI*2);
      let accum = 0;
      let landedIdx = 0;
      for(let i=0;i<items.length;i++){
        const seg = (parseFloat(items[i].weight)||0) / totalWeight * Math.PI*2;
        if(landedAngle >= accum && landedAngle < accum + seg){
          landedIdx = i; break;
        }
        accum += seg;
      }
      showResult(items[landedIdx].text);
    }
  }

  requestAnimationFrame(frame);
}

function quickPick(){
  if(items.length === 0) return;
  const idx = weightedPickIndex();
  showResult(items[idx].text);
}

function showResult(txt){
  resultText.textContent = txt;
  resultModal.classList.remove('hidden');
}
closeModal.onclick = ()=> resultModal.classList.add('hidden');
spinAgain.onclick = ()=> { resultModal.classList.add('hidden'); setTimeout(()=> spinWheel(), 200); };

addBtn.addEventListener('click', ()=>{
  const text = (itemInput.value || '').trim();
  let weight = parseInt(weightInput.value);
  if(!text) return alert('اكتب اسم للعنصر');
  if(!weight || weight <= 0) weight = 1;
  items.push({ text, weight });
  itemInput.value = '';
  weightInput.value = '';
  saveAndRedraw();
});

itemInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter') addBtn.click(); });

spinBtn.addEventListener('click', spinWheel);
quickPickBtn.addEventListener('click', quickPick);
clearBtn.addEventListener('click', ()=>{
  if(!confirm('هل تريد مسح كل العناصر؟')) return;
  items = [];
  saveAndRedraw();
});

function init(){
  resizeCanvas();
  renderList();
  drawWheel();
  const wheelFrame = document.querySelector('.wheel-frame');
  wheelFrame.style.transform = 'rotateX(12deg)';
}

init();
