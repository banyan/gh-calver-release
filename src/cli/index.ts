#!/usr/bin/env node

import yargs from 'yargs';
import type { Arguments, Argv } from 'yargs';

import { createReleasePR, createRelease } from '..';
import type { CreateReleasePRPayload, CreateReleasePayload } from '..';

yargs
  .locale('en')
  .wrap(null)
  .scriptName('gh-calver-release')
  .usage('$0 <cmd> [args]')
  .command(
    'create:pr',
    'Create release pull request',
    (yargs: Argv): Argv<CreateReleasePRPayload> => {
      return yargs
        .option('repo', {
          type: 'string',
          describe:
            'The name of the owner and repository. The name is not case sensitive. (e.g. owner/repo)',
          demandOption: true,
        })
        .option('base', {
          type: 'string',
          describe:
            'The name of the branch you want the changes pulled into. This should be an existing branch on the current repository.',
          demandOption: true,
        })
        .option('head', {
          type: 'string',
          describe:
            'The name of the branch where your changes are implemented.',
          demandOption: true,
        })
        .option('format', {
          type: 'string',
          describe:
            'Pick favorite format from https://github.com/muratgozel/node-calver#choose-format. The default is "yyyy.0m.0d.minor".',
        })
        .option('level', {
          type: 'string',
          describe:
            'If the format has been changed, the level must also be changed to the appropriate one. The default is "calendar.minor".',
        })
        .example([
          [
            '$0 create:pr --repo "banyan/gh-calver-release" --base "main" --head "develop"',
            'Specify only required argument usage',
          ],
          [
            '$0 create:pr --repo "banyan/gh-calver-release" --base "main" --head "develop" --format "yyyy.0m.0d.minor" --level "calendar.minor"',
            'Specify additional format and level usage',
          ],
        ]);
    },
    (args: Arguments<CreateReleasePRPayload>): void => {
      const [_owner, _repo] = args.repo.split('/');
      if (!_owner || !_repo) {
        throw new Error('Invalid repo name');
      }
      createReleasePR({
        ...args,
        owner: _owner,
        repo: _repo,
      });
    },
  )
  .command(
    'create:release',
    'Create release',
    (yargs: Argv): Argv<CreateReleasePayload> => {
      return yargs
        .option('repo', {
          type: 'string',
          describe:
            'The name of the owner and repository. The name is not case sensitive.',
          demandOption: true,
        })
        .option('target_commitish', {
          type: 'string',
          describe:
            'Specifies the commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Unused if the Git tag already exists.',
          demandOption: true,
        })
        .option('pull_number', {
          type: 'number',
          describe: 'The number that identifies the pull request.',
          demandOption: true,
        })
        .option('format', {
          type: 'string',
          describe:
            'Pick favorite format from https://github.com/muratgozel/node-calver#choose-format. The default is "yyyy.0m.0d.minor".',
        })
        .option('level', {
          type: 'string',
          describe:
            'If the format has been changed, the level must also be changed to the appropriate one. The default is "calendar.minor".',
        })
        .example([
          [
            '$0 create:release --repo "banyan/gh-calver-release" --target_commitish "main" --pull_number 1',
            'Specify only required argument usage',
          ],
          [
            '$0 create:release  --repo "banyan/gh-calver-release" --target_commitish "main" --pull_number 1 --format "yyyy.0m.0d.minor" --level "calendar.minor"',
            'Specify additional format and level usage',
          ],
        ]);
    },
    (args: Arguments<CreateReleasePayload>): void => {
      const [_owner, _repo] = args.repo.split('/');
      if (!_owner || !_repo) {
        throw new Error('Invalid repo name');
      }
      createRelease({
        ...args,
        owner: _owner,
        repo: _repo,
      });
    },
  )
  // .command('init', 'Generate GitHub action templates') TODO: implement
  .demandCommand()
  .alias({ h: 'help', v: 'version' }).argv;
