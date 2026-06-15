// src/pages/dashBoardPages/PostEvent.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import useAxios from "@/hooks/useAxios";
import { useAuth } from "@/hooks/useAuth";
import { HttpMethod } from "../../enum/httpMethod";

const MySwal = withReactContent(Swal);

const initialValues = {
  title: "",
  description: "",
  address: "",
  eventDate: "",
  price: "",
  totalTickets: "",
  availableTickets: "",
  category: "",
  images: [],
};

const validationSchema = Yup.object({
  title: Yup.string().trim().required("Event title is required"),
  description: Yup.string().trim().required("Description is required"),
  address: Yup.string().trim().required("Address is required"),
  eventDate: Yup.date()
    .required("Event date is required")
    .transform((value, originalValue) => (originalValue ? new Date(originalValue) : null))
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Event date can't be in the past"),
  price: Yup.number().typeError("Price must be a number").min(0, "Price must be >= 0").required("Price is required"),
  totalTickets: Yup.number()
    .typeError("Total tickets must be a number")
    .integer("Must be an integer")
    .min(0, "Must be >= 0")
    .required("Total tickets required"),
  availableTickets: Yup.number()
    .typeError("Available tickets must be a number")
    .integer("Must be an integer")
    .min(0, "Must be >= 0")
    .required("Available tickets required")
    .test("available<=total", "Available tickets cannot exceed total tickets", function (value) {
      const { totalTickets } = this.parent;
      if (totalTickets === "" || value === "") return true;
      return Number(value) <= Number(totalTickets);
    }),
  category: Yup.string().required("Please select a category"),
  images: Yup.array().optional(),
});

export default function PostEvent() {
  const nav = useNavigate();
  const { user } = useAuth?.() ?? {}; // optional, adjust to your useAuth
  const { fetchData } = useAxios();

  const [previewImages, setPreviewImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // refs to avoid fetch loops if fetchData is unstable
  const catFetchingRef = useRef(false);
  const abortCatRef = useRef(false);

  // load categories using fetchData pattern (exactly like your snippet)
  useEffect(() => {
    if (catFetchingRef.current) return;
    catFetchingRef.current = true;
    abortCatRef.current = false;
    setLoadingCategories(true);
    (async () => {
      try {
        const res = await fetchData({
          url: "/categories",
          method: HttpMethod.GET,
        });
        if (abortCatRef.current) return;
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        setCategories(list);
      } catch (err) {
        console.error("Failed to load categories", err);
        setCategories([]);
      } finally {
        if (!abortCatRef.current) setLoadingCategories(false);
        catFetchingRef.current = false;
      }
    })();

    return () => {
      abortCatRef.current = true;
    };
    // intentionally not including fetchData in deps to avoid infinite loops
  }, []);

  const handleImageChange = (event, setFieldValue) => {
    const files = Array.from(event.target.files || []);
    setFieldValue("images", files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  /** Upload images after the event exists (backend requires eventId). */
  async function uploadImages(files, eventId) {
    if (!files?.length || !eventId) return [];

    const eventIdStr = String(eventId);

    if (files.length === 1) {
      const fd = new FormData();
      fd.append("eventImage", files[0]);
      fd.append("eventId", eventIdStr);

      const resp = await fetchData({
        url: "/upload/eventImage",
        method: HttpMethod.POST,
        data: fd,
      });

      if (!resp?.success) {
        throw new Error(resp?.message || "Failed to upload event image");
      }

      const img = resp?.data;
      return img ? [img] : [];
    }

    const fd = new FormData();
    files.forEach((f) => fd.append("eventImages", f));
    fd.append("eventId", eventIdStr);

    const resp = await fetchData({
      url: "/upload/eventImages",
      method: HttpMethod.POST,
      data: fd,
    });

    if (!resp?.success) {
      throw new Error(resp?.message || "Failed to upload event images");
    }

    const images = resp?.data?.images;
    return Array.isArray(images) ? images : [];
  }

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setSubmitting(true);
      setLoadingSubmit(true);

      const organizerId = user?.organizer?.id;
      if (!organizerId) {
        throw new Error(
          "Organizer profile not found. Please log in again as an organizer."
        );
      }

      const payload = {
        title: values.title,
        description: values.description,
        address: values.address,
        eventDate: values.eventDate,
        ticketPrice: Number(values.price || 0),
        totalTickets: Number(values.totalTickets || 0),
        availableTickets: Number(values.availableTickets || 0),
        status: "pending",
        organizer: { id: Number(organizerId) },
        category: values.category ? { id: Number(values.category) } : undefined,
      };

      const createResp = await fetchData({
        url: "/events",
        method: HttpMethod.POST,
        data: payload,
      });

      const createdEvent = createResp?.data ?? createResp;
      if (!createdEvent?.id) throw new Error("Failed to create event");

      let uploadedImages = [];
      if (values.images?.length) {
        try {
          setUploadingImages(true);
          uploadedImages = await uploadImages(values.images, createdEvent.id);
        } catch (uploadErr) {
          await MySwal.fire({
            title: "Event created — image upload failed",
            text:
              uploadErr?.message ||
              "The event was saved but images could not be uploaded.",
            icon: "warning",
            confirmButtonText: "OK",
          });
        } finally {
          setUploadingImages(false);
        }
      }

      await MySwal.fire({
        title: "Event Posted",
        html: `<strong>${createdEvent.title ?? values.title}</strong><br/>Your event is posted and pending approval.`,
        icon: "success",
        confirmButtonText: "OK",
      });

      const serverImgs = createdEvent.images?.length
        ? createdEvent.images
        : uploadedImages;
      setPreviewImages(
        Array.isArray(serverImgs) ? serverImgs.map((it) => it.url ?? it.path ?? it.filename ?? it) : []
      );

      // Optionally reset form
      // resetForm();
    } catch (err) {
      console.error("Create event error:", err);
      await MySwal.fire({
        title: "Error",
        text: err?.response?.data?.message || err?.message || "Something went wrong.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setSubmitting(false);
      setLoadingSubmit(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Post an Event</h2>

      {/* Post Event Form */}
      <div className="bg-white rounded shadow-sm p-6">
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, setFieldValue }) => (
            <Form>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Event title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Title *</label>
                  <Field name="title" placeholder="Enter event title" className="mt-1 block w-full border rounded px-3 py-2" />
                  <ErrorMessage name="title" component="div" className="text-xs text-red-600 mt-1" />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <Field name="address" placeholder="Venue address" className="mt-1 block w-full border rounded px-3 py-2" />
                  <ErrorMessage name="address" component="div" className="text-xs text-red-600 mt-1" />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Date *</label>
                  <Field name="eventDate" type="date" className="mt-1 block w-full border rounded px-3 py-2" />
                  <ErrorMessage name="eventDate" component="div" className="text-xs text-red-600 mt-1" />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price PKR</label>
                  <Field name="price" type="number" step="0.01" min="0" placeholder="0.00" className="mt-1 block w-full border rounded px-3 py-2" />
                  <ErrorMessage name="price" component="div" className="text-xs text-red-600 mt-1" />
                </div>

                {/* Total Tickets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Tickets *</label>
                  <Field name="totalTickets" type="number" min="0" placeholder="100" className="mt-1 block w-full border rounded px-3 py-2" />
                  <ErrorMessage name="totalTickets" component="div" className="text-xs text-red-600 mt-1" />
                </div>

                {/* Available Tickets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Available Tickets *</label>
                  <Field name="availableTickets" type="number" min="0" placeholder="100" className="mt-1 block w-full border rounded px-3 py-2" />
                  <ErrorMessage name="availableTickets" component="div" className="text-xs text-red-600 mt-1" />
                </div>

                {/* Category (from API) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <Field
                    as="select"
                    name="category"
                    className="mt-1 block w-full border rounded px-3 py-2"
                    onChange={(e) => setFieldValue("category", e.target.value)}
                  >
                    <option value="">Select category</option>
                    {loadingCategories ? (
                      <option value="">Loading...</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c.id ?? c._id} value={String(c.id ?? c._id)}>
                          {c.name ?? c.title ?? `Category ${c.id ?? c._id}`}
                        </option>
                      ))
                    )}
                  </Field>
                  <ErrorMessage name="category" component="div" className="text-xs text-red-600 mt-1" />
                </div>

                {/* Description */}
                <div className="lg:col-span-3 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <Field name="description" as="textarea" rows="5" placeholder="Event description" className="mt-1 block w-full border rounded px-3 py-2" />
                  <ErrorMessage name="description" component="div" className="text-xs text-red-600 mt-1" />
                </div>

                {/* Images */}
                <div className="lg:col-span-3 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Event Images (optional)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={isSubmitting || loadingSubmit || uploadingImages}
                    onChange={(e) => handleImageChange(e, setFieldValue)}
                    className="mt-1 block w-full border rounded px-3 py-2 disabled:opacity-50"
                  />
                  {uploadingImages && (
                    <p className="text-xs text-sky-700 mt-1">Uploading images…</p>
                  )}
                  <ErrorMessage name="images" component="div" className="text-xs text-red-600 mt-1" />
                  {previewImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {previewImages.map((src, idx) => (
                        <img key={idx} src={src} alt={`Preview ${idx}`} className="w-24 h-24 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || loadingSubmit || uploadingImages}
                  className="px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-50"
                >
                  {uploadingImages
                    ? "Uploading images..."
                    : isSubmitting || loadingSubmit
                      ? "Saving..."
                      : "Post Event"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
