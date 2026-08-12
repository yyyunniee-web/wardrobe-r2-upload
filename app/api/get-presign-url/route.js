import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const { fileName, contentType } = await request.json();
    const key = `clothes/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return Response.json({ uploadUrl, key });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "生成签名链接失败" }, { status: 500 });
  }
}
