#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import * as crypto from 'crypto';
import plaid from 'plaid';
import moment from 'moment';
import * as ynab from 'ynab';
import { SaveTransaction } from 'ynab';

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

var startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
var endDate = moment().format('YYYY-MM-DD');

plaidClient.getTransactions(plaid_access_token, startDate, endDate, {
  count: 250,
  offset: 0,
  account_ids: [plaidDefaultAccount]
}).then(tranactionsResponse => {
  console.log(`Processing ${tranactionsResponse.transactions.length} transactions for ${tranactionsResponse.accounts[0].name}...`);
  console.log(`-----------------------`);
  const transactionsForYNAB: SaveTransaction[] = [];
  tranactionsResponse.transactions.forEach(transaction => {
    if (transaction.pending) {
      console.log(`PENDING | ${transaction.date} | ${transaction.name} | ${transaction.amount}`);
      return;
    }
    console.log(`${transaction.date} | ${transaction.name} | ${transaction.amount}`);
    transactionsForYNAB.push({
      account_id: ynabDefaultAccount,
      date: transaction.date,
      amount: -(transaction.amount! * 1000),
      memo: `Auto Import - ${transaction.name}`,
      import_id: crypto.createHash('md5').update(transaction.transaction_id).digest("hex"),
      cleared: SaveTransaction.ClearedEnum.Cleared
    })
  });
  console.log(`-----------------------`);
  if (transactionsForYNAB.length > 0) {
    console.log(`Sending ${transactionsForYNAB.length} transaction to YNAB...`);
    ynabClient.transactions.createTransaction(ynabBudgetID, { transactions: transactionsForYNAB }).then((response) => {
      console.log(`Added ${response.data.transaction_ids.length} new transactions`);
      if (response.data.duplicate_import_ids) {
        console.log(`Ignored ${response.data.duplicate_import_ids.length} duplicate transactions`);
      }
    }).catch(error => {
      console.log(error);
      console.log(error);
    });
  } else {
    console.log(tranactionsResponse.transactions);
  }
}).catch(error => {
  console.log(error);
});
