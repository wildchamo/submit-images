import AWS from "aws-sdk";

const awsAccessKey = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const awsSecretKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.NEXT_PUBLIC_AWS_REGION;

const s3 = new AWS.S3({
  accessKeyId: awsAccessKey,
  secretAccessKey: awsSecretKey,
  region: awsRegion,
});

function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_\-\.]/g, "");
}

export async function uploadFile(file) {
  const originalFileName = file.name;
  const sanitizedFileName = sanitizeFileName(
    originalFileName.split(".").slice(0, -1).join(".")
  );
  const fileExtension = sanitizeFileName(originalFileName.split(".").pop());

  const randomNumber = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  const newFileName = `${sanitizedFileName}_${randomNumber}.${fileExtension}`;

  const params = {
    Bucket: "refaccionesdotcom",
    Key: newFileName,
    Body: file,
    ContentType: file.type,
  };

  try {
    const data = await s3.upload(params).promise();
    console.log("File uploaded successfully: ", data.Location);
    return data.Location;
  } catch (error) {
    console.error("Error uploading file: ", error);
    throw error;
  }
}
