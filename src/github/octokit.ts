import { Octokit } from '@octokit/core';

export function getOctokit() {
  const { GITHUB_TOKEN } = process.env;
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not given');
  }
  return new Octokit({ auth: GITHUB_TOKEN });
}
