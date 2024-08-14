import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/router";
import { formatDistanceToNow } from "date-fns";

function Categories({ swal }) {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    setIsLoading(true);
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
      setIsLoading(false);
    });
  }

  async function fetchProducts(categoryId) {
    setIsProductLoading(true);
    const result = await axios.get(`/api/products?category=${categoryId}`);
    setProducts(result.data);
    setIsProductLoading(false);
  }

  async function saveCategory(ev) {
    ev.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
      })),
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put("/api/categories", data);
      setEditedCategory(null);
    } else {
      await axios.post("/api/categories", data);
    }
    setName("");
    setParentCategory("");
    setProperties([]);
    fetchCategories();
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(","),
      }))
    );
    fetchProducts(category._id);
  }

  async function deleteCategory(category) {
    // Fetch the products associated with the category
    const result = await axios.get(`/api/products?category=${category._id}`);
    const associatedProducts = result.data;

    // If there are associated products, warn the user
    if (associatedProducts.length > 0) {
      swal
        .fire({
          title: "Warning!",
          text: `The category "${category.name}" has ${associatedProducts.length} associated product(s). Deleting this category will also delete these products. Do you want to proceed?`,
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonText: "Yes, Delete!",
          confirmButtonColor: "#d55",
          reverseButtons: true,
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            await axios.delete(`/api/categories?_id=${category._id}`);
            fetchCategories();
            swal.fire(
              "Deleted!",
              `The category "${category.name}" and its associated products have been deleted.`,
              "success"
            );
          }
        });
    } else {
      // If no associated products, proceed with deletion
      swal
        .fire({
          title: "Are you sure?",
          text: `Do you want to delete the category "${category.name}"?`,
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonText: "Yes, Delete!",
          confirmButtonColor: "#d55",
          reverseButtons: true,
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            await axios.delete(`/api/categories?_id=${category._id}`);
            fetchCategories();
            swal.fire(
              "Deleted!",
              `The category "${category.name}" has been deleted.`,
              "success"
            );
          }
        });
    }
  }

  function deleteProduct(productId) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete this product?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete(`/api/products?id=${productId}`);
          fetchProducts(editedCategory._id);
        }
      });
  }

  function addProperty() {
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  }

  function handlePropertyNameChange(index, property, newName) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }

  function handlePropertyValuesChange(index, property, newValues) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  function removeProperty(indexToRemove) {
    setProperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }

  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : "Create new category"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder={"Category name"}
            onChange={(ev) => setName(ev.target.value)}
            value={name}
          />
          <select
            onChange={(ev) => setParentCategory(ev.target.value)}
            value={parentCategory}
          >
            <option value="">No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block">Properties</label>
          <button
            onClick={addProperty}
            type="button"
            className="btn-default text-sm mb-2"
          >
            Add new property
          </button>
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div className="flex gap-1 mb-2" key={`$${index}`}>
                <input
                  type="text"
                  value={property.name}
                  className="mb-0"
                  onChange={(ev) =>
                    handlePropertyNameChange(index, property, ev.target.value)
                  }
                  placeholder="property name (example: color)"
                />

                <input
                  type="text"
                  className="mb-0"
                  onChange={(ev) =>
                    handlePropertyValuesChange(index, property, ev.target.value)
                  }
                  value={property.values}
                  placeholder="values, comma separated"
                />
                <button
                  onClick={() => removeProperty(index)}
                  type="button"
                  className="btn-red"
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName("");
                setParentCategory("");
                setProperties([]);
                setProducts([]);
              }}
              className="btn-default"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary py-1">
            Save
          </button>
        </div>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Category name</td>
              <td>Parent category</td>
              <td>Last Edited</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4}>
                  <div className="py-4">
                    <Spinner fullWidth={true} />
                  </div>
                </td>
              </tr>
            )}
            {categories.length > 0 &&
              categories
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category?.parent?.name}</td>
                    <td>
                      {formatDistanceToNow(new Date(category.updatedAt), {
                        addSuffix: true,
                      })}
                    </td>

                    <td>
                      <button
                        onClick={() => editCategory(category)}
                        className="btn-default mr-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(category)}
                        className="btn-red"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      )}

      {products.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Products in {editedCategory?.name}
          </h2>
          {isProductLoading ? (
            <Spinner fullWidth={true} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} className="border p-4 rounded-lg">
                  <h3 className="font-semibold text-l text-black mb-2">
                    {product.title}
                  </h3>
                  <p className="text-gray-500 mb-4 overflow-hidden text-ellipsis whitespace-nowrap">
                    {product.description}
                  </p>
                  <div className="flex justify-between">
                    <button
                      onClick={() =>
                        router.push(`/products/edit/${product._id}`)
                      }
                      className="btn-primary"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="btn-red"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
