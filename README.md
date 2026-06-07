# Scriptcraft ✍️

AI 驱动的小说转剧本工具，基于阿里云通义千问大模型，将小说文本一键转换为结构化 YAML 剧本，并提供人物卡、人物关系图、分镜脚本等完整创作链路。

## 功能特性

- 📖 **小说转剧本**：输入小说文本或上传 txt/docx/pdf 文件，AI 自动识别场景、人物、对话，以专业剧本改编师视角重新创作
- 🎬 **三种剧本风格**：支持电影剧本、电视剧本、舞台剧本三种风格
- 📄 **结构化 YAML 输出**：输出包含场景、人物、动作、对白的标准 YAML 格式，可直接编辑
- 👤 **人物卡自动生成**：解析 YAML 中的人物信息，自动生成人物卡片，支持保存到人物卡库
- 🕸️ **人物关系图**：AI 分析人物互动，生成可视化关系网络图，支持导出为 PNG
- 🎞️ **分镜脚本生成**：根据剧本自动生成逐镜头分镜脚本，包含景别、运动方式、画面描述、台词
- 📚 **剧本库**：支持保存、分类管理、导出剧本（YAML/DOCX/PDF）
- ✏️ **剧本迭代修改**：支持 AI 辅助修改，直接在输出框内编辑 YAML
- ⭐ **剧本评审**：AI 对剧本进行专业评分和改进建议

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 原生 HTML / CSS / JavaScript |
| 后端 | Python FastAPI |
| AI 模型 | 阿里云 通义千问 qwen-plus |
| 导出 | reportlab（PDF）/ python-docx（DOCX）|

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/r1leyppppp/Scriptcraft.git
cd Scriptcraft
```

### 2. 配置环境变量

在 `backend/` 目录下新建 `.env` 文件：ALIBABA_API_KEY=你的阿里云API Key

### 3. 安装依赖并启动后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. 启动前端

直接用浏览器打开 `frontend/index.html` 即可。

## 项目结构
Scriptcraft/
├── frontend/
│   ├── index.html       # 主页面
│   ├── style.css        # 样式
│   └── script.js        # 前端逻辑
├── backend/
│   └── main.py          # FastAPI 后端，包含所有 AI 接口
├── SCHEMA.md            # 剧本 YAML Schema 定义文档
├── .gitignore
└── README.md

## API 接口说明

| 接口 | 方法 | 功能 |
|------|------|------|
| /convert | POST | 小说文本转 YAML 剧本 |
| /edit | POST | AI 辅助修改剧本 |
| /parse-file | POST | 解析上传的 txt/docx/pdf 文件 |
| /export | POST | 导出剧本为 DOCX/PDF |
| /review | POST | AI 剧本评审评分 |
| /relationship | POST | 分析人物关系 |
| /storyboard | POST | 生成分镜脚本 |

## YAML 输出格式

详见 [SCHEMA.md](./SCHEMA.md)

## 功能链路
小说原文
↓ AI 改编
YAML 剧本
├── characters → 人物卡自动生成 → 人物卡库
├── characters → 人物关系图 → 导出 PNG
├── scene + actions + dialogue → 分镜脚本 → 导出 YAML/DOCX/PDF
└── 全部字段 → 剧本评审与评分
