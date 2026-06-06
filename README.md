# Scriptcraft ✍️

AI 驱动的小说转剧本工具，基于阿里云通义千问大模型，一键将小说文本转换为结构化 YAML 剧本。

## 功能特性

- 📖 输入小说文本，自动识别场景、人物、对话
- 🎬 AI 以专业剧本改编师视角重新创作
- 📄 输出标准 YAML 格式，包含场景、人物、动作、对白
- 📋 一键复制结果

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 原生 HTML / CSS / JavaScript |
| 后端 | Python FastAPI |
| AI 模型 | 阿里云 通义千问 qwen-plus |

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/r1leyppppp/Scriptcraft.git
cd Scriptcraft
```

### 2. 配置环境变量

在 `backend/` 目录下新建 `.env` 文件：

```
ALIBABA_API_KEY=你的阿里云API Key
```

### 3. 启动后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. 启动前端

直接用浏览器打开 `frontend/index.html` 即可。

## 项目结构

```
Scriptcraft/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   └── main.py
├── SCHEMA.md
├── .gitignore
└── README.md
```

## YAML 输出格式

详见 [SCHEMA.md](./SCHEMA.md)