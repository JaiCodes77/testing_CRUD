import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8000";

const emptyForm = {
  name: "",
  description: "",
  price: ""
};

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const totalItems = useMemo(() => items.length, [items]);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error("Failed to load items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price)
    };

    if (!payload.name || Number.isNaN(payload.price)) {
      setError("Please provide a name and a valid price.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/items${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) throw new Error("Failed to save item");
      await loadItems();
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price)
    });
  }

  async function handleDelete(itemId) {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/items/${itemId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete item");
      await loadItems();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditingId(null);
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-text">
          <p className="badge">FastAPI + React CRUD</p>
          <h1>Build momentum with a clean CRUD flow.</h1>
          <p className="hero-subtitle">
            Practice the fundamentals: create, read, update, and delete
            records with a stylish UI.
          </p>
          <div className="hero-actions">
            <button
              className="primary"
              onClick={() =>
                document.querySelector("#items-section")?.scrollIntoView({
                  behavior: "smooth"
                })
              }
            >
              Jump to Items
            </button>
            <span className="stats">{totalItems} items tracked</span>
          </div>
        </div>
        <div className="hero-card">
          <div className="glow" />
          <div className="card-inner">
            <h2>Beginner Friendly</h2>
            <p>
              This dashboard is intentionally simple so you can focus on how
              FastAPI and React talk to each other.
            </p>
            <div className="pill-row">
              <span>FastAPI</span>
              <span>SQLModel</span>
              <span>SQLite</span>
            </div>
          </div>
        </div>
      </header>

      <main id="items-section" className="content">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{editingId ? "Edit item" : "Add a new item"}</h2>
              <p>Update your inventory in real time.</p>
            </div>
            {editingId && (
              <button className="ghost" onClick={handleCancel}>
                Cancel edit
              </button>
            )}
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Coffee Beans"
                required
              />
            </label>
            <label>
              Description
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Single origin, light roast"
              />
            </label>
            <label>
              Price
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="12.50"
                inputMode="decimal"
                required
              />
            </label>
            <button type="submit" className="primary">
              {editingId ? "Save changes" : "Add item"}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel list">
          <div className="panel-header">
            <div>
              <h2>Items</h2>
              <p>Your current list from SQLite.</p>
            </div>
            <button className="ghost" onClick={loadItems}>
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="muted">Loading items...</p>
          ) : items.length === 0 ? (
            <p className="muted">No items yet. Add your first one!</p>
          ) : (
            <div className="table">
              {items.map((item) => (
                <div key={item.id} className="row">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.description || "No description"}</p>
                  </div>
                  <div className="row-actions">
                    <span className="price">${item.price.toFixed(2)}</span>
                    <button className="ghost" onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button
                      className="danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
