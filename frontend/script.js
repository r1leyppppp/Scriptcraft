function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');
  if (page === 'library') renderLibrary();
  if (page === 'character-card') renderCardLibrary();
  if (page === 'relationship') {
  const lib = getLibrary();
  const container = document.getElementById('script-selector');
  if (container) {
    if (!lib.scripts.length) {
      container.innerHTML = '<p style="color:#9ca3af;padding:0 20px;">剧本库为空，请先保存剧本</p>';
    }
  }
}
}

let selectedStyle = '';

function selectStyle(btn, style) {
  document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedStyle = style;

  const welcomePage = document.getElementById('welcome-page');
  welcomePage.classList.remove('theme-movie', 'theme-stage', 'theme-tv');

  const overlay = document.getElementById('spotlight-overlay');
  const beam = document.getElementById('spotlight-beam');

  if (style === '电影剧本') {
    welcomePage.classList.add('theme-movie');
    overlay.classList.remove('active');
  } else if (style === '舞台剧本') {
    document.body.classList.add('stage-mode');
    welcomePage.classList.add('theme-stage');
    overlay.classList.add('active');
    const rect = btn.getBoundingClientRect();
    beam.style.left = (rect.left + rect.width / 2 - 150) + 'px';
  } else if (style === '电视剧本') {
    welcomePage.classList.add('theme-tv');
    overlay.classList.remove('active');
  }
}

async function convertText() {
  const novelInput = document.getElementById('novel-input');
  const outputContent = document.getElementById('output-content');
  const convertBtn = document.getElementById('convert-btn');
  const text = novelInput.value.trim();
  
  if (!text) { showModal('请先输入小说内容！'); return; }
  convertBtn.textContent = '转换中...';
  convertBtn.disabled = true;
  outputContent.value = '正在生成剧本，请稍候...';
  outputContent.disabled = true;
  try {
    const response = await fetch('http://localhost:8000/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, style: selectedStyle })
    });
    const data = await response.json();
    outputContent.value = data.result;
    generateCharacterCards(data.result, 'character-cards');
    generateReview(data.result, 'review-content');
  } catch (error) {
    outputContent.value = '请求失败，请确认后端服务已启动。';
  } finally {
    convertBtn.textContent = '开始转换';
    convertBtn.disabled = false;
    outputContent.disabled = false;
  }
}
function copyOutput() {
  const outputContent = document.getElementById('output-content');
  const copyBtn = document.getElementById('copy-btn');
  navigator.clipboard.writeText(outputContent.textContent);
  copyBtn.textContent = '已复制！';
  setTimeout(() => copyBtn.textContent = '复制', 2000);
}

let fileText = '';

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  document.getElementById('file-name').textContent = '已选择：' + file.name;
  document.getElementById('upload-area').classList.add('uploaded');
  document.getElementById('upload-area').querySelector('p').textContent = '✅ ' + file.name;
  document.getElementById('clear-file-btn').style.display = 'block';
  const ext = file.name.split('.').pop().toLowerCase();
  
  if (ext === 'txt') {
    const reader = new FileReader();
    reader.onload = (e) => { fileText = e.target.result; };
    reader.readAsText(file);
  } else {
    const formData = new FormData();
    formData.append('file', file);
    fetch('http://localhost:8000/parse-file', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => { fileText = data.text; })
    .catch(err => console.error(err));
  }
}

async function convertFile() {
  const fileOutputContent = document.getElementById('file-output-content');
  const fileConvertBtn = document.getElementById('file-convert-btn');
  if (!fileText) { showFileModal('请先上传文件！'); return; }
  fileConvertBtn.textContent = '转换中...';
  fileConvertBtn.disabled = true;
  fileOutputContent.textContent = '正在生成剧本，请稍候...';
  try {
    const response = await fetch('http://localhost:8000/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: fileText, style: selectedStyle })
    });
    const data = await response.json();
    fileOutputContent.textContent = data.result;
    generateCharacterCards(data.result, 'file-character-cards');
    generateReview(data.result, 'file-review-content');
  } catch (error) {
    fileOutputContent.textContent = '请求失败，请确认后端服务已启动。';
  } finally {
    fileConvertBtn.textContent = '开始转换';
    fileConvertBtn.disabled = false;
  }
}

function copyFileOutput() {
  const fileOutputContent = document.getElementById('file-output-content');
  const fileCopyBtn = document.getElementById('file-copy-btn');
  navigator.clipboard.writeText(fileOutputContent.textContent);
  fileCopyBtn.textContent = '已复制！';
  setTimeout(() => fileCopyBtn.textContent = '复制', 2000);
}

async function editScript() {
  const editInput = document.getElementById('edit-input');
  const outputContent = document.getElementById('output-content');
  const editBtn = document.getElementById('edit-btn');
  const currentScript = outputContent.textContent;
  const request = editInput.value.trim();
  if (!request) { showModal('请输入修改要求！'); return; }
  if (currentScript === '转换结果将显示在这里...') { showModal('请先生成剧本！'); return; }
  editBtn.textContent = '修改中...';
  editBtn.disabled = true;
  try {
    const response = await fetch('http://localhost:8000/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: currentScript, request: request })
    });
    const data = await response.json();
    outputContent.textContent = data.result;
    editInput.value = '';
  } catch (error) {
    showModal('修改失败，请确认后端服务已启动。');
  } finally {
    editBtn.textContent = '修改剧本';
    editBtn.disabled = false;
  }
}

async function editFileScript() {
  const editInput = document.getElementById('file-edit-input');
  const outputContent = document.getElementById('file-output-content');
  const editBtn = document.getElementById('file-edit-btn');
  const currentScript = outputContent.textContent;
  const request = editInput.value.trim();
  if (!request) { showFileModal('请输入修改要求！'); return; }
  if (currentScript === '转换结果将显示在这里...') { showFileModal('请先生成剧本！'); return; }
  editBtn.textContent = '修改中...';
  editBtn.disabled = true;
  try {
    const response = await fetch('http://localhost:8000/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: currentScript, request: request })
    });
    const data = await response.json();
    outputContent.textContent = data.result;
    editInput.value = '';
  } catch (error) {
    showFileModal('修改失败，请确认后端服务已启动。');
  } finally {
    editBtn.textContent = '修改剧本';
    editBtn.disabled = false;
  }
}

function showModal(msg) {
  document.getElementById('modal-msg').textContent = msg;
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
}

function showFileModal(msg) {
  document.getElementById('file-modal-msg').textContent = msg;
  document.getElementById('file-modal').classList.add('show');
}

function closeFileModal() {
  document.getElementById('file-modal').classList.remove('show');
}

function checkStyleAndNext() {
  if (!selectedStyle) {
    showWelcomeModal('请先选择剧本风格！');
    return;
  }
  goTo('input-select');
}

function showWelcomeModal(msg) {
  document.getElementById('welcome-modal-msg').textContent = msg;
  document.getElementById('welcome-modal').classList.add('show');
}

function closeWelcomeModal() {
  document.getElementById('welcome-modal').classList.remove('show');
}
// ===== 剧本库 =====
function getLibrary() {
  return JSON.parse(localStorage.getItem('scriptLibrary') || '{"folders":{},"scripts":[]}');
}

function saveLibrary(lib) {
  localStorage.setItem('scriptLibrary', JSON.stringify(lib));
}

function saveScript() {
  const content = document.getElementById('output-content').textContent;
  if (content === '转换结果将显示在这里...') { showModal('请先生成剧本！'); return; }
  document.getElementById('save-modal').classList.add('show');
}

function closeSaveModal() {
  document.getElementById('save-modal').classList.remove('show');
}

function saveToDevice() {
  const content = document.getElementById('output-content').textContent;
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '剧本_' + new Date().toLocaleDateString() + '.txt';
  a.click();
  closeSaveModal();
}

let _pendingContent = '';
let _pendingStyle = '';
let _pendingSource = '';

function saveToLibrary() {
  closeSaveModal();
  _pendingContent = document.getElementById('output-content').textContent;
  _pendingStyle = selectedStyle;
  _pendingSource = 'text';
  document.getElementById('script-name-input').value = '';
  document.getElementById('name-modal').classList.add('show');
}

function saveFileScript() {
  const content = document.getElementById('file-output-content').textContent;
  if (content === '转换结果将显示在这里...') { showFileModal('请先生成剧本！'); return; }
  _pendingContent = content;
  _pendingStyle = selectedStyle;
  document.getElementById('file-save-modal').classList.add('show');
}

function closeFileSaveModal() {
  document.getElementById('file-save-modal').classList.remove('show');
}

function showFileExportModal() {
  closeFileSaveModal();
  document.getElementById('file-export-modal').classList.add('show');
}

function closeFileExportModal() {
  document.getElementById('file-export-modal').classList.remove('show');
}

function confirmSaveName() {
  const name = document.getElementById('script-name-input').value.trim() || '未命名剧本_' + new Date().toLocaleDateString();
  const lib = getLibrary();
  lib.scripts.push({
    id: Date.now(),
    name: name,
    content: _pendingContent,
    style: _pendingStyle,
    date: new Date().toLocaleString(),
    folder: null
  });
  saveLibrary(lib);
  closeNameModal();
  showModal('剧本已保存到剧本库！');
}

function closeNameModal() {
  document.getElementById('name-modal').classList.remove('show');
}
function createFolder() {
  document.getElementById('folder-name-input').value = '';
  document.getElementById('folder-name-modal').classList.add('show');
}

let currentFolder = null;

function renderLibrary() {
  const lib = getLibrary();
  const container = document.getElementById('library-content');
  const pathEl = document.getElementById('current-path');
  let html = '';

  if (currentFolder === null) {
    pathEl.textContent = '全部剧本';
    // 显示文件夹
    Object.keys(lib.folders).forEach(fname => {
      const count = lib.scripts.filter(s => s.folder === fname).length;
      html += `
        <div class="lib-folder">
          <span class="lib-icon" onclick="openFolder('${fname}')">📁</span>
          <span class="lib-name" onclick="openFolder('${fname}')">${fname}</span>
          <span class="lib-meta">${count} 个剧本</span>
          <button onclick="deleteFolder('${fname}')" style="margin-left:auto;padding:4px 12px;border:1.5px solid #e0e0e0;border-radius:12px;background:#fff;font-size:12px;cursor:pointer;color:#ef4444;border-color:#ef4444;">删除</button>
        </div>`;
    });
    // 显示未分类剧本
    lib.scripts.filter(s => !s.folder).forEach(s => {
      html += renderScriptItem(s);
    });
  } else {
    pathEl.textContent = currentFolder;
    html += `<div class="lib-back" onclick="closeFolder()">← 返回</div>`;
    lib.scripts.filter(s => s.folder === currentFolder).forEach(s => {
      html += renderScriptItem(s);
    });
  }

  if (!html) html = '<div class="lib-empty">还没有保存的剧本</div>';
  container.innerHTML = html;
}

function renderScriptItem(s) {
  return `
    <div class="lib-script">
      <div class="lib-script-header">
        <span class="lib-icon">📄</span>
        <span class="lib-name">${s.name}</span>
        <span class="lib-meta">${s.style || ''} · ${s.date}</span>
      </div>
      <div class="lib-script-actions">
        <button onclick="viewScript(${s.id})">查看</button>
        <button onclick="exportLibScript(${s.id})">导出</button>
        <button onclick="moveScript(${s.id})">移动</button>
        <button onclick="deleteScript(${s.id})">删除</button>
      </div>
    </div>`;
}

let _exportingScriptId = null;

function exportLibScript(id) {
  _exportingScriptId = id;
  document.getElementById('lib-export-modal').classList.add('show');
}

function closeLibExportModal() {
  document.getElementById('lib-export-modal').classList.remove('show');
}

function exportLibScriptAs(format) {
  const lib = getLibrary();
  const s = lib.scripts.find(s => s.id === _exportingScriptId);
  if (!s) return;

  if (format === 'txt' || format === 'yaml') {
    const blob = new Blob([s.content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = s.name + (format === 'yaml' ? '.yaml' : '.txt');
    a.click();
    closeLibExportModal();
    showModal('下载成功！');
  } else {
    fetch('http://localhost:8000/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: s.content, format: format, filename: s.name })
    })
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = s.name + '.' + format;
      a.click();
      closeLibExportModal();
      showModal('下载成功！');
    })
    .catch(() => showModal('下载失败，请确认后端服务已启动！'));
  }
}

function openFolder(name) {
  currentFolder = name;
  renderLibrary();
}

function closeFolder() {
  currentFolder = null;
  renderLibrary();
}

function viewScript(id) {
  const lib = getLibrary();
  const s = lib.scripts.find(s => s.id === id);
  if (!s) return;
  document.getElementById('view-script-title').textContent = s.name;
  document.getElementById('view-script-content').textContent = s.content;
  goTo('view-script');
}

function moveScript(id) {
  const lib = getLibrary();
  const folders = Object.keys(lib.folders);
  if (!folders.length) { showModal('请先创建文件夹！'); return; }
  _pendingMoveId = id;
  const container = document.getElementById('move-folder-list');
  container.innerHTML = `
    <button class="script-select-btn" onclick="confirmMoveScript(null)" style="color:#6b7280;border-color:#e0e0e0;">未分类</button>
    ${folders.map(fname => `
      <button class="script-select-btn" onclick="confirmMoveScript('${fname}')">${fname}</button>
    `).join('')}
  `;
  document.getElementById('move-script-modal').classList.add('show');
}

function deleteScript(id) {
  _pendingDeleteId = id;
  _pendingDeleteFolder = null;
  document.getElementById('delete-script-modal').classList.add('show');
}

function showDrawer() {
  document.getElementById('bottom-drawer').classList.add('open');
}

function hideDrawer() {
  document.getElementById('bottom-drawer').classList.remove('open');
}

document.addEventListener('mousemove', (e) => {
  if (e.clientY > window.innerHeight - 60) {
    showDrawer();
  }
});

document.getElementById('bottom-drawer').addEventListener('mouseleave', (e) => {
  if (e.clientY < window.innerHeight - 60) {
    hideDrawer();
  }
});

function clearFile() {
  fileText = '';
  document.getElementById('file-name').textContent = '未选择文件';
  document.getElementById('upload-area').classList.remove('uploaded');
  document.getElementById('upload-area').querySelector('p').textContent = '📂 点击上传 .txt 文件';
  document.getElementById('file-input').value = '';
  document.getElementById('clear-file-btn').style.display = 'none';
}

function showExportModal() {
  closeSaveModal();
  document.getElementById('export-modal').classList.add('show');
}

function closeExportModal() {
  document.getElementById('export-modal').classList.remove('show');
}

function exportAs(format) {
  const textContent = document.getElementById('output-content') ? document.getElementById('output-content').textContent : '';
  const fileContent = document.getElementById('file-output-content') ? document.getElementById('file-output-content').textContent : '';
  const content = _pendingContent || (textContent !== '转换结果将显示在这里...' ? textContent : fileContent);
  const filename = '剧本_' + new Date().toLocaleDateString();

  if (format === 'txt' || format === 'yaml') {
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename + (format === 'yaml' ? '.yaml' : '.txt');
    a.click();
    closeExportModal();
    closeFileExportModal();
  } else if (format === 'docx' || format === 'pdf') {
    fetch('http://localhost:8000/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content, format: format, filename: filename })
    })
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename + '.' + format;
      a.click();
      closeExportModal();
      closeFileExportModal();
    });
  }
}

function switchTab(el, tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  el.classList.add('active');
  document.getElementById('tab-' + tab).style.display = 'block';
}

function generateCharacterCards(yamlText, containerId) {
  const container = document.getElementById(containerId || 'character-cards');
  const lines = yamlText.split('\n');
  const characters = [];
  let current = null;

  lines.forEach(line => {
    if (line.match(/^\s*-\s*name:/)) {
      if (current) characters.push(current);
      current = { name: line.replace(/.*name:\s*["']?/, '').replace(/["']$/, '').trim() };
    } else if (current && line.match(/appearance:/)) {
      current.appearance = line.replace(/.*appearance:\s*["']?/, '').replace(/["']$/, '').trim();
    } else if (current && line.match(/personality:/)) {
      current.personality = line.replace(/.*personality:\s*["']?/, '').replace(/["']$/, '').trim();
    }
  });
  if (current) characters.push(current);

  if (!characters.length) {
    container.innerHTML = '<p style="color:#9ca3af;padding:20px;">未检测到人物信息</p>';
    return;
  }

  container.innerHTML = characters.map(c => `
    <div class="character-card">
      <div class="character-avatar">${c.name.charAt(0)}</div>
      <div class="character-info">
        <div class="character-name">${c.name}</div>
        ${c.appearance ? `<span class="character-tag">外貌</span><span style="font-size:13px;color:#6b7280;">${c.appearance}</span>` : ''}
        ${c.personality ? `<div class="character-desc"><span class="character-tag">性格</span>${c.personality}</div>` : ''}
      </div>
    </div>
  `).join('');
}

async function generateReview(script, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '<p style="color:#9ca3af;padding:20px;">正在生成评价...</p>';
  try {
    const response = await fetch('http://localhost:8000/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: script })
    });
    const data = await response.json();
    const text = data.result.replace(/```json|```/g, '').trim();
    const review = JSON.parse(text);
    
    container.innerHTML = `
      <div style="padding:20px;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
          <div style="width:60px;height:60px;border-radius:50%;background:#7194c6;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:700;flex-shrink:0;">${review.score}</div>
          <div>
            <div style="font-size:16px;font-weight:700;color:#1f2937;">综合评分</div>
            <div style="font-size:13px;color:#6b7280;">${review.overall}</div>
          </div>
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-size:15px;font-weight:700;color:#22c55e;margin-bottom:8px;">✓ 优点</div>
          ${review.strengths.map(s => `<div style="font-size:13px;color:#374151;padding:6px 0;border-bottom:1px solid #f3f4f6;">• ${s}</div>`).join('')}
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-size:15px;font-weight:700;color:#ef4444;margin-bottom:8px;">✗ 不足</div>
          ${review.weaknesses.map(w => `<div style="font-size:13px;color:#374151;padding:6px 0;border-bottom:1px solid #f3f4f6;">• ${w}</div>`).join('')}
        </div>
        <div>
          <div style="font-size:15px;font-weight:700;color:#7194c6;margin-bottom:8px;">💡 建议</div>
          ${review.suggestions.map(s => `<div style="font-size:13px;color:#374151;padding:6px 0;border-bottom:1px solid #f3f4f6;">• ${s}</div>`).join('')}
        </div>
      </div>
    `;
  } catch (e) {
    container.innerHTML = '<p style="color:#9ca3af;padding:20px;">评价生成失败</p>';
  }
}

async function generateRelationship(id) {
  const lib = getLibrary();
  const s = lib.scripts.find(s => s.id === id);
  if (!s) return;
  
  const graph = document.getElementById('relationship-graph');
  graph.innerHTML = '<p style="text-align:center;padding:40px;color:#9ca3af;">正在分析人物关系...</p>';
  
  try {
    const response = await fetch('http://localhost:8000/relationship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: s.content })
    });
    const data = await response.json();
    const text = data.result.replace(/```json|```/g, '').trim();
    const rel = JSON.parse(text);
    renderGraph(rel);
  } catch (e) {
    graph.innerHTML = '<p style="text-align:center;padding:40px;color:#ef4444;">生成失败，请确认后端已启动</p>';
  }
}

function renderGraph(rel) {
  const graph = document.getElementById('relationship-graph');
  const width = graph.offsetWidth;
  const height = 500;
  const characters = rel.characters;
  const relations = rel.relations;
  
  const n = characters.length;
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.25;
  
  const positions = characters.map((c, i) => ({
    name: c.name,
    x: cx + r * Math.cos((2 * Math.PI * i / n) - Math.PI / 2),
    y: cy + r * Math.sin((2 * Math.PI * i / n) - Math.PI / 2)
  }));
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  relations.forEach(rel => {
    const from = positions.find(p => p.name === rel.from);
    const to = positions.find(p => p.name === rel.to);
    if (!from || !to) return;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const offset = 20;
    const x1 = from.x + dx/dist * offset;
    const y1 = from.y + dy/dist * offset;
    const x2 = to.x - dx/dist * offset;
    const y2 = to.y - dy/dist * offset;
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8B4513" stroke-width="2"/>`;
    const textLen = rel.type.length * 12;
    svg += `<rect x="${mx - textLen/2 - 4}" y="${my - 10}" width="${textLen + 8}" height="20" rx="4" fill="#f5ede0"/>`;
    svg += `<text x="${mx}" y="${my + 5}" text-anchor="middle" font-size="12" fill="#6b3a1f" font-family="Microsoft YaHei">${rel.type}</text>`;
  });
  
  positions.forEach(p => {
    svg += `<text x="${p.x}" y="${p.y+5}" text-anchor="middle" font-size="15" fill="#6b3a1f" font-family="Microsoft YaHei" font-weight="bold">${p.name}</text>`;
  });
  
  svg += '</svg>';
  graph.innerHTML = svg;
}

function showRelImportModal() {
  document.getElementById('rel-import-modal').classList.add('show');
}

function closeRelImportModal() {
  document.getElementById('rel-import-modal').classList.remove('show');
}

function importFromDevice() {
  closeRelImportModal();
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.yaml,.yml';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      const graph = document.getElementById('relationship-graph');
      graph.innerHTML = '<p style="text-align:center;padding:40px;color:#9ca3af;">正在分析人物关系...</p>';
      fetch('http://localhost:8000/relationship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: content })
      })
      .then(res => res.json())
      .then(data => {
        const text = data.result.replace(/```json|```/g, '').trim();
        const rel = JSON.parse(text);
        renderGraph(rel);
      })
      .catch(() => {
        graph.innerHTML = '<p style="text-align:center;padding:40px;color:#ef4444;">生成失败</p>';
      });
    };
    reader.readAsText(file);
  };
  input.click();
}

function showRelScriptList() {
  closeRelImportModal();
  const lib = getLibrary();
  const container = document.getElementById('rel-script-list');
  if (!lib.scripts.length) {
    container.innerHTML = '<p style="color:#9ca3af;">剧本库为空</p>';
  } else {
    container.innerHTML = lib.scripts.map(s => `
      <button class="script-select-btn" onclick="generateRelationship(${s.id}); closeRelScriptList();">${s.name}</button>
    `).join('');
  }
  document.getElementById('rel-script-list-modal').classList.add('show');
}

function closeRelScriptList() {
  document.getElementById('rel-script-list-modal').classList.remove('show');
}

function storyboardFromDevice() {
  closeStoryboardImportModal();
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.yaml,.yml,.docx,.pdf';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const container = document.getElementById('storyboard-shots');
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#5ba3b8;">正在生成分镜脚本...</p>';

    if (ext === 'txt' || ext === 'yaml') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        fetch('http://localhost:8000/storyboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script: ev.target.result })
        })
        .then(res => res.json())
        .then(data => renderStoryboard(data.result))
        .catch(() => {
          container.innerHTML = '<p style="text-align:center;padding:40px;color:#ef4444;">生成失败，请确认后端已启动</p>';
        });
      };
      reader.readAsText(file);
    } else {
      // docx / pdf 走后端解析
      const formData = new FormData();
      formData.append('file', file);
      fetch('http://localhost:8000/parse-file', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        return fetch('http://localhost:8000/storyboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script: data.text })
        });
      })
      .then(res => res.json())
      .then(data => renderStoryboard(data.result))
      .catch(() => {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#ef4444;">生成失败，请确认后端已启动</p>';
      });
    }
  };
  input.click();
}

function showStoryboardImportModal() {
  document.getElementById('storyboard-import-modal').classList.add('show');
}
function closeStoryboardImportModal() {
  document.getElementById('storyboard-import-modal').classList.remove('show');
}
function storyboardFromLibrary() {
  closeStoryboardImportModal();
  const lib = getLibrary();
  const container = document.getElementById('storyboard-script-list');
  if (!lib.scripts.length) {
    container.innerHTML = '<p style="color:#9ca3af;">剧本库为空</p>';
  } else {
    container.innerHTML = lib.scripts.map(s => `
      <button class="script-select-btn" onclick="generateStoryboard(${s.id}); closeStoryboardScriptList();">${s.name}</button>
    `).join('');
  }
  document.getElementById('storyboard-script-list-modal').classList.add('show');
}
function closeStoryboardScriptList() {
  document.getElementById('storyboard-script-list-modal').classList.remove('show');
}

async function generateStoryboard(id) {
  const lib = getLibrary();
  const s = lib.scripts.find(s => s.id === id);
  if (!s) return;
  const container = document.getElementById('storyboard-shots');
  container.innerHTML = '<p style="text-align:center;padding:40px;color:#9ca3af;">正在生成分镜脚本...</p>';
  try {
    const response = await fetch('http://localhost:8000/storyboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: s.content })
    });
    const data = await response.json();
    renderStoryboard(data.result);
  } catch (e) {
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#ef4444;">生成失败，请确认后端已启动</p>';
  }
}

function renderStoryboard(yamlText) {
  currentStoryboardYaml = yamlText; 
  const container = document.getElementById('storyboard-shots');
  // 解析YAML shots
  const shots = [];
  const lines = yamlText.split('\n');
  let current = null;
  lines.forEach(line => {
    if (line.match(/^\s*-\s*id:/)) {
      if (current) shots.push(current);
      current = { id: line.replace(/.*id:\s*/, '').trim() };
    } else if (current) {
      const fields = ['scene','shot_type','movement','description','dialogue','duration'];
      fields.forEach(f => {
        const m = line.match(new RegExp(`^\\s*${f}:\\s*(.+)`));
        if (m) current[f] = m[1].replace(/^["']|["']$/g, '').trim();
      });
    }
  });
  if (current) shots.push(current);

  if (!shots.length) {
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#9ca3af;">未能解析分镜内容</p>';
    return;
  }

  container.innerHTML = shots.map(s => `
    <div class="shot-card">
      <div class="shot-num">镜头 ${s.id}</div>
      <div class="shot-scene">${s.scene || ''}</div>
      <div class="shot-tags">
        <span class="shot-tag">${s.shot_type || ''}</span>
        <span class="shot-tag">${s.movement || ''}</span>
        <span class="shot-tag">${s.duration ? s.duration + '秒' : ''}</span>
      </div>
      <div class="shot-desc">${s.description || ''}</div>
      ${s.dialogue ? `<div class="shot-dialogue">「${s.dialogue}」</div>` : ''}
    </div>
  `).join('');
}

// ===== 分镜保存 =====
let currentStoryboardYaml = '';

function showStoryboardSaveModal() {
  if (!currentStoryboardYaml) {
    showModal('请先生成分镜！');
    return;
  }
  document.getElementById('storyboard-save-modal').classList.add('show');
}

function closeStoryboardSaveModal() {
  document.getElementById('storyboard-save-modal').classList.remove('show');
}

function showStoryboardHistory() {
  const history = JSON.parse(localStorage.getItem('storyboardHistory') || '[]');
  const container = document.getElementById('storyboard-history-list');
  if (!history.length) {
    container.innerHTML = '<p style="color:#5ba3b8;text-align:center;padding:20px;">暂无保存记录</p>';
  } else {
    container.innerHTML = history.map((item, i) => `
      <div style="background:#0f1f2e;border:1px solid #1f3040;border-radius:10px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="color:#d1e8f0;font-size:13px;font-weight:600;">${item.name}</div>
          <div style="color:#5ba3b8;font-size:11px;margin-top:4px;">${item.date}</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button onclick="downloadStoryboardHistory(${i})" style="background:#1f3040;color:#a8cdd8;border:1px solid #a8cdd8;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;">下载</button>
          <button onclick="deleteStoryboardHistory(${i})" style="background:#1f3040;color:#ef4444;border:1px solid #ef4444;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;">删除</button>
        </div>
      </div>
    `).join('');
  }
  document.getElementById('storyboard-history-modal').classList.add('show');
}

function closeStoryboardHistory() {
  document.getElementById('storyboard-history-modal').classList.remove('show');
}

function saveStoryboard(format) {
  closeStoryboardSaveModal();
  const name = '分镜_' + new Date().toLocaleDateString();

  // 保存到历史记录
  const history = JSON.parse(localStorage.getItem('storyboardHistory') || '[]');
  history.unshift({ name, date: new Date().toLocaleString(), yaml: currentStoryboardYaml });
  localStorage.setItem('storyboardHistory', JSON.stringify(history));

  if (format === 'yaml') {
    const blob = new Blob([currentStoryboardYaml], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '.yaml';
    a.click();
  } else {
    fetch('http://localhost:8000/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: currentStoryboardYaml, format: format, filename: name })
    })
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name + '.' + format;
      a.click();
    });
  }
}

function downloadStoryboardHistory(i) {
  const history = JSON.parse(localStorage.getItem('storyboardHistory') || '[]');
  const item = history[i];
  const blob = new Blob([item.yaml], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = item.name + '.yaml';
  a.click();
}

function deleteStoryboardHistory(i) {
  const history = JSON.parse(localStorage.getItem('storyboardHistory') || '[]');
  history.splice(i, 1);
  localStorage.setItem('storyboardHistory', JSON.stringify(history));
  showStoryboardHistory();
}

// ===== 人物关系保存 =====
function saveRelationship() {
  const svg = document.querySelector('#relationship-graph svg');
  if (!svg) {
    showModal('请先生成人物关系图！');
    return;
  }
  const name = '人物关系_' + new Date().toLocaleDateString();
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svg.getAttribute('width') || 800}" height="${svg.getAttribute('height') || 500}">
  <style>text { font-family: sans-serif; }</style>
  ${svg.innerHTML}
</svg>`;
  // 存历史
  const history = JSON.parse(localStorage.getItem('relationshipHistory') || '[]');
  history.unshift({ name, date: new Date().toLocaleString(), svg: svgContent });
  localStorage.setItem('relationshipHistory', JSON.stringify(history));

  // 转PNG下载
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svg.getAttribute('width') || 800;
    canvas.height = svg.getAttribute('height') || 500;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5ede0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const a = document.createElement('a');
    a.download = name + '.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
    URL.revokeObjectURL(url);
    showModal('保存成功！');
  };
  img.src = url;
}

function showRelHistory() {
  const history = JSON.parse(localStorage.getItem('relationshipHistory') || '[]');
  const container = document.getElementById('rel-history-list');
  if (!history.length) {
    container.innerHTML = '<p style="color:#8B4513;text-align:center;padding:20px;">暂无保存记录</p>';
  } else {
    container.innerHTML = history.map((item, i) => `
      <div style="background:#f5ede0;border:1px solid #8B4513;border-radius:10px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="color:#6b3a1f;font-size:13px;font-weight:600;">${item.name}</div>
          <div style="color:#8B4513;font-size:11px;margin-top:4px;">${item.date}</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button onclick="downloadRelHistory(${i})" style="background:#8B4513;color:#f5ede0;border:none;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;">下载</button>
          <button onclick="deleteRelHistory(${i})" style="background:#f5ede0;color:#ef4444;border:1px solid #ef4444;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;">删除</button>
        </div>
      </div>
    `).join('');
  }
  document.getElementById('rel-history-modal').classList.add('show');
}

function closeRelHistory() {
  document.getElementById('rel-history-modal').classList.remove('show');
}

function downloadRelHistory(i) {
  const history = JSON.parse(localStorage.getItem('relationshipHistory') || '[]');
  const item = history[i];
  const svg = new DOMParser().parseFromString(item.svg, 'image/svg+xml').documentElement;
  const fixedSvg = item.svg.replace(/font-family="[^"]*"/g, 'font-family="sans-serif"');
  const svgBlob = new Blob([fixedSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svg.getAttribute('width') || 800;
    canvas.height = svg.getAttribute('height') || 500;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5ede0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const a = document.createElement('a');
    a.download = item.name + '.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function deleteRelHistory(i) {
  const history = JSON.parse(localStorage.getItem('relationshipHistory') || '[]');
  history.splice(i, 1);
  localStorage.setItem('relationshipHistory', JSON.stringify(history));
  showRelHistory();
}
function handleSave() {
  const activeTab = document.querySelector('.tab.active');
  const tabText = activeTab ? activeTab.textContent.trim() : '';
  if (tabText === '人物卡') {
    saveCardToLibrary('character-cards');
  } else {
    saveScript();
  }
}

function handleFileSave() {
  const activeTab = document.querySelector('#file-output-panel .tab.active');
  const tabText = activeTab ? activeTab.textContent.trim() : '';
  if (tabText === '人物卡') {
    saveCardToLibrary('file-character-cards');
  } else {
    saveFileScript();
  }
}


// ===== 人物卡库 =====
function getCardLibrary() {
  return JSON.parse(localStorage.getItem('cardLibrary') || '[]');
}

function saveCardLibrary(lib) {
  localStorage.setItem('cardLibrary', JSON.stringify(lib));
}

let _pendingCardHTML = '';

function saveCardToLibrary(containerId) {
  const container = document.getElementById(containerId);
  if (!container.querySelector('.character-card')) {
    showModal('请先生成人物卡！');
    return;
  }
  _pendingCardHTML = container.innerHTML;
  document.getElementById('card-name-input').value = '';
  document.getElementById('card-name-modal').classList.add('show');
}

function confirmCardName() {
  const name = document.getElementById('card-name-input').value.trim() || '未命名人物卡_' + new Date().toLocaleDateString();
  const lib = getCardLibrary();
  lib.push({
    id: Date.now(),
    name,
    html: _pendingCardHTML,
    date: new Date().toLocaleString()
  });
  saveCardLibrary(lib);
  closeCardNameModal();
  showModal('已保存到人物卡库！');
}

function closeCardNameModal() {
  document.getElementById('card-name-modal').classList.remove('show');
}

function renderCardLibrary() {
  const lib = getCardLibrary();
  const container = document.getElementById('card-library-content');
  if (!lib.length) {
    container.innerHTML = '<div class="lib-empty">还没有保存的人物卡</div>';
    return;
  }
  container.innerHTML = lib.map((item, i) => `
    <div class="lib-script">
      <div class="lib-script-header">
        <span class="lib-icon">👤</span>
        <span class="lib-name">${item.name}</span>
        <span class="lib-meta">${item.date}</span>
      </div>
      <div class="lib-script-actions">
        <button onclick="viewCardItem(${i})">查看</button>
        <button onclick="exportCardItem(${i})">导出PDF</button>
        <button onclick="deleteCardItem(${i})">删除</button>
      </div>
    </div>
  `).join('');
}

function viewCardItem(i) {
  const lib = getCardLibrary();
  const item = lib[i];
  document.getElementById('view-card-title').textContent = item.name;
  document.getElementById('view-card-content').innerHTML = item.html;
  goTo('view-card');
}

function exportCardItem(i) {
  const lib = getCardLibrary();
  const item = lib[i];
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html><head><title>${item.name}</title>
    <style>
      body { font-family: 'Microsoft YaHei', sans-serif; padding: 40px; background: #fff; }
      .character-card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin-bottom: 16px; display: flex; gap: 16px; }
      .character-avatar { width: 56px; height: 56px; border-radius: 50%; background: #7194c6; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 700; flex-shrink: 0; }
      .character-name { font-size: 16px; font-weight: 700; margin-bottom: 6px; color: #1f2937; }
      .character-tag { display: inline-block; padding: 2px 10px; background: #e8f0ff; color: #4a72b0; border-radius: 12px; font-size: 12px; margin-right: 6px; }
      .character-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin-top: 8px; }
    </style>
    </head><body>${item.html}</body></html>
  `);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
}

function deleteCardItem(i) {
  const lib = getCardLibrary();
  lib.splice(i, 1);
  saveCardLibrary(lib);
  renderCardLibrary();
}
let _pendingDeleteFolder = null;

function deleteFolder(name) {
  _pendingDeleteFolder = name;
  document.getElementById('delete-script-modal').classList.add('show');
}

let _pendingMoveId = null;
let _pendingDeleteId = null;

function confirmMoveScript(fname) {
  const lib = getLibrary();
  const s = lib.scripts.find(s => s.id === _pendingMoveId);
  if (s) s.folder = fname;
  saveLibrary(lib);
  renderLibrary();
  closeMoveModal();
}

function closeMoveModal() {
  document.getElementById('move-script-modal').classList.remove('show');
}

function confirmDeleteScript() {
  if (_pendingDeleteFolder !== null) {
    const lib = getLibrary();
    lib.scripts.forEach(s => { if (s.folder === _pendingDeleteFolder) s.folder = null; });
    delete lib.folders[_pendingDeleteFolder];
    saveLibrary(lib);
    _pendingDeleteFolder = null;
  } else {
    const lib = getLibrary();
    lib.scripts = lib.scripts.filter(s => s.id !== _pendingDeleteId);
    saveLibrary(lib);
  }
  renderLibrary();
  closeDeleteModal();
}

function closeDeleteModal() {
  document.getElementById('delete-script-modal').classList.remove('show');
}

function confirmCreateFolder() {
  const name = document.getElementById('folder-name-input').value.trim();
  if (!name) { showModal('请输入文件夹名称！'); return; }
  const lib = getLibrary();
  lib.folders[name] = [];
  saveLibrary(lib);
  renderLibrary();
  closeFolderNameModal();
}

function closeFolderNameModal() {
  document.getElementById('folder-name-modal').classList.remove('show');
}