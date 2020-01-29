# Banksy YNAB

[![CircleCI](https://circleci.com/gh/dejanvasic85/banksy-ynab/tree/master.svg?style=svg)](https://circleci.com/gh/dejanvasic85/banksy-ynab/tree/master)

[Serverless application](serverless.com) written in Typescript that contains a lambda subscribed to an SNS topic. The messages contain banking transactions which are then posted to YNAB api.

### Message Structure

| Property     | Type               |      e.g. |
| ------------ | ------------------ | --------: |
| username     | string             |    johnny |
| bankId       | string             |       cba |
| accountName  | string             |   Savings |
| transactions | BankTransactions[] | see below |

### Bank Transaction:

| Property    | Type                     |                      e.g. |
| ----------- | ------------------------ | ------------------------: |
| amount      | number                   |                       -20 |
| date        | string (date ISO Format) | 2019-12-22T00:00:00+11:00 |
| description | string                   |                McDonald's |

Amount field is converted automatically to cents as 100 base points, so -20 will be posted as -20000 to YNAB.

The date field is simply a string and is directly forwarded to YNAB. It should contain the local date including the timezone.

## Secrets

Each user will have their configuration that includes YNAB api key and account details in a JSON stored AWS Secret.

## Architecture

This application is only responsible for subscribing to user transactions and filtering + posting them to YNAB.
[Banksy](https://github.com/dejanvasic85/banksy) is responsible for fetching/scraping the transactions from the various supported banks.

![Architecture Diagram](https://drive.google.com/uc?id=1orR5fQEn99HU-6cKs8hh9JQznay0Qzy_)

