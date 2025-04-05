import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import ShippingBoxForm from "@/components/ShippingBoxForm";

function ShippingBoxesPage({ swal }) {
  const [boxes, setBoxes] = useState([]);
  const [editedBox, setEditedBox] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBoxes();
  }, []);

  function loadBoxes() {
    setIsLoading(true);
    axios.get("/api/shipping-boxes").then((response) => {
      setBoxes(response.data);
      setIsLoading(false);
    });
  }

  function editBox(box) {
    setEditedBox({ ...box });
  }

  async function saveBox(boxData) {
    setIsLoading(true);
    try {
      if (boxData._id) {
        await axios.put("/api/shipping-boxes", boxData);
      } else {
        await axios.post("/api/shipping-boxes", boxData);
      }
      setEditedBox(null);
      await loadBoxes();
    } catch (error) {
      swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          "An error occurred while saving the box",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function deleteBox(box) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete ${box.name}?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete("/api/shipping-boxes?id=" + box._id);
          loadBoxes();
        }
      });
  }

  return (
    <Layout>
      <h1>Shipping Boxes</h1>
      <h2>{editedBox ? "Edit Box" : "Add New Box"}</h2>
      <ShippingBoxForm
        box={editedBox}
        onSave={saveBox}
        onCancel={() => setEditedBox(null)}
        isLoading={isLoading}
      />
      <h2>Existing Boxes</h2>
      <table className="basic mt-4">
        <thead>
          <tr>
            <th>Box Name</th>
            <th>Dimensions (L×W×H cm)</th>
            <th>Max Weight</th>
            <th>Default</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {boxes.length > 0 &&
            boxes.map((box) => (
              <tr key={box._id}>
                <td>{box.name}</td>
                <td>
                  {box.dimensions.length}×{box.dimensions.width}×
                  {box.dimensions.height}
                </td>
                <td>{box.maxWeight} lbs</td>
                <td>{box.isDefault ? "Yes" : "No"}</td>
                <td>
                  <button
                    onClick={() => editBox(box)}
                    className="btn-default mr-2"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteBox(box)} className="btn-red">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  );
}

export default withSwal(({ swal }) => <ShippingBoxesPage swal={swal} />);
