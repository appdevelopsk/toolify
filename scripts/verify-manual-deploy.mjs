import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Fail closed on any non-manual GitHub Actions trigger.
 * Intentionally accepts only the repository's simple YAML representation:
 *
 * on:
 *   workflow_dispatch: {}
 *
 * We avoid regex-only push detection: on: [push] and on: push also deploy.
 * Any unrecognized event syntax must be reviewed before a release.
 */
export function verifyManualDeployWorkflow(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let blocks = 0;
  let manual = 0;
  let inEvents = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*(?:#.*)?$/.test(line)) continue;

    const root = line.match(/^(on|'on'|"on")\s*:(.*)$/);
    if (root) {
      blocks += 1;
      if (root[1] !== "on" || root[2].trim()) {
        throw new Error("Only a plain multiline on: event block is allowed");
      }
      inEvents = true;
      continue;
    }
    if (/^\S/.test(line)) {
      inEvents = false;
      continue;
    }
    if (inEvents) {
      if (/^  workflow_dispatch: \{\}(?:\s*#.*)?$/.test(line)) {
        manual += 1;
      } else {
        throw new Error(`Unexpected workflow trigger at line ${index + 1}: ${line.trim()}`);
      }
    }
  }
  if (blocks !== 1 || manual !== 1) {
    throw new Error("Workflow must have exactly one manual-only on: block");
  }
  return true;
}

/** Validate every workflow in a directory; a single safe deploy.yml is not sufficient. */
export function verifyWorkflowPath(path) {
  const files = statSync(path).isDirectory()
    ? readdirSync(path).filter((entry) => /\.ya?ml$/i.test(entry)).sort().map((entry) => join(path, entry))
    : [path];
  if (files.length === 0) throw new Error("No YAML workflows were found");
  for (const file of files) {
    try {
      verifyManualDeployWorkflow(readFileSync(file, "utf8"));
    } catch (error) {
      throw new Error(`${file}: ${error.message}`);
    }
  }
  return files.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file) {
    process.stderr.write("Usage: node verify-manual-deploy.mjs <workflow.yml>\n");
    process.exitCode = 2;
  } else {
    try {
      const count = verifyWorkflowPath(file);
      process.stdout.write(`[postmerge] PASS: ${count} manual-only GitHub workflow trigger(s)\n`);
    } catch (error) {
      process.stderr.write(`[postmerge] ERROR: ${error.message}\n`);
      process.exitCode = 4;
    }
  }
}
