import * as core from '@actions/core';
import * as github from '@actions/github';
import compareVersions from 'compare-versions';
import {WebhookPayload} from '@actions/github/lib/interfaces';

interface Payload extends WebhookPayload {
  // eslint-disable-next-line camelcase
  pull_request?: {
    [key: string]: any;
    number: number;
    html_url?: string;
    body?: string;
    milestone?: any;
  };
  issue?: {
    [key: string]: any;
    number: number;
    html_url?: string;
    body?: string;
    milestone?: any;
  };
}

export const existsMilestone = (payload: Payload): boolean => {
  if (payload.issue?.milestone) {
    return true;
  }
  if (payload.pull_request?.milestone) {
    return true;
  }
  return false;
};

interface Milestone {
  title: string
  number: number
}

export const pickSmallestVersion = (milestones: {data: Milestone[]}, loose: boolean): Milestone | undefined => {
  const normalizedTitle: (Milestone) => string = loose ? (milestone) => {
    const m = milestone.title.match(/\bv\d+\.\d+\.\d+/);
    if (m !== null) {
      return m[0];
    } else {
      return milestone.title;
    }
  } : (milestone) => {
    return milestone.title
  }

  return milestones.data
    .filter((v) => compareVersions.validate(normalizedTitle(v)))
    .sort((a, b) => {
      return compareVersions(normalizedTitle(a), normalizedTitle(b));
    })
    .shift()
}

async function run() {
  const {repo, payload, issue} = github.context;

  if (payload.action !== 'opened') {
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

  if (existsMilestone(payload as Payload)) {
    console.log('Milestone already exist, skipping.');
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

  const loose = core.getInput('loose')
  const smallestVersion = pickSmallestVersion(milestones, !!Number(loose));
  if (smallestVersion === undefined) {
    console.log("failed to find valid milestone.")
    return
  }

  await client.issues.update({
    ...repo,
    issue_number: issue.number,
    milestone: smallestVersion.number
  });
  core.setOutput('milestone', smallestVersion);
}

run().catch(err => {
  core.setFailed(err);
});
