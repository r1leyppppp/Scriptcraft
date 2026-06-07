function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');
  if (page === 'library') renderLibrary();
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
  const toggle = document.getElementById('sidebar-toggle');
  if (style === '电影剧本') {
  toggle.style.color = '#2a1800';
  toggle.style.borderColor = 'rgba(42,24,0,0.4)';
  } else if (style === '舞台剧本') {
  toggle.style.color = '#ffddcc';
  toggle.style.borderColor = 'rgba(255,221,204,0.4)';
  } else if (style === '电视剧本') {
  toggle.style.color = '#a0c4ff';
  toggle.style.borderColor = 'rgba(160,196,255,0.4)';
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
  _pendingSource = 'file';
  document.getElementById('script-name-input').value = '';
  document.getElementById('name-modal').classList.add('show');
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
        <button onclick="moveScript(${s.id})">移动</button>
        <button onclick="deleteScript(${s.id})">删除</button>
      </div>
    </div>`;
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

