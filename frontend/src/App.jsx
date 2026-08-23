import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [vehicles, setVehicles] = useState([]);
  const [message, setMessage] = useState("");

  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // ADMIN
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // VEHICLE FORM
  const [editingId, setEditingId] = useState(null);

  const [vehicleForm, setVehicleForm] = useState({
    make: "",
    model: "",
    category: "",
    price: "",
    quantity: "",
  });

  // --------------------------------
  // GET ROLE FROM JWT
  // --------------------------------

  function getRoleFromToken(accessToken) {
    try {
      const payload = JSON.parse(
        atob(accessToken.split(".")[1])
      );

      return payload.role;
    } catch {
      return null;
    }
  }

  // --------------------------------
  // LOGIN / REGISTER
  // --------------------------------

  async function handleAuth(e) {
    e.preventDefault();
    setMessage("");

    try {
      if (isRegister) {
        const response = await fetch(
          `${API_URL}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              password,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Registration failed"
          );
        }

        setMessage(
          "Registration successful! Please login."
        );

        setIsRegister(false);
        setName("");
        setPassword("");
      } else {
        const formData = new URLSearchParams();

        formData.append("username", email);
        formData.append("password", password);

        const response = await fetch(
          `${API_URL}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Login failed"
          );
        }

        localStorage.setItem(
          "token",
          data.access_token
        );

        const role = getRoleFromToken(
          data.access_token
        );

        setIsAdmin(role === "admin");
        setToken(data.access_token);
        setMessage("Login successful! 🎉");
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  // --------------------------------
  // GET VEHICLES
  // --------------------------------

  async function fetchVehicles() {
    try {
      const response = await fetch(
        `${API_URL}/api/vehicles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load vehicles"
        );
      }

      setVehicles(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    if (token) {
      const role = getRoleFromToken(token);

      setIsAdmin(role === "admin");

      fetchVehicles();
    }
  }, [token]);

  // --------------------------------
  // PURCHASE VEHICLE
  // --------------------------------

  async function purchaseVehicle(id) {
    try {
      const response = await fetch(
        `${API_URL}/api/vehicles/${id}/purchase`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Purchase failed"
        );
      }

      setMessage(
        "Vehicle purchased successfully! 🚗"
      );

      fetchVehicles();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // --------------------------------
  // DELETE VEHICLE
  // --------------------------------

  async function deleteVehicle(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/vehicles/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Delete failed"
        );
      }

      setMessage(
        "Vehicle deleted successfully! 🗑️"
      );

      fetchVehicles();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // --------------------------------
  // ADD / UPDATE VEHICLE
  // --------------------------------

  async function saveVehicle(e) {
    e.preventDefault();

    try {
      const url = editingId
        ? `${API_URL}/api/vehicles/${editingId}`
        : `${API_URL}/api/vehicles`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          make: vehicleForm.make,
          model: vehicleForm.model,
          category: vehicleForm.category,
          price: Number(vehicleForm.price),
          quantity: Number(vehicleForm.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Operation failed"
        );
      }

      setMessage(
        editingId
          ? "Vehicle updated successfully! ✏️"
          : "Vehicle added successfully! ➕"
      );

      clearVehicleForm();
      fetchVehicles();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // --------------------------------
  // EDIT VEHICLE
  // --------------------------------

  function editVehicle(vehicle) {
    setEditingId(vehicle.id);

    setVehicleForm({
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: vehicle.price,
      quantity: vehicle.quantity,
    });

    setShowAdminPanel(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------
  // RESTOCK VEHICLE
  // --------------------------------

  async function restockVehicle(id) {
    const amount = window.prompt(
      "Enter quantity to restock:"
    );

    if (!amount) {
      return;
    }

    const quantity = Number(amount);

    if (quantity <= 0) {
      setMessage(
        "Restock quantity must be greater than 0."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/vehicles/${id}/restock?quantity=${quantity}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Restock failed"
        );
      }

      setMessage(
        "Vehicle restocked successfully! 📦"
      );

      fetchVehicles();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // --------------------------------
  // CLEAR FORM
  // --------------------------------

  function clearVehicleForm() {
    setEditingId(null);

    setVehicleForm({
      make: "",
      model: "",
      category: "",
      price: "",
      quantity: "",
    });
  }

  // --------------------------------
  // LOGOUT
  // --------------------------------

  function logout() {
    localStorage.removeItem("token");

    setToken(null);
    setVehicles([]);
    setIsAdmin(false);
    setShowAdminPanel(false);
    setMessage("");
  }

  // --------------------------------
  // FILTER VEHICLES
  // --------------------------------

  const filteredVehicles = vehicles.filter(
    (vehicle) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        vehicle.make
          .toLowerCase()
          .includes(searchText) ||
        vehicle.model
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "" ||
        vehicle.category
          .toLowerCase() ===
          category.toLowerCase();

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  const categories = [
    ...new Set(
      vehicles.map(
        (vehicle) => vehicle.category
      )
    ),
  ];

  // ========================================
  // LOGIN PAGE
  // ========================================

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

          <div className="text-center mb-8">

            <div className="text-5xl mb-3">
              🚗
            </div>

            <h1 className="text-3xl font-bold text-slate-800">
              CarDealership
            </h1>

            <p className="text-gray-500 mt-2">
              {isRegister
                ? "Create your account"
                : "Manage your vehicle inventory"}
            </p>

          </div>

          <form
            onSubmit={handleAuth}
            className="space-y-4"
          >

            {isRegister && (
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Enter your name"
                />

              </div>
            )}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="admin@gmail.com"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="Enter password"
              />

            </div>

            <button
              type="submit"
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition"
            >
              {isRegister
                ? "Create Account"
                : "Login"}
            </button>

          </form>

          {message && (
            <p className="text-center text-sm mt-5 text-slate-600">
              {message}
            </p>
          )}

          <div className="text-center mt-6">

            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setMessage("");
              }}
              className="text-slate-700 hover:text-slate-900 hover:underline text-sm font-medium"
            >
              {isRegister
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ========================================
  // DASHBOARD
  // ========================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ================================
          NAVBAR
      ================================= */}

      <nav className="bg-slate-800 text-white shadow-md">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <span className="text-3xl">
              🚗
            </span>

            <div>

              <h1 className="text-xl font-bold">
                CarDealership
              </h1>

              <p className="text-xs text-slate-400">
                Inventory Management
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            {isAdmin && (
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                👑 Admin
              </span>
            )}

            <button
              onClick={logout}
              className="bg-slate-600 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* ================================
          MAIN
      ================================= */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>

            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">
              Dealership Dashboard
            </p>

            <h2 className="text-3xl font-bold text-slate-800 mt-1">
              Vehicle Inventory
            </h2>

            <p className="text-slate-500 mt-1">
              Browse and manage available vehicles.
            </p>

          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setShowAdminPanel(
                  !showAdminPanel
                );

                if (showAdminPanel) {
                  clearVehicleForm();
                }
              }}
              className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-3 rounded-lg font-semibold shadow-sm transition"
            >
              {showAdminPanel
                ? "Close Admin Panel"
                : "⚙️ Admin Panel"}
            </button>
          )}

        </div>

        {/* MESSAGE */}

        {message && (
          <div className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            {message}
          </div>
        )}

        {/* ================================
            ADMIN PANEL
        ================================= */}

        {isAdmin && showAdminPanel && (

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">

            <h3 className="text-2xl font-bold text-slate-800 mb-5">

              {editingId
                ? "✏️ Update Vehicle"
                : "➕ Add New Vehicle"}

            </h3>

            <form
              onSubmit={saveVehicle}
              className="grid md:grid-cols-2 lg:grid-cols-5 gap-4"
            >

              <input
                type="text"
                placeholder="Make"
                value={vehicleForm.make}
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    make: e.target.value,
                  })
                }
                required
                className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />

              <input
                type="text"
                placeholder="Model"
                value={vehicleForm.model}
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    model: e.target.value,
                  })
                }
                required
                className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />

              <input
                type="text"
                placeholder="Category"
                value={vehicleForm.category}
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    category: e.target.value,
                  })
                }
                required
                className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />

              <input
                type="number"
                placeholder="Price"
                value={vehicleForm.price}
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    price: e.target.value,
                  })
                }
                required
                min="0"
                className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />

              <input
                type="number"
                placeholder="Quantity"
                value={vehicleForm.quantity}
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    quantity: e.target.value,
                  })
                }
                required
                min="0"
                className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />

              <div className="lg:col-span-5 flex gap-3">

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  {editingId
                    ? "Update Vehicle"
                    : "Add Vehicle"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={clearVehicleForm}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>

          </div>
        )}

        {/* ================================
            SEARCH
        ================================= */}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-8">

          <div className="grid md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="🔍 Search by make or model..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >

              <option value="">
                All Categories
              </option>

              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* COUNT */}

        <div className="mb-5">

          <p className="text-slate-600">

            Showing{" "}

            <span className="font-bold text-slate-800">
              {filteredVehicles.length}
            </span>{" "}

            vehicles

          </p>

        </div>

        {/* ================================
            VEHICLES
        ================================= */}

        {filteredVehicles.length === 0 ? (

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">

            <div className="text-5xl mb-4">
              🚘
            </div>

            <h3 className="text-xl font-semibold text-slate-800">
              No vehicles found
            </h3>

            <p className="text-slate-500 mt-2">
              Try changing your search or category filter.
            </p>

          </div>

        ) : (

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredVehicles.map(
              (vehicle) => {

                const lowStock =
                  vehicle.quantity > 0 &&
                  vehicle.quantity <= 2;

                return (

                  <div
                    key={vehicle.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 transition overflow-hidden"
                  >

                    {/* CARD HEADER */}

                    <div className="bg-gradient-to-r from-slate-700 to-indigo-800 p-6 text-white">

                      <div className="flex justify-between">

                        <div>

                          <p className="text-slate-300 text-sm">
                            {vehicle.category}
                          </p>

                          <h3 className="text-2xl font-bold mt-1">
                            {vehicle.make}
                          </h3>

                          <p className="text-lg text-slate-200">
                            {vehicle.model}
                          </p>

                        </div>

                        <span className="text-4xl">
                          🚗
                        </span>

                      </div>

                    </div>

                    {/* CARD BODY */}

                    <div className="p-6">

                      <div className="flex justify-between mb-5">

                        <div>

                          <p className="text-sm text-slate-500">
                            Price
                          </p>

                          <p className="text-2xl font-bold text-slate-900">
                            ${Number(
                              vehicle.price
                            ).toLocaleString()}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-sm text-slate-500">
                            In Stock
                          </p>

                          <p
                            className={`text-2xl font-bold ${
                              vehicle.quantity === 0
                                ? "text-red-500"
                                : lowStock
                                ? "text-amber-500"
                                : "text-emerald-600"
                            }`}
                          >
                            {vehicle.quantity}
                          </p>

                        </div>

                      </div>

                      {/* STOCK STATUS */}

                      {vehicle.quantity === 0 ? (

                        <div className="mb-5 inline-block bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
                          Out of Stock
                        </div>

                      ) : lowStock ? (

                        <div className="mb-5 inline-block bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold">
                          Low Stock
                        </div>

                      ) : (

                        <div className="mb-5 inline-block bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
                          In Stock
                        </div>

                      )}

                      {/* PURCHASE */}

                      <button
                        disabled={
                          vehicle.quantity === 0
                        }
                        onClick={() =>
                          purchaseVehicle(
                            vehicle.id
                          )
                        }
                        className={`w-full py-3 rounded-xl font-semibold mb-4 transition ${
                          vehicle.quantity === 0
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-slate-700 hover:bg-slate-800 text-white shadow-sm"
                        }`}
                      >
                        {vehicle.quantity === 0
                          ? "Out of Stock"
                          : "🛒 Purchase Vehicle"}
                      </button>

                      {/* ADMIN BUTTONS */}

                      {isAdmin && (

                        <div className="grid grid-cols-3 gap-2">

                          <button
                            onClick={() =>
                              editVehicle(
                                vehicle
                              )
                            }
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 py-2 rounded-lg text-sm font-semibold transition"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() =>
                              restockVehicle(
                                vehicle.id
                              )
                            }
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-2 rounded-lg text-sm font-semibold transition"
                          >
                            📦 Restock
                          </button>

                          <button
                            onClick={() =>
                              deleteVehicle(
                                vehicle.id
                              )
                            }
                            className="bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold transition"
                          >
                            🗑️ Delete
                          </button>

                        </div>

                      )}

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </main>

    </div>
  );
}

export default App;