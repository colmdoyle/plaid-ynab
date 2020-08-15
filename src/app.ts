import dotenv from 'dotenv';
dotenv.config();

import * as crypto from 'crypto';
import express from 'express';
import plaid from 'plaid';
import moment from 'moment';
import * as ynab from 'ynab';
import { SaveTransactionWrapper, SaveTransaction } from 'ynab';

const app: express.Application = express();

const plaid_access_token = process.env.PLAID_ACCESS_TOKEN as string;
const ynab_access_token = process.env.YNAB_ACCESS_TOKEN as string;

const plaidClient = new plaid.Client({
  clientID: process.env.PLAID_CLIENT_ID as string,
  secret: process.env.PLAID_SECRET as string,
  env: plaid.environments.development as string,
  options: {},
});

const plaidDefaultAccount = process.env.PLAID_DEFAULT_ACCOUNT as string;

const ynabClient = new ynab.API(ynab_access_token);
const ynabBudgetID = process.env.YNAB_BUDGET_ID as string;
const ynabDefaultAccount = process.env.YNAB_DEFAULT_ACCOUNT as string;

app.get('/', (_, res) => {
    var startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    var endDate = moment().format('YYYY-MM-DD');
    plaidClient.getTransactions(plaid_access_token, startDate, endDate,  {
      count: 250,
      offset: 0,
      account_ids: [plaidDefaultAccount]
    }).then(tranactionsResponse => {
      const transactionsForYNAB: SaveTransaction[] = [];

      tranactionsResponse.transactions.forEach(transaction => {
        transactionsForYNAB.push({
          account_id: ynabDefaultAccount,
          date: transaction.date,
          amount: -(transaction.amount! * 1000),
          memo: transaction.name,
          import_id: crypto.createHash('md5').update(transaction.transaction_id).digest("hex")
        })
      });

      ynabClient.transactions.createTransaction(ynabBudgetID, {transactions: transactionsForYNAB}).then((response) => {
        res.json(response);
      });
    })
});

app.listen(3000, () => {
  console.log('Server is online');
});