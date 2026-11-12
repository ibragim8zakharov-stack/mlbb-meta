const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Словарь для героев (перевод имен для поиска картинок)
const HERO_IDS = {
  "хирара": "hirara", "аулус": "aulus", "нолан": "nolan", "пакито": "paquito",
  "лукас": "lukas", "леонард": "leonard", "су ё": "suyou", "фанни": "fanny",
  "джой": "joy", "харли": "harley", "ли сун-син": "yi_sun-shin", "ланселот": "lancelot",
  "фрейя": "freya", "линг": "ling", "бартс": "barats", "хаябуса": "hayabusa",
  "госсен": "gusion", "бальмонд": "balmond", "обсидия": "obsidia", "грейнджер": "granger",
  "клинт": "clint", "бруно": "bruno", "броуди": "brody", "кимми": "kimmy",
  "беатрис": "beatrix", "иритель": "irithel", "клод": "claude", "харит": "harith",
  "мелисса": "melissa", "кэрри": "karrie", "мия": "miya", "эйдора": "eudora",
  "селена": "selena", "люнокс": "lunox", "кадита": "kadita", "цзэтянь": "zetian",
  "чжусинь": "zhuxin", "фаша": "pharsa", "валир": "valir", "вексана": "vexana",
  "ив": "yve", "валентина": "valentina", "ло йи": "luo_yi", "сессилион": "xavier",
  "ксавьер": "xavier", "лилия": "lylia", "кагура": "kagura", "аврора": "aurora", 
  "новария": "novaria", "алиса": "alice", "баданг": "badang", "чичи": "cici", 
  "арлотт": "arlott", "эсмеральда": "esmeralda", "уранус": "uranus", "тэризла": "terizla", 
  "фовиус": "phoveus", "маша": "masha", "атлас": "atlas", "белерик": "belerick", 
  "бенедетта": "benedetta", "чонг": "yu_zhong", "марсель": "marcel", "калеа": "kalea", 
  "хуфра": "khufra", "тигрил": "tigreal", "минотавр": "minotaur", "кейя": "kaja", 
  "халид": "khaleed", "хильда": "hilda", "грок": "grock", "матильда": "mathilda", 
  "баксий": "baxia", "баксия": "baxia", "хилос": "hylos", "ангела": "angela", 
  "рафаэль": "rafaela", "эстес": "estes", "юй чжун": "yu_zhong"
};

const ITEM_IDS = {
  "athena_shield": "athenas_shield",
};

// Генератор картинок (берет из папки img)
function getIconHtml(id, name, type) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  const bg = `linear-gradient(135deg, hsl(${hue}, 70%, 40%), hsl(${(hue+40)%360}, 80%, 20%))`;
  
  const cleanName = name.toLowerCase().trim();
  
  let imgUrl = "";
  if (type === 'hero') {
    const heroId = HERO_IDS[cleanName] || cleanName.replace(/\s+/g, '');
    imgUrl = `img/${heroId}.png`;
  } else {
    const itemId = ITEM_IDS[id] || id;
    imgUrl = `img/${itemId}.png`;
  }
    
  return `
    <div style="width:100%; height:100%; background:${bg}; display:flex; align-items:center; justify-content:center; position:relative;">
      <span style="position:absolute; z-index:1; font-weight:900; color:rgba(255,255,255,0.9); font-size:1.2rem;">${name.slice(0,2).toUpperCase()}</span>
      <img src="${imgUrl}" onerror="this.style.display='none'" style="position:relative; z-index:2; width:100%; height:100%; object-fit:cover;" alt="${name}">
    </div>
  `;
}

// --- МЕТА ---
let currentLine = "Убийца"; 
function renderTierList() {
  const container = $("#tierList");
  const tiers = ["S+", "S", "A", "B", "C"];
  let html = "";
  tiers.forEach(t => {
    const heroesInTier = HEROES.filter(h => h.tier === t && h.role.includes(currentLine));
    if (heroesInTier.length === 0) return;
    const labelClass = t === "S+" ? "Sp" : t; 
    const heroesHtml = heroesInTier.map(h => `
      <div class="tier-hero" title="${h.name} (${h.tier})" data-id="${h.id}">
        ${getIconHtml(h.id, h.name, 'hero')}
      </div>
    `).join("");
    html += `
      <div class="tier-row">
        <div class="tier-label ${labelClass}">${t}</div>
        <div class="tier-heroes">${heroesHtml}</div>
      </div>
    `;
  });
  container.innerHTML = html === "" ? `<p class="empty-state">Нет данных.</p>` : html;
  $$(".tier-hero").forEach(el => {
    el.addEventListener("click", () => {
      selectHero(el.dataset.id);
      document.getElementById("heroes").scrollIntoView({ behavior: 'smooth' });
    });
  });
}

$$("#lineTabs .tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $$("#lineTabs .tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentLine = btn.dataset.line;
    renderTierList();
  });
});

// --- ГЕРОИ ---
let currentHeroId = null;
function renderHeroGrid() {
  const q = $("#heroSearch").value.toLowerCase().trim();
  const uniqueHeroes = [];
  const map = new Map();
  for (const item of HEROES) {
    if(!map.has(item.name)) {
      map.set(item.name, true);
      uniqueHeroes.push(item);
    }
  }
  const list = uniqueHeroes.filter(h => (!q || h.name.toLowerCase().includes(q)));
  $("#heroGrid").innerHTML = list.map(h => `
    <div class="grid-icon ${currentHeroId === h.id ? 'active' : ''}" data-id="${h.id}" title="${h.name}">
      ${getIconHtml(h.id, h.name, 'hero')}
    </div>
  `).join("");
  $$("#heroGrid .grid-icon").forEach(el => {
    el.addEventListener("click", () => selectHero(el.dataset.id));
  });
}

function selectHero(id) {
  currentHeroId = id;
  renderHeroGrid();
  const h = HEROES.find(x => x.id === id);
  if (!h) return;
  const buildsHtml = h.builds ? h.builds.map(b => `<div class="skill" style="margin-bottom:6px; padding:8px; background:var(--bg); border-radius:6px;"><b>Сборка:</b> <span style="color:var(--text)">${b}</span></div>`).join("") : "";
  const matchHtml = (arr, cls) => arr.map(m => `<span class="matchup-chip ${cls}">${m.hero} ${m.percent}%</span>`).join("");
  $("#heroDetail").innerHTML = `
    <div class="detail-header">
      <div class="detail-icon">${getIconHtml(h.id, h.name, 'hero')}</div>
      <div class="detail-title">
        <h3>${h.name}</h3>
        <p>${h.role.join(" / ")} · Тир ${h.tier}</p>
        <span style="font-size:0.85rem;color:var(--text-dim)">${h.tierComment || ""}</span>
      </div>
    </div>
    <div class="detail-block">
      <h4>Гайд по игре</h4>
      <p style="font-size:0.95rem; line-height:1.6; color:var(--text-dim);">${h.guide || "Гайд в разработке."}</p>
    </div>
    <div class="detail-block">
      <h4>Популярные сборки</h4>
      ${buildsHtml}
    </div>
    <div class="detail-block">
      <h4>Матчапы</h4>
      <div class="matchup-row"><b style="color:var(--green);font-size:0.9rem">Силён:</b> ${matchHtml(h.strongVs, "match-good")}</div>
      <div class="matchup-row"><b style="color:var(--red);font-size:0.9rem">Слаб:</b> ${matchHtml(h.weakVs, "match-bad")}</div>
    </div>
  `;
}
$("#heroSearch").addEventListener("input", renderHeroGrid);

// --- ПРЕДМЕТЫ ---
let currentItemId = null;
function renderItemGrid() {
  const cat = $$("#itemFilters .role-chip.active")[0].dataset.effect;
  const list = ITEMS.filter(i => cat === "all" || i.category === cat);
  $("#itemGrid").innerHTML = list.map(i => `
    <div class="grid-icon ${currentItemId === i.id ? 'active' : ''}" data-id="${i.id}" title="${i.name}">
      ${getIconHtml(i.id, i.name, 'item')}
    </div>
  `).join("");
  $$("#itemGrid .grid-icon").forEach(el => {
    el.addEventListener("click", () => selectItem(el.dataset.id));
  });
}

function selectItem(id) {
  currentItemId = id;
  renderItemGrid();
  const i = ITEMS.find(x => x.id === id);
  if (!i) return;
  const statsHtml = i.stats ? i.stats.map(s => `<div class="stat-row"><span>${s.name}</span><span>${s.val}</span></div>`).join("") : "";
  $("#itemDetail").innerHTML = `
    <div class="detail-header">
      <div class="detail-icon">${getIconHtml(i.id, i.name, 'item')}</div>
      <div class="detail-title">
        <h3>${i.name}</h3>
        <p>${i.price === 0 ? "Благословение" : i.price + " золота"}</p>
      </div>
    </div>
    <div class="detail-block">
      <h4>Характеристики</h4>
      ${statsHtml || "<p style='color:var(--text-dim)'>Нет базовых характеристик</p>"}
    </div>
    <div class="effect-box">
      <strong>Эффект</strong>
      <p>${i.passive}</p>
    </div>
    <div class="detail-block" style="margin-top:24px">
      <h4>Против кого собирать</h4>
      <p style="font-size:0.95rem; margin-bottom:8px"><b>${i.goodVs.join(", ")}</b></p>
      <p style="font-size:0.9rem; color:var(--green)">${i.goodVsReason}</p>
    </div>
    <div class="detail-block">
      <h4>Когда не стоит брать</h4>
      <p style="font-size:0.9rem; color:var(--red)">${i.badWhen}</p>
    </div>
  `;
}
$$("#itemFilters .role-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    $$("#itemFilters .role-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderItemGrid();
  });
});

// --- КОНТРПИКИ ---
function fillCounterSelects() {
  const my = $("#myHero");
  const uniqueNames = [...new Set(HEROES.map(h => h.name))];
  const opts = uniqueNames.map(name => {
    const h = HEROES.find(hero => hero.name === name);
    return `<option value="${h.id}">${name}</option>`;
  }).join("");
  my.innerHTML = `<option value="">— выберите героя —</option>` + opts;
}

function renderCounterResult() {
  const myId = $("#myHero").value;
  const box = $("#counterResult");
  if (!myId) { box.innerHTML = `<p class="empty-state">Выберите героя выше.</p>`; return; }
  const me = HEROES.find(h => h.id === myId);
  box.innerHTML = `
    <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
      <div class="detail-icon" style="width:60px;height:60px;">${getIconHtml(me.id, me.name, 'hero')}</div>
      <div><h3 style="font-size:1.4rem">${me.name}</h3></div>
    </div>
    <div class="counter-columns">
      <div class="counter-col good">
        <h4>Силён против (Кого контрит)</h4>
        <div class="counter-list">
          ${me.strongVs.map(v => `<div class="counter-item good"><span>${v.hero}</span><span class="counter-percent" style="color:var(--green)">${v.percent}%</span></div>`).join("")}
        </div>
      </div>
      <div class="counter-col bad">
        <h4>Слаб против (Кто контрит его)</h4>
        <div class="counter-list">
          ${me.weakVs.map(v => `<div class="counter-item bad"><span>${v.hero}</span><span class="counter-percent" style="color:var(--red)">${v.percent}%</span></div>`).join("")}
        </div>
      </div>
    </div>
  `;
}
$("#myHero").addEventListener("change", renderCounterResult);

// --- ГАЙДЫ И ЗАКЛИНАНИЯ ---
function renderGuides() {
  let html = GUIDES.map(g => `
    <div class="accordion-item">
      <div class="accordion-header">${g.title}</div>
      <div class="accordion-body">${g.body}</div>
    </div>
  `).join("");

  if (typeof SPELLS !== 'undefined') {
    html += `
      <div class="accordion-item" style="margin-top: 20px; border-color: var(--purple);">
        <div class="accordion-header" style="color: var(--purple);">
          <span style="display:flex; align-items:center; gap:10px;">⚡ Боевые заклинания (Спеллы)</span>
        </div>
        <div class="accordion-body">
          <p style="margin-bottom: 12px; color: var(--text-dim);">Выберите заклинание, чтобы увидеть его описание.</p>
          ${SPELLS.map(s => `
            <div style="margin-bottom: 12px; padding: 12px; background: var(--bg); border-radius: 8px; border-left: 3px solid var(--gold);">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <b style="color: var(--gold); font-size: 1rem;">${s.name}</b>
                <span style="font-size:0.8rem; color: var(--text-dim);">КД: ${s.cooldown} сек.</span>
              </div>
              <p style="font-size:0.9rem; margin-bottom:6px;">${s.desc}</p>
              <p style="font-size:0.85rem; color: var(--green);"><b>Кому подходит:</b> ${s.bestFor}</p>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  $("#accordion").innerHTML = html;
  
  $$(".accordion-header").forEach(h => {
    h.addEventListener("click", () => h.parentElement.classList.toggle("open"));
  });
}

// Запуск и дата
function init() {
  renderTierList();
  renderHeroGrid();
  renderItemGrid();
  fillCounterSelects();
  renderGuides();

  if (typeof PATCH_INFO !== 'undefined') {
    document.getElementById("footerDate").innerHTML = `Данные актуальны на ${PATCH_INFO.date} · Патч ${PATCH_INFO.patch} · Сезон ${PATCH_INFO.season}`;
  }
}
init();