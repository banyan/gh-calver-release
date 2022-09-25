import { BANNER } from './../config';
import calver from 'calver';

import { DEFAULT_FORMAT, DEFAULT_LEVEL, START_POINT_TAG_NAME } from '../config';

import {
  createPullRequest,
  getLatestReleaseTagName,
  getReleaseNote,
  publishRelease,
} from '../github/api';
import { getOctokit } from '../github/octokit';
import { buildPRTitle } from '../utils/buildPRTitle';

export type CreateReleasePRPayload = {
  owner: string;
  repo: string;
  base: string;
  head: string;
  format: string | undefined;
  level: string | undefined;
};

export const createReleasePR = async ({
  owner,
  repo,
  base,
  head,
  format: _format,
  level: _level,
}: CreateReleasePRPayload) => {
  const octokit = getOctokit();
  const format = _format || DEFAULT_FORMAT;
  const level = _level || DEFAULT_LEVEL;

  const latestReleaseTagName = await getLatestReleaseTagName(octokit, {
    owner,
    repo,
  });

  if (latestReleaseTagName === '') {
    // If there is no latestReleaseTagName, it means that the release has not been created yet.
    // If there is already a develop branch and a main branch, the release would contain all PRs.
    // Therefore, we will create a release here as a start point as gh-calver-release.
    await publishRelease(octokit, {
      owner,
      repo,
      tagName: START_POINT_TAG_NAME,
      targetCommitish: base,
      willGenerateReleaseNotes: false,
    });
  }

  // The version name will also be noted in the release PR, but it will only be tentative.
  // Since the version is cut off by the date of the actual release, it is used here as "candidate".
  const newTagNameCandidate = calver.inc(
    format,
    calver.isValid(format, latestReleaseTagName) ? latestReleaseTagName : '',
    level,
  );

  const releaseNote = await getReleaseNote(octokit, {
    owner,
    repo,
    newTagNameCandidate,
    targetCommitish: head,
    latestReleaseTagName: latestReleaseTagName
      ? latestReleaseTagName
      : START_POINT_TAG_NAME,
  });

  await createPullRequest(octokit, {
    owner,
    repo,
    base,
    head,
    title: buildPRTitle(newTagNameCandidate),
    releaseNote: `${releaseNote}\n${BANNER}`,
  });
};
