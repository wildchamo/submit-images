"use client";
import ImagesInput from "@/components/images-input";
import { uploadFile } from "@/services/submit-image";

import * as XLSX from "xlsx";

import { useState } from "react";

export default function SubmitImagesForm() {
  const [files, setFiles] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const handleUpload = async () => {
    setIsLoading(true);
    try {
      const imagesReadyToPrint = await uploadImages(files);

      console.log("imagesReadyToPrint", imagesReadyToPrint);
      generateExcel(imagesReadyToPrint);
    } catch (error) {
      console.error("Error subiendo las imágenes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold">
        Sube las imagenes para retornar el excel con los links a las mismas
      </h2>
      <ImagesInput id={"refacciones"} files={files} setFiles={setFiles} />

      <button
        onClick={handleUpload}
        className="flex justify-center items-center bg-primaryBlue hover:bg-primaryBlueHover w-full h-10 text-center text-white font-bold py-2 px-4 rounded focus:outline-none cursor-pointer"
      >
        {isLoading ? "Cargando..." : "Subir"}
      </button>
    </section>
  );
}

const uploadImages = async (imagesArray) => {
  let imagesLinks = [];
  for (let image of imagesArray) {
    const url = await uploadFile(image);
    imagesLinks.push({ name: image.name, url });
  }
  return imagesLinks;
};

const generateExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Images");

  XLSX.writeFile(workbook, "images.xlsx");
};
