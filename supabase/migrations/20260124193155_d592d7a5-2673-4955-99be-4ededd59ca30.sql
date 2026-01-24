-- Add discount tracking columns to payments table
ALTER TABLE public.payments
ADD COLUMN discount_applied boolean DEFAULT false,
ADD COLUMN discount_type text, -- 'percent' or 'flat'
ADD COLUMN discount_value numeric DEFAULT 0, -- The discount percentage or flat amount
ADD COLUMN net_amount numeric; -- Final amount received after discount

-- Add comment for clarity
COMMENT ON COLUMN public.payments.discount_applied IS 'Whether a discount was applied to this payment';
COMMENT ON COLUMN public.payments.discount_type IS 'Type of discount: percent or flat';
COMMENT ON COLUMN public.payments.discount_value IS 'The discount value (percentage if percent type, or amount if flat type)';
COMMENT ON COLUMN public.payments.net_amount IS 'Final amount received after applying discount (same as amount if no discount)';