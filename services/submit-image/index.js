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

export async function uploadFile(file, folderName = "IDEMITSU") {
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
    return data.Location;
  } catch (error) {
    console.error("Error uploading file: ", error);
  }
}

async function listAllObjects(bucketName, prefix) {
  let objects = [];
  let continuationToken = null;

  try {
    do {
      const params = {
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      };

      const response = await s3.listObjectsV2(params).promise();
      objects = objects.concat(response.Contents);
      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : null;
    } while (continuationToken);

    return objects;
  } catch (error) {
    console.error("Error listing objects: ", error);
    throw error;
  }
}

export async function generateExcelFromBucket(bucketName, folderPrefix) {
  try {
    const filteredObjects = await listAllObjects(bucketName, folderPrefix);

    const data = filteredObjects.map((obj) => ({
      name: getFileNameWithoutExtension(obj.Key),
      url: `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${obj.Key}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Files");
    XLSX.writeFile(workbook, `${folderPrefix}images.xlsx`);

    console.log("Excel file generated successfully.");
  } catch (error) {
    console.error("Error generating Excel file: ", error);
  }
}

// Llamada a la función con el bucket y el prefijo de la carpeta
//generateExcelFromBucket("refaccionesdotcom", "star/");

function getFileNameWithoutExtension(filePath) {
  const segments = filePath.split("/");
  const fileNameWithExtension = segments[segments.length - 1];

  const fileNameWithoutExtension = fileNameWithExtension
    .split(".")
    .slice(0, -1)
    .join(".");

  return fileNameWithoutExtension;
}

export async function listFolders() {
  let folders = [];
  let isTruncated = true;
  let continuationToken = null;

  try {
    while (isTruncated) {
      const params = {
        Bucket: "refaccionesdotcom",
        Delimiter: "/",
        ContinuationToken: continuationToken,
      };

      const data = await s3.listObjectsV2(params).promise();

      // Filtrar y mapear solo las carpetas
      if (data.CommonPrefixes) {
        folders = folders.concat(
          await Promise.all(
            data.CommonPrefixes.map(async (prefix) => {
              const folderName = prefix.Prefix;
              const fileCount = await countFilesInFolder(folderName);
              return `${folderName} (${fileCount}) archivos`;
            })
          )
        );
      }

      isTruncated = data.IsTruncated;
      continuationToken = data.NextContinuationToken;
    }

    console.log("Folders: ", folders);
    return folders;
  } catch (error) {
    console.error("Error listing folders: ", error);
    throw error;
  }
}

async function countFilesInFolder(folderName) {
  let fileCount = 0;
  let isTruncated = true;
  let continuationToken = null;

  try {
    while (isTruncated) {
      const params = {
        Bucket: "refaccionesdotcom",
        Prefix: folderName,
        ContinuationToken: continuationToken,
      };

      const data = await s3.listObjectsV2(params).promise();
      fileCount += data.KeyCount;

      isTruncated = data.IsTruncated;
      continuationToken = data.NextContinuationToken;
    }

    return fileCount;
  } catch (error) {
    console.error(`Error counting files in folder ${folderName}: `, error);
    throw error;
  }
}
