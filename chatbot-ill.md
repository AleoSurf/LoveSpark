


## 📊 代码仓库分析、gr报告

### 一mini (Gemini) 参数传递机制

#### 1. **调用链路分析**

```
用户输入 → ChatBot.tsx (UI组件)
                ↓
         sendMessageStream() / createChatSession()
                ↓
         geminiService.ts (服务层)
                ↓
         @google/genai SDK
                ↓
         Gemini API
```

#### 2. **参数传递详解**

**ChatBot.tsx → geminiService.ts:**

```typescript
// 创建会话时传递系统指令
export const createChatSession = (): Chat => {
  const ai = getAiClient();
  return ai.chats.create({
    model: 'gemini-3-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,  // 系统指令常量
      temperature: 0.7,
    },
  });
};

// 发送消息时传递用户输入
export const sendMessageStream = async (chat: Chat, message: string) => {
  return chat.sendMessageStream({ message });
};
```

**关键参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `message` | string | 用户输入的对话内容 |
| `systemInstruction` | string | 系统角色定义（在 constants.ts 中） |
| `model` | string | 模型名称（gemini-3-flash / gemini-2.0-flash） |
| `temperature` | number | 0.7（创意程度） |

---

### 二、AI Chatbot 聊天功能实现

#### 1. **ChatBot.tsx 核心逻辑**

```typescript
// 状态管理
const [messages, setMessages] = useState<Message[]>([...])
const chatSessionRef = useRef<Chat | null>(null)

// 初始化聊天会话
useEffect(() => {
  chatSessionRef.current = createChatSession()
}, [])

// 发送消息并处理流式响应
const handleSend = async () => {
  const streamResult = await sendMessageStream(chatSessionRef.current, userMsg.text)
  for await (const chunk of streamResult) {
    // 逐块更新消息内容，实现打字机效果
  }
}
```

#### 2. **流式响应处理**

- 使用 `sendMessageStream()` 实现实时打字机效果
- 每次接收到 chunk 就更新 UI，避免等待完整响应

---

### 三、更换为 MiniMax / GLM API 可行性分析

#### ✅ **技术可行性：高**

**优势：**

1. **SDK 结构相似** - 主流 LLM API 都采用类似的调用模式
2. **只需修改服务层** - `geminiService.ts` 是唯一需要改动的文件
3. **类型定义通用** - `Message` 接口完全兼容其他 LLM

**需要调整的内容：**

| 现有实现 | MiniMax | GLM (智谱) |
|---------|---------|-----------|
| `GoogleGenAI` | `OpenAI` (MiniMax 兼容 OpenAI SDK) | `ZhipuAI` |
| `chat.sendMessageStream()` | `client.chat.completions.create()` | 同左 |
| `model: 'gemini-3-flash'` | `model: 'abab6.5s-chat'` | `model: 'glm-4-flash'` |
| `response.text` | `chunk.choices[0].delta.content` | 同左 |

#### 🔧 **改造方案**

创建新的服务文件，例如 `services/minimaxService.ts`:

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: import.meta.env.VITE_MINIMAX_API_KEY,
  baseURL: 'https://api.minimax.chat/v1/text/chatcompletion_v2'
});

export const sendMessageStream = async (messages: Message[]) => {
  return client.chat.completions.create({
    model: 'abab6.5s-chat',
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...messages.map(m => ({ role: m.role, content: m.text }))
    ],
    stream: true
  });
};
```

---

### 四、结论

1. **参数传递清晰** - 仅通过 `message` 字符串和 `systemInstruction` 配置传递
2. **更换 API 完全可行** - 只需修改服务层，UI 和业务逻辑无需改动
3. **推荐方案** - 先评估 MiniMax/GLM 的功能支持（流式输出、函数调用等），然后创建适配器模式的服务类

如果您决定更换 API，请 **toggle to Act mode**，我可以帮您实现完整的改造代码。
