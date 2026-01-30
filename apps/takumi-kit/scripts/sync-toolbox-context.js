#!/usr/bin/env node
/**
 * Sync Toolbox Context for Claude Code CLI
 * Fetches context from Ermite Toolbox API and generates a markdown file
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const API_URL = process.env.TOOLBOX_API_URL || 'http://localhost:8000';
const OUTPUT_FILE = path.join(__dirname, '..', '.claude', 'toolbox-context.md');

/**
 * Fetch JSON from URL
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

/**
 * Generate markdown from context
 */
function generateMarkdown(context) {
  const { summary, widgets_with_pending, generated_at } = context;

  let md = `# Toolbox Context

> Auto-synced from Ermite Toolbox API
> Generated: ${new Date(generated_at).toLocaleString()}

## Summary

- **Total Widgets**: ${summary.total_widgets}
- **Pending Features**: ${summary.total_pending_features}
- **Recent Notes**: ${summary.recent_notes}

`;

  if (widgets_with_pending && widgets_with_pending.length > 0) {
    md += `## Widgets with Pending Work

`;
    for (const widget of widgets_with_pending) {
      md += `### ${widget.name} (\`${widget.slug}\`)
- ${widget.pending} pending feature(s)

`;
    }
  }

  md += `---

*Use the Ermite Toolbox platform to manage notes, features, and analytics.*
*API: ${API_URL}*
`;

  return md;
}

/**
 * Main sync function
 */
async function sync() {
  console.log(`Syncing Toolbox context from ${API_URL}...`);

  try {
    // Fetch context from API
    const context = await fetchJSON(`${API_URL}/api/v1/context/cli`);

    // Generate markdown
    const markdown = generateMarkdown(context);

    // Ensure directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');

    console.log(`Context synced to ${OUTPUT_FILE}`);
    console.log(`- ${context.summary.total_widgets} widgets`);
    console.log(`- ${context.summary.total_pending_features} pending features`);

    return true;
  } catch (error) {
    // Don't fail silently - just warn
    console.warn(`Warning: Could not sync Toolbox context: ${error.message}`);
    console.warn('This is not critical - the toolbox API may not be running.');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  sync().then((success) => {
    process.exit(success ? 0 : 0); // Always exit 0 to not block Claude Code
  });
}

module.exports = { sync };
