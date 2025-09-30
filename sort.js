// sort-cases.js
const fs = require("fs");

const INPUT_FILE = "src/schema/ElementResolver.tsx";           // your file
const OUTPUT_FILE = "src/schema/ElementResolver-sorted.tsx";   // output file

const file = fs.readFileSync(INPUT_FILE, "utf8");

// match each case block until next case/default/end of switch
const regex = /(case ElementType\.[\s\S]*?)(?=case ElementType\.|default:|}\s*$)/g;

const blocks = file.match(regex);
if (!blocks) {
    console.error("❌ No ElementType cases found");
    process.exit(1);
}

// sort alphabetically by ElementType.name
blocks.sort((a, b) => {
    const getType = (s) => (s.match(/case ElementType\.(\w+)/) || [])[1] || "";
    return getType(a).localeCompare(getType(b));
});

// replace old blocks with sorted blocks
const sortedFile = file.replace(regex, () => blocks.shift());

// write output
fs.writeFileSync(OUTPUT_FILE, sortedFile);
