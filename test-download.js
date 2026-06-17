const pdfParse = require("pdf-parse");

async function run() {
const url =
"https://sam.gov/api/prod/opps/v3/opportunities/resources/files/47352399a0ae4c52b4daca4f554f5b79/download";

const response = await fetch(url);

console.log("Status:", response.status);
console.log("Content-Type:", response.headers.get("content-type"));

const buffer = Buffer.from(
await response.arrayBuffer()
);

console.log("Downloaded bytes:", buffer.length);

const pdf = await pdfParse(buffer);

console.log(
pdf.text.substring(0, 2000)
);
}

run().catch(console.error);
