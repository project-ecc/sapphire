import {RpcProvider} from 'worker-rpc';

const rpcProvider = new RpcProvider(
  (message, transfer) => postMessage(message, transfer)
);

onmessage = e => rpcProvider.dispatch(e.data);

rpcProvider.registerRpcHandler('processTransactions', processTransactions);
// import {addTransaction, getAllRewardTransactions} from "../Managers/SQLManager";
// import hash from "../router/hash";
// import db from '../../app/utils/database/db';

async function processTransactions(toProcess) {
  let entries = [];
  const rewards = [];
  const staked = [];
  const change = [];

  // process transactions
  for (const key of Object.keys(toProcess.transactions)) {
    const values = toProcess.transactions[key];
    let generatedFound = false;

    // check if current values array contains a staked transaction, if it does flag the rest of them as category staked
    restartLoop:
      while (true) {
        for (let i = 0; i <= values.length - 1; i++) {
          if ((values[i].category === 'generate' || values[i].category === 'immature') && generatedFound === false) {
            generatedFound = true;
            continue restartLoop;
          }
          if (generatedFound) {
            if (values[i].category !== 'generate' && values[i].category !== 'immature') {
              values[i].category = 'staked';
            } else {
              values[i].is_main = true;
              values[i].category = 'generate';
            }
            rewards.push({ ...values[i], txId: key });
          }
        }
        break;
      }

    // if the above condition doesnt fit calculate the lev
    if (!generatedFound) {
      for (let i = 0; i <= values.length - 1; i++) {
        entries.push({ ...values[i], txId: key });

        for (let j = 0; j < entries.length - 1; j++) {
          const original = entries[j];
          const current = values[i];
          if (current.txId === original.txId) {
            // console.log('txId match')

            // if original == send
            if (original.category === 'receive' && current.category === 'send' || original.category === 'send' && current.category === 'receive') {
              if (similarity(original.amount.toString(), current.amount.toString()) > 0.6) {
                current.category = 'change';
                original.category = 'change';
                change.push({ ...current, txId: key });
                change.push({ ...original, txId: key });
                entries.splice(entries.indexOf(original), 1);
                entries.splice(entries.indexOf(current), 1);
              }
            }
          }
        }
      }
    }
    generatedFound = false;
  }

  // Set every transaction still left in entries as the main transaction.
  for (let j = 0; j <= entries.length - 1; j++) {
    entries[j].is_main = true;
  }
  return entries.concat(rewards, staked, change);
  // await this.insertIntoDb(entries);
}
// async function insertIntoDb(entries) {
//   const lastCheckedEarnings = this.props.notifications.lastCheckedEarnings;
//   let earningsCountNotif = 0;
//   let earningsTotalNotif = 0;
//   const shouldNotifyEarnings = this.props.notifications.stakingNotificationsEnabled;
//
//   for (let i = 0; i < entries.length; i++) {
//     // console.log(lastCheckedEarnings)
//     if (this.state.transactionsIndexed === false) {
//       this.props.setLoading({
//         isLoading: true,
//         loadingMessage: `Indexing transaction ${i}/${entries.length}`
//       });
//     }
//     const entry = entries[i];
//
//     let isPending = false;
//
//     if (entry.category === 'generate' || entry.category === 'staked') {
//       isPending = Number(entry.confirmations) < 30;
//     } else {
//       isPending = Number(entry.confirmations) < 10;
//     }
//     await addTransaction(entry, isPending);
//
//     // update with 1 new staking reward since previous ones have already been loaded on startup
//     if (entry.category === 'generate') {
//       if (entry.time > lastCheckedEarnings && shouldNotifyEarnings) {
//         this.props.setStakingNotifications({
//           earnings: entry.amount,
//           date: entry.time
//         });
//         earningsCountNotif++;
//         earningsTotalNotif += entry.amount;
//       }
//     }
//   }
//
//   if (shouldNotifyEarnings && earningsCountNotif > 0) {
//     earningsTotalNotif = tools.formatNumber(earningsTotalNotif);
//     const title = `Staking reward - ${earningsTotalNotif} ECC`;
//     const body = earningsCountNotif === 1 ? title : `${earningsCountNotif} Staking rewards - ${earningsTotalNotif} ECC`;
//     const callback = () => { hash.push('/coin/transactions');};
//     await this.queueOrSendNotification(callback, body);
//   }
//
//   // no more transactions to process, mark as done to avoid spamming the daemon
//   if (!this.state.transactionsIndexed) {
//     this.setState({
//       transactionsIndexed: true
//     });
//     this.props.setIndexingTransactions(false);
//     const rewards = await getAllRewardTransactions();
//     this.props.setStakingReward(rewards);
//   }
//
//   this.setState({
//     transactionsPage: 0,
//     isIndexingTransactions: false
//   });
// }

function similarity(s1, s2) {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) { costs[j] = j; } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue),
            costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) { costs[s2.length] = lastValue; }
  }
  return costs[s2.length];
}
