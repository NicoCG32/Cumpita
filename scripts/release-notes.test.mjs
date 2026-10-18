import assert from "node:assert/strict";
import test from "node:test";
import { releaseNotes } from "./release-notes.mjs";

const changelog = `# Changelog

## [Unreleased]
- Trabajo pendiente.

## [1.0.0] — 2026-10-17
### Añadido
- Primera versión.

## [0.9.0] — 2026-10-16
- Versión anterior.
`;

test("extrae solo las notas de la versión solicitada, también con CRLF", () => {
  for (const input of [changelog, changelog.replace(/\n/g, "\r\n")]) {
    assert.equal(releaseNotes("v1.0.0", "1.0.0", input), "### Añadido\n- Primera versión.\n");
  }
});

test("rechaza tags inválidos y versiones distintas del paquete", () => {
  for (const tag of [undefined, "1.0.0", "v01.0.0", "v1.0.0-rc.1", "v1.0.1"]) {
    assert.throws(() => releaseNotes(tag, "1.0.0", changelog));
  }
});

test("rechaza secciones ausentes, duplicadas o sin cambios", () => {
  for (const input of [
    "# Changelog",
    `${changelog}\n## [1.0.0] — otra\n- Duplicada.`,
    "## [1.0.0] — fecha\n### Añadido\n",
  ]) {
    assert.throws(() => releaseNotes("v1.0.0", "1.0.0", input));
  }
});
