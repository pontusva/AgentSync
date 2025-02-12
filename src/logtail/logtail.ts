import { Logtail } from "@logtail/browser";

export const logtail = new Logtail(import.meta.env.SOURCE_TOKEN, {
  endpoint: import.meta.env.INGESTING_HOST,
});
