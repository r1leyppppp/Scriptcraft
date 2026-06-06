function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');
}

const convertBtn = document.getElementById('convert-btn');
    const copyBtn = document.getElementById('copy-btn');
    const novelInput = document.getElementById('novel-input');
    const outputContent = document.getElementById('output-content');

    convertBtn.addEventListener('click', async () => {
      const text = novelInput.value.trim();
      if (!text) {
        showModel('请先输入小说内容！');
        return;
      }

      convertBtn.textContent = '转换中...';
      convertBtn.disabled = true;
      outputContent.textContent = '正在生成剧本，请稍候...';

      try {
        const response = await fetch('http://localhost:8000/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text })
       });

        const data = await response.json();
        outputContent.textContent = data.result;
      } catch (error) {
        outputContent.textContent = '请求失败，请确认后端服务已启动。';
      } finally {
        convertBtn.textContent = '开始转换';
        convertBtn.disabled = false;
      }
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(outputContent.textContent);
      copyBtn.textContent = '已复制！';
      setTimeout(() => copyBtn.textContent = '复制', 2000);
    });


let fileText = '';

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  document.getElementById('file-name').textContent = '已选择：' + file.name;
  document.getElementById('upload-area').classList.add('uploaded');
  document.getElementById('upload-area').querySelector('p').textContent = '✅ ' + file.name;
  const reader = new FileReader();
  reader.onload = (e) => { fileText = e.target.result; };
  reader.readAsText(file, 'UTF-8');
}

const fileConvertBtn = document.getElementById('file-convert-btn');
const fileOutputContent = document.getElementById('file-output-content');
const fileCopyBtn = document.getElementById('file-copy-btn');

fileConvertBtn.addEventListener('click', async () => {
  if (!fileText) {
    showModal('请先上传文件！');
    return;
  }
  fileConvertBtn.textContent = '转换中...';
  fileConvertBtn.disabled = true;
  fileOutputContent.textContent = '正在生成剧本，请稍候...';
  try {
    const response = await fetch('http://localhost:8000/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: fileText })
    });
    const data = await response.json();
    fileOutputContent.textContent = data.result;
  } catch (error) {
    fileOutputContent.textContent = '请求失败，请确认后端服务已启动。';
  } finally {
    fileConvertBtn.textContent = '开始转换';
    fileConvertBtn.disabled = false;
  }
});

fileCopyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(fileOutputContent.textContent);
  fileCopyBtn.textContent = '已复制！';
  setTimeout(() => fileCopyBtn.textContent = '复制', 2000);
});

    function showModle(msg) {
      document.getElementById('modal-msg').textContent = msg;
      document.getElementById('modal').classList.add('show');
    }

    function closeModal() {
      document.getElementById('modal').classList.remove('show');
    }