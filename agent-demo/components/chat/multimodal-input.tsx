"use client";

import { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Square } from "lucide-react";

interface MultimodalInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e?: { preventDefault?: () => void }) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function MultimodalInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onStop,
}: MultimodalInputProps) {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={input}
        onChange={handleInputChange}
        placeholder="Ask something... (e.g., 'What's the weather in Beijing?' or 'Search for Librai.tech')"
        disabled={isLoading}
        className="flex-1"
      />
      {isLoading ? (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onStop}
          title="Stop generating"
        >
          <Square className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon"
          disabled={typeof input !== "string" || !input.trim()}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </Button>
      )}
    </form>
  );
}
