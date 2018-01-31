const request = require('request-promise-native');

export function exchanges() {
  const list = [
    {
      name: 'CoinExchange.io',
      url: 'https://www.coinexchange.io/api/v1/getmarketsummary?market_id=306',
    },
  ];

  return {
    getLastPrices() {
      const lastPrices = {};

      return Promise.all(list.map((exchange) => {
        const opts = {
          url: exchange.url,
          headers: {
            'User-Agent': 'request',
          },
        };

        return request(opts)
          .then((body) => {
            lastPrices[exchange.name] = JSON.parse(body).result.LastPrice;
          });
      })).then(() => lastPrices);
    },
  };
}


export function Interval(fn, time) {
  let timer = false;
  this.start = () => {
    if (!this.isRunning()) {
      timer = setInterval(fn, time);
    }
  };
  this.stop = () => {
    clearInterval(timer);
    timer = false;
  };
  this.isRunning = () => {
    return timer !== false;
  };
}
