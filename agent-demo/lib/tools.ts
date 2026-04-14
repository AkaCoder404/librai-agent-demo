import { tool } from "ai";
import { z } from "zod";

export const getWeather = tool({
  description: "Get the weather in a location",
  inputSchema: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
  execute: async ({ location }) => {
    return {
      location,
      temperature: 72,
      condition: "sunny",
    };
  },
});

export const getCurrentTime = tool({
  description: "Get the current time",
  inputSchema: z.object({}),
  execute: async () => {
    return {
      currentTime: new Date().toLocaleTimeString(),
    };
  },
});
