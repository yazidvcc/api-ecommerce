import dotenv from "dotenv"
import path from "path";
import { fileURLToPath } from "url";
import { web } from "../src/application/web.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../.env") });

web.listen(process.env.PORT, () => {
    console.log("Start Application", process.env.PORT);
})