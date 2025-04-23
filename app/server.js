require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server, S3Store } = require("@tus/server");

const app = express();
const tusServer = new Server();

app.use(cors());

// Configurando o S3Store para armazenar arquivos diretamente no S3
tusServer.datastore = new S3Store({
  bucket: process.env.S3_BUCKET,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  partSize: 8 * 1024 * 1024, // 8MB por parte
});

const uploadApp = express();
uploadApp.all('*', tusServer.handle.bind(tusServer));
app.use('/uploads', uploadApp);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Tus Server rodando em http://localhost:${PORT}`);
});
