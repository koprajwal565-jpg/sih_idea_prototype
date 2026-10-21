import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Star,
  AlertCircle,
  FileText,
  User,
  Plus,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { Booking, CustomerAddress } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { StatusStepper } from '../components/ui/StatusStepper';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

export const CustomerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightBookingId = searchParams.get('highlight_booking');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal state
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Receipt modal state
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Payment processing state
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await apiRequest<Booking[]>('/bookings', {}, currentUser.id);
      if (res.success) {
        setBookings(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser.id]);

  // Handle Payment (Razorpay Test or Demo Mode)
  const handlePay = async (booking: Booking, isDemo: boolean = true) => {
    setPayingBookingId(booking.id);
    try {
      // 1. Create order on server
      const orderRes = await apiRequest('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ booking_id: booking.id, is_demo: isDemo }),
      }, currentUser.id);

      if (!orderRes.success) throw new Error(orderRes.error?.message);

      const orderData = orderRes.data;

      // If in demo mode or Razorpay window is simulated
      if (orderData.is_demo || !(window as any).Razorpay) {
        // Direct verify call
        const verifyRes = await apiRequest('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            booking_id: booking.id,
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_signature: 'sig_demo_verified',
            is_demo: true,
          }),
        }, currentUser.id);

        if (verifyRes.success) {
          alert('Demo Payment Successful! Booking status updated to Confirmed.');
          fetchBookings();
        }
      } else {
        // Real Razorpay Test Checkout popup
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: 'INR',
          name: 'FixNear Services',
          description: `Booking ${booking.booking_reference}`,
          order_id: orderData.order_id,
          handler: async (response: any) => {
            const verifyRes = await apiRequest('/payments/verify', {
              method: 'POST',
              body: JSON.stringify({
                booking_id: booking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                is_demo: false,
              }),
            }, currentUser.id);

            if (verifyRes.success) {
              alert('Payment Confirmed via Razorpay Test Gateway!');
              fetchBookings();
            }
          },
          prefill: {
            name: currentUser.full_name,
            email: currentUser.email,
            contact: currentUser.phone,
          },
          theme: { color: '#059669' },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed');
    } finally {
      setPayingBookingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const reason = prompt('Please provide reason for cancellation:');
    if (!reason) return;

    try {
      const res = await apiRequest(
        `/bookings/${bookingId}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        },
        currentUser.id
      );
      if (res.success) {
        alert('Booking cancelled.');
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handleViewReceipt = async (bookingId: string) => {
    try {
      const res = await apiRequest(`/payments/booking/${bookingId}`, {}, currentUser.id);
      if (res.success) {
        setReceiptData(res.data);
        setIsReceiptOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Receipt not available');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalBooking) return;

    setIsSubmittingReview(true);
    try {
      const res = await apiRequest(
        '/reviews',
        {
          method: 'POST',
          body: JSON.stringify({
            booking_id: reviewModalBooking.id,
            rating: reviewRating,
            comment: reviewComment,
          }),
        },
        currentUser.id
      );

      if (res.success) {
        alert('Thank you! Your review has been published.');
        setReviewModalBooking(null);
        setReviewComment('');
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Bar */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80'}
            alt={currentUser.full_name}
            className="w-14 h-14 rounded-full object-cover border-2 border-brand-500"
          />
          <div>
            <h1 className="text-xl font-bold text-stone-900">{currentUser.full_name}</h1>
            <p className="text-xs text-stone-500">
              {currentUser.email} • {currentUser.phone}
            </p>
          </div>
        </div>

        <Link to="/services">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Book New Service
          </Button>
        </Link>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-stone-900">Your Service Bookings</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-stone-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
            <p className="text-sm text-stone-600 mb-3">You have no booking requests yet.</p>
            <Link to="/services">
              <Button size="sm">Browse Services</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const isHighlighted = highlightBookingId === booking.id;
              return (
                <Card
                  key={booking.id}
                  className={`p-6 transition-all ${
                    isHighlighted ? 'ring-2 ring-brand-500 border-brand-500 bg-brand-50/20' : ''
                  }`}
                >
                  {/* Top line: Reference, Status, Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-stone-900">
                        {booking.booking_reference}
                      </span>
                      <StatusBadge status={booking.status} />
                      {booking.payment_status === 'paid' ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Paid
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Payment Pending
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-stone-500 mr-2">Total Amount:</span>
                      <span className="text-lg font-bold text-stone-900">₹{booking.final_price_inr}</span>
                    </div>
                  </div>

                  {/* Status Progress Stepper */}
                  <div className="my-4">
                    <StatusStepper status={booking.status} />
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs text-stone-600">
                    <div>
                      <span className="text-stone-400 block mb-0.5">Service</span>
                      <span className="font-semibold text-stone-900 text-sm">
                        {booking.service?.name || 'General Service'}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 block mb-0.5">Schedule & Address</span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-stone-800 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{booking.scheduled_date} ({booking.scheduled_time_slot})</span>
                        </div>
                        <div className="flex items-center gap-1 text-stone-600">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span className="truncate">{booking.address?.street_address || 'Bellandur, Bengaluru'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-stone-400 block mb-0.5">Assigned Professional</span>
                      {booking.provider ? (
                        <div>
                          <span className="font-semibold text-stone-900 block">
                            {booking.provider.business_name}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            ⭐ {booking.provider.rating_avg} ({booking.provider.rating_count} reviews)
                          </span>
                        </div>
                      ) : (
                        <span className="italic text-stone-500">Auto-matching best nearby pro...</span>
                      )}
                    </div>
                  </div>

                  {/* Problem Description Note */}
                  <div className="mt-4 p-3 bg-surface-50 rounded-lg border border-stone-100 text-xs text-stone-700">
                    <span className="font-semibold">Notes: </span>
                    {booking.problem_description}
                  </div>

                  {/* Action Bar */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(booking.id)}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Itemized Receipt
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* If unpaid, show Pay button */}
                      {booking.payment_status === 'unpaid' && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            isLoading={payingBookingId === booking.id}
                            onClick={() => handlePay(booking, true)}
                            className="bg-emerald-700 hover:bg-emerald-800"
                          >
                            <CreditCard className="w-3.5 h-3.5 mr-1" />
                            Pay ₹{booking.final_price_inr} (Demo Mode)
                          </Button>
                        </div>
                      )}

                      {/* If completed, prompt for review */}
                      {booking.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewModalBooking(booking)}
                        >
                          <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                          Leave Review
                        </Button>
                      )}

                      {/* Cancellation if not completed/cancelled */}
                      {!['completed', 'cancelled'].includes(booking.status) && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      <Modal
        isOpen={!!reviewModalBooking}
        onClose={() => setReviewModalBooking(null)}
        title="Rate & Review Professional"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
          <div>
            <span className="text-stone-600 block mb-1 font-medium">Select Star Rating</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-stone-800 text-sm">{reviewRating} / 5</span>
            </div>
          </div>

          <div>
            <label className="text-stone-700 font-semibold block mb-1">Your Feedback</label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="How was the punctuality, cleanliness, and quality of work?"
              className="w-full rounded-lg border border-stone-300 p-2.5 focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setReviewModalBooking(null)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingReview}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Itemized Receipt Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="FixNear Tax Invoice & Receipt"
        maxWidth="md"
      >
        {receiptData && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="font-bold text-sm text-stone-900">{receiptData.booking_reference}</span>
                <span className="block text-stone-500">{receiptData.service_name}</span>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                Status: {receiptData.payment_status?.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 text-stone-600">
              <div className="flex justify-between">
                <span>Base Service Charges</span>
                <span className="font-semibold text-stone-900">₹{receiptData.base_price_inr}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Convenience Fee</span>
                <span className="font-semibold text-stone-900">₹{receiptData.platform_fee_inr}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (Goods & Services Tax)</span>
                <span className="font-semibold text-stone-900">₹{receiptData.taxes_inr || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Paid (INR)</span>
                <span className="text-brand-700">₹{receiptData.total_inr}</span>
              </div>
            </div>

            {receiptData.payment_details && (
              <div className="bg-surface-50 p-3 rounded-lg border border-stone-200 text-[11px] text-stone-500 space-y-1">
                <div>Razorpay Order: {receiptData.payment_details.razorpay_order_id}</div>
                <div>Payment Ref: {receiptData.payment_details.razorpay_payment_id || 'N/A'}</div>
                <div>Method: {receiptData.payment_details.method?.toUpperCase()}</div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setIsReceiptOpen(false)}>
                Close Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
