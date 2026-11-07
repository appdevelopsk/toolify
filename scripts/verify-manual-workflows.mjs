import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { verifyManualDeployWorkflow } from './verify-manual-deploy.mjs';

/** Verify every Actions workflow opts in to dispatch only. */
export function verifyAllManualWorkflows(directory) {
  const files = readdirSync(directory).filter(name => /\.ya?ml$/i.test(name)).sort();
  if (files.length === 0) throw new Error('No GitHub workflow YAML files found');
  for (const name of files) {
    try {
      verifyManualDeployWorkflow(readFileSync(join(directory, name), 'utf8'));
    } catch (error) {
      throw new Error(`${name}: ${error.message}`);
    }
  }
  return files;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const directory = process.argv[2];
  if (!directory) {
    console.error('Usage: node scripts/verify-manual-workflows.mjs .github/workflows');
    process.exitCode = 2;
  } else {
    try {
      const files = verifyAllManualWorkflows(directory);
      console.log(`[postmerge] PASS: ${files.length} workflows use manual-only events`);
    } catch (error) {
      console.error(`[postmerge] ERROR: ${error.message}`);
      process.exitCode = 4;
    }
  }
}
