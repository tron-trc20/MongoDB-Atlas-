const https = require('https');

https.get('https://api.ipify.org?format=json', (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    console.log(JSON.parse(data).ip);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
}); 