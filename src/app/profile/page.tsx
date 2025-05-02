"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "@/services/auth.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",
    address: user?.address || {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }
  if (!user) {
    return <div className="text-center py-16">Debes iniciar sesión para ver tu perfil.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await updateUserProfile(user.id, {
        displayName: form.displayName,
        photoURL: form.photoURL,
        address: form.address
      });
      setSuccess(true);
    } catch (err) {
      setError("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            name="displayName"
            className="input-field mt-1"
            value={form.displayName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            className="input-field mt-1 bg-gray-100"
            value={form.email}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Foto de perfil (URL)</label>
          <input
            type="text"
            name="photoURL"
            className="input-field mt-1"
            value={form.photoURL}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              name="address.street"
              className="input-field mt-1"
              value={form.address.street}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ciudad</label>
            <input
              type="text"
              name="address.city"
              className="input-field mt-1"
              value={form.address.city}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Provincia</label>
            <input
              type="text"
              name="address.state"
              className="input-field mt-1"
              value={form.address.state}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Código Postal</label>
            <input
              type="text"
              name="address.zipCode"
              className="input-field mt-1"
              value={form.address.zipCode}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">¡Perfil actualizado!</div>}
        <button
          type="submit"
          className="btn-primary w-full mt-4"
          disabled={saving}
        >
          {saving ? <LoadingSpinner size="sm" /> : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
