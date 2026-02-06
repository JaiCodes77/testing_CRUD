import React, { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  const heroRef = useRef(null);
  const flowRef = useRef(null);

  const totalItems = useMemo(() => items.length, [items]);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".reveal-up", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.15
      });

      gsap.utils.toArray(".panel").forEach((panel) => {
        gsap.from(panel, {
          scrollTrigger: {
            trigger: panel,
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out"
        });
      });

      gsap.utils.toArray(".story-step").forEach((step, index) => {
        gsap.from(step, {
          scrollTrigger: {
            trigger: step,
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          x: index % 2 === 0 ? -40 : 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out"
        });
      });

      gsap.to(".parallax", {
        scrollTrigger: {
          trigger: ".parallax",
          start: "top bottom",
          scrub: true
        },
        y: -60
      });
    }, heroRef);

    const orbitSpin = gsap.to(".orbit", {
      rotate: 360,
      duration: 14,
      ease: "none",
      repeat: -1
    });

    const flowAnimation = gsap.to(".story-wave", {
      x: 18,
      y: -12,
      duration: 2.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });

    return () => {
      ctx.revert();
      orbitSpin.kill();
      flowAnimation.kill();
    };
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
    <div className="page" ref={heroRef}>
      <header className="hero">
        <div className="hero-text">
          <p className="badge reveal-up">FastAPI + React CRUD</p>
          <h1 className="reveal-up">Build momentum with a clean CRUD flow.</h1>
          <p className="hero-subtitle reveal-up">
            Practice the fundamentals: create, read, update, and delete
            records with a stylish, scrollable experience.
          </p>
          <div className="hero-actions reveal-up">
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
            <button
              className="ghost"
              onClick={() =>
                document.querySelector("#story")?.scrollIntoView({
                  behavior: "smooth"
                })
              }
            >
              See the Story
            </button>
            <span className="stats">{totalItems} items tracked</span>
          </div>
        </div>
        <div className="hero-card parallax">
          <div className="glow" />
          <div className="card-inner">
            <div className="orbit">
              <div className="orbit-dot" />
            </div>
            <h2>Beginner Friendly</h2>
            <p>
              This dashboard is intentionally simple so you can focus on how
              FastAPI and React talk to each other.
            </p>
            <div className="pill-row">
              <span>FastAPI</span>
              <span>SQLModel</span>
              <span>SQLite</span>
              <span>React</span>
            </div>
          </div>
        </div>
      </header>

      <section id="story" className="story">
        <div className="story-header">
          <h2>Make your first API feel cinematic.</h2>
          <p>
            Scroll through the flow and see how a simple CRUD app becomes a
            real product. Each step highlights a core FastAPI skill.
          </p>
        </div>
        <div className="story-grid">
          {[
            {
              title: "Model the data",
              text: "Define a clean SQLModel schema and keep your types aligned."
            },
            {
              title: "Create confidently",
              text: "POST requests validate input and store it in SQLite."
            },
            {
              title: "Read with clarity",
              text: "List and fetch items with predictable response models."
            },
            {
              title: "Update smoothly",
              text: "PUT actions feel instant with partial updates and UI sync."
            },
            {
              title: "Delete safely",
              text: "Remove items with clear status feedback and refreshes."
            },
            {
              title: "Ship the UI",
              text: "A stylish front end makes the learning feel rewarding."
            }
          ].map((step, index) => (
            <div key={step.title} className="story-step">
              <span className="step-index">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
        <div className="story-wave" ref={flowRef}>
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="feature-band">
        <div className="feature-card">
          <h3>FastAPI patterns</h3>
          <p>See clean CRUD routes, models, and dependency patterns.</p>
        </div>
        <div className="feature-card">
          <h3>Front-end polish</h3>
          <p>Beautiful UI and motion so the project feels alive.</p>
        </div>
        <div className="feature-card">
          <h3>SQLite simplicity</h3>
          <p>No extra services. Your data lives right in the repo.</p>
        </div>
      </section>

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
