import { useState, useEffect } from "react";
import Spinner from "@/components/Spinner";

export default function ShippingBoxForm({ box, onSave, onCancel, isLoading }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (box) {
      setName(box.name || "");
      setDescription(box.description || "");
      setLength(box.dimensions?.length || "");
      setWidth(box.dimensions?.width || "");
      setHeight(box.dimensions?.height || "");
      setMaxWeight(box.maxWeight || "");
      setIsDefault(box.isDefault || false);
    } else {
      // Reset form when no box is selected
      setName("");
      setDescription("");
      setLength("");
      setWidth("");
      setHeight("");
      setMaxWeight("");
      setIsDefault(false);
    }
  }, [box]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const data = {
      name,
      description,
      dimensions: {
        length: parseFloat(length) || 0,
        width: parseFloat(width) || 0,
        height: parseFloat(height) || 0,
      },
      maxWeight: parseFloat(maxWeight) || 0,
      isDefault,
    };

    if (box?._id) {
      data._id = box._id;
    }

    onSave(data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-4 mb-4">
        <div className="grow">
          <label>Box Name</label>
          <input
            type="text"
            placeholder="Box name"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
        </div>
        <div className="grow">
          <label>Maximum Weight (lbs)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="Max weight"
            value={maxWeight}
            onChange={(ev) => setMaxWeight(ev.target.value)}
          />
        </div>
      </div>

      <div className="mb-4">
        <label>Description</label>
        <textarea
          placeholder="Box description"
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
        />
      </div>

      <div className="mb-4">
        <label>Dimensions (cm)</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="Length"
            value={length}
            onChange={(ev) => setLength(ev.target.value)}
          />
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="Width"
            value={width}
            onChange={(ev) => setWidth(ev.target.value)}
          />
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="Height"
            value={height}
            onChange={(ev) => setHeight(ev.target.value)}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(ev) => setIsDefault(ev.target.checked)}
          />
          Set as default box
        </label>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? <Spinner /> : box ? "Update" : "Create"}
        </button>
        {box && (
          <button type="button" onClick={onCancel} className="btn-default">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
