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
    s3ClientConfig: {
      bucket: process.env.S3_BUCKET,
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    },
    partSize: 2 * 1024 * 1024,
  }),
});

tusServer.getUrl = (req, id) => {
  return `https://${req.headers.host}${tusServer.options.path}/${id}`;
};

app.all('/files/', tusServer.handle.bind(tusServer));
app.all('/files/:id', tusServer.handle.bind(tusServer));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TUS server rodando em http://localhost:${PORT}/files`);
});