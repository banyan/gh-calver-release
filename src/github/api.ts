import type { Octokit } from '@octokit/core';
import { RequestError } from '@octokit/request-error';

export const getLatestReleaseTagName = async (
  octokit: Octokit,
  {
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  },
): Promise<string> => {
  try {
    const res = await octokit.request(
      'GET /repos/{owner}/{repo}/releases/latest',
      {
        owner,
        repo,
      },
    );
    return res.data.tag_name;
  } catch (err: unknown) {
    if (err instanceof RequestError && err.status === 404) {
      return '';
    }
    throw err;
  }
};

export const getReleaseNote = async (
  octokit: Octokit,
  {
    owner,
    repo,
    newTagNameCandidate,
    targetCommitish,
    latestReleaseTagName,
  }: {
    owner: string;
    repo: string;
    newTagNameCandidate: string;
    targetCommitish: string;
    latestReleaseTagName: string;
  },
): Promise<string> => {
  // POST request, but as it says `The generated release notes are not saved anywhere`, GET may be appropriate in practice.
  // Ref: https://docs.github.com/en/rest/releases/releases#generate-release-notes-content-for-a-release
  const res = await octokit.request(
    'POST /repos/{owner}/{repo}/releases/generate-notes',
    {
      owner,
      repo,
      tag_name: newTagNameCandidate,
      targetCommitish,
      previous_tag_name: latestReleaseTagName,
    },
  );
  return res.data.body;
};

export const createPullRequest = async (
  octokit: Octokit,
  {
    owner,
    repo,
    base,
    head,
    title,
    releaseNote,
  }: {
    owner: string;
    repo: string;
    base: string;
    head: string;
    title: string;
    releaseNote: string;
  },
): Promise<void> => {
  try {
    await octokit.request('POST /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      head,
      base,
      title,
      body: releaseNote,
    });
  } catch (err: unknown) {
    if (
      err instanceof RequestError &&
      err.message.includes('No commits between')
    ) {
      console.error(
        `Could not create Pull Request because of no commits between ${base} and ${head}.`,
      );
      return process.exit(1);
    }
    throw err;
  }
};

export const publishRelease = async (
  octokit: Octokit,
  {
    owner,
    repo,
    tagName,
    targetCommitish,
    willGenerateReleaseNotes,
  }: {
    owner: string;
    repo: string;
    tagName: string;
    targetCommitish: string;
    willGenerateReleaseNotes: boolean;
  },
): Promise<void> => {
  await octokit.request('POST /repos/{owner}/{repo}/releases', {
    owner,
    repo,
    tag_name: tagName,
    name: tagName,
    target_commitish: targetCommitish,
    generate_release_notes: willGenerateReleaseNotes,
  });
};

export const getPullRequestBody = async (
  octokit: Octokit,
  {
    owner,
    repo,
    pullNumber,
  }: {
    owner: string;
    repo: string;
    pullNumber: number;
  },
): Promise<string | null> => {
  const res = await octokit.request(
    'GET /repos/{owner}/{repo}/pulls/{pull_number}',
    {
      owner,
      repo,
      pull_number: pullNumber,
    },
  );
  return res.data.body;
};

export const updatePullRequestTitle = async (
  octokit: Octokit,
  {
    owner,
    repo,
    pullNumber,
    title,
  }: {
    owner: string;
    repo: string;
    pullNumber: number;
    title: string;
  },
): Promise<void> => {
  await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: pullNumber,
    title,
  });
};
