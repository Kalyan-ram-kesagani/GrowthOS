import { useEffect, useState } from "react";

import Card from "../components/Card";
import { api } from "../services/api";

function DataPage({
  type,
  title,
  description,
  icon: Icon,
  fields,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    try {
      setLoading(true);

      const data = await api.get(`/${type}`);

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [type]);

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const addItem = async () => {
    const payload = {};

    fields.forEach((field) => {
      if (field.type === "number") {
        payload[field.name] = Number(
          form[field.name] || 0
        );
      } else {
        payload[field.name] =
          form[field.name] ||
          field.default ||
          "";
      }
    });

    try {
      setSaving(true);

      await api.post(`/${type}`, payload);

      setForm({});

      await loadItems();
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    const confirmed = window.confirm(
      "Delete this item?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/${type}/${id}`);

      await loadItems();
    } catch (error) {
      console.error(
        `Error deleting ${type}:`,
        error
      );
    }
  };

  return (
    <div className="page module">
      <span className="eyebrow">
        <Icon size={15} />
        GROWTHOS MODULE
      </span>

      <h1>{title}</h1>

      <p>{description}</p>

      <Card className="coming">
        <h2>Add New</h2>

        {fields.map((field) => {
          if (field.type === "select") {
            return (
              <select
                key={field.name}
                value={
                  form[field.name] ||
                  field.default ||
                  field.options?.[0] ||
                  ""
                }
                onChange={(e) =>
                  handleChange(
                    field.name,
                    e.target.value
                  )
                }
              >
                {field.options?.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            );
          }

          if (field.type === "textarea") {
            return (
              <textarea
                key={field.name}
                placeholder={field.placeholder}
                value={form[field.name] || ""}
                onChange={(e) =>
                  handleChange(
                    field.name,
                    e.target.value
                  )
                }
              />
            );
          }

          return (
            <input
              key={field.name}
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={form[field.name] || ""}
              onChange={(e) =>
                handleChange(
                  field.name,
                  e.target.value
                )
              }
            />
          );
        })}

        <br />
        <br />

        <button
          onClick={addItem}
          disabled={saving}
        >
          {saving ? "Saving..." : "Add"}
        </button>
      </Card>

      <div className="moduleGrid">
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>
            No items yet. Add your first item!
          </p>
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              className="moduleCard"
            >
              <Icon />

              <h3>
                {item.name ||
                  item.title ||
                  "Untitled"}
              </h3>

              {item.description && (
                <p>{item.description}</p>
              )}

              {item.content && (
                <p>{item.content}</p>
              )}

              {item.category && (
                <p>
                  Category: {item.category}
                </p>
              )}

              {item.organization && (
                <p>
                  Organization:{" "}
                  {item.organization}
                </p>
              )}

              {item.level && (
                <p>
                  Level: {item.level}
                </p>
              )}

              {item.progress !== undefined && (
                <p>
                  Progress: {item.progress}%
                </p>
              )}

              {item.status && (
                <small>
                  Status: {item.status}
                </small>
              )}

              <br />
              <br />

              <button
                onClick={() =>
                  deleteItem(item.id)
                }
              >
                Delete
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default DataPage;