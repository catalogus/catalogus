# M-Pesa Integration Plan (TanStack Start + Supabase)
This plan is based on `M-PESA.md` and the current codebase. It focuses on a secure, server-side M-Pesa integration that fits TanStack Start and Supabase.

## Key Constraints From the M-Pesa Doc
- Authorization header must be `Bearer <encrypted API key>`, where the API key is RSA-encrypted with the public key and Base64-encoded.
- Requests are REST over HTTPS only.
- Async callbacks require an HTTPS callback URL and a port in `[11000,19000]`.
- Transaction lifecycle includes C2B initiation, optional status queries, and reversals.

## Step 1 — Credentials and Endpoints
Collect from the M-Pesa developer portal:
- API Key
- Public Key (Base64)
- Base URL for sandbox and live
- C2B initiation endpoint
- Transaction status query endpoint
- Reversal endpoint
- Required request/response fields for each call

Decide how to separate sandbox vs live configuration using environment variables.

## Step 2 — Async vs Sync Strategy
Because async callbacks require HTTPS on ports `[11000,19000]`, choose one path before implementation:
- Host TanStack Start on a Node server that can terminate TLS on a port within `[11000,19000]` and expose `/api/mpesa/callback`.
- Keep M-Pesa in synchronous mode and implement server-side status polling with the Transaction Status Query API.

## Step 3 — Data Model Alignment
Fix schema mismatches and add payment tracking:
- The function in `supabase/migrations/20260111_atomic_checkout_rpc.sql` uses `payment_method`, but `supabase/schema.sql` does not define it.
- Either add `payment_method` to `orders` or remove it from the RPC.

Pick one payment data strategy:
- Add fields to `orders`: `payment_method`, `payment_status`, `mpesa_transaction_id`, `mpesa_reference`, `mpesa_last_response`, `paid_at`.
- Create a `mpesa_transactions` table with `order_id`, `transaction_id`, `status`, `amount`, `phone`, `request_payload`, `response_payload`, `created_at`, `updated_at`.

Decide stock handling:
- Keep current behavior and reserve stock at order creation, with a release strategy on failed/expired payments.
- Or decrement stock only after confirmed payment and add a `mark_order_paid` function.

## Step 4 — Server-Only M-Pesa Client
Create a server-only module (example path: `src/server/mpesa.ts`) that provides:
- `buildBearerToken(apiKey, publicKeyBase64)` using Node crypto RSA public encryption and Base64 encoding.
- `mpesaRequest({ endpoint, method, body })` with proper headers and error handling.
- `initiateC2BPayment(order, phone, amount)`.
- `queryTransactionStatus(transactionId)`.
- `reverseTransaction(transactionId, amount, reason)`.

Ensure the public key is converted into a valid PEM form before encryption.

## Step 5 — Replace Client Stub With Server Functions
Current client stub exists in `src/lib/mpesa.ts`. Replace all client usage with TanStack Start server functions:
- Create a server function like `createOrderAndInitiateMpesa({ cart, customer })`.
- Validate session and cart against DB.
- Create the order and items.
- Call M-Pesa C2B initiation.
- Store `mpesa_transaction_id` and initial payment status.
- Return safe client payload: order id, instructions, and status.

Update these files to call the server function instead of importing the client stub:
- `src/routes/checkout/index.tsx`
- `src/routes/pedido/$orderId.tsx`

## Step 6 — Callback or Polling Flow
If async callbacks are possible:
- Add `/api/mpesa/callback` and validate payload shape.
- Verify transaction by calling `queryTransactionStatus` before marking paid.
- Update order status and stock atomically.
- Respond quickly with HTTP 200.

If async callbacks are not possible:
- Add `getMpesaStatus(orderId)` server function.
- Use TanStack Query polling on the order detail page to update status.

## Step 7 — Frontend Updates
Update checkout and order detail flows:
- `src/routes/checkout/index.tsx` should call only the server function and show returned instructions.
- `src/routes/pedido/$orderId.tsx` should poll or subscribe to order status updates.
- Remove the M-Pesa stub usage and update translation keys for payment statuses.

## Step 8 — Supabase Functions and RLS
Update database functions and policies:
- If pay-then-decrement, update `create_order_atomic` to stop stock decrementing.
- Add `mark_order_paid(order_id, transaction_id, amount)` to validate totals and update stock atomically.
- RLS: customers can read their own orders; only service role can update payment status fields.

## Step 9 — Admin Support
Expose M-Pesa metadata in the admin UI:
- `mpesa_transaction_id`
- `payment_status`
- last response info

Add admin actions:
- Recheck transaction status
- Reverse transaction

## Step 10 — Environment and Secrets
Add server-only environment variables:
- `MPESA_API_KEY`
- `MPESA_PUBLIC_KEY`
- `MPESA_BASE_URL`
- `MPESA_CALLBACK_URL`
- `MPESA_TIMEOUT_MS`
- `SUPABASE_SERVICE_ROLE_KEY`

Add entries to `.env.example` and deployment documentation.

## Step 11 — Testing
Use the M-Pesa sandbox to validate:
- Authorization token encryption matches portal expectations.
- C2B initiation succeeds and stores transaction metadata.
- Status query updates order status.
- Callback flow updates order status if async is enabled.
- Failure cases: invalid phone, insufficient balance, and timeouts.

## Step 12 — Deployment and Validation
- Select hosting based on async callback requirements.
- If using non-443 ports, provision TLS for the chosen port.
- Register callback URL in the M-Pesa portal.
- Run end-to-end tests to confirm order creation, payment initiation, status updates, and correct stock updates.

## Immediate File-Level Impact
- `src/lib/mpesa.ts` will be removed or replaced with server-only logic.
- `src/routes/checkout/index.tsx` will call a single server function.
- `src/routes/pedido/$orderId.tsx` will use polling or realtime updates.
- `supabase/migrations/20260111_atomic_checkout_rpc.sql` will be updated for the selected stock strategy.
- `supabase/schema.sql` will be updated for payment fields or a new `mpesa_transactions` table.

## Open Decisions Required Before Implementation
- Hosting strategy for async callbacks on ports `[11000,19000]`.
- Stock update timing (order creation vs confirmed payment).
- Data storage strategy for M-Pesa metadata (orders table vs `mpesa_transactions`).
