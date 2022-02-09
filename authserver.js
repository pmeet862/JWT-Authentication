require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

let refreshTokens = [];

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SERECT, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAcessToken({ name: user.name });
    res.send({ accessToken: accessToken });
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };
  const accessToken = generateAcessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SERECT);
  refreshTokens.push(refreshToken);
  res.send({ accessToken: accessToken, refreshToken: refreshToken });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

function generateAcessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SERECT, { expiresIn: "15s" });
}

app.listen(4000);
