import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import { Server } from '@tus/server';
import { S3Store } from '@tus/s3-store';

const app = express();
app.use(cors());

const tusServer = new Server({
  path: '/files',
  datastore: new S3Store({
    bucket: process.env.S3_BUCKET,
    s3ClientConfig: {
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    },
    partSize: 8 * 1024 * 1024,
  }),
});

app.all('/files', tusServer.handle.bind(tusServer));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TUS server rodando em http://localhost:${PORT}/files`);
});