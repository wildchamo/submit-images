export default function ImagesInput({ id, files, setFiles }) {
  const handleFileChange = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setFiles([...files, ...event.target.files]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const newFiles = [...event.dataTransfer.files];
    setFiles([...files, ...newFiles]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const removeFile = (fileName, event) => {
    event.preventDefault();
    setFiles(files.filter((file) => file.name !== fileName));
  };

  return (
    <div className="pb-4">
      <div className="space-y-4">
        <div
          className="mt-4 flex justify-center rounded-md px-6 pb-6 pt-5 text-center text-gray-500 outline-dashed outline-2 transition-all duration-150 ease-in-out outline-gray-300"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            <div className="flex text-sm">
              <label
                htmlFor={id}
                className="relative cursor-pointer rounded-md font-medium text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-500"
              >
                <span className="font-bold">Upload a file</span>
                <input
                  id={id}
                  type="file"
                  name="files[]"
                  className="sr-only"
                  multiple
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
          </div>
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {files.map((file, index) => (
            <li key={index} className="flex justify-between">
              {file.name}
              <button
                onClick={(event) => {
                  event.preventDefault();
                  removeFile(file.name, event);
                }}
                className="ml-4 text-red-500"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
