function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');
  if (page === 'library') renderLibrary();
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
  outputContent.textContent = '正在生成剧本，请稍候...';
  try {
    const response = await fetch('http://localhost:8000/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, style: selectedStyle })
    });
    const data = await response.json();
    outputContent.textContent = data.result;
    generateCharacterCards(data.result, 'character-cards');
    generateReview(data.result, 'review-content');
  } catch (error) {
    outputContent.textContent = '请求失败，请确认后端服务已启动。';
  } finally {
    convertBtn.textContent = '开始转换';
    convertBtn.disabled = false;
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
  const name = prompt('文件夹名称：');
  if (!name) return;
  const lib = getLibrary();
  lib.folders[name] = [];
  saveLibrary(lib);
  renderLibrary();
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
        <div class="lib-folder" onclick="openFolder('${fname}')">
          <span class="lib-icon">📁</span>
          <span class="lib-name">${fname}</span>
          <span class="lib-meta">${count} 个剧本</span>
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

  if (format === 'txt') {
    const blob = new Blob([s.content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = s.name + '.txt';
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
  alert(s.content);
}

function moveScript(id) {
  const lib = getLibrary();
  const folders = Object.keys(lib.folders);
  if (!folders.length) { alert('请先创建文件夹！'); return; }
  const fname = prompt('移动到哪个文件夹？\n' + folders.join('\n'));
  if (!fname || !lib.folders.hasOwnProperty(fname)) return;
  const s = lib.scripts.find(s => s.id === id);
  if (s) s.folder = fname;
  saveLibrary(lib);
  renderLibrary();
}

function deleteScript(id) {
  if (!confirm('确认删除？')) return;
  const lib = getLibrary();
  lib.scripts = lib.scripts.filter(s => s.id !== id);
  saveLibrary(lib);
  renderLibrary();
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
  
  if (format === 'txt') {
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename + '.txt';
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

    if (ext === 'txt' || ext === 'yaml' || ext === 'yml') {
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