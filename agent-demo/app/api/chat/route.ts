import { google } from "@ai-sdk/google";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
  LanguageModelUsage,
  LanguageModelResponseMetadata,
  AssistantModelMessage,
  ToolModelMessage,
  createUIMessageStreamResponse,
  tool,
} from "ai";
import { getCurrentTime, getWeather } from "@/lib/tools";
import { z } from "zod";

type ResponseMessage = AssistantModelMessage | ToolModelMessage;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google("gemini-3.1-pro-preview"),
    providerOptions: {
      google: {
        searchGrounding: true,
        thinkingConfig: {
          thinkingLevel: "high", // 'minimal' | 'low' | 'medium' | 'high'
          includeThoughts: true,
        },
      },
    },
    messages: modelMessages,
    system:
      "You are a helpful assistant. Answer user questions and use tools when necessary.",
    stopWhen: stepCountIs(5),

    tools: {
      getCurrentTime,
      getWeather,
      searchGoogle: google.tools.googleSearch({}),
      // 如果需要multi-agent 协作，可以在这里注册更多工具，例如：
      // callAnotherAgent: async (input) => {
      //    这里可以调用另一个agent的API，传入input并返回结果或直接anotherAgent.generateText(input)的结果
      // }
    },
    onFinish: async ({
      usage,
      response,
    }: {
      usage: LanguageModelUsage;
      response: LanguageModelResponseMetadata & {
        messages: Array<ResponseMessage>;
        body?: unknown;
      };
    }) => {
      console.log("AI Chat Usage:", {
        promptTokens: usage.inputTokens,
        completionTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });

      // if (response.messages.length > 0) {
      //   console.log(
      //     "[DEBUG] Full AI Response:",
      //     JSON.stringify(response.messages),
      //   );
      //   const lastMessage = response.messages[response.messages.length - 1];
      //   console.log(
      //     "[DEBUG] Final AI Response:",
      //     lastMessage.role,
      //     JSON.stringify(lastMessage.content).slice(0, 200),
      //   );
      // }
    },
  });

  // Use toDataStreamResponse for tool calling support
  return result.toUIMessageStreamResponse();
}
