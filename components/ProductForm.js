import axios from "axios";
import { router } from "next/router";
import { useState, useEffect } from "react";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title: currentTitle,
  description: currentDescription,
  price: currentPrice,
  images: existingImages,
  category: currentCategory,
}) {
  const [title, setTitle] = useState(currentTitle || "");
  const [description, setDescription] = useState(currentDescription || "");
  const [price, setPrice] = useState(currentPrice || "");
  const [images, setImages] = useState(existingImages || []);
  const [returnHome, setReturnHome] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    axios.get("/api/categories").then((response) => {
      setCategories(response.data);
    });
  }, []);

  async function createProduct(e) {
    e.preventDefault();
    const data = { title, description, price, images, category };
    if (_id) {
      // Update
      await axios.put("/api/products", { ...data, _id });
    } else {
      // Create
      await axios.post("/api/products", data);
    }
    setReturnHome(true);
  }

  if (returnHome) {
    router.push("/products");
  }

  async function uploadImages(e) {
    const files = e.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      const response = await axios.post("/api/upload", data);
      const newImages = response.data.links;
      setImages((oldImages) => {
        return [...oldImages, ...newImages];
      });
      setIsUploading(false);
    }
  }

  function updateImageOrder(images) {
    setImages(images);
  }

  return (
    <form onSubmit={createProduct}>
      <label>Product name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      ></input>
      <label>Category</label>
      <select
        value={
          category || currentCategory._id
        } /*Show current category or newly selected one */
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Uncategorized</option>
        {categories.length > 0 &&
          categories
            .filter((category) => !!category.parent)
            .map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
      </select>
      <label>Photo</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImageOrder}
        >
          {!!images?.length &&
            images.map((image) => (
              <div key={image} className="h-24">
                <img src={image} alt="" className="rounded-lg" />
              </div>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="w-24 h-24 rounded-md flex items-center">
            <Spinner />
          </div>
        )}
        <label className="w-24 h-24 text-center flex items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Upload</div>
          <input onChange={uploadImages} type="file" className="hidden"></input>
        </label>
      </div>
      <label>Description</label>
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <label>Price (CAD)</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      ></input>
      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
}
