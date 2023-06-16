import * as core from '@actions/core';
import {getOctokit, context} from '@actions/github';
import {compareVersions, validate} from 'compare-versions';
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
  title: string;
  number: number;
}

export const pickSmallestVersion = (milestones: {
  data: Milestone[];
}): Milestone => {
  const sortedMilestones = milestones.data
    .filter(v => validate(v.title))
    .sort((a, b) => {
      return compareVersions(a.title, b.title);
    });
  return sortedMilestones[0];
};

async function run() {
  const {repo, payload, issue} = context;

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
  const token = core.getInput('github-token', {required: true});
  const client = getOctokit(token).rest;

  const milestones = await client.issues.listMilestones({
    owner: repo.owner,
    repo: repo.repo,
    state: 'open'
  });

  if (milestones.data.length === 0) {
    console.log('There are no milestones, skipping.');
    return;
  }

  const smallestVersion = pickSmallestVersion(milestones);

  await client.issues.update({
    owner: repo.owner,
    repo: repo.repo,
    issue_number: issue.number,
    milestone: smallestVersion.number
  });
  core.setOutput('milestone', smallestVersion);
}

run().catch(err => {
  core.setFailed(err.message);
});
