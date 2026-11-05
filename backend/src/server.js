import app from './app.js';
import env from './config/env.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(
    `🚀 EVOQ backend running on http://localhost:${PORT} [${env.NODE_ENV}]`
  );
});

