import { Logtail } from "@logtail/browser";

export const logtail = new Logtail("BCfp6fLZELzGDafN2QrBK36p", {
  endpoint: "https://in.logtail.com",
  batchSize: 1, // Send logs immediately
  batchInterval: 0, // Don't wait to send logs
});
