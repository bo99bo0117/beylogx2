// ===== BeyLog X - Minimal Logic =====

const FINISHES = ["Xtreme","Over","Burst","Spin","Other"];

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function uid(prefix){
  return prefix + Math.random().toString(36).slice(2,8);
}

function save(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}
function load(key){
  return JSON.parse(localStorage.getItem(key) || "[]");
}

// ===== 初期化 =====
document.addEventListener("DOMContentLoaded", init);

function init(){
  initTabs();
  refreshBeySelect();
  renderBeys();
  renderBattles();
  renderStats();
  $("#battleForm").addEventListener("submit", addBattle);
  $("#btnAddBey").addEventListener("click", openAddBey);
}

// ===== タブ =====
function initTabs(){
  $$(".tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      $$(".tab").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      $$(".tabpane").forEach(p=>p.classList.remove("active"));
      $("#tab-"+tab).classList.add("active");
      if(tab==="beys") renderBeys();
      if(tab==="recent") renderBattles();
      if(tab==="stats") renderStats();
    });
  });
}

// ===== ベイ =====
function openAddBey(){
  const name = prompt("公式名を入力");
  if(!name) return;
  const blade = prompt("Blade");
  const ratchet = prompt("Ratchet");
  const bit = prompt("Bit");
  const type = prompt("Type (Attack/Defense/Stamina/Balance)");
  const beys = load("beys");
  beys.push({
    id: uid("B"),
    officialName: name,
    blade,
    ratchet,
    bit,
    type
  });
  save("beys", beys);
  refreshBeySelect();
  renderBeys();
}

function refreshBeySelect(){
  const beys = load("beys");
  const selA = $("#battleBeyA");
  const selB = $("#battleBeyB");
  selA.innerHTML = "<option value=''>選択</option>";
  selB.innerHTML = "<option value=''>選択</option>";
  beys.forEach(b=>{
    selA.innerHTML += `<option value="${b.id}">${b.officialName}</option>`;
    selB.innerHTML += `<option value="${b.id}">${b.officialName}</option>`;
  });
}

function renderBeys(){
  const beys = load("beys");
  const grid = $("#beyGrid");
  if(!grid) return;
  if(!beys.length){
    grid.innerHTML = "<div>まだ登録がありません</div>";
    return;
  }
  grid.innerHTML = beys.map(b=>`
    <div class="card">
      <strong>${b.officialName}</strong><br>
      ${b.blade} / ${b.ratchet} / ${b.bit}<br>
      ${b.type}
    </div>
  `).join("");
}

// ===== バトル =====
function addBattle(e){
  e.preventDefault();
  const beyA = $("#battleBeyA").value;
  const beyB = $("#battleBeyB").value;
  if(!beyA || !beyB || beyA===beyB){
    alert("ベイを正しく選択してください");
    return;
  }
  const winner = document.querySelector("input[name='winner']:checked")?.value;
  const finish = document.querySelector("input[name='finish']:checked")?.value;
  const place = document.querySelector("input[name='place']:checked")?.value;
  const recorder = document.querySelector("input[name='recorder']:checked")?.value;

  if(!winner || !finish || !place || !recorder){
    alert("必須項目を選んでください");
    return;
  }

  const battles = load("battles");
  battles.push({
    id: uid("T"),
    date: new Date().toISOString(),
    beyA,
    beyB,
    winner,
    finish,
    place,
    recorder
  });
  save("battles", battles);
  renderBattles();
  renderStats();
  alert("保存しました");
}

// ===== バトル一覧 =====
function renderBattles(){
  const battles = load("battles");
  const beys = load("beys");
  const map = Object.fromEntries(beys.map(b=>[b.id,b]));
  const list = $("#battleList");
  if(!list) return;
  if(!battles.length){
    list.innerHTML = "<div>まだ記録がありません</div>";
    return;
  }
  list.innerHTML = battles.slice().reverse().map(t=>{
    const a = map[t.beyA]?.officialName || "";
    const b = map[t.beyB]?.officialName || "";
    const win = t.winner==="A" ? a : b;
    return `<div class="card">
      ${a} vs ${b}<br>
      勝者: ${win} (${t.finish})<br>
      ${t.place} / ${t.recorder}
    </div>`;
  }).join("");
}

// ===== 集計 =====
function renderStats(){
  const battles = load("battles");
  const stats = $("#finishStats");
  if(!stats) return;
  const total = battles.length;
  const count = {};
  FINISHES.forEach(f=>count[f]=0);
  battles.forEach(t=> count[t.finish] = (count[t.finish]||0)+1 );
  stats.innerHTML = FINISHES.map(f=>{
    const c = count[f];
    const pct = total ? Math.round(c/total*100) : 0;
    return `<div class="card">${f} : ${c}回 (${pct}%)</div>`;
  }).join("");
}
