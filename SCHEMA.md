# Scriptcraft YAML 剧本格式规范

## 顶层结构

```yaml
scene:
  location: 场景地点
  time: 时间
  atmosphere: 氛围描述

characters:
  - name: 人物姓名
    appearance: 外貌描述
    personality: 性格特征

actions:
  - character: 人物姓名
    action: 动作描述

dialogue:
  - speaker: 说话人
    line: 台词内容
    action: 说话时的动作（可选）
```

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| scene.location | string | ✅ | 场景地点 |
| scene.time | string | ✅ | 时间描述 |
| scene.atmosphere | string | ✅ | 氛围/环境描述 |
| characters[].name | string | ✅ | 人物姓名 |
| characters[].appearance | string | ❌ | 外貌描述 |
| characters[].personality | string | ❌ | 性格特征 |
| actions[].character | string | ✅ | 执行动作的人物 |
| actions[].action | string | ✅ | 动作描述 |
| dialogue[].speaker | string | ✅ | 说话人姓名 |
| dialogue[].line | string | ✅ | 台词内容 |
| dialogue[].action | string | ❌ | 说话时的动作 |