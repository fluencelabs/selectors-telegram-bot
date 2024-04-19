import * as dotenv from "dotenv";

dotenv.config();

export class EnvConfig {
    public static readonly TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || "foo";
}
