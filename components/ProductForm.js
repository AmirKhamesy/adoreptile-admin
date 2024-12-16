import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
  discounts: existingDiscounts,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [category, setCategory] = useState(assignedCategory || "");
  const [productProperties, setProductProperties] = useState(
    assignedProperties || {}
  );
  const [price, setPrice] = useState(existingPrice || "");
  const [images, setImages] = useState(existingImages || []);
  const [discounts, setDiscounts] = useState(existingDiscounts || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [discountErrors, setDiscountErrors] = useState({});
  const [hasDiscountErrors, setHasDiscountErrors] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setCategoriesLoading(true);
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
      setCategoriesLoading(false);
    });
  }, []);

  useEffect(() => {
    // Ensure productProperties are initialized with default values
    if (categories.length > 0 && category) {
      let catInfo = categories.find(({ _id }) => _id === category);
      const newProductProps = { ...productProperties };

      catInfo.properties.forEach((p) => {
        if (!newProductProps[p.name]) {
          newProductProps[p.name] = p.values[0]; // Set default value to the first option
        }
      });

      setProductProperties(newProductProps);
    }
  }, [category, categories]);

  function validateDiscounts(discountsToValidate = discounts) {
    const errors = {};
    let hasErrors = false;

    // Check for duplicate quantities
    const quantities = new Set();
    discountsToValidate.forEach((discount, index) => {
      const quantity = discount.quantity?.toString();
      if (quantities.has(quantity)) {
        errors[index] = {
          ...errors[index],
          quantity: "Duplicate quantity tier",
        };
        hasErrors = true;
      }
      quantities.add(quantity);

      // Also mark the first occurrence of the duplicate as an error
      if (hasErrors) {
        const firstIndex = discountsToValidate.findIndex(
          (d) => d.quantity?.toString() === quantity
        );
        if (firstIndex !== index) {
          errors[firstIndex] = {
            ...errors[firstIndex],
            quantity: "Duplicate quantity tier",
          };
        }
      }
    });

    // Validate each discount
    discountsToValidate.forEach((discount, index) => {
      const currentErrors = {};

      // Quantity validation
      if (!discount.quantity || parseInt(discount.quantity) < 2) {
        currentErrors.quantity = "Quantity must be 2 or more";
        hasErrors = true;
      }

      // Value validation
      if (!discount.value || parseFloat(discount.value) <= 0) {
        currentErrors.value = "Discount must be greater than 0";
        hasErrors = true;
      }

      if (discount.type === "percentage" && parseFloat(discount.value) >= 100) {
        currentErrors.value = "Percentage cannot be 100% or more";
        hasErrors = true;
      }

      if (discount.type === "fixed") {
        const maxDiscount = parseFloat(price) * parseFloat(discount.quantity);
        if (parseFloat(discount.value) >= maxDiscount) {
          currentErrors.value = "Discount must be less than total price";
          hasErrors = true;
        }
      }

      // Calculate total discount percentage
      const totalPrice = parseFloat(price) * parseFloat(discount.quantity);
      let discountAmount;
      if (discount.type === "percentage") {
        discountAmount = totalPrice * (parseFloat(discount.value) / 100);
      } else {
        discountAmount = parseFloat(discount.value);
      }
      const discountPercentage = (discountAmount / totalPrice) * 100;

      if (discountPercentage > 50) {
        currentErrors.warning = "High discount warning";
      }

      if (Object.keys(currentErrors).length > 0) {
        errors[index] = {
          ...errors[index],
          ...currentErrors,
        };
      }
    });

    setDiscountErrors(errors);
    setHasDiscountErrors(hasErrors);
    return !hasErrors;
  }

  useEffect(() => {
    validateDiscounts();
  }, [discounts, price]);

  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      category,
      properties: productProperties,
      discounts,
    };
    if (_id) {
      //update
      await axios.put("/api/products", { ...data, _id });
    } else {
      //create
      await axios.post("/api/products", data);
    }
    setGoToProducts(true);
  }
  if (goToProducts) {
    router.push("/products");
  }
  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      const res = await axios.post("/api/upload", data);
      setImages((oldImages) => {
        return [...oldImages, ...res.data.links];
      });
      setIsUploading(false);
    }
  }
  function updateImagesOrder(images) {
    setImages(images);
  }
  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(
        ({ _id }) => _id === catInfo?.parent?._id
      );
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }

  function addDiscount() {
    const existingQuantities = new Set(
      discounts.map((d) => parseInt(d.quantity))
    );
    let newQuantity = 2;

    // Find the first available quantity that isn't used
    while (existingQuantities.has(newQuantity)) {
      newQuantity++;
    }

    const newDiscount = {
      quantity: newQuantity.toString(),
      type: "percentage",
      value: "5",
    };

    setDiscounts((prev) => {
      const newDiscounts = [...prev, newDiscount];
      // Immediately validate the new discounts
      setTimeout(() => validateDiscounts(newDiscounts), 0);
      return newDiscounts;
    });
  }

  function updateDiscount(index, field, value) {
    setDiscounts((prev) => {
      const newDiscounts = [...prev];
      newDiscounts[index] = {
        ...newDiscounts[index],
        [field]: value,
      };

      // Immediately validate the new discounts
      setTimeout(() => validateDiscounts(newDiscounts), 0);

      return newDiscounts;
    });
  }

  function removeDiscount(index) {
    setDiscounts((prev) => prev.filter((_, i) => i !== index));
  }

  const isFormValid = category && title && price && !hasDiscountErrors;

  return (
    <form onSubmit={saveProduct} className="max-w-4xl mx-auto">
      <label>Product name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />
      <label>Category</label>
      <select value={category} onChange={(ev) => setCategory(ev.target.value)}>
        <option value="">Uncategorized</option>
        {categories.length > 0 &&
          categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
      </select>
      {categoriesLoading && <Spinner />}
      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div key={p.name}>
            <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
            <div>
              <select
                value={productProperties[p.name]}
                onChange={(ev) => setProductProp(p.name, ev.target.value)}
              >
                {p.values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

      <label>Photos</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}
        >
          {!!images?.length &&
            images.map((link) => (
              <div
                key={link}
                className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
              >
                <img src={link} alt="" className="rounded-lg" />
              </div>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
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
          <div>Add image</div>
          <input type="file" onChange={uploadImages} className="hidden" />
        </label>
      </div>
      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(ev) => setDescription(ev.target.value)}
      />
      <label>Price (in USD)</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(ev) => setPrice(ev.target.value)}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-900">
              Quantity Discounts
            </h2>
            <button
              type="button"
              onClick={addDiscount}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Discount Tier
            </button>
          </div>

          {hasDiscountErrors && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please fix the following issues with your discounts:
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          {discounts.length === 0 && (
            <div className="text-center py-6">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4M12 4v16m8-8H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No discounts
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add a discount tier to encourage bulk purchases
              </p>
            </div>
          )}

          {discounts.map((discount, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg p-6 border ${
                discountErrors[index] ? "border-red-300" : "border-gray-200"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Quantity
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      min="2"
                      className={`shadow-sm block w-full sm:text-sm rounded-md ${
                        discountErrors[index]?.quantity
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-primary focus:border-primary"
                      }`}
                      value={discount.quantity}
                      onChange={(ev) =>
                        updateDiscount(index, "quantity", ev.target.value)
                      }
                    />
                    {discountErrors[index]?.quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {discountErrors[index].quantity}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Type
                  </label>
                  <div className="mt-1">
                    <select
                      className="shadow-sm block w-full sm:text-sm rounded-md border-gray-300 focus:ring-primary focus:border-primary"
                      value={discount.type}
                      onChange={(ev) =>
                        updateDiscount(index, "type", ev.target.value)
                      }
                    >
                      <option value="percentage">Percentage Off</option>
                      <option value="fixed">Fixed Amount Off</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {discount.type === "percentage"
                      ? "Discount Percentage"
                      : "Discount Amount"}
                  </label>
                  <div className="mt-1 relative">
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">
                          {discount.type === "percentage" ? "%" : "$"}
                        </span>
                      </div>
                      <input
                        type="number"
                        className={`block w-full rounded-md sm:text-sm pl-7 ${
                          discountErrors[index]?.value
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500 pr-10"
                            : "border-gray-300 focus:ring-primary focus:border-primary"
                        }`}
                        min="0"
                        max={
                          discount.type === "percentage"
                            ? "99.99"
                            : parseFloat(price) * parseFloat(discount.quantity)
                        }
                        step={discount.type === "percentage" ? "1" : "0.01"}
                        value={discount.value}
                        onChange={(ev) =>
                          updateDiscount(index, "value", ev.target.value)
                        }
                      />
                      {discountErrors[index]?.value && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg
                            className="h-5 w-5 text-red-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {discountErrors[index]?.value && (
                      <p className="mt-2 text-sm text-red-600">
                        {discountErrors[index].value}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeDiscount(index)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove
                </button>
              </div>

              {discountErrors[index]?.warning && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        High Discount Warning
                      </h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        This discount is over 50% of the total price. Please
                        verify this is intended.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        {!isFormValid && (
          <div className="text-sm text-gray-600">
            {!category && "Please select a category. "}
            {!title && "Please enter a product name. "}
            {!price && "Please enter a price. "}
            {hasDiscountErrors && "Please fix discount errors."}
          </div>
        )}
        <button
          type="submit"
          className="btn-primary ml-auto"
          disabled={!isFormValid}
        >
          Save
        </button>
      </div>
    </form>
  );
}
