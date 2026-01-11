
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Mail, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid 10-digit phone number." }).max(10, { message: "Please enter a valid 10-digit phone number." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

const EmailPopup = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("openContactForm", handleOpen);
    return () => {
      window.removeEventListener("openContactForm", handleOpen);
    };
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setShowConfirmation(false);
    setError(null);
    const { error } = await supabase.functions.invoke("contact-us", {
      body: values,
    });
    setIsSubmitting(false);

    if (error) {
      setError("There was an error submitting the form. Please try again.");
    } else {
      setShowConfirmation(true);
      form.reset();
      setTimeout(() => {
        setShowConfirmation(false);
        setOpen(false);
      }, 1800);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Floating trigger button */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        <DialogTrigger asChild>
          <button
            className={
              "bg-royal text-white w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-royal-dark transition-colors outline-none border-4 border-white"
            }
            aria-label={open ? "Close Contact Form" : "Open Contact Form"}
          >
            {open ? <X size={22} /> : <Mail size={22} />}
          </button>
        </DialogTrigger>
      </div>
      <DialogContent className="max-w-xs p-0 rounded-xl overflow-hidden animate-scale-in border-0 shadow-premium">
        <DialogHeader className="relative">
          {/* Gradient header with icon and title */}
          <div className="bg-gradient-to-r from-royal to-royal-dark py-4 px-4 flex flex-col items-center relative">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow scale-105 -mt-3 mb-0.5 border-2 border-golden">
              <Mail className="text-royal" size={18} />
            </div>
            <DialogTitle className="text-lg font-bold text-white mt-1 mb-0.5">
              Contact Us
            </DialogTitle>
            <DialogDescription className="text-white/90 text-xs font-medium pb-1">
              Fill the form & our team will reply soon!
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="bg-white px-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-xs">Your Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Jane Doe"
                        autoComplete="name"
                        className="bg-gray-50 focus:bg-white h-8 text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-xs">Your Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="bg-gray-50 focus:bg-white h-8 text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-xs">Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your phone number"
                        autoComplete="tel"
                        className="bg-gray-50 focus:bg-white h-8 text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-xs">Your Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here..."
                        rows={3}
                        className="bg-gray-50 focus:bg-white resize-none text-xs p-2 min-h-[65px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              {/* Feedback messages */}
              {showConfirmation ? (
                <div className="bg-green-50 text-green-700 font-medium px-2 py-1 rounded w-full text-xs text-center animate-fade-in">
                  🎉 Thank you! Your message has been sent.
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-700 font-medium px-2 py-1 rounded w-full text-xs text-center animate-fade-in">
                  {error}
                </div>
              ) : null}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-royal hover:bg-royal-dark text-white font-semibold rounded-lg shadow transition h-8 text-xs"
                size="sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-1">
                    <svg className="inline-block animate-spin" width={14} height={14} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="#f59e0b" strokeWidth="2.1" strokeDasharray="31.415,31.415" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
          {/* Subtle divider & info */}
          <div className="border-t border-gray-200 my-3"></div>
          <div className="text-[10px] text-gray-400 text-center leading-tight mb-1">
            We’ll never share your email.<br />
            For urgent queries, email{" "}
            <a
              href="mailto:help.unknowniitians@gmail.com"
              className="text-royal underline hover:text-royal-dark"
            >
              help.unknowniitians@gmail.com
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailPopup;
