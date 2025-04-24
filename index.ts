import * as dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { S3 } from "aws-sdk";
import mime from "mime-types";

const S3_BUCKET = process.env.AWS_S3_BUCKET as string;
const PORT = process.env.PORT || 3001;

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEYID,
    secretAccessKey: process.env.AWS_SECRETACCESSKEY,
    region: process.env.AWS_REGION
});

const app = express();

app.get("/*", async (req, res) => {
  // id.100xdevs.com
  const host = req.hostname;

  const id = host.split(".")[0];
  let filePath = req.path;

    // Remove leading "/protfolio" from the path if present
    if (filePath.startsWith(`/${id}`)) {
      filePath = filePath.slice(id.length + 1); // +1 for the slash
    }

  try {
    const contents = await s3.getObject({
      Bucket: S3_BUCKET,
      Key: `__outout/${id}${filePath}`
    }).promise();

    const type = mime.lookup(filePath) || "application/octet-stream";
    res.set("Content-Type", type);
  
    res.send(contents.Body);
  } catch (error) {
    res.status(400).send("file Not found")
  }
})

app.listen(PORT);
