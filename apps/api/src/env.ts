import { config } from "dotenv";

// Repo-root .env, regardless of cwd.
config({ path: new URL("../../../.env", import.meta.url) });
