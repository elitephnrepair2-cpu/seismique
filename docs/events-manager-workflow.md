# Events manager workflow — foundation awaiting manager input

Prepared November 5, 2026. This is a proposed staff workflow, not a live staff system or approved business policy.

## What is working now

The public Parties & Events page introduces corporate events, celebrations and performances. Its three-step planner gathers occasion, guest count, preferred date and flexibility, requested start time/duration, interests, estimated total budget or help estimating, notes and contact details. Visitors review a structured plan and explicitly email it using their own email service, or copy it. The website does not submit messages, create leads, store contact information, reserve dates or take payments. With JavaScript unavailable, the direct email/phone routes remain usable.

No prices, guest capacities, available dates, package commitments or response-time promises have been invented. Optional budget is expressed in USD as the customer's estimate, not a quote. Date/time is a preference in Houston, not live inventory. The public inquiry address is the existing info@seismique.com.

## Existing-system finding to confirm first

The official https://www.seismique.com/private-events and https://www.seismique.com/corporate-events-houston pages link to https://seismique.tripleseat.com/party_request/47515. On November 5, 2026 this redirected in the browser to /404 and showed “Page Not Found!” No form was submitted. This establishes a broken public route, not whether the staff account/subscription is active.

Ask the manager whether Tripleseat is still in use, which location owns events, and for the current approved inquiry URL or supported integration. Prefer their active system as the booking source of truth. Do not create a second calendar or duplicate inbox before that is resolved. Do not assume undocumented form endpoints are supported APIs.

## Proposed staff workspace

- **Today:** inquiries awaiting a reply; holds nearing expiry; upcoming events missing details or payments. Each entry opens the complete event record.
- **Inquiries:** filter by occasion, date window, guest count, budget, owner and status. Keep a visible last-contact date and next action. Budget should inform recommendations, not silently discard customers.
- **Event record:** contact, request details, guest count, chosen spaces, event/setup/cleanup times, conversation, internal notes, proposal revisions and an activity history. Keep internal notes and customer-facing messages distinct.
- **Availability:** staff view of each space and its approved capacities, recurring windows, blackouts, holds and confirmed events. Represent resources blocked by full venue rentals. Enforce conflicts on the server when a hold or confirmation is created.
- **Website:** edit approved packages, photos, inclusions and FAQs; preview changes before publishing. Public “What’s Happening” entries have their own publish state and approved ticket link. Private bookings never become public events automatically.
- **Reporting:** inquiry response time, source, conversion, confirmed value and reasons bookings were declined, if the manager needs these.

## Proposed lifecycle to validate

New inquiry → Reviewing → Proposal sent → Temporary hold → Confirmed → Completed.
Alternative outcomes: closed without booking, cancelled, or hold expired. Confirm exact statuses with the manager; quotation does not itself reserve capacity. Only an authorized manager can place a timed hold or confirm, and all required payment/agreement conditions must come from their policy. Track hold expiry, edits, notification outcomes and who made each change. Customer follow-up preferences and business reminder rules remain undecided.

## Decisions the manager must supply

| Decision | Why it matters |
|---|---|
| Existing tools and valid inquiry route | Choose the canonical inbox/calendar and avoid duplicate entry |
| Spaces, capacities, simultaneous events and buyout rules | Determine availability and resource conflicts |
| Packages, prices, minimum spends, extras and taxes/fees | Determine quoting and what can be shown publicly |
| Lead time, hours, duration, setup/cleanup and closures | Determine valid slots |
| Holds and expiry; approval authority | Prevent requests from becoming unintended reservations |
| Agreements, deposits, balances and cancellations | Define confirmation and payment workflow |
| Staff users and roles | Restrict publishing, pricing, confirmation and private customer records |
| Contact channels, response expectations and reminders | Define notifications and follow-up |
| Data retention and access | Decide how contact records and attachments are handled |
| Fixed offerings eligible for instant booking | Identify what can safely bypass a custom quote |

## Next implementation after answers

1. Verify the existing booking tool and supported connection; route requests into it with delivery/error confirmation. If it is being replaced, agree on the new source of truth before migrating.
2. Add authenticated staff access with server-side permissions. A hidden URL is not access control. Use explicit roles and an activity log before exposing any private records.
3. Add structured package/space configuration, quotes, timed holds and conflict-safe confirmation. Connect payment state to the actual provider; do not handle card details in the website database.
4. Add public availability and instant booking only for manager-approved offerings and rules. Confirm availability again at reservation time.
5. Validate a real inquiry-to-event example with the manager before enabling automatic customer messages or payments.

## Public content / image provenance

Event categories and possibilities were checked against the official private-events and corporate-events pages above. The Gallery photograph is the public image linked there (51d719_4dd2916158ae4ec8882aedf061815097~mv2.png). The mini-golf photo is an existing local website asset. Page content uses original concise copy; no new capacities or package guarantees are asserted.
