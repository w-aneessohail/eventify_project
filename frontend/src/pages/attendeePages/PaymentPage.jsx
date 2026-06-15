"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { RoutePath } from "@/enum/routePath";
import useAxios from "@/hooks/useAxios";

const MySwal = withReactContent(Swal);
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 30;

const Payment = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const returnStatus = searchParams.get("status");
  const { fetchData } = useAxios();
  const [booking, setBooking] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const pollAttempts = useRef(0);

  const loadBooking = useCallback(async () => {
    if (!bookingId) {
      setLoadError("Invalid booking");
      setPageLoading(false);
      return null;
    }

    setPageLoading(true);
    setLoadError(null);

    try {
      const result = await fetchData({
        url: `/bookings/${bookingId}`,
        method: "get",
      });

      if (result) {
        setBooking(result);
        if (String(result.status || "").toLowerCase() === "confirmed") {
          setPaid(true);
        } else if (String(result.status || "").toLowerCase() === "cancelled") {
          setLoadError("This booking was cancelled and cannot be paid.");
        }
        return result;
      }

      setLoadError("Booking not found");
      return null;
    } catch (err) {
      setLoadError(err.message || "Failed to load booking");
      return null;
    } finally {
      setPageLoading(false);
    }
  }, [bookingId, fetchData]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  useEffect(() => {
    if (returnStatus !== "return" || paid || !bookingId) return;

    setConfirming(true);
    pollAttempts.current = 0;

    const poll = async () => {
      const result = await fetchData({
        url: `/bookings/${bookingId}`,
        method: "get",
      });

      if (result && String(result.status || "").toLowerCase() === "confirmed") {
        setBooking(result);
        setPaid(true);
        setConfirming(false);
        return;
      }

      pollAttempts.current += 1;
      if (pollAttempts.current < POLL_MAX_ATTEMPTS) {
        setTimeout(poll, POLL_INTERVAL_MS);
      } else {
        setConfirming(false);
      }
    };

    poll();
  }, [returnStatus, paid, bookingId, fetchData]);

  useEffect(() => {
    if (returnStatus === "cancelled" && !paid) {
      setLoadError(null);
    }
  }, [returnStatus, paid]);

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

  if (confirming) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            Confirming your payment…
          </h2>
          <p className="text-gray-600 text-sm">
            Please wait while we verify your payment with Safepay.
          </p>
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Payment Complete</h2>
          <p className="text-gray-600 mb-6">
            Your booking is confirmed. You can view it in My Bookings.
          </p>
          <button
            onClick={() => navigate(RoutePath.ATTENDEE_MY_BOOKINGS)}
            className="w-full py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (returnStatus === "cancelled") {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            Payment cancelled
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            You left the Safepay checkout. Your booking is still pending — you can
            try again when ready.
          </p>
          <button
            onClick={() => navigate(`/attendee/payment/${bookingId}`)}
            className="w-full py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 mb-2"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => navigate(RoutePath.ATTENDEE_ALL_EVENTS)}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Back to events
          </button>
        </div>
      </div>
    );
  }

  if (returnStatus === "return" && !paid) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            Payment pending confirmation
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            We have not received confirmation yet. This usually takes a few
            seconds. Refresh this page or check My Bookings shortly.
          </p>
          <button
            onClick={() => loadBooking()}
            className="w-full py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 mb-2"
          >
            Refresh status
          </button>
          <button
            type="button"
            onClick={() => navigate(RoutePath.ATTENDEE_MY_BOOKINGS)}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const handlePayNow = async () => {
    if (paid || loading || !booking) return;

    const result = await MySwal.fire({
      title: "Pay with Safepay",
      text: `You will be redirected to Safepay to pay PKR ${Number(
        booking.totalAmount
      ).toFixed(2)}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Continue to Safepay",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      const checkout = await fetchData({
        url: `/payments`,
        method: "post",
        data: {
          bookingId: Number(bookingId),
        },
      });

      if (checkout?.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl);
        return;
      }

      MySwal.fire({
        title: "Checkout unavailable",
        text: "Could not start Safepay checkout. Please try again.",
        icon: "error",
      });
    } catch (err) {
      MySwal.fire({
        title: "Error",
        text: err.message || "Could not start payment",
        icon: "error",
      });
    } finally {
      setLoading(false);
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

          <div className="mt-6 rounded-lg bg-sky-50 border border-sky-100 p-4 text-sm text-sky-900">
            You will be redirected to Safepay&apos;s secure hosted checkout to pay
            by card or wallet.
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
          {loading ? "Redirecting…" : "Pay with Safepay"}
        </button>

        <button
          type="button"
          onClick={() => navigate(RoutePath.ATTENDEE_ALL_EVENTS)}
          className="mt-3 w-full py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel and go back
        </button>
      </div>
    </div>
  );
};

export default Payment;
