import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios.get("/api/products").then((response) => {
      setProducts(response.data);
      setIsLoading(false);
    });
  }, []);

  function formatDiscount(discount) {
    const formattedValue =
      discount.type === "percentage"
        ? `${discount.value}%`
        : `$${parseFloat(discount.value).toFixed(2)}`;
    return (
      <div className="flex items-center text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-green-600 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>
          Buy {discount.quantity}+ items:{" "}
          <span className="font-medium">{formattedValue} off</span>
        </span>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium mb-0">Products</h1>
        <Link className="btn-primary flex items-center" href={"/products/new"}>
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
          Add new product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-12 gap-2 p-4 border-b border-gray-200 bg-gray-50 font-medium text-sm text-gray-600">
          <div className="col-span-4">PRODUCT</div>
          <div className="col-span-2">BASE PRICE</div>
          <div className="col-span-4">DISCOUNTS</div>
          <div className="col-span-2">ACTIONS</div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Spinner />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {products.map((product) => (
              <div
                key={product._id}
                className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-gray-50"
              >
                <div className="col-span-4">
                  <div className="font-medium text-gray-900">
                    {product.title}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                </div>
                <div className="col-span-4">
                  <div className="space-y-1">
                    {product.discounts?.length > 0 ? (
                      product.discounts
                        .sort((a, b) => a.quantity - b.quantity)
                        .map((discount, i) => (
                          <div key={i}>{formatDiscount(discount)}</div>
                        ))
                    ) : (
                      <span className="text-sm text-gray-400">
                        No discounts
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-2 flex gap-2">
                  <Link
                    className="btn-default !py-1.5 !px-2.5"
                    href={"/products/edit/" + product._id}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                  </Link>
                  <Link
                    className="btn-red !py-1.5 !px-2.5"
                    href={"/products/delete/" + product._id}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
