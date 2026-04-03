# Architecture

## Overview
A minimal chat-based agent using Vercel AI SDK + Google Gemini with tool calling capabilities.

## Data Flow
```
User Input → API Route → streamText() → Gemini
                     ↓
              Tool Calls (search/weather)
                     ↓
              Stream Response → UI
```

## Project Structure

```bash
app/
├── api/chat/route.ts         # 后端 API，处理聊天和 tool calling
├── chat/[id]/page.tsx        # 聊天页面（动态路由）
├── layout.tsx                # 根布局
├── page.tsx                  # 首页（重定向到新聊天）
└── globals.css               # 全局样式

components/
├── chat/
│   ├── chat.tsx              # 主聊天容器
│   ├── messages.tsx          # 消息列表
│   ├── message.tsx           # 单条消息（支持 tool call 展示）
│   ├── multimodal-input.tsx  # 输入框组件
│   └── markdown.tsx          # Markdown 渲染器
└── ui/                       # shadcn/ui 组件

lib/
├── tools.ts                  # agent的工具定义
└── utils.ts                  # 工具函数
```

## Agent Configuration

| Setting   | Value                                   |
| --------- | --------------------------------------- |
| Model     | `gemini-3.1-pro-preview`                |
| Framework | Vercel AI SDK (`streamText`, `useChat`) |
| Tools     | Google Search, Weather                  |

## Tools

| Tool      | Description              | Handler                                   |
| --------- | ------------------------ | ----------------------------------------- |
| `search`  | Web search via Google    | `lib/tools.ts` → Google Custom Search API |
| `weather` | Get weather for location | `lib/tools.ts` → Weather API              |

## Key Components

| Component              | Responsibility                                  |
| ---------------------- | ----------------------------------------------- |
| `chat.tsx`             | Main container, `useChat` hook, streaming state |
| `message.tsx`          | Renders text + tool call invocations            |
| `multimodal-input.tsx` | Input + submit handling                         |
| `route.ts`             | Agent backend - `streamText()` orchestration    |

## Message Flow

1. **User submits** → `useChat.handleSubmit()`
2. **API receives** → `streamText({ model, messages, tools })`
3. **LLM decides** → Text response OR tool call
4. **Tool executes** → Result streamed back via `toolInvocations`
5. **UI renders** → `message.toolInvocations` displayed inline

## State Management

- **Chat state**: `useChat` from AI SDK (messages, input, isLoading, error)
- **UI state**: Local React state for loading indicators
- **History**: In-memory only (no persistence)

## Error Handling

| Error           | Handling                                              |
| --------------- | ----------------------------------------------------- |
| LLM API failure | `error` state from `useChat` → Error banner + retry   |
| Tool failure    | Caught in tool handler → Error message in tool result |
| Network timeout | Automatic retry on re-submit                          |

## Environment Variables

```env
GOOGLE_GENERATIVE_AI_API_KEY=    # Gemini API access
```

## Extending

**Add a tool:**
1. Define schema in `lib/tools.ts`
2. Add handler in `app/api/chat/route.ts`
3. Update `message.tsx` if new UI needed for results
