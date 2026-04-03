"use client";

import { UIMessage } from "ai";
import { ChatMessage } from "./message";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MessagesProps {
  messages: UIMessage[];
  status: "ready" | "submitted" | "streaming" | "error";
  error: Error | undefined;
  onRetry: () => void;
}

export function Messages({ messages, status, error, onRetry }: MessagesProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Messages */}
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
          isStreaming={status === "streaming" && index === messages.length - 1}
        />
      ))}

      {/* Loading Indicator */}
      {status === "submitted" && (
        <div className="flex items-center gap-2 text-muted-foreground px-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Agent is thinking...</span>
        </div>
      )}

      {/* Error Display */}
      {status === "error" && error && (
        <Alert variant="destructive" className="mx-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error.message || "Something went wrong. Please try again."}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="w-fit"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
