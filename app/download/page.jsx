"use client";
import { generateExcelFromBucket, listFolders } from "@/services/submit-image";
import { useState, useRef } from "react";

export default function DownloadPage() {
  const folderNameRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [folders, setFolders] = useState([]);

  const handleLoadFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const foldersList = await listFolders();
      console.log("foldersList", foldersList);
      setFolders(foldersList);
    } catch (error) {
      console.error("Error fetching folders: ", error);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let folderName = folderNameRef.current.value;

    if (!folderName.endsWith("/")) {
      folderName += "/";
    }

    await generateExcelFromBucket("refaccionesdotcom", folderName);
    setIsLoading(false);
  };

  return (
    <section className="grid place-content-center p-20">
      <h2 className="text-2xl font-bold mb-4">
        Descarga las imágenes que necesites para generar el archivo Excel. Solo
        ingresa el nombre de la carpeta en el siguiente campo.
      </h2>

      <label
        htmlFor="folderName"
        className="block text-lg font-medium text-gray-700 mb-2"
      >
        Nombre de la carpeta:
      </label>
      <input
        type="text"
        id="folderName"
        ref={folderNameRef}
        placeholder="Ingresa el nombre de la carpeta"
        className="mb-4 p-2 border border-gray-300 rounded w-full"
      />

      <button
        onClick={handleUpload}
        className="flex justify-center items-center bg-gray-600 hover:bg-gray-500 w-full h-10 text-center text-white font-bold py-2 px-4 rounded focus:outline-none cursor-pointer"
      >
        {isLoading ? "Cargando..." : "Descargar"}
      </button>

      <div className="mt-4">
        <h3 className="text-xl font-bold mb-2">Carpetas disponibles:</h3>

        <p>
          si deseas ver las carpetas existentes y cuantos archivos hay en cada
          una, clicka el siguiente boton!{" "}
        </p>

        <button
          onClick={handleLoadFolders}
          className="flex justify-center items-center bg-blue-600 hover:bg-blue-500 w-full h-10 text-center text-white font-bold py-2 px-4 rounded focus:outline-none cursor-pointer mt-4"
        >
          {isLoadingFolders ? "Cargando carpetas..." : "Cargar carpetas"}
        </button>
        <ul className="list-disc list-inside">
          {folders.map((folder, index) => (
            <li key={index}>{folder}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
