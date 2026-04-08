import "dotenv/config";
const options = {
  method: "POST",
  headers: {
    Authorization: "Bearer " + process.env.ZIINA_API_TOKEN,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: process.env.WEBHOOK_URL,
    secret: process.env.WEBHOOK_SECRET,
  }),
};


fetch("https://api-v2.ziina.com/api/webhook", options)
  .then((res) => res.json())
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
