# Plaid to YNAB Importer

A small script to automatically pull transactions from your bank via [Plaid](https://plaid.com/) and import them into [YNAB](https://www.youneedabudget.com/)

## Prerequisites

### YNAB data
- A [personal access token](https://api.youneedabudget.com/#personal-access-tokens)
- Your [Budget ID](https://api.youneedabudget.com/v1#/Budgets/getBudgets)
- Your [Account ID](https://api.youneedabudget.com/v1#/Accounts/getAccounts)

### Plaid data
- A [client ID and client secret](https://plaid.com/docs/quickstart/
- An access token which you can get via their [sample app](https://github.com/plaid/quickstart)
- The [list of account IDs](https://plaid.com/docs/quickstart/#auth-data) that you want to access

## Known limitations

Currently, the script only supports one YNAB account and one YNAB budget, but could probably be extended easily enough

## Optional

### Slack notifications

If you're using a paid Slack plan, you can optionally send notifications when the script is run via [Workflow Builder webhooks](https://slack.com/intl/en-ie/help/articles/360041352714-Create-workflows-using-webhooks) by specifying a `SLACK_WEBHOOK_URL` environment variable.

There is a `.workflow` file in the root directory which you can [import](https://slack.com/intl/en-ie/help/articles/360035209114-Automate-everyday-tasks-with-Workflow-Builder#import-a-file) directly into Workflow Builder to get started.