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
  const versionFromTitle = (title: string) => {
    const m = title.match(/\bv\d+\.\d+\.\d+/);
    if (m !== null) {
      return m[0];
    } else {
      return title;
    }
  };

  if (loose) {
    return milestones.data
      .sort((a, b) => {
        return compareVersions(versionFromTitle(a.title), versionFromTitle(b.title));
      }).shift()
  } else {
    return milestones.data
      .filter((v) => compareVersions.validate(v.title))
      .sort((a, b) => {
        return compareVersions(a.title, b.title);
      }).shift()
  }
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
  console.log(`loose "${loose}"`)
  console.log({loose})
  const smallestVersion = pickSmallestVersion(milestones, !!Number(loose));
  if (smallestVersion === undefined) {
    throw new Error("failed to find valid milestone.")
  }

  await client.issues.update({
    ...repo,
    issue_number: issue.number,
    milestone: smallestVersion.number
  });
  core.setOutput('milestone', smallestVersion);
}

run().catch(err => {
  const message = `${err.message} loose: "${ core.getInput('loose')  }" `
  core.setFailed(message);
});
