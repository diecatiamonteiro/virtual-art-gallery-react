import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { IoMdAddCircleOutline } from "react-icons/io";

// Artist Data Settings Component
function ArtistDataSettings() {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    location: currentUser?.location || "",
    profilePhoto: currentUser?.profilePhoto || "",
    photoPreview: currentUser?.profilePhoto || "",
  });
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  // Define displayName function
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
    console.log("Form Data Before Submit:", formData); // Log form data before submission
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = e.target.result;
          
          // First update the preview
          setFormData((prev) => ({
            ...prev,
            photoPreview: base64String,
          }));

          // Immediately save the photo to backend
          try {
            await updateProfile({
              profilePhoto: base64String,
            });
            
            // Update the actual photo in state after successful upload
            setFormData((prev) => ({
              ...prev,
              profilePhoto: base64String,
            }));
            
            toast.success("Profile photo updated successfully");
          } catch (error) {
            console.error("Error saving photo:", error);
            toast.error("Failed to save profile photo");
            
            // Revert preview on error
            setFormData((prev) => ({
              ...prev,
              photoPreview: prev.profilePhoto,
            }));
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Failed to process photo");
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        location: currentUser.location || "",
        profilePhoto: currentUser.profilePhoto || "",
        photoPreview: currentUser.profilePhoto || "",
      }));
    }
  }, [currentUser]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Artist Data</h2>
      {!isEditing ? (
        <>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side - Artist Details */}
            <div className="flex-1 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <p className="font-bold text-gray-600">
                    Name: <span className="font-normal">{displayName()}</span>
                  </p>
                  <p className="font-bold text-gray-600">
                    Email:{" "}
                    <span className="font-normal">
                      {currentUser?.email || ""}
                    </span>
                  </p>
                  <p className="font-bold text-gray-600">
                    Location:{" "}
                    <span className="font-normal">
                      {currentUser?.location || "No location set"}
                    </span>
                  </p>
                  <p className="font-bold text-gray-600">
                    Frame artist since:{" "}
                    <span className="font-normal">
                      {new Date(currentUser?.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Photo and Name */}
            {formData.photoPreview && (
              <div className="w-full md:w-1/3 text-center">
                <div className="bg-gray-50 p-4 rounded-lg h-full flex flex-col items-center justify-center">
                  <img
                    src={formData.photoPreview}
                    alt="Artist profile"
                    className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                  />
                  <h3 className="text-xl font-bold mb-2">{displayName()}</h3>
                  <p className="text-gray-600 mb-4">Artist</p>
                  {/* Photo upload controls */}
                  <div className="flex flex-col gap-2">
                    <label className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      Choose Photo
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
            >
              Edit Profile
            </button>
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

// *******************************************************************************************
// Artist Bio Settings Component
function ArtistBioSettings({ bioData, setBioData }) {
  const { currentUser, updateProfile } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create an update object with just the bio
      const updateData = {
        bio: bioData.bio,
      };

      await updateProfile(updateData);

      setBioData((prev) => ({
        ...prev,
        statement: bioData.bio,
        isEditing: false,
      }));

      toast.success("Bio updated successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update bio");
    }
  };

  // Initialize bio data from currentUser when component mounts
  useEffect(() => {
    if (currentUser?.bio) {
      setBioData((prev) => ({
        ...prev,
        bio: currentUser.bio,
        statement: currentUser.bio,
      }));
    }
  }, [currentUser, setBioData]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Artist Bio</h2>
      {!bioData.isEditing ? (
        <div className="space-y-4">
          <p className="text-gray-600">{bioData.statement || "No bio set"}</p>
          <button
            onClick={() =>
              setBioData({
                ...bioData,
                isEditing: true,
                bio: bioData.statement, // Initialize edit field with current statement
              })
            }
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
          >
            Edit Bio
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={bioData.bio}
            onChange={(e) =>
              setBioData({
                ...bioData,
                bio: e.target.value,
              })
            }
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
              onClick={() =>
                setBioData({
                  ...bioData,
                  isEditing: false,
                  bio: bioData.statement, // Reset to original on cancel
                })
              }
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

// *******************************************************************************************
// Artist Artwork Settings Component
function ArtistArtworkSettings({ artworkData, setArtworkData }) {
  const navigate = useNavigate();
  const {
    currentUser,
    saveArtwork,
    getArtistArtworks,
    deleteArtwork,
    updateArtwork,
  } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // Will store artwork ID being edited

  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const artworksData = await getArtistArtworks();
        setArtworks(artworksData);
      } catch (error) {
        toast.error("Failed to load artworks");
      }
    };

    loadArtworks();
  }, [getArtistArtworks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert tags string to array before saving
      const formattedArtwork = {
        ...artworkData,
        tags: artworkData.tags
          ? artworkData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      const savedArtwork = await saveArtwork(formattedArtwork);
      setArtworks((prev) => [...prev, savedArtwork]);
      setIsAddingNew(false);
      setArtworkData({
        title: "",
        date: "",
        price: "",
        size: {
          width: "",
          height: "",
        },
        description: "",
        tags: "",
        image: null,
        imagePreview: null,
      });
      toast.success("Artwork added successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add artwork");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setArtworkData((prev) => ({
          ...prev,
          image: file,
          imagePreview: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishArtwork = async (artwork) => {
    try {
      const publishData = {
        id: artwork.id,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        alt_description: artwork.title || "",
        urls: {
          regular: artwork.imageUrl,
          small: artwork.imageUrl,
        },
        user: {
          name:
            currentUser?.firstName + " " + currentUser?.lastName ||
            "Unknown Artist",
          location: currentUser?.location || "",
          profile_image: {
            medium: currentUser?.profilePhoto || "",
          },
        },
        created_at: artwork.date || new Date().toISOString(),
        price: artwork.price || 0,
        size: {
          width: parseInt(artwork.size?.width) || 0,
          height: parseInt(artwork.size?.height) || 0,
        },
        description: artwork.description || "",
        tags: artwork.tags
          ? Array.isArray(artwork.tags)
            ? artwork.tags
            : []
          : [],
        artistId: currentUser.uid,
        imageUrl: artwork.imageUrl,
        title: artwork.title || "",
        isArtistWork: true,
      };

      await updateArtwork(artwork.id, publishData);
      setArtworks((prev) =>
        prev.map((art) =>
          art.id === artwork.id ? { ...art, ...publishData } : art
        )
      );

      toast.success("Artwork published to gallery successfully!");
    } catch (error) {
      console.error("Error publishing artwork:", error);
      toast.error(error.message || "Failed to publish artwork");
    }
  };

  const handleDeleteArtwork = async (artwork) => {
    // Add confirmation dialog
    if (
      !window.confirm(
        "Are you sure you want to delete this artwork? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteArtwork(artwork.id);
      setArtworks((prev) => prev.filter((art) => art.id !== artwork.id));
      toast.success("Artwork deleted successfully");
    } catch (error) {
      console.error("Error deleting artwork:", error);
      toast.error("Failed to delete artwork");
    }
  };

  const handleEditArtwork = async (e, artworkId) => {
    e.preventDefault();
    try {
      // Create updated data without the File object
      const updatedData = {
        ...artworkData,
        // Remove the File object
        image: undefined,
        // Use the preview URL for the image
        imageUrl: artworkData.imagePreview || artwork.imageUrl,
        urls: {
          regular: artworkData.imagePreview || artwork.imageUrl,
          small: artworkData.imagePreview || artwork.imageUrl,
        },
        tags: artworkData.tags
          ? artworkData.tags.split(",").map((tag) => tag.trim())
          : [],
        date: artworkData.date,
      };

      await updateArtwork(artworkId, updatedData);
      setArtworks((prev) =>
        prev.map((art) =>
          art.id === artworkId ? { ...art, ...updatedData } : art
        )
      );
      setIsEditing(null);
      setArtworkData({
        title: "",
        date: "",
        price: "",
        size: { width: "", height: "" },
        description: "",
        tags: "",
        image: null,
        imagePreview: null,
      });
      toast.success("Artwork updated successfully");
    } catch (error) {
      console.error("Error updating artwork:", error);
      toast.error("Failed to update artwork");
    }
  };

  const startEditing = (artwork) => {
    setArtworkData({
      title: artwork.title || "",
      date: artwork.date || "",
      price: artwork.price || "",
      size: {
        width: artwork.size?.width || "",
        height: artwork.size?.height || "",
      },
      description: artwork.description || "",
      tags: Array.isArray(artwork.tags)
        ? artwork.tags
            .map((tag) => (typeof tag === "object" ? tag.title : tag))
            .join(", ")
        : artwork.tags || "",
      imagePreview: artwork.imageUrl || artwork.imagePreview || null,
    });
    setIsEditing(artwork.id);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Artist Artwork</h2>

      {!isAddingNew && !isEditing ? (
        <div className="space-y-6">
          {/* Display existing artworks */}
          {artworks.map((artwork, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {(artwork.imageUrl || artwork.imagePreview) && (
                  <div className="w-full md:w-1/3">
                    <img
                      src={artwork.imageUrl || artwork.imagePreview}
                      alt={artwork.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{artwork.title}</h3>
                  <p className="text-gray-600">Date: {artwork.date}</p>
                  <p className="text-green-600 font-bold">
                    Price: €{artwork.price}
                  </p>
                  <p className="text-gray-600">
                    Size: W {artwork.size?.width || 0}cm × H{" "}
                    {artwork.size?.height || 0}cm
                  </p>
                  <p className="text-gray-700 mt-2">{artwork.description}</p>
                  <div className="mt-2">
                    {Array.isArray(artwork.tags)
                      ? artwork.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                          >
                            {typeof tag === "object" ? tag.title : tag}
                          </span>
                        ))
                      : artwork.tags && typeof artwork.tags === "string"
                      ? artwork.tags.split(",").map((tag, i) => (
                          <span
                            key={i}
                            className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                          >
                            {tag.trim()}
                          </span>
                        ))
                      : null}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handlePublishArtwork(artwork)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold 
${
  artwork.isPublished
    ? "bg-gray-100 text-gray-600 cursor-not-allowed"
    : "bg-blue-500 text-white hover:bg-blue-600"
}`}
                      disabled={artwork.isPublished}
                    >
                      {artwork.isPublished
                        ? "Published in Gallery"
                        : "Publish to Gallery"}
                    </button>
                    <button
                      onClick={() => {
                        startEditing(artwork);
                        setIsAddingNew(false);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteArtwork(artwork)}
                      className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddingNew(true)}
              className="bg-green-500 flex flex-row items-center text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
            >
              <IoMdAddCircleOutline className="mr-1 text-xl" />
              Add Artwork
            </button>
            <button
              onClick={() => navigate("/for-art-lovers")}
              className="bg-white text-green-500 px-4 py-2 border border-green-500 rounded hover:bg-green-200 transition-colors duration-300"
            >
              See Gallery
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={
            isEditing ? (e) => handleEditArtwork(e, isEditing) : handleSubmit
          }
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={artworkData.title}
              onChange={(e) =>
                setArtworkData((prev) => ({ ...prev, title: e.target.value }))
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
              value={artworkData.date}
              onChange={(e) =>
                setArtworkData((prev) => ({ ...prev, date: e.target.value }))
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
              value={artworkData.price}
              onChange={(e) =>
                setArtworkData((prev) => ({ ...prev, price: e.target.value }))
              }
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Width (cm)
              </label>
              <input
                type="number"
                value={artworkData.size?.width || ""}
                onChange={(e) =>
                  setArtworkData((prev) => ({
                    ...prev,
                    size: {
                      ...prev.size,
                      width: Number(e.target.value),
                    },
                  }))
                }
                className="mt-1 w-full p-2 border rounded"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                type="number"
                value={artworkData.size?.height || ""}
                onChange={(e) =>
                  setArtworkData((prev) => ({
                    ...prev,
                    size: {
                      ...prev.size,
                      height: Number(e.target.value),
                    },
                  }))
                }
                className="mt-1 w-full p-2 border rounded"
                min="1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={artworkData.description}
              onChange={(e) =>
                setArtworkData((prev) => ({
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
              value={artworkData.tags}
              onChange={(e) =>
                setArtworkData((prev) => ({ ...prev, tags: e.target.value }))
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
              onChange={handleImageChange}
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
            >
              {isEditing ? "Update Artwork" : "Save Artwork"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(null);
                setIsAddingNew(false);
                setArtworkData({
                  title: "",
                  date: "",
                  price: "",
                  size: { width: "", height: "" },
                  description: "",
                  tags: "",
                  image: null,
                  imagePreview: null,
                });
              }}
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

// *******************************************************************************************
// Artist Sales Settings Component
function ArtistSalesSettings() {
  const [sales, setSales] = useState([
    {
      artworkTitle: "Sample Artwork 1",
      date: "2024-03-15",
      amount: 500,
    },
    {
      artworkTitle: "Sample Artwork 2",
      date: "2024-03-10",
      amount: 750,
    },
  ]);

  // Fetch sales data from Firebase
  useEffect(() => {
    // TODO: Implement fetching sales data
    // const fetchSales = async () => {
    // const salesData = await getSalesData();
    // setSales(salesData);
    // };
    // fetchSales();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Artist Sales</h2>
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

// *******************************************************************************************
// *******************************************************************************************
// Main Artist Dashboard Component
export function ArtistDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const { logout } = useAuth();
  // Update bioData state to include image
  const [bioData, setBioData] = useState({
    bio: "",
    statement: "",
    isEditing: false,
    profilePhoto: null,
    photoPreview: null,
  });

  // Update artworkData state to include image preview
  const [artworkData, setArtworkData] = useState({
    title: "",
    date: "",
    price: "",
    size: {
      width: "",
      height: "",
    },
    description: "",
    tags: "",
    image: null,
    imagePreview: null,
  });

  // Add effect to persist data between tab switches
  useEffect(() => {
    const savedData = sessionStorage.getItem("artistDashboardData");
    if (savedData) {
      const { bioData: savedBio, artworkData: savedArtwork } =
        JSON.parse(savedData);
      // Restore the data including image preview
      setBioData(savedBio);
      setArtworkData({
        ...savedArtwork,
        image: null, // File object can't be stored, but we keep the preview
      });
    }
  }, []);

  // Save data when it changes, including image preview
  useEffect(() => {
    const dataToSave = {
      bioData,
      artworkData: {
        ...artworkData,
        image: null, // Don't try to store the File object
      },
    };
    sessionStorage.setItem("artistDashboardData", JSON.stringify(dataToSave));
  }, [bioData, artworkData]);

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
            Artist Sales
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-lg shadow p-6 max-w-2xl mx-left">
          {activeTab === "profile" && <ArtistDataSettings />}
          {activeTab === "bio" && (
            <ArtistBioSettings bioData={bioData} setBioData={setBioData} />
          )}
          {activeTab === "artwork" && (
            <ArtistArtworkSettings
              artworkData={artworkData}
              setArtworkData={setArtworkData}
            />
          )}
          {activeTab === "sales" && <ArtistSalesSettings />}
        </div>
      </div>
    </div>
  );
}

export default ArtistDashboard;
