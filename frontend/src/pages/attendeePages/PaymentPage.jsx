"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { RoutePath } from "@/enum/routePath";
import useAxios from "@/hooks/useAxios";

const MySwal = withReactContent(Swal);

const Payment = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { fetchData } = useAxios();
  const [booking, setBooking] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("card");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setLoadError("Invalid booking");
      setPageLoading(false);
      return;
    }

    const loadBooking = async () => {
      setPageLoading(true);
      setLoadError(null);
      try {
        const result = await fetchData({
          url: `/bookings/${bookingId}`,
          method: "get",
        });
        if (result) {
          setBooking(result);
        } else {
          setLoadError("Booking not found");
        }
      } catch (err) {
        setLoadError(err.message || "Failed to load booking");
      } finally {
        setPageLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  if (pageLoading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <p className="text-gray-600">Loading booking…</p>
      </div>
    );
  }

  if (loadError || !booking) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            {loadError || "Booking data not found"}
          </p>
          <button
            onClick={() => navigate(RoutePath.ATTENDEE_ALL_EVENTS)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handlePayNow = async () => {
    if (paid || !booking) return;

    const result = await MySwal.fire({
      title: "Confirm Payment",
      text: `Are you sure you want to pay PKR ${Number(
        booking.totalAmount
      ).toFixed(2)}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Pay Now",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);

        const paymentResult = await fetchData({
          url: `/payments/confirm`,
          method: "post",
          data: {
            bookingId: Number(bookingId),
            method: method,
          },
        });

        if (paymentResult) {
          setPaid(true);
          await MySwal.fire({
            title: "Payment Successful!",
            text: "Your booking is confirmed.",
            icon: "success",
            confirmButtonText: "OK",
          });
          navigate(RoutePath.ATTENDEE_MY_BOOKINGS);
        } else {
          MySwal.fire({
            title: "Payment Failed",
            text: "Payment could not be completed. The event may be sold out or the booking is no longer valid.",
            icon: "error",
          });
        }
      } catch (err) {
        MySwal.fire({
          title: "Error",
          text: err.message || "Payment processing failed",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Complete Your Payment
        </h2>

        <div className="bg-white rounded-lg border shadow p-6">
          <div className="text-sm text-gray-500">Amount to Pay</div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="text-4xl font-extrabold text-indigo-700">
              PKR {Number(booking.totalAmount).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">Pakistani Rupee</div>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="text-sm text-gray-600 mb-2">Booking Details</div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <strong>No. of Seats:</strong> {booking.quantity || 1}
              </p>
              <p>
                <strong>Status:</strong> {booking.status}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-gray-600 mb-2">Payment Methods</div>

            <label
              className={`flex items-center gap-3 p-3 rounded border ${
                method === "card"
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-200"
              } cursor-pointer`}
            >
              <input
                type="radio"
                name="method"
                value="card"
                checked={method === "card"}
                onChange={() => setMethod("card")}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold">Credit / Debit Card</div>
                <div className="text-xs text-gray-500">
                  Visa, Mastercard, Amex
                </div>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-3 mt-3 rounded border ${
                method === "wallet"
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-200"
              } cursor-pointer`}
            >
              <input
                type="radio"
                name="method"
                value="wallet"
                checked={method === "wallet"}
                onChange={() => setMethod("wallet")}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold">Wallet</div>
                <div className="text-xs text-gray-500">
                  Pay using wallet balance
                </div>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-3 mt-3 rounded border ${
                method === "bank_transfer"
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-200"
              } cursor-pointer`}
            >
              <input
                type="radio"
                name="method"
                value="bank_transfer"
                checked={method === "bank_transfer"}
                onChange={() => setMethod("bank_transfer")}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold">Bank Transfer</div>
                <div className="text-xs text-gray-500">Secure bank payment</div>
              </div>
            </label>
          </div>
        </div>

        <button
          disabled={paid || loading}
          onClick={handlePayNow}
          className={`mt-6 w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            paid || loading
              ? "bg-gray-300 cursor-not-allowed text-gray-600"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {paid ? "Payment Completed" : loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default Payment;
