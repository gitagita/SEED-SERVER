const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use('/', require('./routes'));

app.use('*', (req, res) => {
  res.status(404).json({
    status: 404,
    success: false,
    message: '페이지 주소를 찾을 수 없습니다.',
  });
});

app
  .listen(3000, () => {
    console.log('server is running');
  })
  .on('error', () => {
    process.exit(1);
  });

