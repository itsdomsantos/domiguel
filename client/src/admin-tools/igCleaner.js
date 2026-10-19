// IG Cleaner — corre DENTRO do instagram.com (bookmarklet ou consola).
// Abre um painel com quem segues / quem te segue (foto + nome), deixa
// selecionar pessoas e faz "deixar de seguir" / "remover seguidor" com
// pausas entre ações para não ativar os bloqueios do Instagram.
// Este ficheiro é importado como texto (?raw) pela página admin — tem de ser
// autónomo, sem imports.
(() => {
  if (!/(^|\.)instagram\.com$/.test(location.hostname)) {
    alert('Abre o instagram.com (com sessão iniciada) e corre o IG Cleaner lá.');
    return;
  }
  const PANEL_ID = 'dd-ig-cleaner';
  document.getElementById(PANEL_ID)?.remove();

  const cookie = (n) => decodeURIComponent((document.cookie.match('(?:^|; )' + n + '=([^;]*)') || [])[1] || '');
  const myId = cookie('ds_user_id');
  if (!myId || !cookie('csrftoken')) {
    alert('Não encontrei a sessão do Instagram. Faz login primeiro.');
    return;
  }

  const APP_ID = '936619743392459';
  const LONG_PAUSE_EVERY = 15;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);

  // path relativo a /api/v1/, ou absoluto (começa por "/") para os endpoints /web/.
  async function ig(path, method = 'GET', body = '') {
    const res = await fetch(path.startsWith('/') ? path : '/api/v1/' + path, {
      method,
      credentials: 'include',
      headers: {
        'X-IG-App-ID': APP_ID,
        'X-ASBD-ID': '129477',
        'X-CSRFToken': cookie('csrftoken'),
        'X-Requested-With': 'XMLHttpRequest',
        'X-IG-WWW-Claim': sessionStorage.getItem('www-claim-v2') || '0',
        ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
      body: method === 'POST' ? body : undefined,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      /* resposta sem JSON */
    }
    if (!res.ok || data?.status === 'fail') {
      const err = new Error(`HTTP ${res.status}${data?.feedback_message || data?.message ? ' — ' + (data.feedback_message || data.message) : ''}`);
      err.status = res.status;
      err.blocked = res.status === 429 || !!data?.feedback_required || data?.message === 'feedback_required';
      throw err;
    }
    return data;
  }

  // O Instagram às vezes responde "ok" sem fazer nada — confirmamos sempre.
  async function stillLinked(isUnf, id) {
    const d = await ig(`friendships/show/${id}/`);
    return isUnf ? !!d.following : !!d.followed_by;
  }

  async function act(isUnf, id) {
    const body = `user_id=${id}&container_module=profile`;
    await ig(isUnf ? `friendships/destroy/${id}/` : `friendships/remove_follower/${id}/`, 'POST', body);
    await sleep(rand(1500, 3000));
    if (!(await stillLinked(isUnf, id))) return;
    // Alternativa: endpoints antigos do site
    await ig(isUnf ? `/web/friendships/${id}/unfollow/` : `/web/friendships/${id}/remove_follower/`, 'POST');
    await sleep(rand(1500, 3000));
    if (!(await stillLinked(isUnf, id))) return;
    const err = new Error('o Instagram respondeu ok mas não aplicou a ação (bloqueio silencioso)');
    err.blocked = true;
    throw err;
  }

  async function fetchAll(kind, onProgress) {
    const out = new Map();
    let maxId = '';
    do {
      const q =
        'count=50' +
        (kind === 'followers' ? '&search_surface=follow_list_page' : '') +
        (maxId ? '&max_id=' + encodeURIComponent(maxId) : '');
      const d = await ig(`friendships/${myId}/${kind}/?${q}`);
      for (const u of d.users || []) out.set(String(u.pk_id || u.pk), u);
      onProgress(out.size);
      maxId = d.next_max_id || '';
      if (maxId) await sleep(rand(700, 1500));
    } while (maxId);
    return out;
  }

  // ---------- UI (só createElement + style, por causa da CSP do Instagram) ----------
  const C = {
    bg: '#0d0d17',
    surface: '#12121f',
    surface2: '#191927',
    border: 'rgba(255,255,255,0.1)',
    text: '#f2f2f7',
    soft: '#a3a3b8',
    dim: '#6c6c82',
    brand: '#7c5cff',
    brand2: '#00d4ff',
    danger: '#ff5c7c',
    success: '#34d399',
  };
  function el(tag, style = {}, props = {}, children = []) {
    const n = document.createElement(tag);
    Object.assign(n.style, style);
    Object.assign(n, props);
    for (const c of [].concat(children)) if (c) n.append(c);
    return n;
  }
  const btnStyle = (bg, color = C.text) => ({
    padding: '8px 12px',
    borderRadius: '10px',
    border: `1px solid ${C.border}`,
    background: bg,
    color,
    font: '600 13px system-ui, sans-serif',
    cursor: 'pointer',
  });
  const inputStyle = {
    padding: '8px 10px',
    borderRadius: '10px',
    border: `1px solid ${C.border}`,
    background: C.surface2,
    color: C.text,
    font: '13px system-ui, sans-serif',
    outline: 'none',
  };

  const state = {
    following: new Map(),
    followers: new Map(),
    selected: new Set(),
    view: 'following',
    onlyNonMutual: true,
    search: '',
    running: false,
    stop: false,
  };

  const statusEl = el('div', { color: C.soft, fontSize: '12px', minHeight: '18px' });
  const setStatus = (t, color = C.soft) => {
    statusEl.textContent = t;
    statusEl.style.color = color;
  };

  const closeBtn = el('button', btnStyle('transparent', C.soft), { textContent: '✕', title: 'Fechar' });
  closeBtn.onclick = () => {
    state.stop = true;
    panel.remove();
  };

  const tabFollowing = el('button', {}, {});
  const tabFollowers = el('button', {}, {});
  function paintTabs() {
    const n1 = state.following.size;
    const n2 = state.followers.size;
    tabFollowing.textContent = `A seguir (${n1})`;
    tabFollowers.textContent = `Seguidores (${n2})`;
    Object.assign(tabFollowing.style, btnStyle(state.view === 'following' ? C.brand : C.surface2), { flex: '1' });
    Object.assign(tabFollowers.style, btnStyle(state.view === 'followers' ? C.brand : C.surface2), { flex: '1' });
    mutualLabel.lastChild.textContent =
      state.view === 'following' ? ' Só quem não me segue de volta' : ' Só quem eu não sigo de volta';
  }
  tabFollowing.onclick = () => {
    state.view = 'following';
    renderList();
  };
  tabFollowers.onclick = () => {
    state.view = 'followers';
    renderList();
  };

  const search = el('input', { ...inputStyle, flex: '1', minWidth: '0' }, { placeholder: 'Pesquisar @username ou nome' });
  search.oninput = () => {
    state.search = search.value.trim().toLowerCase();
    renderList();
  };

  const mutualBox = el('input', { accentColor: C.brand }, { type: 'checkbox', checked: true });
  mutualBox.onchange = () => {
    state.onlyNonMutual = mutualBox.checked;
    renderList();
  };
  const mutualLabel = el('label', { color: C.soft, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }, {}, [
    mutualBox,
    document.createTextNode(''),
  ]);

  const selAllBtn = el('button', btnStyle(C.surface2), { textContent: 'Selecionar visíveis' });
  const selNoneBtn = el('button', btnStyle(C.surface2), { textContent: 'Limpar seleção' });
  const counter = el('span', { color: C.soft, fontSize: '13px', marginLeft: 'auto' });

  const delayMin = el('input', { ...inputStyle, width: '56px' }, { type: 'number', min: '5', value: '25' });
  const delayMax = el('input', { ...inputStyle, width: '56px' }, { type: 'number', min: '5', value: '45' });

  const unfollowBtn = el('button', { ...btnStyle(C.brand), flex: '1' }, { textContent: 'Deixar de seguir' });
  const removeBtn = el('button', { ...btnStyle(C.danger, '#08080f'), flex: '1' }, { textContent: 'Remover seguidor' });
  const stopBtn = el('button', { ...btnStyle(C.surface2), display: 'none' }, { textContent: 'Parar' });
  stopBtn.onclick = () => {
    state.stop = true;
    setStatus('A parar depois da ação atual…');
  };

  const list = el('div', { flex: '1', minHeight: '0', overflowY: 'auto', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` });
  const rows = new Map(); // id -> { row, check, status }

  const row = (...children) => el('div', { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }, {}, children);

  const panel = el(
    'div',
    {
      position: 'fixed',
      top: '0',
      right: '0',
      width: 'min(560px, 100vw)',
      bottom: '0',
      zIndex: '2147483647',
      background: C.bg,
      color: C.text,
      borderLeft: `1px solid ${C.border}`,
      boxShadow: '0 0 60px rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      padding: '16px',
      font: '14px system-ui, sans-serif',
      boxSizing: 'border-box',
    },
    { id: PANEL_ID },
    [
      row(
        el('strong', { fontSize: '17px' }, {}, [
          document.createTextNode('IG Cleaner'),
          el('span', { color: C.brand2 }, { textContent: '.' }),
        ]),
        el('span', { flex: '1' }),
        closeBtn,
      ),
      statusEl,
      row(tabFollowing, tabFollowers),
      row(search),
      row(mutualLabel),
      row(selAllBtn, selNoneBtn, counter),
      list,
      row(
        el('span', { color: C.soft, fontSize: '13px' }, { textContent: 'Pausa entre ações (s):' }),
        delayMin,
        el('span', { color: C.dim }, { textContent: 'a' }),
        delayMax,
      ),
      row(unfollowBtn, removeBtn, stopBtn),
    ],
  );
  document.body.append(panel);

  function visibleUsers() {
    const src = state.view === 'following' ? state.following : state.followers;
    const other = state.view === 'following' ? state.followers : state.following;
    const out = [];
    for (const [id, u] of src) {
      if (state.onlyNonMutual && other.has(id)) continue;
      if (state.search && !`${u.username} ${u.full_name || ''}`.toLowerCase().includes(state.search)) continue;
      out.push([id, u]);
    }
    return out;
  }

  function updateCounter() {
    const s = [...state.selected];
    const nUnf = s.filter((id) => state.following.has(id)).length;
    const nRem = s.filter((id) => state.followers.has(id)).length;
    counter.textContent = `${s.length} selecionados`;
    unfollowBtn.textContent = `Deixar de seguir (${nUnf})`;
    removeBtn.textContent = `Remover seguidor (${nRem})`;
    unfollowBtn.disabled = state.running || !nUnf;
    removeBtn.disabled = state.running || !nRem;
    unfollowBtn.style.opacity = unfollowBtn.disabled ? '0.45' : '1';
    removeBtn.style.opacity = removeBtn.disabled ? '0.45' : '1';
  }

  function renderList() {
    paintTabs();
    list.replaceChildren();
    rows.clear();
    const users = visibleUsers();
    if (!users.length) {
      list.append(el('div', { padding: '40px 10px', textAlign: 'center', color: C.dim }, { textContent: 'Ninguém aqui.' }));
    }
    for (const [id, u] of users) {
      const check = el('input', { accentColor: C.brand, width: '18px', height: '18px', flexShrink: '0' }, {
        type: 'checkbox',
        checked: state.selected.has(id),
      });
      check.onchange = () => {
        check.checked ? state.selected.add(id) : state.selected.delete(id);
        updateCounter();
      };
      const img = el('img', { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', background: C.surface2, flexShrink: '0' }, {
        src: u.profile_pic_url || '',
        loading: 'lazy',
        alt: '',
      });
      const link = el('a', { color: C.text, fontWeight: '600', textDecoration: 'none' }, {
        href: `/${u.username}/`,
        target: '_blank',
        rel: 'noopener',
        textContent: '@' + u.username + (u.is_verified ? ' ✓' : ''),
      });
      link.onclick = (e) => e.stopPropagation();
      const followsMe = state.followers.has(id);
      const iFollow = state.following.has(id);
      const tag = el('span', { fontSize: '11px', color: C.dim }, {
        textContent: state.view === 'following' ? (followsMe ? 'segue-te' : 'não te segue') : iFollow ? 'segues' : 'não segues',
      });
      const status = el('span', { fontSize: '12px', flexShrink: '0' });
      const r = el(
        'label',
        { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' },
        {},
        [
          check,
          img,
          el('div', { flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', lineHeight: '1.3' }, {}, [
            link,
            el('span', { color: C.soft, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, {
              textContent: u.full_name || '',
            }),
            tag,
          ]),
          status,
        ],
      );
      list.append(r);
      rows.set(id, { row: r, check, status });
    }
    updateCounter();
  }

  selAllBtn.onclick = () => {
    for (const [id] of visibleUsers()) state.selected.add(id);
    renderList();
  };
  selNoneBtn.onclick = () => {
    state.selected.clear();
    renderList();
  };

  async function countdown(ms, label) {
    const end = Date.now() + ms;
    while (Date.now() < end && !state.stop) {
      setStatus(`${label} — próxima ação em ${Math.ceil((end - Date.now()) / 1000)}s`);
      await sleep(500);
    }
  }

  async function run(action) {
    const isUnf = action === 'unfollow';
    const pool = isUnf ? state.following : state.followers;
    const ids = [...state.selected].filter((id) => pool.has(id));
    if (!ids.length) return;
    const verb = isUnf ? 'deixar de seguir' : 'remover como seguidor';
    let msg = `Vais ${verb} ${ids.length} conta(s). Continuar?`;
    if (ids.length > 150) msg += '\n\nAviso: mais de ~150 por dia aumenta o risco de bloqueio temporário do Instagram.';
    if (!confirm(msg)) return;

    const min = Math.max(5, Number(delayMin.value) || 25);
    const max = Math.max(min, Number(delayMax.value) || 45);
    state.running = true;
    state.stop = false;
    stopBtn.style.display = '';
    updateCounter();

    let done = 0;
    for (let i = 0; i < ids.length && !state.stop; i++) {
      const id = ids[i];
      const u = pool.get(id);
      const r = rows.get(id);
      if (r) {
        r.status.textContent = '…';
        r.row.scrollIntoView({ block: 'nearest' });
      }
      setStatus(`${i + 1}/${ids.length} — @${u.username}`);
      try {
        await act(isUnf, id);
        done++;
        pool.delete(id);
        state.selected.delete(id);
        if (r) {
          r.status.textContent = '✓';
          r.status.style.color = C.success;
          r.check.checked = false;
          r.check.disabled = true;
          r.row.style.opacity = '0.4';
        }
      } catch (e) {
        if (r) {
          r.status.textContent = '✕';
          r.status.style.color = C.danger;
          r.status.title = e.message;
        }
        if (e.blocked || e.status === 400 || e.status === 403) {
          setStatus(
            `Instagram travou as ações (${e.message}). Parei por segurança — espera algumas horas antes de continuar.`,
            C.danger,
          );
          state.stop = true;
          break;
        }
      }
      updateCounter();
      if (i < ids.length - 1 && !state.stop) {
        const long = done > 0 && done % LONG_PAUSE_EVERY === 0;
        await countdown(long ? rand(180, 300) * 1000 : rand(min, max) * 1000, long ? `Pausa longa (${done} feitos)` : `${done} feitos`);
      }
    }

    state.running = false;
    stopBtn.style.display = 'none';
    if (!statusEl.textContent.startsWith('Instagram travou')) {
      setStatus(`Concluído: ${done} de ${ids.length}.`, C.success);
    }
    paintTabs();
    updateCounter();
  }
  unfollowBtn.onclick = () => run('unfollow');
  removeBtn.onclick = () => run('remove');

  (async () => {
    paintTabs();
    updateCounter();
    try {
      setStatus('A carregar quem segues…');
      state.following = await fetchAll('following', (n) => setStatus(`A carregar quem segues… ${n}`));
      paintTabs();
      setStatus('A carregar os teus seguidores…');
      state.followers = await fetchAll('followers', (n) => setStatus(`A carregar os teus seguidores… ${n}`));
      if (!state.following.size && !state.followers.size) {
        setStatus('O Instagram devolveu listas vazias. Recarrega a página (F5) e tenta de novo.', C.danger);
      } else {
        setStatus(`Pronto. ${state.following.size} a seguir · ${state.followers.size} seguidores.`, C.success);
      }
    } catch (e) {
      setStatus(`Erro a carregar listas: ${e.message}`, C.danger);
    }
    renderList();
  })();
})();
