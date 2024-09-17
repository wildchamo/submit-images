export async function uploadImage(file) {
  let url;

  // = process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/";
  console.warn(file);
  const fileName = file.name.split(".").slice(0, -1).join(".");
  const fileExtension = file.name.split(".").pop();

  const randomNumber = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  const newFileName = `${fileName}_${randomNumber}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from("zorcesforms")
    .upload("/" + newFileName, file);
  if (error) {
    return error;
  } else {
    return url + data.fullPath;
  }
}
function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "_") // Reemplaza espacios con guiones bajos
    .replace(/[^a-z0-9_\-\.]/g, ""); // Elimina caracteres no permitidos
}

export async function uploadFile(file) {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/";
  console.warn(file);

  const sanitizedFileName = sanitizeFileName(
    file.name.split(".").slice(0, -1).join(".")
  );
  const fileExtension = file.name.split(".").pop();

  const randomNumber = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  const newFileName = `${sanitizedFileName}_${randomNumber}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from("zorcesforms")
    .upload("/" + newFileName, file);
  if (error) {
    return error;
  } else {
    return url + data.fullPath;
  }
}
