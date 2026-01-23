import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, Download, Share2, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- Types ---
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
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Ref for the hidden formal receipt template
  const receiptRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching Logic ---
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

  // --- Helpers ---
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

  const formatValidTill = (dateString: string | null) => {
    if (!dateString) return "Lifetime Access";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // --- Button Handlers ---

  const handleDownloadPDF = async () => {
    if (!receiptRef.current || !receipt) return;
    setIsDownloading(true);

    try {
      const element = receiptRef.current;
      
      // Generate canvas from the hidden formal receipt
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Handle images if any
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Receipt_${receipt.orderId}.pdf`);

      toast({
        title: "Success",
        description: "Receipt downloaded successfully.",
      });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast({
        title: "Error",
        description: "Failed to download receipt.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!receipt) return;
    const shareData = {
      title: 'Enrollment Receipt',
      text: `Enrollment Receipt for ${receipt.course.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Receipt link has been copied to clipboard.",
      });
    }
  };

  const handleContactUs = () => {
    if (!receipt) return;
    
    const subject = `Support Request: Order ${receipt.orderId}`;
    const formattedAmount = receipt.amount === 0 ? 'Free' : `₹ ${receipt.amount}`;
    const orderDate = new Date(receipt.date).toLocaleDateString('en-GB');
    
    const body = `Hi Support Team,

I need help with my enrollment regarding the following order:

--- ORDER DETAILS ---
Order ID: ${receipt.orderId}
Course Name: ${receipt.course.title}
Amount Paid: ${formattedAmount}
Transaction Date: ${orderDate}
Status: ${receipt.status}
---------------------

My Query:
[Please describe your issue here]`;

    // Construct standard mailto link
    // Ensure "CC" is handled by the email client properly
    const mailtoLink = `mailto:support@unknown.live?cc=unknowniitians@gmail.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Explicitly open in current window to trigger client
    window.open(mailtoLink, '_self');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#4f46e5]" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#64748b]">
        <h2 className="text-xl font-bold mb-2">Receipt Not Found</h2>
        <Link to="/dashboard/enrollments">
          <Button variant="outline">Back to Enrollments</Button>
        </Link>
      </div>
    );
  }

  const isFree = receipt.amount === 0;

  return (
    <div className="font-['Inter',sans-serif] w-full max-w-[1000px] mx-auto pb-10">
      
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          to="/dashboard/enrollments" 
          className="inline-flex items-center text-sm text-[#64748b] hover:text-[#4f46e5] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Enrollments
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          
          {/* Status Banner */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-10 text-center">
            <div className="w-11 h-11 bg-[#10b981] text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-bold text-[#334155] mb-6">Payment Successful</h1>
            <div className="flex flex-wrap gap-3 justify-center">
              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-white border border-[#e2e8f0] px-[18px] py-2.5 rounded-lg text-sm text-[#334155] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-colors disabled:opacity-50"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isDownloading ? 'Generating...' : 'Download Receipt'}
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 bg-white border border-[#e2e8f0] px-[18px] py-2.5 rounded-lg text-sm text-[#334155] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share Receipt
              </button>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6">
            <div className="flex justify-between text-[13px] text-[#64748b] mb-5">
              <span>Order Id: {receipt.orderId}</span>
              <span>Order Date: {formatDate(receipt.date)}</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#fcfdfe] border border-[#f1f5f9] rounded-[10px] p-4 gap-4">
              <div className="flex gap-4 items-center w-full">
                <img 
                  src={receipt.course.image_url || "https://via.placeholder.com/90x60/4f46e5/ffffff?text=Course"} 
                  alt={receipt.course.title} 
                  className="w-[90px] h-[60px] bg-[#e2e8f0] rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-grow">
                  <h3 className="text-base font-medium text-[#334155] mb-1 leading-tight">
                    {receipt.course.title}
                  </h3>
                  <p className="text-sm text-[#64748b] mb-1">
                    Price: <span className="text-[#10b981] font-medium">{isFree ? 'Free' : `₹${receipt.amount}`}</span>
                  </p>
                  <span className="inline-block bg-[#dcfce7] text-[#166534] text-[11px] px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              </div>
              <Link to={`/courses/${receipt.course.id}`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-[#eef2ff] text-[#4f46e5] border-none px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors whitespace-nowrap cursor-pointer">
                  Go to Batch
                </button>
              </Link>
            </div>

            <div className="mt-6 bg-[#fafbff] p-4 rounded-lg">
              <label className="text-xs text-[#64748b] block mb-1">Valid Till:</label>
              <p className="text-base text-[#334155]">
                {formatValidTill(receipt.course.end_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6">
            <h2 className="text-[17px] font-bold text-[#334155] mb-5">Payment Details</h2>
            <div className="flex justify-between text-sm text-[#64748b] mb-3">
              <span>Price (1 items)</span>
              <span>{isFree ? '₹ 0' : `₹ ${receipt.amount}`}</span>
            </div>
            <div className="flex justify-between text-sm text-[#64748b] mb-3">
              <span>Discount</span>
              <span>₹ 0</span>
            </div>
            <div className="flex justify-between text-sm text-[#64748b] mb-3">
              <span>Delivery Charges</span>
              <span>₹ 0</span>
            </div>
            <div className="mt-4 pt-4 border-t border-[#e2e8f0] flex justify-between text-base text-[#334155] font-medium">
              <span>Total Amount</span>
              <span>{isFree ? '₹ 0' : `₹ ${receipt.amount}`}</span>
            </div>
          </div>

          {/* Contact Us Card */}
          <div className="bg-gradient-to-br from-white to-[#f9faff] rounded-xl border border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6">
            <div className="flex justify-between items-center">
              <div className="flex-1 pr-4">
                <h2 className="text-[17px] font-bold text-[#334155] mb-1">Need help?</h2>
                <p className="text-[13px] text-[#64748b] leading-[1.4] mb-4">
                  Get in touch and we will be happy to help you.
                </p>
                <button 
                  onClick={handleContactUs}
                  className="bg-[#4f46e5] text-white border-none px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Contact Us
                </button>
              </div>
              <img 
                src="https://illustrations.popsy.co/blue/customer-support.svg" 
                className="w-20 opacity-80" 
                alt="support"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- HIDDEN FORMAL RECEIPT TEMPLATE FOR PDF GENERATION --- */}
      <div 
        ref={receiptRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '210mm', // A4 Width
          minHeight: '297mm', // A4 Height
          backgroundColor: '#ffffff',
          padding: '40px',
          fontFamily: 'Arial, sans-serif',
          color: '#000',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>PAYMENT RECEIPT</h1>
            <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#555' }}>Order ID: {receipt.orderId}</p>
            <p style={{ margin: '0', fontSize: '14px', color: '#555' }}>Date: {formatDate(receipt.date)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#4f46e5' }}>Unknown IITians</h2>
            <p style={{ margin: '5px 0 0', fontSize: '14px' }}>support@unknown.live</p>
            <p style={{ margin: '0', fontSize: '14px' }}>www.unknown.live</p>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '10px' }}>Bill To:</h3>
          <p style={{ margin: '0', fontSize: '14px' }}>{user?.email || 'Student'}</p>
        </div>

        {/* Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px' }}>Description</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '15px 12px', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                <div style={{ fontWeight: 'bold' }}>{receipt.course.title}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Valid Till: {formatValidTill(receipt.course.end_date)}</div>
              </td>
              <td style={{ padding: '15px 12px', textAlign: 'right', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                {isFree ? 'Free' : `₹ ${receipt.amount}`}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
              <span>Subtotal:</span>
              <span>{isFree ? '₹ 0' : `₹ ${receipt.amount}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
              <span>Tax (0%):</span>
              <span>₹ 0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span>{isFree ? '₹ 0' : `₹ ${receipt.amount}`}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', textAlign: 'center', color: '#888', fontSize: '12px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <p>This is a computer-generated receipt and does not require a physical signature.</p>
          <p>Thank you for learning with Unknown IITians!</p>
        </div>
      </div>

    </div>
  );
};

export default EnrollmentReceiptView;
