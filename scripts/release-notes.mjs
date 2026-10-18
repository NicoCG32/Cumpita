import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function releaseNotes(tag, version, changelog) {
  if (!/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(tag)) {
    throw new Error("El tag debe ser una versión estable: vMAYOR.MENOR.PARCHE.");
  }
  if (tag !== `v${version}`) {
    throw new Error(`El tag ${tag} no coincide con package.json (${version}).`);
  }

  const sections = changelog.replace(/\r\n/g, "\n").split(/^## /m).slice(1);
  const matching = sections.filter((section) => section.startsWith(`[${version}] `));
  if (matching.length !== 1) {
    throw new Error(`CHANGELOG.md debe tener exactamente una sección ## [${version}].`);
  }
  const notes = matching[0].slice(matching[0].indexOf("\n") + 1).trim();
  if (!/^\s*-\s+\S/m.test(notes)) {
    throw new Error(`La sección ${version} debe contener notas de cambios.`);
  }
  return `${notes}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const { version } = JSON.parse(readFileSync("package.json", "utf8"));
    const notes = releaseNotes(process.argv[2], version, readFileSync("CHANGELOG.md", "utf8"));
    if (process.argv[3]) writeFileSync(process.argv[3], notes);
    else process.stdout.write(notes);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
