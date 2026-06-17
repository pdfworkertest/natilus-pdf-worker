const { createClient } = require("@supabase/supabase-js");
const pdfParse = require("pdf-parse");

const SUPABASE_URL =
"https://nmknkjdfduahlnqzfjqz.supabase.co";

const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ta25ramRmZHVhaGxucXpmanF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTcxMDM0NiwiZXhwIjoyMDk3Mjg2MzQ2fQ.sHRuFjjuIRAQ4umwbjP26zK79nVQ8CBKdWY6jXHS4eY";

const supabase = createClient(
SUPABASE_URL,
SUPABASE_KEY
);

async function extractPdfText(url) {
try {
console.log("Downloading:", url);

const response = await fetch(url);

if (!response.ok) {
  throw new Error(
    `Failed download: ${response.status}`
  );
}

const buffer = Buffer.from(
  await response.arrayBuffer()
);

const pdf = await pdfParse(buffer);

console.log(
  `Extracted ${pdf.text.length} characters`
);

return pdf.text;

} catch (err) {
console.error(
"PDF extraction failed:",
err.message
);

return "";

}
}

async function run() {
console.log("Starting PDF worker...");

const { data: opportunities, error } =
await supabase
.from("opportunities")
.select("*")
.eq("attachment_processed", false)
.not("resource_links", "is", null)
.limit(50);

if (error) {
console.error(
"Supabase query failed:",
error
);
return;
}

console.log(
`Found ${opportunities.length} opportunities`
);

for (const opp of opportunities) {
try {
if (
!opp.resource_links ||
opp.resource_links.length === 0
) {
continue;
}

  console.log(
    `Processing: ${opp.title}`
  );

  let combinedText = "";

  for (const url of opp.resource_links) {
    const text =
      await extractPdfText(url);

    combinedText +=
      "\n\n--- PDF ---\n\n" + text;
  }

  const { error: updateError } =
    await supabase
      .from("opportunities")
      .update({
        attachment_text: combinedText,
        attachment_processed: true,
        attachment_count:
          opp.resource_links.length
      })
      .eq(
        "notice_id",
        opp.notice_id
      );

  if (updateError) {
    console.error(
      "Update failed:",
      updateError
    );
    continue;
  }

  console.log(
    `Updated: ${opp.title}`
  );

} catch (err) {
  console.error(
    `Failed processing ${opp.notice_id}:`,
    err
  );
}

}

console.log("Done");
}

run().catch(console.error);
