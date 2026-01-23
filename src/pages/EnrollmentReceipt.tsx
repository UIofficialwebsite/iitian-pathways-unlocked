import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, Download, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface CourseDetails {
  id: string;
  title: string;
  image_url: string | null;
  end_date: string | null;
}

interface ReceiptDetails {
  orderId: string;
  date: string;
  amount: number;
  status: string;
  course: CourseDetails;
}

const EnrollmentReceipt = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);

  useEffect(() => {
    const fetchReceiptData = async () => {
      if (!user || !courseId) return;

      try {
        // 1. Fetch Enrollment (Source of Truth for Access & Course Metadata)
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select(`
            id,
            created_at,
            amount,
            status,
            order_id,
            courses (
              id,
              title,
              image_url,
              end_date
            )
          `)
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .in('status', ['success', 'active', 'paid', 'SUCCESS', 'ACTIVE']) // Broaden status check
          .maybeSingle(); // Use maybeSingle to avoid 406 if no rows found

        if (enrollmentError) throw enrollmentError;

        if (!enrollmentData) {
          setLoading(false);
          return;
        }

        const course = enrollmentData.courses as unknown as CourseDetails;
        let finalAmount = enrollmentData.amount || 0;
        let finalDate = enrollmentData.created_at;
        let finalOrderId = enrollmentData.order_id || enrollmentData.id;

        // 2. If Paid Course (Amount > 0) & Has Order ID -> Fetch from Payments Table
        if (finalAmount > 0 && enrollmentData.order_id) {
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('amount, created_at, order_id, status')
            .eq('order_id', enrollmentData.order_id)
            .maybeSingle();

          if (!paymentError && paymentData) {
            // Override with Payment Table Details
            finalAmount = paymentData.amount || finalAmount;
            finalDate = paymentData.created_at || finalDate;
            finalOrderId = paymentData.order_id || finalOrderId;
          }
        }

        setReceipt({
          orderId: finalOrderId,
          date: finalDate,
          amount: finalAmount,
          status: 'Success',
          course: course
        });

      } catch (error) {
        console.error('Error fetching receipt:', error);
        toast({
          title: "Error",
          description: "Could not load receipt details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReceiptData();
  }, [user, courseId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f8ff]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f8ff] text-slate-600 gap-4">
        <h2 className="text-xl font-bold">Receipt Not Found</h2>
        <p className="text-sm text-slate-500">We couldn't find an active enrollment for this course.</p>
        <Link to="/dashboard">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isFree = receipt.amount === 0;

  return (
    <div className="min-h-screen bg-[#f5f8ff] font-sans text-slate-700 py-10 px-4 flex justify-center">
      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          
          {/* Status Banner */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center flex flex-col items-center">
            <div className="w-11 h-11 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6" strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Payment Successful</h1>
            <div className="flex flex-wrap gap-3 justify-center">
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-sm text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-sm text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                <Share2 className="w-4 h-4" />
                Share Receipt
              </button>
            </div>
          </div>

          {/* Order Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between text-sm text-slate-500 mb-5">
              <span>Order Id: {receipt.orderId}</span>
              <span>Order Date: {formatDate(receipt.date)}</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#fcfdfe] border border-slate-100 rounded-lg p-4 gap-4">
              <div className="flex gap-4 items-center w-full">
                <img 
                  src={receipt.course.image_url || "https://via.placeholder.com/90x60"} 
                  alt={receipt.course.title} 
                  className="w-[90px] h-[60px] bg-slate-200 rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-grow">
                  <h3 className="text-base font-medium text-slate-800 mb-1 leading-tight">
                    {receipt.course.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-1">
                    Price: <span className="text-emerald-600 font-medium">{isFree ? 'Free' : `₹${receipt.amount}`}</span>
                  </p>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              </div>
              <Link to={`/courses/${receipt.course.id}`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-[#eef2ff] text-indigo-600 hover:bg-indigo-50 border-none px-5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                  Go to Batch
                </button>
              </Link>
            </div>

            <div className="mt-6 bg-[#fafbff] p-4 rounded-lg">
              <label className="text-xs text-slate-500 block mb-1">Valid Till:</label>
              <p className="text-base text-slate-800 font-medium">
                {receipt.course.end_date ? formatDate(receipt.course.end_date) : 'Lifetime Access'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Payment Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-[17px] font-bold text-slate-800 mb-5">Payment Details</h2>
            <div className="flex justify-between text-sm text-slate-500 mb-3">
              <span>Price (1 item)</span>
              <span>{isFree ? '₹0' : `₹${receipt.amount}`}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 mb-3">
              <span>Discount</span>
              <span>₹0</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 mb-3">
              <span>Delivery Charges</span>
              <span>₹0</span>
            </div>
            <div className="border-t border-slate-200 my-4"></div>
            <div className="flex justify-between text-base font-medium text-slate-800">
              <span>Total Amount</span>
              <span>{isFree ? '₹0' : `₹${receipt.amount}`}</span>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-gradient-to-br from-white to-[#f9faff] rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center">
              <div className="flex-1 pr-4">
                <h2 className="text-[17px] font-bold text-slate-800 mb-1">Need help?</h2>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                  Get in touch and we will be happy to help you.
                </p>
                <button className="bg-indigo-600 text-white border-none px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Contact Us
                </button>
              </div>
              <div className="w-20 opacity-80">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-indigo-200">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeWidth="2"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EnrollmentReceipt;
