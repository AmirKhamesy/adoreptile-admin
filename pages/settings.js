import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { withSwal } from "react-sweetalert2";
import SeedProgress from "@/components/SeedProgress";

const PickupLocationPicker = dynamic(
  () => import("@/components/PickupLocationPicker"),
  { ssr: false }
);

function SettingsPage({ swal }) {
  const [products, setProducts] = useState([]);
  const [featuredProductId, setFeaturedProductId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shippingFee, setShippingFee] = useState("");
  const [pickupLocation, setPickupLocation] = useState(null);
  const [pickupTitle, setPickupTitle] = useState("");
  const [seedSteps, setSeedSteps] = useState([]);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchAll().then(() => {
      setIsLoading(false);
    });
  }, []);

  async function fetchAll() {
    await axios.get("/api/products").then((res) => {
      setProducts(res.data);
    });
    await axios.get("/api/settings?name=featuredProductId").then((res) => {
      setFeaturedProductId(res.data.value);
    });
    await axios.get("/api/settings?name=shippingFee").then((res) => {
      setShippingFee(res.data.value);
    });
    await axios.get("/api/settings?name=pickupLocation").then((res) => {
      if (res.data?.value) {
        setPickupLocation(res.data.value);
        setPickupTitle(res.data.value.title || "");
      }
    });
  }

  async function saveSettings() {
    setIsLoading(true);
    await axios.put("/api/settings", {
      name: "featuredProductId",
      value: featuredProductId,
    });
    await axios.put("/api/settings", {
      name: "shippingFee",
      value: shippingFee,
    });
    await axios.put("/api/settings", {
      name: "pickupLocation",
      value: pickupLocation ? { ...pickupLocation, title: pickupTitle } : null,
    });
    setIsLoading(false);
    await swal.fire({
      title: "Settings saved!",
      icon: "success",
    });
  }

  async function seedDatabase() {
    setIsSeeding(true);
    const steps = [
      {
        title: "Reading Seed Data",
        message: "Loading configuration...",
        status: "pending",
      },
      {
        title: "Creating Categories",
        message: "Setting up product categories...",
        status: "pending",
      },
      {
        title: "Adding Products",
        message: "Populating product catalog...",
        status: "pending",
      },
      {
        title: "Setting Featured Product",
        message: "Configuring featured items...",
        status: "pending",
      },
    ];
    setSeedSteps(steps);

    try {
      // Step 1: Start seeding
      setSeedSteps((current) =>
        current.map((step, i) =>
          i === 0 ? { ...step, status: "completed" } : step
        )
      );

      const response = await axios.post("/api/seed");

      // Update steps based on the response
      if (response.data.categoriesAdded === 0) {
        setSeedSteps((current) =>
          current.map((step, i) =>
            i === 1
              ? {
                  ...step,
                  status: "skipped",
                  message: "Categories already exist",
                }
              : step
          )
        );
      } else {
        setSeedSteps((current) =>
          current.map((step, i) =>
            i === 1
              ? {
                  ...step,
                  status: "completed",
                  message: `Added ${response.data.categoriesAdded} categories`,
                }
              : step
          )
        );
      }

      if (response.data.productsAdded === 0) {
        setSeedSteps((current) =>
          current.map((step, i) =>
            i === 2
              ? {
                  ...step,
                  status: "skipped",
                  message: "Products already exist",
                }
              : step
          )
        );
      } else {
        setSeedSteps((current) =>
          current.map((step, i) =>
            i === 2
              ? {
                  ...step,
                  status: "completed",
                  message: `Added ${response.data.productsAdded} products`,
                }
              : step
          )
        );
      }

      setSeedSteps((current) =>
        current.map((step, i) =>
          i === 3
            ? {
                ...step,
                status: "completed",
                message: "Featured product configured",
              }
            : step
        )
      );

      await fetchAll();

      setTimeout(() => {
        setIsSeeding(false);
        swal.fire({
          title: "Database seeded!",
          icon: "success",
        });
      }, 1000);
    } catch (error) {
      console.error("Seed error:", error);
      setIsSeeding(false);
      swal.fire({
        title: "Error",
        text: "Failed to seed database",
        icon: "error",
      });
    }
  }

  return (
    <Layout>
      <h1>Settings</h1>
      {isLoading && <Spinner />}
      {!isLoading && (
        <>
          <label>Featured product</label>
          <select
            value={featuredProductId}
            onChange={(ev) => setFeaturedProductId(ev.target.value)}
          >
            {products.length > 0 &&
              products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.title}
                </option>
              ))}
          </select>
          <label>Shipping price (in usd)</label>
          <input
            type="number"
            value={shippingFee}
            onChange={(ev) => setShippingFee(ev.target.value)}
          />

          <h2>Pick Up Location</h2>
          <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.75rem" }}>
            Set a location where customers can pick up their order for free. Leave blank to disable the pickup option.
          </p>
          <label>Location Title (e.g. &quot;Our Store&quot;, &quot;Warehouse&quot;)</label>
          <input
            type="text"
            placeholder="e.g. Our Store"
            value={pickupTitle}
            onChange={(ev) => setPickupTitle(ev.target.value)}
          />
          <label>Pin location on map</label>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.5rem" }}>
            Search for an address or click/drag the pin on the map to set the exact pickup spot.
          </p>
          <PickupLocationPicker
            value={pickupLocation}
            onChange={(loc) => setPickupLocation(loc)}
          />

          <div className="flex justify-between" style={{ marginTop: "1.5rem" }}>
            <button onClick={saveSettings} className="btn-primary">
              Save settings
            </button>
            <button
              onClick={seedDatabase}
              className="btn-default"
              disabled={isSeeding}
            >
              {isSeeding ? "Seeding..." : "Seed Database"}
            </button>
          </div>

          {isSeeding && seedSteps.length > 0 && (
            <div className="mt-8">
              <SeedProgress steps={seedSteps} />
            </div>
          )}
        </>
      )}
      <style jsx>{`
        .mt-8 {
          margin-top: 2rem;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </Layout>
  );
}

export default withSwal(({ swal }) => <SettingsPage swal={swal} />);
