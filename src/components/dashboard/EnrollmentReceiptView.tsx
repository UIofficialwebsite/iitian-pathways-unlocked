import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, Download, Share2, ArrowLeft, Mail, Printer } from 'lucide-react';
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

  // --- Actions ---

  const handleDownloadPDF = async () => {
    if (!receiptRef.current || !receipt) return;
    setIsDownloading(true);

    try {
      const element = receiptRef.current;
      
      // Use html2canvas to render the hidden receipt div
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 settings
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${receipt.orderId}.pdf`);

      toast({
        title: "Success",
        description: "Official receipt downloaded.",
      });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate receipt. Please try printing instead.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleContactUs = () => {
    if (!receipt) return;
    
    const subject = `Support Request: Order ${receipt.orderId}`;
    const formattedAmount = receipt.amount === 0 ? 'Free' : `₹ ${receipt.amount}`;
    const orderDate = new Date(receipt.date).toLocaleDateString('en-GB');
    
    const body = `Hi Support Team,

I am writing regarding my recent enrollment.

--- ORDER DETAILS ---
Order ID: ${receipt.orderId}
Course: ${receipt.course.title}
Amount: ${formattedAmount}
Date: ${orderDate}
---------------------

[Please describe your issue here]`;

    // UPDATED EMAILS
    const mailtoLink = `mailto:support@unknowniitians.live?cc=unknowniitians@gmail.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
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
      
      {/* Back Link */}
      <div className="mb-6">
        <Link 
          to="/dashboard/enrollments" 
          className="inline-flex items-center text-sm text-[#64748b] hover:text-[#4f46e5] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Enrollments
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
        
        {/* Left Column - On Screen View */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-10 text-center">
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
                {isDownloading ? 'Generating...' : 'Download Official Invoice'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6">
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
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6">
            <h2 className="text-[17px] font-bold text-[#334155] mb-5">Payment Details</h2>
            <div className="flex justify-between text-sm text-[#64748b] mb-3">
              <span>Price (1 item)</span>
              <span>{isFree ? '₹ 0' : `₹ ${receipt.amount}`}</span>
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

          <div className="bg-gradient-to-br from-white to-[#f9faff] rounded-xl border border-[#e2e8f0] shadow-sm p-6">
            <div className="flex justify-between items-center">
              <div className="flex-1 pr-4">
                <h2 className="text-[17px] font-bold text-[#334155] mb-1">Need help?</h2>
                <p className="text-[13px] text-[#64748b] leading-[1.4] mb-4">
                  For support inquiries, please contact us directly.
                </p>
                <button 
                  onClick={handleContactUs}
                  className="bg-[#4f46e5] text-white border-none px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================================
          HIDDEN FORMAL INVOICE TEMPLATE (This renders only for the PDF generation)
         ===================================================================================== */}
      <div 
        ref={receiptRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '210mm', // Standard A4 width
          minHeight: '297mm',
          backgroundColor: '#ffffff',
          padding: '40px',
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: '#1a1a1a',
          boxSizing: 'border-box'
        }}
      >
        {/* --- Header Section --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '24px', marginBottom: '32px' }}>
          
          {/* Logo & Company Info */}
          <div>
            <img 
              src="https://res.cloudinary.com/dkywjijpv/image/upload/v1769193106/UI_Logo_yiput4.png" 
              alt="Unknown IITians Logo" 
              style={{ height: '50px', marginBottom: '16px', objectFit: 'contain' }}
            />
            <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#4b5563' }}>
              <strong>Unknown IITians</strong><br />
              Digital Learning Platform<br />
              Noida, Uttar Pradesh, India<br />
              <span style={{ color: '#4f46e5' }}>support@unknowniitians.live</span><br />
              <a href="https://unknowniitians.live" style={{ color: '#4f46e5', textDecoration: 'none' }}>www.unknowniitians.live</a>
            </div>
          </div>

          {/* Invoice Meta */}
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>INVOICE</h1>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              <p style={{ margin: '4px 0' }}><strong>Invoice #:</strong> INV-{receipt.orderId.slice(-8).toUpperCase()}</p>
              <p style={{ margin: '4px 0' }}><strong>Order ID:</strong> {receipt.orderId}</p>
              <p style={{ margin: '4px 0' }}><strong>Date:</strong> {formatDate(receipt.date)}</p>
              <p style={{ margin: '4px 0' }}><strong>Status:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>PAID</span></p>
            </div>
          </div>
        </div>

        {/* --- Bill To Section --- */}
        <div style={{ marginBottom: '40px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold', letterSpacing: '1px', margin: '0 0 8px 0' }}>Bill To</h3>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
            {user?.user_metadata?.full_name || 'Valued Student'}
          </div>
          <div style={{ fontSize: '14px', color: '#4b5563' }}>
            {user?.email}<br />
            (Digital Delivery)
          </div>
        </div>

        {/* --- Line Items --- */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ backgroundColor: '#111827', color: '#ffffff' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '6px 0 0 6px' }}>Item Description</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '0 6px 6px 0' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{receipt.course.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Access valid until: {formatValidTill(receipt.course.end_date)}
                </div>
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: '#4b5563' }}>Digital Course</td>
              <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                {isFree ? 'Free' : `₹ ${receipt.amount.toLocaleString('en-IN')}`}
              </td>
            </tr>
          </tbody>
        </table>

        {/* --- Totals --- */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#4b5563' }}>
              <span>Subtotal:</span>
              <span>{isFree ? '₹ 0.00' : `₹ ${receipt.amount.toLocaleString('en-IN')}.00`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#4b5563' }}>
              <span>Tax (0%):</span>
              <span>₹ 0.00</span>
            </div>
            <div style={{ borderTop: '2px solid #e5e7eb', margin: '8px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
              <span>Total:</span>
              <span>{isFree ? '₹ 0.00' : `₹ ${receipt.amount.toLocaleString('en-IN')}.00`}</span>
            </div>
          </div>
        </div>

        {/* --- Legal Footer --- */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', textTransform: 'uppercase' }}>Terms & Conditions / Legal Disclaimer</h4>
          
          <div style={{ fontSize: '10px', color: '#6b7280', lineHeight: '1.6', textAlign: 'justify' }}>
            <p style={{ marginBottom: '6px' }}>
              1. <strong>Final Sale:</strong> This receipt serves as proof of payment for digital educational services provided by Unknown IITians. As this is a digital service granting immediate access to proprietary content, all sales are final, and no refunds will be issued once access has been granted, except as required by applicable law.
            </p>
            <p style={{ marginBottom: '6px' }}>
              2. <strong>Unauthorized Distribution:</strong> The content provided under this enrollment is the intellectual property of Unknown IITians. Unauthorized copying, distribution, screen recording, or sharing of account credentials is strictly prohibited and may result in immediate termination of access without refund and potential legal action under the Copyright Act, 1957.
            </p>
            <p style={{ marginBottom: '6px' }}>
              3. <strong>Jurisdiction:</strong> Any disputes arising out of or in connection with this transaction shall be subject to the exclusive jurisdiction of the courts located in Noida, Uttar Pradesh, India.
            </p>
            <p style={{ marginBottom: '6px' }}>
              4. <strong>Service Claims:</strong> While we strive to provide the highest quality education, Unknown IITians makes no guarantees regarding specific exam results or academic outcomes. The materials are provided "as is" to aid in preparation.
            </p>
            <p style={{ marginBottom: '0' }}>
              This is a computer-generated invoice and does not require a physical signature.
            </p>
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
            © {new Date().getFullYear()} Unknown IITians. All rights reserved. | www.unknowniitians.live
          </div>
        </div>

      </div>
    </div>
  );
};

export default EnrollmentReceiptView;
