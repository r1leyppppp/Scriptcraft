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
        api_key=os.environ.get("ALIBABA_API_KEY"),
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
        api_key=os.environ.get("ALIBABA_API_KEY"),
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
            from docx.shared import Pt
            from docx.oxml.ns import qn
            doc = DocxDocument()
            for line in input.content.split('\n'):
                para = doc.add_paragraph(line)
                run = para.runs[0] if para.runs else para.add_run()
                run.font.name = '微软雅黑'
                run._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
                run.font.size = Pt(11)
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.docx')
            doc.save(tmp.name)
            return StreamingResponse(
                open(tmp.name, 'rb'),
                media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                headers={'Content-Disposition': 'attachment; filename=script.docx'}
            )
        elif input.format == 'pdf':
            from reportlab.pdfbase import pdfmetrics
            from reportlab.pdfbase.ttfonts import TTFont
            import platform
            try:
                if platform.system() == 'Windows':
                    pdfmetrics.registerFont(TTFont('Chinese', 'C:/Windows/Fonts/msyh.ttc'))
                else:
                    pdfmetrics.registerFont(TTFont('Chinese', '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc'))
                font_name = 'Chinese'
            except:
                font_name = 'Helvetica'
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            c = canvas.Canvas(tmp.name, pagesize=A4)
            width, height = A4
            margin = 40
            max_width = width - margin * 2
            y = height - margin
            c.setFont(font_name, 12)

            def new_page():
                nonlocal y
                c.showPage()
                c.setFont(font_name, 12)
                y = height - margin

            for line in input.content.split('\n'):
                if not line.strip():
                    y -= 18
                    if y < margin:
                        new_page()
                    continue
                current = ''
                for char in line:
                    test = current + char
                    if c.stringWidth(test, font_name, 12) > max_width:
                        c.drawString(margin, y, current)
                        y -= 18
                        if y < margin:
                            new_page()
                        current = char
                    else:
                        current = test
                if current:
                    c.drawString(margin, y, current)
                    y -= 18
                    if y < margin:
                        new_page()

            c.save()
            return StreamingResponse(
                open(tmp.name, 'rb'),
                media_type='application/pdf',
                headers={'Content-Disposition': 'attachment; filename=script.pdf'}
            )
    except Exception as e:
        print(f"导出错误: {e}")
        return {"error": str(e)}
    

class ReviewInput(BaseModel):
    script: str

@app.post("/review")
async def review_script(input: ReviewInput):
    client = OpenAI(
        api_key=os.environ.get("ALIBABA_API_KEY"),
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {
                "role": "user",
                "content": f"""你是一位专业的剧本评审导师。请对以下剧本进行专业评价，输出JSON格式。

剧本内容：
{input.script}

请输出以下JSON格式，不要有任何其他文字：
{{
  "overall": "总体评价描述",
  "score": 8,
  "strengths": ["优点1", "优点2", "优点3"],
  "weaknesses": ["不足1", "不足2"],
  "suggestions": ["建议1", "建议2", "建议3"]
}}"""
            }
        ]
    )
    return {"result": response.choices[0].message.content}

class RelationshipInput(BaseModel):
    script: str

@app.post("/relationship")
async def get_relationship(input: RelationshipInput):
    client = OpenAI( 
        api_key=os.environ.get("ALIBABA_API_KEY"),
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {
                "role": "user",
                "content": f"""分析以下剧本中的人物关系，输出JSON格式。

剧本：
{input.script}

输出格式：
{{
  "characters": [
    {{"name": "人物名"}}
  ],
  "relations": [
    {{"from": "人物A", "to": "人物B", "type": "关系类型"}}
  ]
}}

只输出JSON，不要其他文字。"""
            }
        ]
    )
    return {"result": response.choices[0].message.content}

class StoryboardInput(BaseModel):
    script: str
@app.post("/storyboard")
async def generate_storyboard(input: StoryboardInput):
    client = OpenAI(
        api_key=os.environ.get("ALIBABA_API_KEY"),
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {
                "role": "user",
                "content": f"""你是专业的分镜师。根据以下剧本生成分镜脚本，用YAML结构输出。

剧本：
{input.script}

YAML格式要求：
shots:
  - id: 1
    scene: 场景名
    shot_type: 全景/中景/近景/特写
    movement: 固定/推镜/拉镜/摇镜/跟镜
    description: 画面描述
    dialogue: 台词（无则留空）
    duration: 3

只输出YAML内容，不要任何解释文字。

剧本内容：
{input.script}"""
            }
        ]
    )
    return {"result": response.choices[0].message.content}

class SvgExportInput(BaseModel):
    svg: str
    filename: str

@app.post("/export-svg")
async def export_svg(input: SvgExportInput):
    try:
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        c = canvas.Canvas(tmp.name, pagesize=A4)
        width, height = A4
        c.setFont("Helvetica", 10)
        lines = input.svg.split('\n')
        y = height - 40
        for line in lines:
            if y < 40:
                c.showPage()
                y = height - 40
            c.drawString(40, y, line[:100])
            y -= 14
        c.save()
        return StreamingResponse(
            open(tmp.name, 'rb'),
            media_type='application/pdf',
            headers={'Content-Disposition': f'attachment; filename=relationship.pdf'}
        )
    except Exception as e:
        print(f"SVG导出错误: {e}")
        return {"error": str(e)}