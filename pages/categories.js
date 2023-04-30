import { useState } from "react";
import Layout from "./../components/Layout";
import axios from "axios";
import { useEffect } from "react";
import { Category } from "./../models/Category";
export default function Categories() {
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    getCategories();
  }, []);

  function getCategories() {
    axios.get("/api/categories").then((response) => {
      setCategories(response.data);
    });
  }

  async function saveCategory(e) {
    e.preventDefault();
    const data = { name, parentCategory };
    if (editingCategory) {
      // Forward category id to server
      data._id = editingCategory._id;
      await axios.put("/api/categories", data);
      setEditingCategory(null);
    } else {
      await axios.post("/api/categories", data);
    }
    setName("");
    getCategories();
  }

  function editCategory(category) {
    setEditingCategory(category);
    setName(category.name);
    setParentCategory(category?.parent?._id);
  }

  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editingCategory
          ? `Editing category "${editingCategory.name}"`
          : "New category name"}
      </label>
      {parentCategory}
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            className="mb-0"
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></input>
          <select
            className="mb-0"
            value={parentCategory}
            onChange={(e) =>
              setParentCategory(e.target.value || null)
            } /*HACK: Using null for unsetting values in server */
          >
            <option value="">No parent category</option>
            {categories?.length > 0 &&
              categories.map((category) => (
                <option value={category._id} key={category._id + category.name}>
                  {category.name}
                </option>
              ))}
          </select>
          <button type="submit" className="btn-primary">
            Save
          </button>
        </div>
      </form>
      <table className="primary mt-4">
        <thead>
          <tr>
            <td>Category name</td>
            <td>Category parent</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {categories?.length > 0 &&
            categories.map((category) => (
              <tr key={"cata" + category.name}>
                <td>{category.name}</td>
                <td>{category?.parent?.name}</td>
                <td>
                  <button
                    onClick={() => editCategory(category)}
                    className="btn-primary mr-1"
                  >
                    Edit
                  </button>
                  <button className="btn-primary ">Delete</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  );
}
