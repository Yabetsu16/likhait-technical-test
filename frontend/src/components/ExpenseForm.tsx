/**
 * Form component for adding/editing expenses
 */

import React from "react";
import { ExpenseFormData } from "../types";
import { EXPENSE_CATEGORIES } from "../constants/categories";
import { TextField, SelectBox, Button } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { useEffect, useState } from "react";
import { fetchCategories, createCategory } from "../services/api";
import CategoriesManager from "./CategoriesManager";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit,
    });

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isManageOpen, setIsManageOpen] = useState(false);
  const categoryOptions = (categories.length ? categories.map((c) => ({ value: c.name, label: c.name })) : EXPENSE_CATEGORIES.map((category) => ({ value: category, label: category })))

  const refreshCategories = async () => {
    setLoadingCategories(true);
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err) {
      // ignore and keep hardcoded categories as fallback
      console.error("Failed to load categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    // initial load
    let mounted = true;
    (async () => {
      setLoadingCategories(true);
      try {
        const cats = await fetchCategories();
        if (mounted) setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      const created = await createCategory(name);
      // refresh category list and select the new one
      setCategories((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      handleChange("category", created.name);
      setNewCategoryName("");
    } catch (err: any) {
      alert(err.message || "Failed to create category");
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <TextField
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={formData.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        error={errors.amount}
        fullWidth
        required
      />

      <TextField
        label="Description"
        type="text"
        placeholder="Enter description"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        error={errors.description}
        fullWidth
        required
      />

      <SelectBox
        label="Category"
        options={categoryOptions}
        value={formData.category}
        onChange={(e) => handleChange("category", e.target.value)}
        error={errors.category}
        fullWidth
        required
      />

      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <TextField
              label="New category"
              type="text"
              placeholder="Add category"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              fullWidth
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="button"
              variant="primary"
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              style={{ marginBottom: '0.25rem' }}
            >
              Add
            </Button>
          </div>
        </div>

        <Button type="button" variant="primary" fullWidth onClick={() => setIsManageOpen(true)}>
          Manage
        </Button>
      </div>

      <CategoriesManager isOpen={isManageOpen} onClose={() => { setIsManageOpen(false); refreshCategories(); }} onChange={refreshCategories} />

      <TextField
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => handleChange("date", e.target.value)}
        error={errors.date}
        fullWidth
        required
        // Prevent selecting future dates in the date picker
        max={todayStr}
      />

      <TextField
        label="Payer"
        type="text"
        placeholder="Payer name"
        value={formData.payer_name ?? ""}
        onChange={(e) => handleChange("payer_name", e.target.value)}
        error={errors.payer_name}
        fullWidth
      />

      <div style={buttonGroupStyle}>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
