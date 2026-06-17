
const https = require("https");

const data = JSON.stringify({
  phone: "7750858874",
  password: "12345678"
});

const options = {
  hostname: "api.examgoal.com",
  path: "/auth/login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length
  }
};

const req = https.request(options, (res) => {
  let body = "";
  res.on("data", (d) => { body += d; });
  res.on("end", () => {
    console.log(body);
  });
});

req.on("error", (e) => {
  console.error(e);
});
req.write(data);
req.end();

