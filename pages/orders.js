import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";

function OrderTypeBadge({ orderType }) {
  const isPickup = orderType === "pickup";
  const isShipping = orderType === "delivery";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: isPickup ? "#dcfce7" : "#dbeafe",
        color: isPickup ? "#15803d" : "#1d4ed8",
      }}
    >
      {isPickup ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      ) : (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )}
      {isPickup ? "Pickup" : isShipping ? "Shipping" : "Delivery"}
    </span>
  );
}

function PaidBadge({ paid }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "0.7rem",
        fontWeight: 600,
        background: paid ? "#dcfce7" : "#fee2e2",
        color: paid ? "#15803d" : "#dc2626",
      }}
    >
      {paid ? (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
      {paid ? "Paid" : "Unpaid"}
    </span>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios.get("/api/orders").then((response) => {
      setOrders(response.data);
      setIsLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Orders</h1>
        <span
          style={{
            fontSize: "0.8rem",
            color: "#6b7280",
            background: "#f3f4f6",
            padding: "4px 12px",
            borderRadius: "20px",
          }}
        >
          {orders.length} total
        </span>
      </div>

      {isLoading && (
        <div style={{ padding: "3rem 0" }}>
          <Spinner fullWidth={true} />
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div
          style={{ textAlign: "center", padding: "4rem 0", color: "#9ca3af" }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: "0 auto 1rem", display: "block", opacity: 0.4 }}
          >
            <path d="M9 17H15M9 13H15M9 9H10M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z" />
          </svg>
          <p style={{ fontSize: "0.95rem" }}>No orders yet</p>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "1.25rem 1.5rem",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                display: "grid",
                gridTemplateColumns: "140px 1fr 1fr auto",
                gap: "1.25rem",
                alignItems: "center",
              }}
            >
              {/* Date + badges */}
              <div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  {formatDate(order.createdAt)}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <PaidBadge paid={order.paid} />
                  <OrderTypeBadge orderType={order.orderType} />
                </div>
              </div>

              {/* Recipient */}
              <div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: "0.2rem",
                  }}
                >
                  {order.name}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#6b7280",
                    marginBottom: "0.15rem",
                  }}
                >
                  {order.email}
                </div>
                {order.orderType !== "pickup" && (
                  <div style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                    {[
                      order.streetAddress,
                      order.city,
                      order.postalCode,
                      order.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
              </div>

              {/* Products */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "3px" }}
              >
                {order.line_items?.map((l, i) => (
                  <div
                    key={`${l.price_data?.product_data?.name}-${i}`}
                    style={{ fontSize: "0.8rem", color: "#374151" }}
                  >
                    <span style={{ fontWeight: 500 }}>
                      {l.price_data?.product_data?.name}
                    </span>
                    <span style={{ color: "#9ca3af", marginLeft: "4px" }}>
                      × {l.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order total */}
              <div style={{ textAlign: "right", minWidth: "70px" }}>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  $
                  {order.line_items
                    ?.reduce(
                      (sum, l) =>
                        sum + (l.price_data?.unit_amount * l.quantity) / 100,
                      0,
                    )
                    .toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#9ca3af",
                    marginTop: "2px",
                  }}
                >
                  USD
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
