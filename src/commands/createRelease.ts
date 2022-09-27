import { BANNER } from './../config';
import calver from 'calver';

import { DEFAULT_FORMAT, DEFAULT_LEVEL } from '../config';
import {
  getLatestReleaseTagName,
  getPullRequestBody,
  publishRelease,
  updatePullRequestTitle,
} from '../github/api';
import { getOctokit } from '../github/octokit';
import { buildPRTitle } from '../utils/buildPRTitle';

export type CreateReleasePayload = {
  repo: string;
  target_commitish: string;
  pull_number: number;
  format: string | undefined;
  level: string | undefined;
};

export const createRelease = async ({
  owner,
  repo,
  target_commitish: targetCommitish,
  pull_number: pullNumber,
  format: _format,
  level: _level,
}: CreateReleasePayload & { owner: string }) => {
  const octokit = getOctokit();
  const format = _format || DEFAULT_FORMAT;
  const level = _level || DEFAULT_LEVEL;

  const latestReleaseTagName = await getLatestReleaseTagName(octokit, {
    owner,
    repo,
  });

  const newTagName = calver.inc(
    format,
    calver.isValid(format, latestReleaseTagName) ? latestReleaseTagName : '',
    level,
  );

  await publishRelease(octokit, {
    owner,
    repo,
    tagName: newTagName,
    targetCommitish,
    willGenerateReleaseNotes: true,
  });

  const prBody = await getPullRequestBody(octokit, {
    owner,
    repo,
    pullNumber,
  });

  // The release version is considered to be a PR made via gh-calver-release,
  // and the tentative release version is adjusted to the timing of the release.
  if (prBody?.includes(BANNER)) {
    await updatePullRequestTitle(octokit, {
      owner,
      repo,
      pullNumber,
      title: buildPRTitle(newTagName),
    });
  }
};
