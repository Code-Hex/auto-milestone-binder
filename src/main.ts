import * as core from '@actions/core';
import * as github from '@actions/github';
import compareVersions from 'compare-versions';

async function run() {
  const {eventName, action, repo, payload, issue} = github.context;

  if (eventName !== 'milestone') {
    console.log(`The event name was '${eventName}'`);
    return;
  }
  if (action !== 'opened') {
    console.log('No issue or PR was opened, skipping');
    return;
  }

  // Do nothing if its not a pr or issue
  const isIssue: boolean = !!payload.issue;
  const isPR: boolean = !!payload.pull_request;
  if (!isIssue && !isPR) {
    console.log(
      'The event that triggered this action was not a pull request or issue, skipping.'
    );
    return;
  }

  // Get client and context
  const client: github.GitHub = new github.GitHub(
    core.getInput('github-token', {required: true})
  );

  const milestones = await client.issues.listMilestonesForRepo({
    ...repo,
    state: 'open'
  });

  if (milestones.data.length === 0) {
    console.log('There are no milestones, skipping.');
    return;
  }

  const sortedMilestones = milestones.data.sort((a, b) => {
    return compareVersions(a.title, b.title);
  });

  const smallestVersion = sortedMilestones[0];

  await client.issues.update({
    ...repo,
    issue_number: issue.number,
    milestone: smallestVersion.number
  });
  core.setOutput('milestone', smallestVersion);
}

run().catch(err => {
  core.setFailed(err.message);
});
