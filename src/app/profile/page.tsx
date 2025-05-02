"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "@/services/auth.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = {
  lat: -34.6037, // Buenos Aires por defecto
  lng: -58.3816,
};

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
      zipCode: "",
      lat: undefined,
      lng: undefined
    }
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(user?.photoURL || "");
  const [file, setFile] = useState<File | null>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [autocomplete, setAutocomplete] = useState<any>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"]
  });

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        address: user.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          lat: undefined,
          lng: undefined
        }
      });
      setPreview(user.photoURL || "");
      if (user.address && user.address.lat && user.address.lng) {
        setMarker({ lat: user.address.lat, lng: user.address.lng });
      }
    }
  }, [user]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const fetchAddress = async (lat: number, lng: number) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    if (data.results && data.results[0]) {
      const address = data.results[0].address_components;
      const get = (type: string) => {
        const comp = address.find((c: any) => c.types.includes(type));
        return comp ? comp.long_name : '';
      };
      setForm((prev) => ({
        ...prev,
        address: {
          street: get('route') + ' ' + get('street_number'),
          city: get('locality') || get('administrative_area_level_2'),
          state: get('administrative_area_level_1'),
          zipCode: get('postal_code'),
          lat,
          lng
        }
      }));
    }
  };

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarker({ lat, lng });
        fetchAddress(lat, lng);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    let photoURL = form.photoURL;
    try {
      if (file) {
        const storageRef = ref(storage, `profile-pictures/${user.id}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
      }
      await updateUserProfile(user.id, {
        displayName: form.displayName,
        photoURL,
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
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-200 mb-2">
          <img
            src={preview || "/file.svg"}
            alt="Foto de perfil"
            className="w-full h-full object-cover"
          />
        </div>
        <label className="btn-secondary cursor-pointer mt-2">
          Cambiar foto
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona tu dirección en el mapa</label>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={marker || defaultCenter}
            zoom={marker ? 16 : 12}
            onClick={(e) => {
              const lat = e.latLng?.lat();
              const lng = e.latLng?.lng();
              if (lat && lng) {
                setMarker({ lat, lng });
                fetchAddress(lat, lng);
              }
            }}
            onLoad={() => setMapLoaded(true)}
          >
            {marker && <Marker position={marker} />}
          </GoogleMap>
        )}
        {form.address.street && (
          <div className="mt-2 text-gray-700 text-sm">
            <strong>Dirección seleccionada:</strong> {form.address.street}, {form.address.city}, {form.address.state}, {form.address.zipCode}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            name="displayName"
            className="input-field mt-1 bg-gray-100 text-gray-700"
            value={form.displayName}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            className="input-field mt-1 bg-gray-100 text-gray-500"
            value={form.email}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mt-4">Dirección de envío</label>
          {isLoaded && (
            <Autocomplete
              onLoad={setAutocomplete}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                className="input-field mt-1"
                placeholder="Escribe tu dirección..."
                value={form.address.street}
                onChange={e => setForm(prev => ({
                  ...prev,
                  address: { ...prev.address, street: e.target.value }
                }))}
              />
            </Autocomplete>
          )}
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
