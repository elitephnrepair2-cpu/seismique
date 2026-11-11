# Events page and manager workflow

Updated November 6, 2026 with the manager's preliminary answers supplied by the user. This document distinguishes confirmed direction from proposed implementation. The manager said fuller answers would follow. The subsequent public-page redesign follows the direction below; booking-platform integration and a content editor remain pending.

## Confirmed by the manager

- Private parties and rentals require direct communication with her. She must check supplies/inventory and staff scheduling before a booking can be arranged.
- Customers can buy general admission and event admission tickets themselves. They cannot independently book private events or parties.
- The business is returning to a ticketing/booking system that already gives staff booking details and outstanding balances, with a calendar, notes/messaging and invoices. Its name and supported inquiry route have not yet been supplied.
- She is the sole person facilitating events. Other staff use the booking system and do not need website access for booking information.
- Do not publish packages. She wants flexibility to accommodate special groups without discouraging inquiries.
- She wants photos of the bar and gallery, a small selection of event photos, and flyers for special events as on the previous website.
- The bar accommodates 65 guests. The gallery accommodates 100, with an extension into another room for approximately 150. Treat the larger arrangement as subject to discussion, not a guaranteed standard capacity or automatic eligibility rule.
- Her previous inquiry route listed the events email and asked for the date, guest count and type of event. The actual events email address has not yet been supplied.

Source notes: user-provided `text-6F5BFF9CB5FE-1.txt` and `text-C26E0738F74A-1.txt`. These are preliminary business requirements, not instructions to submit messages or publish changes automatically.

## Public page direction

1. Introduce private events with authentic bar/gallery/event photography and a clear "Inquire about an event" action.
2. Present the spaces: bar up to 65; gallery up to 100; larger gallery arrangements around 150 by discussion. Do not present unconfirmed prices, packages or promises about inclusions.
3. Make the inquiry easy to start: event type, preferred date, estimated guest count and contact details. Offer flexibility/undecided choices so early inquiries can still reach her.
4. Keep budget, preferred time/duration, space preferences and extra notes optional. Budget can help her tailor the conversation; do not use it to silently reject or exclude special groups. The manager has not yet approved any budget ranges or minimums.
5. Explain that she checks availability, supplies and staffing before confirming the event. A date entered in the form is a preference, not a reservation or verified availability.
6. Give public special events a separate flyer/listing area with approved dates, descriptions and admission-ticket links when available. Public ticket purchases and private-rental inquiries must have distinct actions. Private bookings never become public listings automatically.

Use approved real photographs. The previous Gallery hero image was removed at the user's request; do not restore it or substitute generated event imagery without direction.

## Staff tools: revised scope

The existing booking platform remains responsible for bookings, calendar, customer records, notes/messaging, invoices and payment balances. The earlier proposed custom inquiry pipeline, quote builder, holds, calendar, payment tracking, reporting and multi-person events workspace are superseded by the manager's answers. Do not build a duplicate booking system or a public private-event reservation calendar.

If she wants to edit website content herself, propose a small authenticated content editor for one events manager. It would manage approved space photos/text and public event flyers, dates, descriptions, ticket links and publication state. Preview, unpublish and past-event archiving are proposed conveniences, not confirmed requirements. Confirm whether she wants self-service editing or prefers to send changes to the website maintainer before choosing an editor.

Other staff continue using the booking platform. Do not introduce website access to private booking records merely to support public content editing.

## What is working on the website now

The redesigned Parties & Events page presents the Gallery and Drinque bar with their supplied guest capacities. A single inquiry form gathers occasion, guest count, preferred date/flexibility, space preference, name and email. An optional disclosure holds timing, budget, interests, additional contact details and notes. Space-specific inquiry links preselect the room. The public-events section links to Seismique’s existing flyers and registrations until the manager supplies the current assets for this site. Visitors review a structured plan and explicitly email it using their own email service, or copy it. The website does not submit messages, create leads, store contact information, reserve dates or take payments. With JavaScript unavailable, direct email/phone routes remain usable.

The current inquiry address is the existing general address `info@seismique.com`, not a manager-confirmed events address. Do not describe the form as a successfully delivered inquiry merely because an email composer opened. A direct submission route must give truthful delivery/error feedback if added later.

The page uses the manager’s supplied capacities. It does not publish package prices, available dates or response-time promises. Optional budget is the customer's estimate in USD, not a quote. Date/time is a preference in Houston, not live inventory.

## Possible platform: Resova (identity unconfirmed)

The user subsequently mentioned a possible move to a service pronounced "Rezovo" for payments and integrations. Resova is a plausible match, but neither the exact service nor the business's selected account/plan has been confirmed. Do not treat this as authorization to migrate bookings or change payment destinations.

Official Resova documentation checked November 6, 2026 describes:

- A booking calendar, staff/room/equipment scheduling, blocked periods, booking notes, PDF invoices and payment links: [feature overview](https://get.resova.com/features/feature/all-features/).
- Items set to private for team members only: [calendar setup](https://info.resova.com/resova-knowledge-center/setting-up-the-calendar).
- Staff creating bookings from calendar slots: [calendar bookings](https://info.resova.com/resova-knowledge-center/creating-bookings-on-time-slots-from-the-calendar).
- Website embedding and external calendar connections: [integrations](https://get.resova.com/features/integrations/all-integrations/).

If this is their chosen platform, the proposed flow is: private-event inquiry reaches the manager; she checks supplies, staffing and room availability; she arranges the booking and payment in Resova. General admission and public-event ticket actions can use their approved Resova destinations. Verify the account configuration before implementation; product documentation does not establish that these features are enabled for Seismique. An embedded checkout or booking API is not evidence of a supported inquiry intake endpoint. Keep private rentals unavailable for customer self-booking in accordance with the manager's instructions.

Continue public-page content and inquiry design while awaiting the exact platform and working links. If the selected platform lacks a feature, establish the specific gap before proposing an additional tool.

## Remaining inputs

- The ticketing/booking platform's name, working public ticket links, and any supported private-event inquiry form/link or integration. Confirm the platform is ready before changing destinations.
- The direct events email and preferred inquiry destination: that inbox or an approved form feeding the existing system. Do not assume she wants duplicate submissions to both.
- Approved bar/gallery/event photos and current special-event flyers, with event dates and ticket destinations.
- Whether she wants to publish website updates herself; if so, which fields she wants to control.
- Any remaining public-facing details she wants included, such as venue access, catering options, visit/tour requests or response expectations. Await confirmation before making promises.

## Prior link finding

On November 5, 2026 the official private/corporate-events pages linked to `https://seismique.tripleseat.com/party_request/47515`, which redirected to `/404` and displayed "Page Not Found!" No form was submitted. This establishes a broken historical public route, not whether the business still uses Tripleseat or which platform it is returning to. Use the manager's confirmed current destination rather than guessing from this old link.

## Implementation order

1. Revise the public page around spaces and direct inquiries, keeping package listings and private-event self-booking out of scope.
2. Connect the approved inquiry destination once supplied, preserving optional budget qualification and clear confirmation expectations.
3. Add approved photography and public special-event flyers with correct ticket links.
4. Add the small content editor only if the manager wants to maintain these items herself.
5. Check the customer flow on phone/tablet and validate inquiry delivery through an agreed test; do not send a real inquiry or contact the manager without explicit authorization.

## Redesign photography

The redesigned page uses two photographs from Seismique’s existing website, downloaded and visually checked November 6, 2026, resized to 720/1600-pixel JPEGs. The removed hero image is not reused.

- Gallery room: `IMG_5595.JPEG`, [corporate events page](https://www.seismique.com/corporate-events-houston), [original photograph](https://static.wixstatic.com/media/51d719_3d5a60e96ec9402994892eda572943de~mv2.jpeg).
- Drinque bar: `20260121_131959.jpg`, [bar page](https://www.seismique.com/the-drinque), [original photograph](https://static.wixstatic.com/media/51d719_06f29dd5bd674ec1a7ea2ec8631366a8~mv2.jpg).

Local files: `dist/assets/events/gallery-{720,1600}.jpg` and `dist/assets/events/drinque-{720,1600}.jpg`. No generated event imagery was added. The manager can replace these with her preferred photographs. Public flyers are currently reached through https://www.seismique.com/events-calendar; no unconfirmed event dates or prices were copied onto this page.

## November 10 GM feedback: bar and audience navigation

- Added `/bar/` and a Bar entry in the six-item main navigation and footer. The page explicitly states that museum admission is not required, welcomes neighborhood meetups, and describes watching games on the giant screen. No bar hours, menu, specials or scheduled games were added. The bar footer directs visitors to call for current bar hours instead of implying museum hours also apply to the bar.
- Reused the approved-site bar photo already in this project. Added a second authentic photo from the same official Drinque page showing the giant screen above the seating (screen is off in the actual photo; no content was composited onto it). Original: https://static.wixstatic.com/media/51d719_afda2dac52094be6b335fcac21337623~mv2.jpeg . Local responsive files: `drinque-screen-{720,1200}.jpg`. Resize only, no generated or substitute venue imagery.
- The official calendar https://www.seismique.com/events-calendar listed Caffeine + Canvas (Adults) and Putt Pals Mini Golf + Art (ages 4–10) when checked November 10. Their official Eventbrite links are retained. Eventbrite returned a rate-limit error during automated retrieval, so individual session dates were not verified or inferred from the recurring text. Published listings link to registration for available dates. The month view explicitly states that individual dates are not yet listed here; an empty date is not a declaration that no event occurs.
- All Events / Adults / Kids & Families filters apply to the listings and any explicitly confirmed calendar dates. `public-events-data` in the maintained component is the source for IDs, audience membership, publication status, date arrays and registration destinations. Only add dated sessions after approval; never turn a recurring description or tentative concept into a confirmed calendar entry. The static cards remain usable without JavaScript.
- Removed the tentative weekday-special and future-concept promotions from the public events page. Compatibility section anchors and legacy redirects remain valid.
- Birthday parties and adult/private gatherings now have distinct paths that preselect the appropriate occasion in the existing inquiry. The accompanying-adult / no-drop-off policy appears with birthday content, in the inquiry area and on the public-events page. Guest count remains required (positive whole number); date, budget and space preferences retain their original optional behavior. Existing contact routing, review-before-email flow, manager confirmation and room capacities are unchanged.
- Targeted regeneration: `python3 scripts/build-bar-events.py`; the full page builder also invokes this refresh. After homepage navigation changes, run the existing journey build and release gate.
