from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os

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