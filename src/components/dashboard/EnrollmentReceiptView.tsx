import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom';
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

const EnrollmentReceiptView = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);

  useEffect(() => {
    const fetchReceiptData = async () => {
      if (!user || !courseId) return;

      try {
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
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (enrollmentError) throw enrollmentError;

        if (!enrollmentData) {
          setLoading(false);
          return;
        }

        const course = enrollmentData.courses as unknown as CourseDetails;
        
        let finalAmount = Number(enrollmentData.amount) || 0;
        let finalDate = enrollmentData.created_at || new Date().toISOString();
        let finalOrderId = enrollmentData.order_id || enrollmentData.id;
        let finalStatus = enrollmentData.status || 'Success';

        if (finalAmount > 0 && enrollmentData.order_id) {
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('amount, created_at, order_id, status')
            .eq('order_id', enrollmentData.order_id)
            .maybeSingle();

          if (!paymentError && paymentData) {
            finalAmount = Number(paymentData.amount) || finalAmount;
            finalDate = paymentData.created_at || finalDate;
            finalOrderId = paymentData.order_id || finalOrderId;
            finalStatus = paymentData.status || finalStatus;
          }
        }

        setReceipt({
          orderId: finalOrderId,
          date: finalDate,
          amount: finalAmount,
          status: finalStatus,
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4 min-h-[60vh]">
        <h2 className="text-xl font-bold">Receipt Not Found</h2>
        <p className="text-sm text-slate-500">We couldn't find the transaction details for this course.</p>
        <Link to="/dashboard">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isFree = receipt.amount === 0;

  return (
    <div className="mx-auto max-w-5xl py-8 px-4">
      {/* Back Link */}
      <div className="mb-6">
        <Link to="/dashboard/enrollments" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Enrollments
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center flex flex-col items-center">
            <div className="w-11 h-11 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6" strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Payment Successful</h1>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" /> Download Receipt
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" /> Share Receipt
              </Button>
            </div>
          </div>

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
                    Price: <span className="text-emerald-600 font-medium">{isFree ? 'Free' : `₹${receipt.amount.toLocaleString()}`}</span>
                  </p>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded">Active</span>
                </div>
              </div>
              <Link to={`/courses/${receipt.course.id}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#eef2ff] text-indigo-600 hover:bg-indigo-50 border-none hover:text-indigo-700">
                  Go to Batch
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-[17px] font-bold text-slate-800 mb-5">Payment Details</h2>
            <div className="flex justify-between text-sm text-slate-500 mb-3">
              <span>Price (1 item)</span>
              <span>{isFree ? '₹0' : `₹${receipt.amount.toLocaleString()}`}</span>
            </div>
            <div className="border-t border-slate-200 my-4"></div>
            <div className="flex justify-between text-base font-medium text-slate-800">
              <span>Total Amount</span>
              <span>{isFree ? '₹0' : `₹${receipt.amount.toLocaleString()}`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentReceiptView;
