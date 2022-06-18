const http = require('http');
const app = require('./app');


const server = http.createServer(app);

const PORT = 3000;

// listening on console
server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
