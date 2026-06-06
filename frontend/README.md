# 前端说明

## 功能
- 小说文本输入框
- 点击"开始转换"发送请求到后端
- 右侧显示 YAML 格式剧本输出
- 复制按钮一键复制结果
- 弹窗提示组件

## 文件结构
- index.html：页面 HTML 结构
- style.css：所有 CSS 样式
- script.js：所有 JavaScript 逻辑

## API 调用
发送 POST 请求到 http://localhost:8000/convert
请求体：{ "text": "小说内容" }
返回：{ "result": "YAML剧本" }