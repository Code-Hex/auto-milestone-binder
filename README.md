# Auto Milestone Binder

![Test Milestone Binder](https://github.com/Code-Hex/auto-milestone-binder/workflows/Test%20Milestone%20Binder/badge.svg)

An action for binding milestone to some PR or some issues.
When a pull request is opened without a milestone, this action finds a milestone which has smallest version string in the title
and set the milestone to the pull request.

You can see the example: https://github.com/Code-Hex/auto-milestone-binder/issues/7

# Usage

See [action.yml](action.yml)

```yaml
on:
  issues:
    types: [opened]
  pull_request:
    types: [opened]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: Code-Hex/auto-milestone-binder@v1.0.0
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        loose: '0'
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
