import { gzipSync, gunzipSync } from "bun";
import { join } from "path";
import { readFileSync } from "fs";

const filePath = join(process.cwd(), "public", "IPL.csv.gz");
const fileBuffer = readFileSync(filePath);
const decompressed = gunzipSync(fileBuffer);
const content = new TextDecoder().decode(decompressed);

const firstLine = content.split("\n")[0];
console.log(JSON.stringify(firstLine.split(",")));
