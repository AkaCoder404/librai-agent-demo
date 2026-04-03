"use client";

import { useState } from "react";
import { UIMessage } from "ai";
import { Markdown } from "./markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Bot,
  Wrench,
  Search,
  Cloud,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: UIMessage;
  isLast?: boolean;
  isStreaming?: boolean;
}

// Tool part structure in new AI SDK
interface ToolPart {
  type: string; // e.g., 'tool-google_search', 'tool-get_weather'
  toolCallId: string;
  toolName: string;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  input?: any;
  output?: any;
  errorText?: string;
}

interface ReasoningPart {
  type: "reasoning";
  text: string;
}

export function ChatMessage({
  message,
  isLast,
  isStreaming,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [isReasoningOpen, setIsReasoningOpen] = useState(true);
  const [isToolsOpen, setIsToolsOpen] = useState(true);

  // Extract content from parts
  const textParts: string[] = [];
  const reasoningParts: ReasoningPart[] = [];
  const toolParts: ToolPart[] = [];

  message.parts?.forEach((part: any) => {
    const { type } = part;

    // Tool calls have type like 'tool-google_search', 'tool-get_weather', etc.
    if (type?.startsWith("tool-")) {
      const toolName = type.replace("tool-", "");
      toolParts.push({
        ...part,
        toolName,
      } as ToolPart);
    } else if (type === "reasoning" && part.text?.trim()) {
      reasoningParts.push(part as ReasoningPart);
    } else if (type === "text" && part.text?.trim()) {
      textParts.push(part.text);
    }
  });

  const textContent = textParts.join("");
  const reasoningContent = reasoningParts.map((p) => p.text).join("\n\n");

  return (
    <div
      className={cn(
        "flex gap-3 px-4",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 space-y-2 min-w-0",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Role Label */}
        <div
          className={cn(
            "text-xs font-medium text-muted-foreground",
            isUser ? "text-right" : "text-left",
          )}
        >
          {isUser ? "You" : "Agent"}
          {isStreaming && (
            <span className="ml-2 text-primary animate-pulse">●</span>
          )}
        </div>

        {/* Reasoning Content */}
        {reasoningContent && (
          <div className={cn("w-full max-w-[85%]", isUser ? "ml-auto" : "")}>
            <button
              type="button"
              onClick={() => setIsReasoningOpen(!isReasoningOpen)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Reasoning</span>
              {isReasoningOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isReasoningOpen && (
              <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
                <Markdown>{reasoningContent}</Markdown>
              </div>
            )}
          </div>
        )}

        {/* Tool Invocations */}
        {toolParts.length > 0 && (
          <div className={cn("w-full max-w-[85%]", isUser ? "ml-auto" : "")}>
            <button
              type="button"
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Tools</span>
              {isToolsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isToolsOpen && (
              <div className="space-y-2">
                {toolParts.map((toolPart) => {
                  const { toolName, toolCallId, state, input, output, errorText } =
                    toolPart;

                  const isLoading =
                    state === "input-streaming" || state === "input-available";
                  const isDone = state === "output-available";
                  const isError = state === "output-error";

                  return (
                    <Card key={toolCallId} className="border-muted-foreground/20">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {toolName === "google_search" ? (
                            <Search className="w-4 h-4" />
                          ) : toolName === "get_weather" ? (
                            <Cloud className="w-4 h-4" />
                          ) : (
                            <Wrench className="w-4 h-4" />
                          )}
                          Tool Call: {toolName}
                          {isLoading && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              calling...
                            </span>
                          )}
                          {isDone && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                              done
                            </span>
                          )}
                          {isError && (
                            <span className="text-xs text-red-600">error</span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 pt-0 space-y-2">
                        {/* Tool Input/Arguments */}
                        {input && (
                          <div className="text-xs">
                            <span className="font-semibold">Input:</span>
                            <pre className="mt-1 bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(input, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Tool Output/Result */}
                        {isDone && output && (
                          <div className="text-xs">
                            <span className="font-semibold">Output:</span>
                            <pre className="mt-1 bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(output, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Error */}
                        {isError && errorText && (
                          <div className="text-xs text-red-600">
                            <span className="font-semibold">Error:</span>
                            <p className="mt-1">{errorText}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        {textContent && (
          <div
            className={cn(
              "rounded-lg px-4 py-2",
              isUser
                ? "bg-primary text-primary-foreground ml-auto w-fit max-w-[85%]"
                : "bg-muted w-fit max-w-[85%]",
            )}
          >
            <Markdown>{textContent}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
