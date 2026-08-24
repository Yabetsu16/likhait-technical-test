import React, { useEffect, useState } from "react";
import { Modal, Button, TextField } from "../vibes";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../services/api";
import { COLORS } from "../constants/colors";

interface Category {
  id: number;
  name: string;
}

interface CategoriesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onChange?: () => void;
}

export default function CategoriesManager({ isOpen, onClose, onChange }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newName, setNewName] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const created = await createCategory(name);
      setCategories((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      setNewName("");
      if (onChange) onChange();
    } catch (err: any) {
      alert(err.message || "Failed to create category");
    }
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditingName(c.name);
  };

  const saveEdit = async (id: number) => {
    const name = editingName.trim();
    if (!name) return;
    try {
      const updated = await updateCategory(id, name);
      setCategories((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
      setEditingName("");
    if (onChange) onChange();
    } catch (err: any) {
    alert(err.message || "Failed to update category");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category? This cannot be undone if no expenses reference it.")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (onChange) onChange();
    } catch (err: any) {
      alert(err.message || "Failed to delete category");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories">
      <div style={{ padding: "0.5rem 0" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <TextField
            placeholder="New category"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
          />
          <Button type="button" variant="primary" onClick={handleCreate} disabled={!newName.trim()}>
            Add
          </Button>
        </div>

        <div style={{ maxHeight: "40vh", overflow: "auto" }}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            categories.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", borderBottom: `1px solid ${COLORS.secondary.s04}` }}>
                {editingId === c.id ? (
                  <>
                    <TextField value={editingName} onChange={(e) => setEditingName(e.target.value)} fullWidth />
                    <Button type="button" variant="primary" onClick={() => saveEdit(c.id)} disabled={!editingName.trim()}>
                      Save
                    </Button>
                    <Button type="button" variant="secondary" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>{c.name}</div>
                    <Button type="button" variant="secondary" onClick={() => startEdit(c)}>
                      Edit
                    </Button>
                    <Button type="button" variant="danger" onClick={() => handleDelete(c.id)}>
                      Remove
                    </Button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
