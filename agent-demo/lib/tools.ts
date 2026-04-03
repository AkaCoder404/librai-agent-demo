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
