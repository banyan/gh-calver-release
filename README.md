# gh-calver-release :spiral_calendar:

>Create a Release PR and a Release using calver

There are cases where you want to release a website or application with [calendar versioning](https://calver.org/).
This tool can be used in such cases and is supposed to be used with GitHub Actions.

You can run `gh-calver-release create:pr` on any event such as `workflow_dispatch`. This will create a pull request for release. The description of the Pull Request will be created using the [Automatically generated release notes](https://docs.github.com/en//repositories/releasing-projects-on-github/automatically-generated-release-notes) feature.

The `gh-calver-release create:release` is executed when the release PR is merged. In fact, releases are also created when a hotfix enters the base branch directly.


## Usage

### `gh-calver-release create:pr`

```yml
name: Create Release PR
on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
    - name: Create release pull request
      run: |
        npx gh-calver-release create:pr --repo ${{ github.repository }} --base main --head develop
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### `gh-calver-release create:release`

```yml
name: Create Release
on:
  pull_request:
    branches:
      - main # base branch
    types:
      - closed

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    if: github.event.pull_request.merged == true # detect when pull request is merged
    steps:
    - name: Create release
      run: |
        npx gh-calver-release create:release --repo ${{ github.repository }} --target_commitish main --pull_number ${{ github.event.pull_request.number }}
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
