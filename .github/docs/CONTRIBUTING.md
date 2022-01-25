# Contributing to this Repository

Thanks for your interest in contributing to this Repository. We're grateful for your initiative! ❤️

In this guide, we're going to go through the steps for each kind of contribution, and good and bad examples of what to do. We look forward to your contributions!

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [🐞 Bugs and Issues](#-bugs-and-issues)
- [🥇 Making Your First Submission](#-making-your-first-submission)
- [☑️ Naming Conventions](#-naming-conventions)
- [🙏 Thank You](#-thank-you)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<a name="-bugs-and-issues"></a>

## 🐞 Bugs and Issues

### Submitting Issues

We love to get issue reports. But we love it even more if they're in the right format. For any bugs you encounter, we need you to:

- **Describe your problem**: What exactly is the bug. Be as clear and concise as possible
- **Why do you think it's happening?** If you have any insight, here's where to share it

There are also a couple of nice to haves:

- **Screenshots:** If they're relevant

<a name="-making-your-first-submission"></a>

## 🥇 Making Your First Submission

0. Associate your local git config with your github account. If this is your first time using git you can follow [the steps](#associate-with-github-account).
1. Fork the repo and clone onto your computer.
2. Create a [new branch](#naming-your-branch), for example `fix/index-typo-1`.
3. Work on this branch to do the fix/improvement.
4. Check if your code changes follow the [code review guidelines](.github/docs/CODE_REVIEW_GUIDELINES.md).
5. Commit the changes with the [correct commit style](#writing-your-commit-message).
6. Make a pull request.
7. Submit your pull request and wait for all checks to pass.
8. Get a LGTM 👍 and PR gets merged.

**Note:** If you're just fixing a typo or grammatical issue, you can go straight to a pull request.

### Associate with Github Account

- Confirm username and email on [your profile page](https://github.com/settings/profile).
- Set git config on your computer.

```shell
git config user.name "YOUR GITHUB NAME"
git config user.email "YOUR GITHUB EMAIL"
```

- (Optional) Reset the commit author if you made commits before you set the git config.

```shell
git checkout YOUR-WORKED-BRANCH
git commit --amend --author="YOUR-GITHUB-NAME <YOUR-GITHUB-EMAIL>" --no-edit
git log  # to confirm the change is effective
git push --force
```

<a name="-naming-conventions"></a>

## ☑️ Naming Conventions

For branches, commits, and PRs we follow some basic naming conventions:

- Be descriptive
- Use all lower-case
- Limit punctuation
- Include one of our specified [types](#specify-the-correct-types)
- Short (under 70 characters is best)
- In general, follow the [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/#summary) guidelines

Note: If you don't follow naming conventions, your commit will be automatically flagged to be fixed.

### Specify the correct types

Type is an important prefix in PR, commit message. For each branch, commit, or PR, we
need you to specify the type to help us keep things organized. For example, for commit messages:

```
feat: add hat wobble
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```

- build: Changes that affect the build system or external dependencies (npm packages etc)
- ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- test: Adding missing tests or correcting existing tests
- chore: updating grunt tasks etc; no production code change

### Naming your Branch

Your branch name should follow the format `type/scope-issue_id`:

- `type` is one of the [types above](#specify-the-correct-types)
- `scope` is optional, and represents the module your branch is working on.
- `issue_id` is [the GitHub
  issue](https://github.com/dinis-rodrigues/gerador-horarios/issues) number. Having the
  correct issue number will automatically link the Pull Request on this branch to that
  issue. If any.

> Good examples:

```text
feat/added-dark-theme
fix/executor-loader-113
chore/update-version
docs/add-cloud-section-33
```

> Bad examples:

| Branch name     | Feedback                                              |
| --------------- | ----------------------------------------------------- |
| `FIXAWESOME123` | Not descriptive enough, all caps, doesn't follow spec |
| `NEW-test-1`    | Should be lower case, not descriptive                 |
| `mybranch-1`    | No type, not descriptive                              |

### Writing your Commit Message

A good commit message helps us track this Repository development. A Pull Request with a bad commit message will be _rejected_ automatically in the CI pipeline.

Commit messages should stick to our [naming conventions](#naming-conventions) outlined above, and use the format `type(scope?): subject`:

- `type` is one of the [types above](#specify-the-correct-types).
- `scope` is optional, and represents the module your commit is working on.
- `subject` explains the commit, without an ending period`.`

For example, a commit that fixes a bug in the executor module should be phrased as: `fix(executor): fix the bad naming in init function`

> Good examples:

```text
fix(indexer): fix wrong sharding number in indexer
feat: add remote api
```

> Bad examples:

| Commit message                                                                                | Feedback                           |
| --------------------------------------------------------------------------------------------- | ---------------------------------- |
| `doc(101): improved 101 document`                                                             | Should be `docs(101)`              |
| `tests(flow): add unit test for flow exception`                                               | Should be `test(flow)`             |
| `DOC(101): Improved 101 Documentation`                                                        | All letters should be in lowercase |
| `fix(pea): i fix this pea and this looks really awesome and everything should be working now` | Too long                           |
| `fix(pea):fix network receive of the pea`                                                     | Missing space after `:`            |
| `hello: add hello-world`                                                                      | Type `hello` is not allowed        |

#### What if I Mess Up?

We all make mistakes. GitHub has a guide on [rewriting commit messages](https://docs.github.com/en/free-pro-team@latest/github/committing-changes-to-your-project/changing-a-commit-message) so they can adhere to our standards.

You can also install [commitlint](https://commitlint.js.org/#/) onto your own machine and check your commit message by running:

```bash
echo "<commit message>" | commitlint
```

### Naming your Pull Request

We don't enforce naming of PRs and branches, but we recommend you follow the same style. It can simply be one of your commit messages, just copy/paste it, e.g. `fix(readme): improve the readability and move sections`.

## 🙏 Thank You

Once again, thanks so much for your interest in contributing to this repo. We're excited to see your contributions!
