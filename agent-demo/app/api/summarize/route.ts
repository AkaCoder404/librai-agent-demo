import { google } from "@ai-sdk/google";
import { generateText, UIMessage } from "ai";

// 

// Allow responses up to 30 seconds
export const maxDuration = 30;

/**
 * Converts UIMessages to a readable conversation text format
 */
function convertMessagesToPrompt(messages: UIMessage[]): string {
  return messages
    .map((msg) => {
      const role = msg.role === "user" ? "User" : "Assistant";
      // Extract text content from parts
      const textParts = msg.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(" ");
      return `${role}: ${textParts}`;
    })
    .join("\n\n");
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  if (!messages || messages.length === 0) {
    return Response.json(
      { error: "No messages to summarize" },
      { status: 400 },
    );
  }

  // Convert messages to a readable conversation text
  const conversationText = convertMessagesToPrompt(messages);

  const result = await generateText({
    model: google("gemini-3.1-pro-preview"),
    prompt: `Please summarize the following conversation:\n\n${conversationText}`,
    system:
      "You are a helpful assistant that summarizes conversations. Provide a concise summary of the chat history, highlighting the key points discussed, questions asked, and answers provided. Keep the summary brief but informative (2-4 sentences).",
  });

  console.log("Summary result:", result.content);

  return Response.json({ summary: result.text });
}
