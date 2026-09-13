#!/usr/bin/env node

/**
 * Handles mirroring issues and comments from stillsystems/treeresolve-community to stillsystems/treeresolve:
 * - Mirrors newly opened issues to core
 * - Mirrors community user comments to core
 * - Mirrors state changes (close/reopen) to core
 */

const fs = require('fs');

async function findCoreIssue(coreHeaders, communityIssueNum) {
  // 1. Direct fetch from issues list (bypasses search indexing lag)
  const listRes = await fetch(
    `https://api.github.com/repos/stillsystems/treeresolve/issues?state=all&per_page=100`,
    { headers: coreHeaders }
  );
  if (listRes.ok) {
    const issues = await listRes.json();
    for (const item of issues) {
      if ((item.body || '').includes(`mirror-origin: stillsystems/treeresolve-community#${communityIssueNum}`)) {
        return item;
      }
    }
  }

  // 2. Fallback to Search API if more than 100 issues
  const searchQ = encodeURIComponent(
    `repo:stillsystems/treeresolve "mirror-origin: stillsystems/treeresolve-community#${communityIssueNum}"`
  );
  const searchRes = await fetch(
    `https://api.github.com/search/issues?q=${searchQ}`,
    { headers: coreHeaders }
  );
  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.items && data.items.length > 0) {
      return data.items[0];
    }
  }

  return null;
}

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH not found');
    process.exit(1);
  }

  const token = process.env.CORE_SYNC_TOKEN;
  if (!token) {
    console.error('CORE_SYNC_TOKEN is missing');
    process.exit(1);
  }

  const communityToken = process.env.GITHUB_TOKEN;

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = event.issue;
  if (!issue) {
    console.log('No issue found in event payload. Exiting.');
    return;
  }

  const coreHeaders = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'TreeResolve-Community-Mirror',
    'Content-Type': 'application/json',
  };

  const communityHeaders = {
    Authorization: `token ${communityToken || token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'TreeResolve-Community-Mirror',
    'Content-Type': 'application/json',
  };

  // 1. Issue Opened -> Create Mirror in Core
  if (event.action === 'opened') {
    console.log(`Creating mirrored issue for community issue #${issue.number}...`);

    const title = `[Community #${issue.number}] ${issue.title}`;
    const body = [
      `<!-- mirror-origin: stillsystems/treeresolve-community#${issue.number} -->`,
      `> 🌐 **Mirrored from Public Community Issue:** [stillsystems/treeresolve-community#${issue.number}](${issue.html_url})`,
      `> **Author:** @${issue.user?.login || 'unknown'}`,
      '',
      issue.body || '*No description provided.*',
      '',
      '---',
      '💡 *To reply publicly to the author on the community issue, start your comment with `/reply <message>` or `/public <message>`. All other comments will remain private.*',
    ].join('\n');

    // Filter available labels (copy over standard labels like bug, documentation, enhancement)
    const labels = ['community'];
    if (issue.labels && Array.isArray(issue.labels)) {
      for (const l of issue.labels) {
        if (typeof l.name === 'string' && l.name !== 'community') {
          labels.push(l.name);
        }
      }
    }

    const createRes = await fetch(`https://api.github.com/repos/stillsystems/treeresolve/issues`, {
      method: 'POST',
      headers: coreHeaders,
      body: JSON.stringify({
        title,
        body,
        labels,
      }),
    });

    if (!createRes.ok) {
      console.error(`Failed to create mirror issue in core: ${createRes.status} ${await createRes.text()}`);
      process.exit(1);
    }

    const createdCoreIssue = await createRes.json();
    console.log(`✅ Mirrored to core issue #${createdCoreIssue.number}`);

    // Leave a receipt comment on the community issue
    await fetch(
      `https://api.github.com/repos/stillsystems/treeresolve-community/issues/${issue.number}/comments`,
      {
        method: 'POST',
        headers: communityHeaders,
        body: JSON.stringify({
          body: `<!-- mirror-bot -->\n🧭 *Mirrored to private development backlog for engineering triage.*`,
        }),
      }
    );
    return;
  }

  // 2. Issue Closed / Reopened -> Sync State to Core
  if (event.action === 'closed' || event.action === 'reopened') {
    console.log(`Syncing state (${event.action}) to core...`);
    const coreIssue = await findCoreIssue(coreHeaders, issue.number);
    if (!coreIssue) {
      console.log(`Core issue not found for community issue #${issue.number}.`);
      return;
    }

    const targetState = event.action === 'closed' ? 'closed' : 'open';
    if (coreIssue.state === targetState) {
      console.log(`Core issue #${coreIssue.number} already in target state ${targetState}. Skipping.`);
      return;
    }

    await fetch(`https://api.github.com/repos/stillsystems/treeresolve/issues/${coreIssue.number}`, {
      method: 'PATCH',
      headers: coreHeaders,
      body: JSON.stringify({ state: targetState }),
    });

    console.log(`✅ Synced state (${targetState}) to core issue #${coreIssue.number}`);
    return;
  }

  // 3. New Comment on Community Issue -> Forward to Core
  if (event.action === 'created' && event.comment) {
    const comment = event.comment;
    const body = comment.body || '';

    // Ignore bot comments or comments sent from core
    if (body.includes('<!-- from-core -->') || body.includes('<!-- mirror-bot -->') || body.includes('<!-- mirror-from-community -->')) {
      console.log('Automated comment detected. Ignoring.');
      return;
    }

    console.log(`Forwarding community comment to core...`);
    const coreIssue = await findCoreIssue(coreHeaders, issue.number);
    if (!coreIssue) {
      console.log(`Core issue not found for community issue #${issue.number}.`);
      return;
    }

    const forwardedBody = [
      `<!-- mirror-from-community -->`,
      `💬 **@${comment.user?.login || 'User'} commented on [community#${issue.number}](${comment.html_url}):**`,
      '',
      body,
    ].join('\n');

    const commentRes = await fetch(
      `https://api.github.com/repos/stillsystems/treeresolve/issues/${coreIssue.number}/comments`,
      {
        method: 'POST',
        headers: coreHeaders,
        body: JSON.stringify({ body: forwardedBody }),
      }
    );

    if (!commentRes.ok) {
      console.error(`Failed to forward comment to core: ${commentRes.status} ${await commentRes.text()}`);
      process.exit(1);
    }

    console.log(`✅ Forwarded comment to core issue #${coreIssue.number}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
