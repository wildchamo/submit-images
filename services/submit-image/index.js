import AWS from "aws-sdk";

import * as XLSX from "xlsx";

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

export async function uploadFile(file, folderName = "manijauto") {
  const originalFileName = file.name;
  const sanitizedFileName = sanitizeFileName(
    originalFileName.split(".").slice(0, -1).join(".")
  );
  const fileExtension = sanitizeFileName(originalFileName.split(".").pop());

  const randomNumber = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  const newFileName = `${sanitizedFileName}_${randomNumber}.${fileExtension}`;

  const key = `${folderName}/${newFileName}`;

  const params = {
    Bucket: "refaccionesdotcom",
    Key: key,
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

async function listAllObjects(
  bucketName,
  continuationToken = null,
  allObjects = []
) {
  const params = {
    Bucket: bucketName,
    ContinuationToken: continuationToken,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    allObjects.push(...data.Contents);

    console.log("Objects listed: ", data.Contents.length);

    if (data.IsTruncated) {
      return listAllObjects(bucketName, data.NextContinuationToken, allObjects);
    } else {
      return allObjects;
    }
  } catch (error) {
    console.error("Error listing objects: ", error);
    throw error;
  }
}

async function generateExcelFromBucket(bucketName) {
  console.warn("arrancando");
  try {
    const objects = await listAllObjects(bucketName);
    const data = objects.map((obj) => ({
      name: getFileNameWithoutExtension(obj.Key),
      url: `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${obj.Key}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Files");
    XLSX.writeFile(workbook, "bucket_files.xlsx");

    console.log("Excel file generated successfully.");
  } catch (error) {
    console.error("Error generating Excel file: ", error);
  }
}

// generateExcelFromBucket("refaccionesdotcom");

function getFileNameWithoutExtension(fileName) {
  return fileName.split(".").slice(0, -1).join(".");
}
