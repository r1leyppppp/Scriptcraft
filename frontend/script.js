function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');
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
  const reader = new FileReader();
  reader.onload = (e) => { fileText = e.target.result; };
  reader.readAsText(file);
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