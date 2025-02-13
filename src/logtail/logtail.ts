import { Logtail } from "@logtail/browser";

// Note: Logging might be blocked by privacy-focused browsers (like Brave) or ad blockers
// If logs aren't appearing, users may need to:
// 1. Use a different browser
// 2. Add an exception for in.logs.betterstack.com in their ad blocker
// 3. Or disable shields in Brave
export const logtail = new Logtail("gTBFyWyEVfuTbw2hLqTyvkDq", {
  endpoint: "https://in.logs.betterstack.com",
});

console.log("logtail", logtail);
