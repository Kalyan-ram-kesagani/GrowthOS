import { useEffect, useRef, useState } from "react";

import {
  Pencil,
  Trash2,
  CalendarDays,
  Plus,
  X,
  Upload,
} from "lucide-react";

import Card from "../components/Card";
import { api } from "../services/api";
import { useToast } from "../components/Toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

function DataPage({
  type,
  title,
  description,
  icon: Icon,
  fields,
  collapsibleForm = false,
}) {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const loadRequestId = useRef(0);

  const loadItems = async () => {
    const requestId = ++loadRequestId.current;

    try {
      setLoading(true);
      setLoadError("");

      const data = await api.get(`/${type}`);

      if (!Array.isArray(data)) {
        throw new Error(`Invalid response while loading ${title.toLowerCase()}.`);
      }

      if (requestId !== loadRequestId.current) return;
      setItems([...data].reverse());
    } catch (error) {
      if (requestId !== loadRequestId.current) return;

      console.error(
        `Error loading ${type}:`,
        error
      );

      setItems([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : `Unable to load ${title.toLowerCase()}.`
      );
    } finally {
      if (requestId === loadRequestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setForm({});
    setEditingId(null);
    setIsFormOpen(false);
    loadItems();
    return () => {
      loadRequestId.current += 1;
    };
  }, [type]);

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({});
    setEditingId(null);
    if (collapsibleForm) {
      setIsFormOpen(false);
    }
  };

  const saveItem = async () => {
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

      if (!editingId) {
        await api.post(
          `/${type}`,
          payload
        );
      } else {
        await api.put(
          `/${type}/${editingId}`,
          payload
        );
      }

      resetForm();

      await loadItems();
    } catch (error) {
      console.error(
        `Error saving ${type}:`,
        error
      );

      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    const editData = {};

    fields.forEach((field) => {
      editData[field.name] =
        item[field.name] ?? "";
    });

    setForm(editData);
    setEditingId(item.id);
    setIsFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteItem = async (id) => {
    const deletedItem = items.find((i) => i.id === id);
    const label = deletedItem
      ? deletedItem.name || deletedItem.title || deletedItem.company || "Item"
      : "Item";

    try {
      await api.delete(`/${type}/${id}`);

      if (editingId === id) {
        resetForm();
      }

      await loadItems();

      addToast(`"${label}" moved to recycle bin`, "info", {
        duration: 6000,
        action: {
          onClick: async () => {
            try {
              await api.post(`/recycle-bin/${type}/${id}/restore`);
              await loadItems();
              addToast(`"${label}" restored successfully`, "success");
            } catch (err) {
              addToast("Failed to restore item.", "error");
            }
          },
        },
      });
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      addToast("Failed to delete this item.", "error");
    }
  };

  const getItemTitle = (item) => {
    return (
      item.name ||
      item.title ||
      item.full_name ||
      item.organization ||
      "Untitled"
    );
  };

  const isFormVisible = !collapsibleForm || isFormOpen;

  return (
    <div
      className={`page module dataPage${
        collapsibleForm ? " certificatesPage" : ""
      }`}
    >

      {/* PAGE HERO */}

      <div
        className={`moduleHeader dataPageHeader${
          collapsibleForm ? " dataPageHeaderWithAction" : ""
        }`}
      >

        <div className="dataPageHeading">
          <span className="eyebrow">
            <Icon size={15} />
            GROWTHOS {title.toUpperCase()}
          </span>

          <h1>{title}</h1>

          <p>
            {description}
          </p>
        </div>

        {collapsibleForm && (
          <button
            type="button"
            className="addCertificateBtn"
            disabled={saving}
            onClick={() => {
              if (isFormOpen) {
                resetForm();
              } else {
                setIsFormOpen(true);
              }
            }}
            aria-expanded={isFormOpen}
            aria-controls={isFormOpen ? "data-entry-form" : undefined}
          >
            {isFormOpen ? <X size={17} /> : <Plus size={17} />}
            {isFormOpen ? "Close" : "Add New Certificate"}
          </button>
        )}
      </div>


      {/* ADD / EDIT FORM */}

      {isFormVisible && (
      <div className="formCenter" id="data-entry-form">

        <Card className="dataForm">

          <div className="formTitle">

            <div className="formTitleContent">

              <div className="formIcon">
                <Icon size={22} />
              </div>

              <div>

                <h2>
                  {editingId
                    ? `Edit ${title.replace(/s$/, "")}`
                    : `Add New ${title.replace(/s$/, "")}`}
                </h2>

                <p>
                  {editingId
                    ? "Update your information below."
                    : `Add your ${title
                        .replace(/s$/, "")
                        .toLowerCase()} information to GrowthOS.`}
                </p>

              </div>

            </div>

            {editingId && (

              <button
                type="button"
                className="closeEditBtn"
                onClick={resetForm}
                disabled={saving}
                title="Cancel editing"
              >
                <X size={18} />
              </button>

            )}

          </div>


          {/* FORM FIELDS */}

          <div className="formFields">

            {fields.map((field) => {

              if (field.type === "select") {
                return (

                  <div
                    className="formGroup"
                    key={field.name}
                  >

                    <label>
                      {field.label ||
                        field.name}
                    </label>

                    <select
                      value={
                        form[field.name] ??
                        field.default ??
                        field.options?.[0] ??
                        ""
                      }
                      onChange={(e) =>
                        handleChange(
                          field.name,
                          e.target.value
                        )
                      }
                    >

                      {field.options?.map(
                        (option) => (

                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                );
              }


              if (field.type === "textarea") {
                return (

                  <div
                    className="formGroup fullWidth"
                    key={field.name}
                  >

                    <label>
                      {field.label ||
                        field.name}
                    </label>

                    <textarea
                      placeholder={
                        field.placeholder
                      }
                      value={
                        form[field.name] || ""
                      }
                      onChange={(e) =>
                        handleChange(
                          field.name,
                          e.target.value
                        )
                      }
                    />

                  </div>

                );
              }


              if (field.type === "file") {
                const imageUrl = form[field.name] || "";
                return (

                  <div
                    className="formGroup fullWidth"
                    key={field.name}
                  >

                    <label>
                      {field.label ||
                        field.name}
                    </label>

                    <div className="fileUploadArea">

                      {imageUrl && (
                        <div className="filePreview">
                          <img
                            src={imageUrl.startsWith("http") ? imageUrl : `${API_BASE_URL}${imageUrl}`}
                            alt="Preview"
                            className="filePreviewImage"
                          />
                        </div>
                      )}

                      <label className="fileUploadBtn">
                        <Upload size={16} />
                        {field.buttonText || "Upload File"}
                        <input
                          type="file"
                          accept="image/*"
                          className="fileInput"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const result = await api.upload(file);
                              handleChange(field.name, result.url);
                              addToast("File uploaded successfully.", "success");
                            } catch (err) {
                              console.error("Upload failed:", err);
                              addToast("Failed to upload file. Please try again.", "error");
                            }
                          }}
                        />
                      </label>

                    </div>

                  </div>

                );
              }


              return (

                <div
                  className="formGroup"
                  key={field.name}
                >

                  <label>
                    {field.label ||
                      field.name}
                  </label>

                  <input
                    type={
                      field.type || "text"
                    }
                    placeholder={
                      field.placeholder
                    }
                    min={
                      field.type === "number"
                        ? 1
                        : undefined
                    }
                    max={
                      field.type === "number"
                        ? 100
                        : undefined
                    }
                    value={
                      form[field.name] ?? ""
                    }
                    onChange={(e) => {
                      let value =
                        e.target.value;

                      if (
                        field.type === "number" &&
                        value !== ""
                      ) {
                        value = Math.min(
                          100,
                          Math.max(
                            1,
                            Number(value)
                          )
                        );
                      }

                      handleChange(
                        field.name,
                        value
                      );
                    }}
                  />

                </div>

              );
            })}

          </div>


          {/* FORM ACTIONS */}

          <div className="formActions">

            {editingId && (

              <button
                type="button"
                className="cancelBtn"
                onClick={resetForm}
                disabled={saving}
              >
                <X size={17} />
                Cancel
              </button>

            )}

            <button
              type="button"
              className="saveBtn"
              onClick={saveItem}
              disabled={saving}
            >

              <Plus size={17} />

              {saving
                ? "Saving..."
                : editingId
                ? "Update Item"
                : "Add Item"}

            </button>

          </div>

        </Card>

      </div>
      )}


      {/* ITEMS SECTION */}

      <div className="dataItemsSection">
        <div className="dataItemsHeader">
          {!loading && !loadError && (
            <span className="itemCount">
              {items.length}{" "}
              {items.length === 1
                ? "item"
                : "items"}
            </span>
          )}
        </div>


        <div className="moduleGrid">
          {loading ? (
            <div className="emptyState loadingState">
              Loading your information...
            </div>

          ) : loadError ? (
            <div className="emptyState loadErrorState" role="alert">
              <h3>Unable to load {title.toLowerCase()}</h3>
              <p>{loadError}</p>
              <button
                type="button"
                className="retryBtn"
                onClick={loadItems}
              >
                Try again
              </button>
            </div>

          ) : items.length === 0 ? (
            <div className="emptyState">

              <div className="emptyStateIcon">
                <Icon size={26} />
              </div>

              <h3>
                No {title.toLowerCase()} yet
              </h3>

              <p>
                {collapsibleForm
                  ? "Add your first certificate using the button above."
                  : "Add your first item using the form above."}
              </p>

            </div>

          ) : (

            items.map((item) => collapsibleForm ? (
              <Card
                key={item.id}
                className="moduleCard dataItemCard certificateCard"
              >
                <div className="certificatePreview">
                  {item.image_url ? (
                    <img
                      src={item.image_url.startsWith("http") ? item.image_url : `${API_BASE_URL}${item.image_url}`}
                      alt={getItemTitle(item)}
                      className="certImage"
                    />
                  ) : (
                    <div className="certificatePreviewEmpty">
                      <Icon size={34} />
                      <span>No certificate image</span>
                    </div>
                  )}
                </div>

                <div className="certificateInfo">
                  <h3>{getItemTitle(item)}</h3>

                  {item.organization && (
                    <p className="certificateOrganization">
                      Issued by {item.organization}
                    </p>
                  )}

                  <div className="itemCreated">
                    <CalendarDays size={16} />
                    <span>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Recently added"}
                    </span>
                  </div>

                  <div className="cardActions">
                    <button
                      type="button"
                      className="editBtn"
                      onClick={() => startEdit(item)}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="deleteBtn"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card
                key={item.id}
                className="moduleCard dataItemCard"
              >
                <div className="dataCardTop">
                  <div className="dataCardIcon">
                    <Icon size={21} />
                  </div>
                  {item.status && (
                    <span className="statusBadge">
                      {item.status}
                    </span>
                  )}
                </div>

                {item.image_url && (
                  <div className="certImageContainer">
                    <img
                      src={item.image_url.startsWith("http") ? item.image_url : `${API_BASE_URL}${item.image_url}`}
                      alt={getItemTitle(item)}
                      className="certImage"
                    />
                  </div>
                )}

                <h3>{getItemTitle(item)}</h3>

                {item.professional_title && (
                  <p className="itemHighlight">
                    {item.professional_title}
                  </p>
                )}

                {item.description && (
                  <p className="cardDescription">
                    {item.description}
                  </p>
                )}

                {item.content && (
                  <p className="cardDescription">
                    {item.content}
                  </p>
                )}

                {item.email && (
                  <p className="itemDetail">
                    {item.email}
                  </p>
                )}

                {item.phone && (
                  <p className="itemDetail">
                    {item.phone}
                  </p>
                )}

                {item.location && (
                  <p className="itemDetail">
                    {item.location}
                  </p>
                )}

                {item.category && (
                  <p className="itemMeta">
                    Category:
                    <span>
                      {item.category}
                    </span>
                  </p>
                )}

                {item.organization && (
                  <p className="itemMeta">
                    Organization:
                    <span>
                      {item.organization}
                    </span>
                  </p>
                )}

                {item.description && (
                  <p className="itemMeta">
                    <span>
                      {item.description}
                    </span>
                  </p>
                )}

                <div className="itemCreated">
                  <CalendarDays size={16} />
                  <span>
                    Created:{" "}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Recently added"}
                  </span>
                </div>

                <div className="cardActions">
                  <button
                    type="button"
                    className="editBtn"
                    onClick={() => startEdit(item)}
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="deleteBtn"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </Card>
            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default DataPage;