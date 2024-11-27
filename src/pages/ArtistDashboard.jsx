import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

// Profile Settings Component (Similar to UserDashboard)
function ProfileSettings() {
  const { currentUser, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName:
      typeof currentUser?.firstName === "string" ? currentUser.firstName : "",
    lastName:
      typeof currentUser?.lastName === "string" ? currentUser.lastName : "",
    location: currentUser?.location || "",
    profilePhoto: currentUser?.profilePhoto || "",
  });
  const [photoPreview, setPhotoPreview] = useState(currentUser?.profilePhoto || "");
  const [isEditing, setIsEditing] = useState(false);

  // Reuse your existing displayName function
  const displayName = () => {
    let firstName = currentUser?.firstName;
    let lastName = currentUser?.lastName;
    if (Array.isArray(firstName)) {
      firstName = firstName[0];
    }
    if (lastName && typeof lastName === "object") {
      firstName = lastName.firstName || firstName;
      lastName = lastName.lastName;
    }
    if (!firstName && !lastName) {
      return "No name set";
    }
    return `${firstName || ""} ${lastName || ""}`.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const previewURL = URL.createObjectURL(file);
        setPhotoPreview(previewURL);
        setFormData(prev => ({
          ...prev,
          profilePhoto: file
        }));
        toast.success("Profile photo updated successfully");
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to upload photo");
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Artist Data</h2>
      {!isEditing ? (
        <>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side - Artist Details */}
            <div className="flex-1 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Artist Information</h3>
                <div className="space-y-2">
                  <p className="font-bold text-gray-600">
                    Frame artist since:{" "}
                    <span className="font-normal">
                      {new Date(currentUser?.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="font-bold text-gray-600">
                    Location:{" "}
                    <span className="font-normal">
                      {currentUser?.location || "No location set"}
                    </span>
                  </p>
                  <p className="font-bold text-gray-600">
                    Email:{" "}
                    <span className="font-normal">{currentUser?.email || ""}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Photo and Name */}
            <div className="w-full md:w-1/3 text-center">
              <div className="bg-gray-50 p-4 rounded-lg h-full flex flex-col items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Artist profile"
                    className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{displayName()}</h3>
                <p className="text-gray-600 mb-4">Artist</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
            >
              Edit Profile
            </button>
            <label className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              Update Photo
            </label>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="mt-1 w-full p-2 border rounded"
              placeholder="City, Country"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-black px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Bio Settings Component (New for Artists)
function BioSettings() {
  const { currentUser, updateProfile } = useAuth();
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ bio });
      setIsEditing(false);
      toast.success("Bio updated successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update bio");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Artist Bio</h2>
      {!isEditing ? (
        <div className="space-y-4">
          <p className="text-gray-600">{bio || "No bio set"}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
          >
            Edit Bio
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 border rounded min-h-[200px]"
            placeholder="Tell us about yourself and your art..."
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-black px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Artwork Management Component (New for Artists)
function ArtworkManagement() {
  const [artworks, setArtworks] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newArtwork, setNewArtwork] = useState({
    title: "",
    date: "",
    price: "",
    description: "",
    tags: "",
    image: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement artwork upload to Firebase
      // const imageUrl = await uploadArtworkImage(newArtwork.image);
      // const artworkData = {
      //   ...newArtwork,
      //   imageUrl,
      //   createdAt: new Date().toISOString()
      // };
      // await saveArtwork(artworkData);
      setArtworks([...artworks, newArtwork]);
      setIsAddingNew(false);
      setNewArtwork({
        title: "",
        date: "",
        price: "",
        description: "",
        tags: "",
        image: null,
      });
      toast.success("Artwork added successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add artwork");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Artist Artwork</h2>

      {!isAddingNew ? (
        <div className="space-y-6">
          {/* Display existing artworks */}
          {artworks.map((artwork, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {artwork.image && (
                  <div className="w-full md:w-1/3">
                    <img
                      src={URL.createObjectURL(artwork.image)}
                      alt={artwork.title}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{artwork.title}</h3>
                  <p className="text-gray-600">Date: {artwork.date}</p>
                  <p className="text-green-600 font-bold">Price: ${artwork.price}</p>
                  <p className="text-gray-700 mt-2">{artwork.description}</p>
                  <div className="mt-2">
                    {artwork.tags.split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setIsAddingNew(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
          >
            Add New Artwork
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={newArtwork.title}
              onChange={(e) =>
                setNewArtwork((prev) => ({ ...prev, title: e.target.value }))
              }
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={newArtwork.date}
              onChange={(e) =>
                setNewArtwork((prev) => ({ ...prev, date: e.target.value }))
              }
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              value={newArtwork.price}
              onChange={(e) =>
                setNewArtwork((prev) => ({ ...prev, price: e.target.value }))
              }
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={newArtwork.description}
              onChange={(e) =>
                setNewArtwork((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="mt-1 w-full p-2 border rounded"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <input
              type="text"
              value={newArtwork.tags}
              onChange={(e) =>
                setNewArtwork((prev) => ({ ...prev, tags: e.target.value }))
              }
              className="mt-1 w-full p-2 border rounded"
              placeholder="Separate tags with commas"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Artwork Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewArtwork((prev) => ({ ...prev, image: e.target.files[0] }))
              }
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
            >
              Save Artwork
            </button>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="bg-gray-200 text-black px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Artwork Management Component (New for Artists)
function ArtworkSales() {
  const [sales, setSales] = useState([
    {
      artworkTitle: "Sample Artwork 1",
      date: "2024-03-15",
      amount: 500
    },
    {
      artworkTitle: "Sample Artwork 2",
      date: "2024-03-10",
      amount: 750
    }
  ]);

  // Fetch sales data from Firebase
  useEffect(() => {
    // TODO: Implement fetching sales data
    // const fetchSales = async () => {
    //   const salesData = await getSalesData();
    //   setSales(salesData);
    // };
    // fetchSales();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sales Dashboard</h2>
      <div className="space-y-4">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-bold text-gray-600">Total Sales</h3>
            <p className="text-2xl font-bold">
              ${sales.reduce((acc, sale) => acc + sale.amount, 0)}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-gray-600">Artworks Sold</h3>
            <p className="text-2xl font-bold">{sales.length}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-bold text-gray-600">Average Sale Price</h3>
            <p className="text-2xl font-bold">
              $
              {sales.length > 0
                ? (
                    sales.reduce((acc, sale) => acc + sale.amount, 0) /
                    sales.length
                  ).toFixed(2)
                : 0}
            </p>
          </div>
        </div>

        {/* Recent Sales */}
        <div>
          <h3 className="font-bold text-gray-600 mb-2">Recent Sales</h3>
          <div className="space-y-2">
            {sales.map((sale, index) => (
              <div key={index} className="p-4 bg-white border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{sale.artworkTitle}</p>
                    <p className="text-sm text-gray-600">
                      Sold on {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-green-600">${sale.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Artist Dashboard Component
export default function ArtistDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const { logout } = useAuth();

  return (
    <div className="container mx-left py-8">
      <h1 className="text-3xl font-bold mb-4">Artist Dashboard</h1>

      <button
        onClick={logout}
        className="w-auto text-left px-4 py-2 mb-8 rounded bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors duration-300"
      >
        Logout
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "profile"
                ? "bg-green-100 text-green-800 font-bold"
                : "hover:bg-gray-100"
            }`}
          >
            Artist Data
          </button>
          <button
            onClick={() => setActiveTab("bio")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "bio"
                ? "bg-green-100 text-green-800 font-bold"
                : "hover:bg-gray-100"
            }`}
          >
            Artist Bio
          </button>
          <button
            onClick={() => setActiveTab("artwork")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "artwork"
                ? "bg-green-100 text-green-800 font-bold"
                : "hover:bg-gray-100"
            }`}
          >
            Artist Artwork
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "sales"
                ? "bg-green-100 text-green-800 font-bold"
                : "hover:bg-gray-100"
            }`}
          >
            Sales Dashboard
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-lg shadow p-6 max-w-2xl mx-left">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "bio" && <BioSettings />}
          {activeTab === "artwork" && <ArtworkManagement />}
          {activeTab === "sales" && <ArtworkSales />}
        </div>
      </div>
    </div>
  );
}
