import axios from "axios";
import { router } from "next/router";
import { useState } from "react";

export default function ProductForm({
  title: currentTitle,
  description: currentDescription,
  price: currentPrice,
}) {
  const [title, setTitle] = useState(currentTitle || "");
  const [description, setDescription] = useState(currentDescription || "");
  const [price, setPrice] = useState(currentPrice || 0);
  const [returnHome, setReturnHome] = useState(false);

  async function createProduct(e) {
    e.preventDefault();
    const data = { title, description, price };
    await axios.post("/api/products", data);
    setReturnHome(true);
  }

  if (returnHome) {
    router.push("/products");
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
