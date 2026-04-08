import "dotenv/config";

const options = { method: 'DELETE', headers: { Authorization: 'Bearer ' + process.env.ZIINA_API_TOKEN } };

fetch('https://api-v2.ziina.com/api/webhook', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
