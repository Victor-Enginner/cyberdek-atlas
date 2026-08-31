const state = { catalog: [], activeCategory: 'ALL', query: '', favoritesOnly: false, visible: 24, favorites: new Set(JSON.parse(localStorage.getItem('cyberdek-favorites') || '[]')) };
const $ = (selector) => document.querySelector(selector);
const cards = $('#cards');
const chips = $('#category-chips');
const repoCards = $('#repo-cards');
const repoState = { query: '', risk: 'Todos', catalog: [
  ['CYBERDEK ATLAS','~/cyberdek-atlas','Painel local','Baixo','Pronto para usar','cd ~/cyberdek-atlas && npm run serve','Interface visual local para organizar seu aprendizado.'],
  ['Anubis','~/Anubis','Enumeração de subdomínios','Médio','Requer dependências Python','cd ~/Anubis && anubis --help','Use somente em domínios seus ou autorizados.'],
  ['dirsearch','~/dirsearch','Teste de caminhos web','Médio','Requer Python 3.11+','cd ~/dirsearch && python3 dirsearch.py --help','Pode gerar muitas requisições; use apenas em laboratório.'],
  ['XSStrike','~/XSStrike','Detecção XSS','Alto','Requer dependências Python','cd ~/XSStrike && python xsstrike.py --help','Ferramenta de alto impacto: não use sem autorização.'],
  ['Commix','~/commix','Teste de injeção','Alto','Use apenas em laboratório','cd ~/commix && python commix.py -h','Prioridade alta de risco; comece apenas pela documentação.'],
  ['AllHackingTools','~/AllHackingTools','Agregador de ferramentas','Alto','Revisar antes de executar',"cd ~/AllHackingTools && sed -n '1,160p' README.md",'Não execute o menu automaticamente; revise instalações e evite ações de ataque.'],
  ['DarkFly-Tool','~/DarkFly-Tool','Agregador legado','Alto','Legado: usa Python 2',"cd ~/DarkFly-Tool && sed -n '1,140p' README.md",'Não recomendado: não instale Python 2 para executá-lo.'],
  ['Termux-Kali','~/Termux-Kali','Ambiente Linux','Médio','Revisar compatibilidade',"cd ~/Termux-Kali && sed -n '1,160p' README.md",'Leia o script e confirme espaço em disco antes de instalar.']
] };

const hostFromUrl = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
const persist = () => { localStorage.setItem('cyberdek-favorites', JSON.stringify([...state.favorites])); $('#saved-count').textContent = state.favorites.size; };
const filtered = () => state.catalog.filter((entry) => {
  const haystack = `${entry.title} ${entry.category} ${entry.url}`.toLowerCase();
  return (state.activeCategory === 'ALL' || entry.category === state.activeCategory)
    && (!state.query || haystack.includes(state.query))
    && (!state.favoritesOnly || state.favorites.has(entry.id));
});

function makeCard(entry) {
  const article = document.createElement('article'); article.className = 'card';
  const meta = document.createElement('div'); meta.className = 'card-meta'; meta.textContent = entry.category;
  const link = document.createElement('a'); link.href = entry.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.className = 'card-link'; link.textContent = entry.title; link.title = entry.title;
  const domain = document.createElement('span'); domain.className = 'domain'; domain.textContent = hostFromUrl(entry.url);
  const save = document.createElement('button'); save.type = 'button'; save.className = 'save'; save.setAttribute('aria-label', `Salvar ${entry.title}`); save.textContent = state.favorites.has(entry.id) ? '★' : '☆';
  save.addEventListener('click', () => { state.favorites.has(entry.id) ? state.favorites.delete(entry.id) : state.favorites.add(entry.id); persist(); render(); });
  article.append(meta, link, domain, save); return article;
}

function renderChips() {
  const counts = state.catalog.reduce((out, item) => (out[item.category] = (out[item.category] || 0) + 1, out), {});
  const options = [['ALL', state.catalog.length], ...Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))];
  chips.replaceChildren(...options.map(([category, count]) => { const button = document.createElement('button'); button.type = 'button'; button.className = `chip ${state.activeCategory === category ? 'active' : ''}`; button.textContent = `${category} · ${count}`; button.addEventListener('click', () => { state.activeCategory = category; state.visible = 24; render(); }); return button; }));
}

function render() {
  const list = filtered(); const visible = list.slice(0, state.visible);
  cards.replaceChildren(...visible.map(makeCard)); renderChips();
  $('#result-summary').textContent = `${list.length.toLocaleString('pt-BR')} fonte${list.length === 1 ? '' : 's'} ${state.favoritesOnly ? 'salva' : 'encontrada'}${list.length === 1 ? '' : 's'}`;
  $('#load-more').hidden = visible.length >= list.length; $('#clear-filters').hidden = state.activeCategory === 'ALL' && !state.query && !state.favoritesOnly;
}

function renderRepos() {
  const list = repoState.catalog.filter(([name,, category, risk, status]) => `${name} ${category} ${risk} ${status}`.toLowerCase().includes(repoState.query) && (repoState.risk === 'Todos' || repoState.risk === risk));
  $('#risk-chips').replaceChildren(...['Todos','Baixo','Médio','Alto'].map((risk) => { const b = document.createElement('button'); b.type = 'button'; b.className = `chip ${risk === repoState.risk ? 'active' : ''}`; b.textContent = risk; b.addEventListener('click', () => { repoState.risk = risk; renderRepos(); }); return b; })); repoCards.replaceChildren(...list.map(([name,path,category,risk,status,command,note]) => { const c=document.createElement('article'); c.className='repo-card'; c.innerHTML=`<p class="repo-meta risk-${risk.toLowerCase().replace('é','e')}">RISCO ${risk.toUpperCase()} · ${category}</p><h3>${name}</h3><p class="repo-location">${path} · ${status}</p><code class="repo-command"></code><p class="repo-note">Nota: ${note}</p>`; c.querySelector('code').textContent=command; return c; })); $('#repo-summary').textContent = `${list.length} repositório${list.length === 1 ? '' : 's'} no mapa`;
}
$('#search').addEventListener('input', (event) => { state.query = event.target.value.trim().toLowerCase(); state.visible = 24; render(); });
$('#clear-filters').addEventListener('click', () => { state.activeCategory = 'ALL'; state.query = ''; state.favoritesOnly = false; state.visible = 24; $('#search').value = ''; render(); });
$('#favorites-toggle').addEventListener('click', () => { state.favoritesOnly = !state.favoritesOnly; state.visible = 24; $('#favorites-toggle').classList.toggle('active', state.favoritesOnly); render(); document.querySelector('#directory').scrollIntoView({ behavior: 'smooth' }); });
$('#load-more').addEventListener('click', () => { state.visible += 48; render(); });
$('#random-link').addEventListener('click', () => { const entry = state.catalog[Math.floor(Math.random() * state.catalog.length)]; window.open(entry.url, '_blank', 'noopener,noreferrer'); });
$('#repo-search').addEventListener('input', (event) => { repoState.query = event.target.value.trim().toLowerCase(); renderRepos(); });

const [catalog, manifest] = await Promise.all([fetch('./catalog.json').then((r) => r.json()), fetch('./manifest.json').then((r) => r.json())]);
renderRepos();
state.catalog = catalog; $('#public-count').textContent = manifest.inventory.publicCatalog.toLocaleString('pt-BR'); $('#category-count').textContent = manifest.inventory.headings; $('#year').textContent = new Date().getFullYear(); persist(); render();
