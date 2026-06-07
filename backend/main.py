from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from docx import Document
import pypdf
import io
from fastapi import UploadFile, File
from fastapi.responses import StreamingResponse
from docx import Document as DocxDocument
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class NovelInput(BaseModel):
    text: str

@app.post("/convert")
async def convert(input: NovelInput):
    client = OpenAI(
        api_key="sk-6b247cd4504c49d99a8d25347569ed6a",
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {
                "role": "user",
                "content": f"""你是一位专业的剧本改编师。请将以下小说文本改编为专业的剧本格式，用YAML结构输出。

改编要求：
1. 不要照抄原文，要用剧本语言重新创作
2. 场景描述要有画面感，像电影镜头一样
3. 人物动作要具体生动
4. 对话要自然流畅，符合人物性格
5. 添加必要的舞台/镜头指示

YAML格式要求：
- scene: 场景信息（地点、时间、氛围）
- characters: 人物列表（姓名、外貌、性格）
- actions: 动作描写
- dialogue: 对话（说话人、台词、动作）

小说原文：
{input.text}

请直接输出YAML内容，不要有任何解释文字。"""
            }
        ]
    )
    return {"result": response.choices[0].message.content}

class EditInput(BaseModel):
    script: str
    request: str

@app.post("/edit")
async def edit(input: EditInput):
    client = OpenAI(
        api_key="sk-6b247cd4504c49d99a8d25347569ed6a",
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {
                "role": "user",
                "content": f"""你是一位专业的剧本改编师。以下是一份已生成的YAML格式剧本，用户希望对其进行修改。

当前剧本：
{input.script}

用户的修改要求：
{input.request}

请根据用户要求修改剧本，保持YAML格式输出，直接输出修改后的完整YAML内容，不要有任何解释文字。"""
            }
        ]
    )
    return {"result": response.choices[0].message.content}

@app.post("/parse-file")
async def parse_file(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename.lower()
    if filename.endswith('.txt'):
        text = content.decode('utf-8', errors='ignore')
    elif filename.endswith('.docx'):
        doc = Document(io.BytesIO(content))
        text = '\n'.join([para.text for para in doc.paragraphs])
    elif filename.endswith('.pdf'):
        reader = pypdf.PdfReader(io.BytesIO(content))
        text = '\n'.join([page.extract_text() for page in reader.pages])
    else:
        return {"error": "不支持的文件格式"}
    return {"text": text}

class ExportInput(BaseModel):
    content: str
    format: str
    filename: str

@app.post("/export")
async def export_file(input: ExportInput):
    try:
        if input.format == 'docx':
            doc = DocxDocument()
            for line in input.content.split('\n'):
                doc.add_paragraph(line)
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.docx')
            doc.save(tmp.name)
            return StreamingResponse(
                open(tmp.name, 'rb'),
                media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                headers={'Content-Disposition': 'attachment; filename=script.docx'}
            )
        elif input.format == 'pdf':
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            c = canvas.Canvas(tmp.name, pagesize=A4)
            width, height = A4
            y = height - 40
            for line in input.content.split('\n'):
                if y < 40:
                    c.showPage()
                    y = height - 40
                c.drawString(40, y, line)
                y -= 15
            c.save()
            return StreamingResponse(
                open(tmp.name, 'rb'),
                media_type='application/pdf',
                headers={'Content-Disposition': 'attachment; filename=script.pdf'}
            )
    except Exception as e:
        print(f"导出错误: {e}")
        return {"error": str(e)}