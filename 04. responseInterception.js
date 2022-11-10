import puppeteer from 'puppeteer';

// Isolating one or more software components from their dependencies makes them easier to test. We can do so by substituting interactions with such dependencies with simulated, simplified ones. This is also known as stubbing.

// Every time we load this script, the test website is sending a request to its backend to fetch a list of best selling books. For our example, we are going to intercept this response and modify it to return a single book we define on the fly.

const mockResponseObject = [
  {
    id: 1,
    title: 'How to Mock a Response',
    author: 'A. Friend',
    genre: 'business',
    price: '0.00',
    rating: '★★★★★',
    stock: 65535,
  },
];

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 250 });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  // instead of receiving the entire list of books, we intercept the response in the request handler
  page.on('request', (request) => {
    request.url() === 'https://danube-web.shop/api/books'
      ? request.response({
          content: 'application/json',
          body: JSON.stringify(mockResponseObject),
        })
      : request.continue();
  });

  await page.goto('https://danube-web.shop/');

  await page.screenshot({ path: './screenshots/03. responseInterception.png' });

  await browser.close();
})();
