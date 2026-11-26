require('dotenv').config();
require('express');

const { createApp } = require('./appFactory');
const app = createApp();

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 3001);

  app.listen(port, () => {
    console.log(`PawLoka API listening on port ${port}`);
  });
}

module.exports = app;