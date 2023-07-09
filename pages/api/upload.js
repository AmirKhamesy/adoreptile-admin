import multiparty from "multiparty";
import fs from "fs";
import mime from "mime-types";

const bucketName = "adoreptile";

export default async function handle(req, res) {
  const body = req;
  console.log(body);
  const images = [];
  // for (const file of files.file) {
  // const extension = file.originalFilename.split(".").pop();
  // const newFileName = Date.now() + "." + extension;
  //upload file to s3
  // await client.send(
  //   new PutObjectCommand({
  //     Bucket: bucketName,
  //     Key: newFileName,
  //     Body: fs.readFileSync(file.path),
  //     ACL: "public-read",
  //     ContentType: mime.lookup(file.path),
  //   })
  // );
  // const link = `https://${bucketName}.s3.amazonaws.com/${newFileName}`;
  // links.push(link);
  // }

  return res.json({ images });
}

export const config = {
  api: { bodyParser: false },
};
