import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import { Server } from '@tus/server';
import { S3Store } from '@tus/s3-store';

const app = express();
app.use(cors());

const s3Store = new S3Store({
  s3ClientConfig: {
    bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  partSize: 1 * 1024 * 1024,
  maxConcurrentPartUploads: 2
});

// app.use(cors({
//   origin: '*',
//   methods: ['GET','HEAD','POST','PATCH','OPTIONS','DELETE'],
//   exposedHeaders: [
//     'Location',
//     'Tus-Resumable',
//     'Upload-Length',
//     'Upload-Offset',
//     'Upload-Metadata'
//   ]
// }))


const localTusServer = new Server({
  path: '/afiles',
  datastore: s3Store,
});

app.all('/afiles', localTusServer.handle.bind(localTusServer));   // criação
app.all('/afiles/:id', localTusServer.handle.bind(localTusServer));   // criação

// app.post  ('/afiles',    localTusServer.handle.bind(localTusServer));   // criação
// app.head  ('/afiles/:id', localTusServer.handle.bind(localTusServer));   // checagem de status
// app.patch ('/afiles/:id', localTusServer.handle.bind(localTusServer));   // envio de chunk
// app.options('/afiles',    localTusServer.handle.bind(localTusServer));   // preflight CORS
// app.options('/afiles/:id',localTusServer.handle.bind(localTusServer));   // preflight CORS

const tusServer = new Server({
  path: '/files',
  allowedCredentials: true,
  respectForwardedHeaders: true,
  datastore: s3Store,
});

app.all('/files/', tusServer.handle.bind(tusServer));
app.all('/files/:id', tusServer.handle.bind(tusServer));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TUS server rodando em http://localhost:${PORT}/files`);
});