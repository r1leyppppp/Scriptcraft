const convertBtn = document.getElementById('convert-btn');
    const copyBtn = document.getElementById('copy-btn');
    const novelInput = document.getElementById('novel-input');
    const outputContent = document.getElementById('output-content');

    convertBtn.addEventListener('click', async () => {
      const text = novelInput.value.trim();
      if (!text) {
        showToast('请先输入小说内容！');
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

    function showToast(msg) {
      document.getElementById('modal-msg').textContent = msg;
      document.getElementById('modal').classList.add('show');
    }

    function closeModal() {
      document.getElementById('modal').classList.remove('show');
    }