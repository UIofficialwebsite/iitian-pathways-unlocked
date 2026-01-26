import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, Download, Share2, ArrowLeft, Mail, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- Types ---
interface OrderItem {
  title: string;
  amount: number; // This is the individual item price (likely list price)
  validTill: string | null;
  image_url: string | null;
  id: string; // course_id
  type: 'Batch' | 'Add-on';
}

interface ReceiptDetails {
  orderId: string;
  date: string;
  totalAmount: number; // Final amount paid
  subtotal: number;    // Gross amount before discount
  discount: number;    // Total discount value
  couponCode: string | null;
  status: string;
  utr: string;
  paymentTime: string;
  items: OrderItem[];
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
        // 1. Get the initial enrollment to find the Order ID
        const { data: initialEnrollment, error: initialError } = await supabase
          .from('enrollments')
          .select('order_id, created_at, status, courses(id, title, image_url, end_date)')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (initialError) throw initialError;

        if (!initialEnrollment) {
          setLoading(false);
          return;
        }

        const orderId = initialEnrollment.order_id;
        
        let finalItems: OrderItem[] = [];
        let finalTotal = 0;
        let finalSubtotal = 0;
        let finalDiscount = 0;
        let finalCoupon: string | null = null;
        let finalDate = initialEnrollment.created_at;
        let finalStatus = initialEnrollment.status || 'Success';
        let finalUtr = '-';
        let finalPaymentTime = new Date(finalDate).toLocaleTimeString();

        // 2. If Order ID exists, fetch ALL items in this order
        if (orderId) {
          const { data: allEnrollments, error: allError } = await supabase
            .from('enrollments')
            .select(`
              amount,
              subject_name,
              courses (
                id,
                title,
                image_url,
                end_date
              )
            `)
            .eq('order_id', orderId);

          if (allError) throw allError;

          if (allEnrollments) {
            // Sort: Clicked course first, then by price descending
            const sortedEnrollments = allEnrollments.sort((a, b) => {
               const aId = (a.courses as any)?.id;
               const bId = (b.courses as any)?.id;
               if (aId === courseId) return -1;
               if (bId === courseId) return 1;
               return (b.amount || 0) - (a.amount || 0);
            });

            finalItems = sortedEnrollments.map((item: any) => {
              const isAddon = !!item.subject_name;
              const displayTitle = item.subject_name || item.courses?.title || 'Unknown Item';
              const validityDate = item.courses?.end_date; 

              return {
                title: displayTitle,
                amount: Number(item.amount) || 0,
                validTill: validityDate,
                image_url: item.courses?.image_url,
                id: item.courses?.id,
                type: isAddon ? 'Add-on' : 'Batch'
              };
            });
          }

          // 3. Fetch Payment Record for accurate Pricing, Discounts & Coupons
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select(`
              amount, 
              net_amount, 
              discount_value, 
              coupon_code, 
              created_at, 
              order_id, 
              status, 
              utr, 
              payment_time
            `)
            .eq('order_id', orderId)
            .maybeSingle();

          if (!paymentError && paymentData) {
            // Logic: 
            // net_amount is usually the actual paid amount. 
            // amount might be the gross amount or paid amount depending on gateway logic.
            // Safe bet: Final Paid = net_amount (if exists) ELSE amount.
            // Subtotal = Final Paid + Discount.
            
            const netAmount = Number(paymentData.net_amount);
            const rawAmount = Number(paymentData.amount);
            const discountVal = Number(paymentData.discount_value) || 0;

            // If net_amount is present, use it as 'Paid', otherwise use 'amount'
            finalTotal = !isNaN(netAmount) && netAmount !== 0 ? netAmount : (rawAmount || 0);
            
            finalDiscount = discountVal;
            
            // Subtotal is what it would have cost without discount
            finalSubtotal = finalTotal + finalDiscount;
            
            finalCoupon = paymentData.coupon_code || null;
            finalDate = paymentData.created_at;
            finalStatus = paymentData.status || finalStatus;
            finalUtr = paymentData.utr || '-';
            finalPaymentTime = paymentData.payment_time || new Date(paymentData.created_at).toLocaleTimeString();
          } else {
            // Fallback if no payment record found (e.g. manual entry or legacy)
            finalTotal = finalItems.reduce((sum, item) => sum + item.amount, 0);
            finalSubtotal = finalTotal;
            finalDiscount = 0;
          }

        } else {
          // Fallback: Single item, no order ID
          const singleCourse = initialEnrollment.courses as any;
          finalItems = [{
            title: singleCourse?.title || 'Unknown Course',
            amount: 0, 
            validTill: singleCourse?.end_date, 
            image_url: singleCourse?.image_url,
            id: singleCourse?.id,
            type: 'Batch'
          }];
          finalTotal = 0;
          finalSubtotal = 0;
          finalDiscount = 0;
        }

        setReceipt({
          orderId: orderId || (initialEnrollment.courses as any)?.id || 'N/A',
          date: finalDate,
          totalAmount: finalTotal,
          subtotal: finalSubtotal,
          discount: finalDiscount,
          couponCode: finalCoupon,
          status: finalStatus,
          utr: finalUtr,
          paymentTime: finalPaymentTime,
          items: finalItems
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // --- Actions ---
  const handleDownloadPDF = async () => {
    if (!receiptRef.current || !receipt) return;
    setIsDownloading(true);

    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`Invoice_${receipt.orderId}.pdf`);
      toast({ title: "Success", description: "Official invoice downloaded." });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast({ title: "Error", description: "Failed to generate receipt.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!receipt) return;
    const shareData = {
      title: 'Enrollment Receipt',
      text: `Enrollment Receipt for Order ${receipt.orderId}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied", description: "Receipt link copied to clipboard." });
    }
  };

  const handleContactUs = () => {
    if (!receipt) return;
    const subject = `Support Request: Order ${receipt.orderId}`;
    const formattedAmount = receipt.totalAmount === 0 ? 'Free' : `₹ ${receipt.totalAmount}`;
    const orderDate = new Date(receipt.date).toLocaleDateString('en-GB');
    const body = `Hi Support Team,\n\nI am writing regarding my recent enrollment.\n\n--- ORDER DETAILS ---\nOrder ID: ${receipt.orderId}\nAmount: ${formattedAmount}\nDate: ${orderDate}\n---------------------\n\n[Please describe your issue here]`;
    const mailtoLink = `mailto:support@unknowniitians.live?cc=unknowniitians@gmail.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-[#4f46e5]" /></div>;
  if (!receipt) return <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#64748b]"><h2 className="text-xl font-bold mb-2">Receipt Not Found</h2><Link to="/dashboard/enrollments"><Button variant="outline">Back to Enrollments</Button></Link></div>;

  const isFree = receipt.totalAmount === 0;
  
  const mainBatch = receipt.items.find(i => i.type === 'Batch') || receipt.items[0]; 
  const addOns = receipt.items.filter(i => i !== mainBatch);

  // Filter Items for display in Payment Summary & PDF
  const displayItems = receipt.items; // Show all items in list to explain subtotal

  return (
    <div className="font-['Inter',sans-serif] w-full max-w-[1000px] mx-auto pb-10">
      
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/dashboard/enrollments" className="inline-flex items-center text-sm text-[#64748b] hover:text-[#4f46e5] transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Enrollments
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-10 text-center">
            <div className="w-11 h-11 bg-[#10b981] text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-bold text-[#334155] mb-6">Payment Successful</h1>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center gap-2 bg-white border border-[#e2e8f0] px-[18px] py-2.5 rounded-lg text-sm text-[#334155] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-colors disabled:opacity-50">
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isDownloading ? 'Generating...' : 'Download Invoice'}
              </button>
              <button onClick={handleShare} className="flex items-center gap-2 bg-white border border-[#e2e8f0] px-[18px] py-2.5 rounded-lg text-sm text-[#334155] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-colors">
                <Share2 className="w-4 h-4" /> Share Receipt
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6">
            <div className="flex justify-between text-[13px] text-[#64748b] mb-5">
              <span>Order Id: {receipt.orderId}</span>
              <span>Order Date: {formatDate(receipt.date)}</span>
            </div>

            {/* Main Batch Card */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#fcfdfe] border border-[#f1f5f9] rounded-[10px] p-4 gap-4">
              <div className="flex gap-4 items-center w-full">
                <img src={mainBatch.image_url || "https://via.placeholder.com/90x60/4f46e5/ffffff?text=Course"} alt={mainBatch.title} className="w-[90px] h-[60px] bg-[#e2e8f0] rounded-md object-cover flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className="text-base font-medium text-[#334155] mb-1 leading-tight">{mainBatch.title}</h3>
                  <p className="text-sm text-[#64748b] mb-1">
                    Value: <span className="text-[#334155] font-medium">{mainBatch.amount === 0 ? 'Free' : `₹${mainBatch.amount}`}</span>
                  </p>
                  <span className="inline-block bg-[#dcfce7] text-[#166534] text-[11px] px-2 py-0.5 rounded">Active</span>
                </div>
              </div>
              <Link to={`/courses/${mainBatch.id}`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-[#eef2ff] text-[#4f46e5] border-none px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors whitespace-nowrap cursor-pointer">Go to Batch</button>
              </Link>
            </div>

            {/* Add-ons List */}
            {addOns.length > 0 && (
              <div className="mt-4 px-4 pt-4 border-t border-[#f1f5f9]">
                <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">Included Add-ons</h4>
                <div className="space-y-3">
                  {addOns.map((addon, idx) => (
                    <div key={idx} className="flex items-center justify-between group py-1">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#f0f9ff] text-[#0ea5e9] flex items-center justify-center shrink-0">
                          <Plus className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-[#334155] font-medium">{addon.title}</span>
                      </div>
                      <Link to={`/courses/${addon.id}`} className="text-xs text-[#4f46e5] hover:underline font-medium">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 bg-[#fafbff] p-4 rounded-lg">
              <label className="text-xs text-[#64748b] block mb-1">Valid Till:</label>
              <p className="text-base text-[#334155]">
                {formatValidTill(mainBatch.validTill)}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Pricing */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6">
            <h2 className="text-[17px] font-bold text-[#334155] mb-5">Payment Details</h2>
            
            {/* List Everything in Payment Breakdown */}
            {displayItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm text-[#64748b] mb-2">
                    <span className="truncate max-w-[180px]">{item.title} {item.type === 'Add-on' && '(Add-on)'}</span>
                    <span>{item.amount === 0 ? 'Free' : `₹ ${item.amount}`}</span>
                </div>
            ))}
            
            <div className="border-t border-[#e2e8f0] my-3"></div>
            
            {/* Subtotal */}
            <div className="flex justify-between text-sm text-[#64748b] mb-2">
              <span>Subtotal</span>
              <span>{formatCurrency(receipt.subtotal)}</span>
            </div>

            {/* Discount Section */}
            {receipt.discount > 0 && (
              <div className="flex justify-between text-sm text-[#10b981] mb-2 font-medium">
                <span className="flex items-center gap-1">
                  Discount
                  {receipt.couponCode && (
                     <span className="text-[10px] bg-[#dcfce7] text-[#166534] px-1.5 py-0.5 rounded border border-[#86efac] flex items-center gap-0.5">
                       <Tag className="w-2.5 h-2.5" /> {receipt.couponCode}
                     </span>
                  )}
                </span>
                <span>-{formatCurrency(receipt.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm text-[#64748b] mb-3"><span>Delivery Charges</span><span>₹ 0</span></div>
            
            <div className="mt-4 pt-4 border-t border-[#e2e8f0] flex justify-between text-base text-[#334155] font-medium">
              <span>Total Paid</span>
              <span>{isFree ? '₹ 0' : formatCurrency(receipt.totalAmount)}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-[#f9faff] rounded-xl border border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6">
            <div className="flex justify-between items-center">
              <div className="flex-1 pr-4">
                <h2 className="text-[17px] font-bold text-[#334155] mb-1">Need help?</h2>
                <p className="text-[13px] text-[#64748b] leading-[1.4] mb-4">Get in touch and we will be happy to help you.</p>
                <button onClick={handleContactUs} className="bg-[#4f46e5] text-white border-none px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Contact Us
                </button>
              </div>
              <img src="https://illustrations.popsy.co/blue/customer-support.svg" className="w-20 opacity-80" alt="support" />
            </div>
          </div>
        </div>
      </div>

      {/* === HIDDEN FORMAL INVOICE TEMPLATE (PDF Only) === */}
      <div 
        ref={receiptRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '210mm',
          minHeight: '297mm',
          backgroundColor: '#ffffff',
          padding: '40px',
          fontFamily: "'Inter', sans-serif",
          color: '#1a1a1a',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <img src="https://res.cloudinary.com/dkywjijpv/image/upload/v1769193106/UI_Logo_yiput4.png" alt="Logo" style={{ height: '50px', marginBottom: '16px', objectFit: 'contain' }} />
            <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#4b5563' }}>
              <strong>Unknown IITians</strong><br />Ed-tech Platform<br />New Delhi, India<br /><span style={{ color: '#4f46e5' }}>support@unknowniitians.live</span><br /><a href="https://unknowniitians.live" style={{ color: '#4f46e5', textDecoration: 'none' }}>www.unknowniitians.live</a>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>INVOICE</h1>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              <p style={{ margin: '4px 0' }}><strong>Invoice #:</strong> INV-{receipt.orderId.slice(-8).toUpperCase()}</p>
              <p style={{ margin: '4px 0' }}><strong>Order ID:</strong> {receipt.orderId}</p>
              <p style={{ margin: '4px 0' }}><strong>Date:</strong> {formatDate(receipt.date)}</p>
              <p style={{ margin: '4px 0' }}><strong>Time:</strong> {receipt.paymentTime}</p>
              <p style={{ margin: '4px 0' }}><strong>UTR:</strong> {receipt.utr}</p>
              <p style={{ margin: '4px 0' }}><strong>Status:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>PAID</span></p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '40px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold', letterSpacing: '1px', margin: '0 0 8px 0' }}>Bill To</h3>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{user?.user_metadata?.full_name || 'Valued Student'}</div>
          <div style={{ fontSize: '14px', color: '#4b5563' }}>{user?.email}<br />(Digital Delivery)</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ backgroundColor: '#111827', color: '#ffffff' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '6px 0 0 6px' }}>Item Description</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '0 6px 6px 0' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Access valid until: {formatValidTill(item.validTill)}</div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: '#4b5563' }}>{item.type === 'Batch' ? 'Digital Course' : 'Add-on'}</td>
                <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    {item.amount === 0 ? 'Free' : `₹ ${item.amount.toLocaleString('en-IN')}`}
                </td>
                </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#4b5563' }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(receipt.subtotal)}</span>
            </div>
            
            {receipt.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#10b981' }}>
                    <span>Discount {receipt.couponCode ? `(${receipt.couponCode})` : ''}:</span>
                    <span>-{formatCurrency(receipt.discount)}</span>
                </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#4b5563' }}><span>Tax (0%):</span><span>₹ 0.00</span></div>
            <div style={{ borderTop: '2px solid #e5e7eb', margin: '8px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}><span>Total Paid:</span><span>{formatCurrency(receipt.totalAmount)}</span></div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', textTransform: 'uppercase' }}>Terms & Conditions / Legal Disclaimer</h4>
          <div style={{ fontSize: '10px', color: '#6b7280', lineHeight: '1.6', textAlign: 'justify' }}>
            <p style={{ marginBottom: '6px' }}>1. <strong>Final Sale:</strong> This receipt serves as proof of payment for digital educational services provided by Unknown IITians. All sales are final.</p>
            <p style={{ marginBottom: '6px' }}>2. <strong>Unauthorized Distribution:</strong> The content provided is the intellectual property of Unknown IITians. Unauthorized copying or distribution is strictly prohibited.</p>
            <p style={{ marginBottom: '6px' }}>3. <strong>Jurisdiction:</strong> Any disputes shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.</p>
            <p style={{ marginBottom: '6px' }}>4. <strong>Service Claims:</strong> Unknown IITians makes no guarantees regarding specific exam results. The materials are provided "as is".</p>
            <p style={{ marginBottom: '0' }}>This is a computer-generated invoice and does not require a physical signature.</p>
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>© {new Date().getFullYear()} Unknown IITians. All rights reserved. | www.unknowniitians.live</div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentReceiptView;
