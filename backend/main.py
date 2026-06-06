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
        api_key=os.environ.get("ALIBABA_API_KEY"),
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
    
    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {
                "role": "user",
                "content": f"""请将以下小说文本转换为结构化的YAML格式剧本。

要求：
1. 识别场景、人物、对话
2. 输出标准YAML格式
3. 包含场景描述、人物动作、对白

小说文本：
{input.text}

请直接输出YAML内容，不需要其他解释。"""
            }
        ]
    )
    
    return {"result": response.choices[0].message.content}