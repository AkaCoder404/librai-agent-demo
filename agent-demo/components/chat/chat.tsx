"use client";

import { useState, useRef, useEffect, RefObject, ChangeEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { UIMessage, DefaultChatTransport } from "ai";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { Bot } from "lucide-react";

interface ChatProps {
  id: string;
}

export function Chat({ id }: ChatProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    error,
  } = useChat<UIMessage>({
    id,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onFinish: () => {},
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  // Manage input state ourselves (new API doesn't manage it internally)
  const [input, setInput] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!input.trim()) return;

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: input }],
    });
    setInput("");
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-full min-w-xl max-w-xl md:min-w-2xl md:max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold">Agent Demo</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {status === "ready" && "Ready"}
            {status === "submitted" && "Sending..."}
            {status === "streaming" && "Streaming..."}
            {status === "error" && "Error"}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Welcome to Agent Demo
            </h3>
            <p className="max-w-sm">Ask me anything!</p>
          </div>
        ) : (
          <Messages
            messages={messages}
            status={status}
            error={error}
            onRetry={() => regenerate()}
          />
        )}
        <div ref={messagesEndRef} className="h-px" />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 shrink-0">
        <MultimodalInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          onStop={stop}
        />
      </div>
    </div>
  );
}

// Hook for auto-scroll to bottom
function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        end.scrollIntoView({ behavior: "instant", block: "end" });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef];
}
