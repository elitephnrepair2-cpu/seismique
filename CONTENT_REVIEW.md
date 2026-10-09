# Seismique visitor-content review

## Ordered floating boxes — October 3, 2026

Replaced the fixed bottom Parties & Events / Explore Exhibits pair with sequential floating boxes: Explore Exhibits, Mini Golf, Parties & Events, Coming Soon, Events Calendar, Artists & Team. The boxes alternate sides along the route and open the existing pages directly. Back to jungle preserves progress. Duplicate physical junction signs and the discovery posts were removed so the floating boxes are the primary path navigation. No factual content changed.

Validation: inline and navigation JavaScript syntax and diff checks passed. Local Chrome verified all six options in order, page destinations, hidden bottom controls, and exact progress restoration after each return. Mobile and desktop screenshots were inspected with no JavaScript errors. The interaction check used reduced motion and throttled animation callbacks for software rendering.

## Jungle page markers — October 3, 2026

Coming Soon, Events Calendar, and Artists & Team are now accessible from clickable discovery posts along the jungle walkway. Markers appear in sequence at progress .58–.76, .76–.90, and .90–1.00; physical signposts remain in the 3D world. The projected controls have readable labels and keyboard access. Back to jungle keeps the visitor’s paused progress; existing menu and entrance access remain. No project facts, dates, credits or offers changed.

Local Chrome checked sequential marker visibility, opening each page, and exact progress restoration after returning. Mobile and desktop marker screenshots were inspected. Reduced-motion testing reported no browser JavaScript errors; animation callbacks were throttled for software-rendered screenshots. Normal-motion timing remains unchanged.

## Meeting-inspired pages — October 3, 2026

Added Coming Soon, Events Calendar, and Artists & Team as separately routed information pages with main-menu links. A Coming Soon shortcut appears at the stationary entrance. Project concepts derive from the supplied meeting transcript: a connected space-station story, vendor characters in a market, and possible bar/park work. There are no invented opening dates, individual credits, staff names, offers, or events. Preview badges and confirmation/pending language identify the unfinished content. The artist directory link points to the existing published directory.

The calendar initially displays October 2026 and supports previous/next months and selecting dates. No events are seeded; weekday specials are a clearly labeled area awaiting confirmed details. Local Chrome checked all three pages at 390 × 844 and 1280 × 800, menu navigation, entrance shortcut, calendar month/day changes, and return to tour without browser JavaScript errors. The browser review bypassed Three.js for these information-page checks; the unchanged 3D scene was not re-tested.

## Jungle detail refinement — October 3, 2026

Refined branch cross-sections with irregular ridges, knots and bark bump texture; replaced large folded leaf shapes with smaller curved foliage and fern leaflets; varied plant spacing and pod sizes; rounded stone borders; replaced directional floor bands with seamless mottling. Four selected pods now illuminate nearby surfaces, replacing overlapping overhead lights to keep the overall light count stable. The museum sign moved to the path edge and the junction signs were reduced.

Validation: inline JavaScript syntax and diff checks passed. Local Chrome navigation checks covered reduced-motion arrival, keyboard exploration, Menu, Skip tour, gallery and return. Final entrance screenshots at 390 × 844 and 1280 × 800 were inspected after adjusting the foreground lighting and sign placement. No browser JavaScript errors were reported. Screenshot rendering used reduced motion; the final snapshot run throttled browser animation callbacks for software rendering. Normal-motion timing was not changed, and physical-device frame rates have not been measured.

## Jungle reference update — October 3, 2026

Updated the existing 3D jungle using the user-supplied IMG_2856.mov as a visual reference: thicker braided trunks and roots, lower interlocking canopy limbs, mixed-color hanging and low pods, orange foliage, warmer stacked stone borders, and a mottled teal path. This remains a stylized interpretation, not a measured replica. No visitor facts or exhibit inventory changed.

Validation: inline JavaScript syntax and diff checks passed. Local Chrome screenshots were inspected at 390 × 844 and 1280 × 800. Reduced-motion entrance, jungle exploration, Menu, Skip tour, gallery access, and return navigation passed without browser JavaScript errors. Existing normal-motion timing was unchanged.

## Fullscreen walkthrough update — October 2, 2026

The portal and jungle now fill the browser viewport. Menu, Skip tour, and Get tickets remain accessible above the scene. Enter begins an approximately eleven-second journey that stops inside the jungle; touch swipes, wheel input, and keyboard controls continue exploration. The duplicate page header and intro block were removed.

Local Chrome verified full viewport sizing at 390 × 844 and 1280 × 800, the automatic jungle stop, keyboard exploration, menu navigation, exhibit gallery access, and Skip tour. Entrance, jungle, menu, and desktop screenshots were inspected; no browser JavaScript errors were reported. The software-rendered browser was too slow for reliable timed Pause/Continue click assertions, so those controls were reviewed in code without a completed timed interaction test.

## Exhibit gallery update — October 2, 2026

The right-hand jungle destination is now Explore Exhibits. Nine names and photographs were collected from https://www.seismique.com/immersive-art-museum: Eden, Alien Grass, Abduction, Archive, Facemaking, Kaleidral, Brainwasher, Venus, and Fraction. Short descriptions are paraphrased from that page. This is the initial gallery selection, not a complete exhibit inventory.

Photographs are linked to the existing image assets referenced by the official gallery. No photo files were copied after local-download approval was canceled. EXHIBIT_PHOTOS.json records the original URLs. No substitute images or fictional exhibit names were added.

The meeting transcript warned that existing artist credits may be missing or inaccurate. Individual exhibit credits are omitted pending creative-team confirmation. A link to https://www.seismique.com/meet-the-artists provides the published artist directory. The public About page credits Venus Playground to Toshiko Horiuchi MacAdam, The Hub to Kai Ussin and Shokka, and Flare to Sparker Studio; these mappings remain review notes rather than new gallery claims. The cave mentioned in the meeting was not identified in the retrieved gallery entries.

The existing admission prices, hours, contact paths, and mini golf information were preserved; this change does not re-verify those earlier facts.

Validation for this update: JavaScript syntax, unique HTML IDs, internal anchors, and local references passed. A local Chrome session verified the junction-to-gallery transition, native dialog opening/closing, keyboard focus restoration, exact return to the saved jungle position, and continued mini golf access. All nine remotely hosted display images loaded at 980px width. Gallery layouts were inspected at 390px and 1280px viewport widths, including the WebGL-unavailable fallback. The camera round trip was exercised with reduced motion enabled.

---

Checked September 25, 2026 (America/Chicago). The following points were flagged to Dejohn before publishing. The page contains published facts and contact prompts; no missing policies were filled in from assumptions.

## Verified sources used

| Content | Official source | Treatment |
| --- | --- | --- |
| Museum $34.99 adult / $24.99 child; Mini Golf $24.99 / $21.99; bundle $49.99 / $39.99 | https://order.toasttab.com/online/onlinetickets and https://order.toasttab.com/online/onlinetickets/item-adult-museum-admission_ed122618-f910-4604-bb20-9fe7c6f58f4e | Published price table; total and terms at checkout. |
| Museum interactive light, sound and technology | https://www.seismique.com/immersive-art-museum | Short paraphrase. |
| Indoor 18-hole glow golf | https://www.seismique.com/mini-golf-arcade | Course description and inclusion. |
| Mon–Thu noon–9 pm; Fri noon–midnight; Sat 10 am–midnight; Sun 10 am–9 pm | https://www.seismique.com/ and https://www.seismique.com/visit | Current main-page hours used rather than older archived or demo-page schedules. |
| 2306 Highway 6 S, Houston, TX 77077 | Official Toast ticket listing; https://www.seismique.com/blank corroborates street address | Address and map link. |
| Free parking; arcade exclusion; shoes, socks, food, photo and bag policies; flashing lights | https://www.seismique.com/visit | Brief paraphrases and FAQs. |
| Private events, birthday and company gatherings | https://www.seismique.com/private-events | Separate event section and email inquiry. |
| Info@Seismique.com, (346) 202-6006 | Current official homepage and Visit footer | Email and telephone links. |

## Needs Seismique confirmation before client launch

- Child-ticket age cutoff and any free-admission age rule. No ages invented; page directs customers to confirm.
- Wheelchair and step-free routes, accessible restrooms, and specific accommodations. Only the published flashing-light notice is asserted; page offers a phone/email path to discuss access needs.
- Refund, re-entry and change policies; tax/fee handling. Page directs visitors to official checkout or the team without inventing terms.
- The official site links to https://seismique.tripleseat.com/party_request/47515, but retrieval returned a 404. Do not substitute a guessed form. The site currently uses a dedicated, pre-addressed email inquiry to the verified public contact. No email is sent automatically and there is no false submission confirmation.

Promotional offers and birthday package prices were not added because this request is for baseline admission and an inquiry path. The official checkout remains the source for purchase totals and current terms.

## Verification

- HTML structure, unique IDs and every internal anchor destination checked.
- Public percentage and range input removed.
- Actual DOM interaction simulation tested all four direct navigation links from initial progress zero, Skip tour, deep links, Explore, Auto tour, wheel/touch/key interruption, detour pause/resume and return, normal and reduced motion.
- Navigation remains usable if Three.js is unavailable.
- Main headline and supporting line sit outside the canvas; existing portal geometry and materials were preserved.
- No live browser/GPU visual QA was available in this environment. This remains a visual review item.

## October 3 side-path update

Added six curved side paths beside the floating page boxes, with stone edges and colored guide lights. Local Chrome checks verified all six page links, exact return positions, hidden legacy bottom controls, and no page errors. Mobile and desktop renders were inspected using software WebGL and reduced motion; planting-bed height was corrected to keep branch surfaces visible. JavaScript syntax and diff whitespace checks passed. No factual content changed.

## Separate information pages

Nine static information pages now have their own URLs and page titles, with one content section per page. Browser checks passed direct loading and refreshing every route, mobile overflow checks, exhibit dialog use, calendar month changes, menu navigation, and saved return-state handling. Mobile exhibit and desktop calendar layouts were visually inspected. The pages do not load Three.js. Content facts and preview labels are preserved.

## Cinematic Exhibits redesign — October 4, 2026

Rebuilt /exhibits/ around the user's ten-section conversion brief. Six featured environments use official linked gallery photographs. Additional official visitor images were verified by visual inspection during asset research: two visitors in an LED tunnel (homepage), adults at a light console and children at a projection (private-events), and children in crochet nets (tickets). Media stays linked to the official image host.

Sources: https://www.seismique.com/immersive-art-museum (exhibit names and interaction descriptions); https://www.seismique.com/private-events (visitor imagery); https://www.seismique.com/tickets (family image); https://www.seismique.com/about (published Venus Playground / Toshiko Horiuchi MacAdam credit); https://www.seismique.com/visit (hours, free parking, arcade exclusion); https://order.toasttab.com/online/onlinetickets (adult/child museum $34.99/$24.99 and museum+golf $49.99/$39.99, address); https://www.seismique.com/mini-golf-arcade (indoor 18-hole glow course).

The two-hour planning suggestion is explicitly an editorial suggested plan, not a confirmed typical visit duration. The official /home-demo duration text was not treated as current policy. Current checkout governs final totals, child eligibility and terms. The public artist attribution is used as published; the earlier creative-team credit audit remains a client-launch review item. No savings, deadline, availability or offer claims were invented.

Validation: all ten sections, exact required headlines, six featured exhibits, unique IDs, internal destinations, stylesheet/script references, alternative text, mobile and reduced-motion rules, and page-template preservation checked. JavaScript syntax passed. No live render/layout check was possible because the browser policy check was unavailable.


## Reference brand details — October 5, 2026

The Exhibits page now uses the official CC Biff Bamboom Outline font for featured exhibit names and the image-dialog title. The font is referenced from the observed Parastorage font URL; its public response allows cross-origin loading. The white optical wave was extracted from the official immersive-art-museum page’s visible divider SVG and saved locally as dist/assets/seismique-optical-wave.svg. It is decorative, static, and hidden from assistive technology. The existing coral accent palette is retained.

Visual QA is now available: inspected the original wave and exhibit lettering in the local browser preview at desktop and 375px mobile widths. At 375px and 320px, the page has no horizontal overflow and all six exhibit names fit. Structure and asset checks pass.


## Global footer — October 6, 2026
- Contact, hours and parking checked against https://www.seismique.com/visit. Address and social accounts retained from the official site.
- TikTok https://www.tiktok.com/@seismique supplied by the user. Privacy Policy links to https://www.seismique.com/blank. No Terms page is linked, per the user’s clarification that none is published.
- Shared footer verified on all ten generated routes, with single stylesheet/script inclusion and valid internal destinations.
- Desktop four columns and 375px mobile disclosures visually checked. Social controls are 44 × 44px, keyboard disclosures work, contact navigation reaches its section, and mobile has no horizontal overflow. Homepage scrolling reaches the footer after the jungle endpoint. JavaScript syntax checks pass.

- Footer access correction: visible homepage Visit info shortcut pauses the walkthrough and moves keyboard focus to the footer; Back to tour returns to the existing scene. Verified on desktop and 375px mobile, including interrupting entrance animation. End-of-tour scrolling uses a shared tolerant endpoint check; touch-down no longer freezes the target short of the boundary, and partially scrolled pages retain native scrolling.

## Museum flooring — October 6, 2026
Replaced the entrance floor panels with horizontal illustrated wood planks, using the user’s supplied photo and confirmed cross-path orientation. Off-white and black grain, tapered marks, knots and staggered seams; neutral physical material receives portal lighting with a restrained sheen. Existing Eden painted path retained. Desktop visual review and browser error check passed; inline JavaScript syntax checked.

- Increased floor grain width by approximately 50%, deepened ink to near-black, and strengthened knot contours and plank seams at the user’s request.

## Jungle pacing and depth — October 7, 2026
- Wheel and touch gestures have a forward limit at the next readable stop. Wheel deltas are bounded, jungle pacing increased, and camera advance capped to prevent rapid jumps. Keyboard uses the same stopping points.
- Tested 300-event simulated gestures at all six stops; each lands 8.1m before its marker, inside its visible range. Reverse travel, beginning bounds and final endpoint pass.
- Added instanced background foliage, fuller crowns, distant trunks, broader main trunks and stronger carved bark relief. The ending has a softly lit rooted arch, foliage curtain and colored floor wash. Last card yields to the ending.
- Previewed the entrance and final clearing; no browser errors observed. Verified narrow-screen footer reachability and no horizontal overflow. Temporary isolated scene preview removed before packaging.

## Portal DNA and jungle atmosphere — October 7, 2026
- Added a separate journey-atmosphere layer: angular reflective facets, partial mechanical braces, restrained cyan inlays, magenta/purple reflections, and vegetation reflected near the far end. The original opening field, mechanical activation, portal geometry and journey navigation remain intact.
- Far-rim foliage and turquoise light introduce the jungle gradually. Existing transition hoops are dimmer and ease toward turquoise.
- Dark side surfaces behind the planting receive very faint reflective texture and motion-dependent color spill; low-opacity mist stays along the sides. No additional neon enclosure around the jungle.
- Destination cards have quieter borders and a narrower mobile size. New decorative motion honors reduced-motion preferences; ambient reflection time follows the existing effects clock.
- Desktop portal, transition and jungle scene previews checked; 375px card width/readability and horizontal overflow checked. Shader compilation produced no errors. Original field/activation segment and journey navigation compared unchanged against the prior published source. Temporary scene fixtures removed before packaging.


## Galaxy canopy — version 39

- Opened the jungle ceiling above the existing tree canopy to a camera-relative celestial background; retained the existing portal, side walls, side-room roofs, paths, navigation and destination cards.
- Added dark violet/magenta nebula clouds with muted turquoise patches, sparse stars, and gradual reveal between journey progress .43 and .60. The sky remains behind leaves and branches through ordinary scene depth testing.
- One pooled shooting star crosses the upper sky for 1.25–1.65 effect seconds, with a small tapered tail; subsequent crossings are spaced 15–25 effect seconds apart. No meteor shower or changes to scene lighting.
- Sky motion shares the existing Pause effects clock. Reduced-motion users receive a still galaxy without shooting stars. No downloaded textures or new dependencies.
- Verified the portal transition, jungle entrance and deeper jungle on desktop, plus the galaxy and shooting star at 375×812. No horizontal overflow or WebGL/shader errors. Temporary preview fixtures removed.
- Checked script syntax, event cadence and duration, upper-sky trajectory, pause behavior and reduced-motion behavior using the actual sky factory and bundled Three.js.


## Destination portal — version 40

- Replaced the final luminous tree arch and interior sign with a closed, dimensional metal portal. A beveled elliptical shell, inset light segments, subdued moving rim reflections, mechanical clasps and a dark swirling membrane suggest another world without opening or offering a click target.
- Mounted YOUR NEXT DISCOVERY above the aperture, with physical brackets, foreground roots and leaves. Raised only the last crossing bough to keep the title unobstructed on phones.
- Removed the rear enclosure wall and shortened the last side walls. The existing galaxy extends toward the horizon only during the final approach, with sparse additional stars and the existing shooting-star cadence.
- Fade the ground and walkway edges over the final few metres. Museum flooring beneath the jungle is clipped before this fade so the illustrated grain does not show through. Earlier floor materials retain their appearance.
- The camera settles toward the portal only after progress .945, using an aspect-aware stopping distance. It stays at least 6.7 metres before the closed surface; earlier camera poses and destination stops remain unchanged.
- New portal motion uses the existing effects clock, freezes with Pause effects and stays still for reduced motion. Existing entrance portal geometry and animation preserved.
- Visual QA: desktop 1024×768, phone 375×812 and narrow phone 320×812; readable title, intact earlier jungle, no overflow or WebGL/shader errors. Scrolling at the end reaches the final ticket CTA and global footer.
- Automated checks: executable script syntax, earlier camera-pose equality through .945, monotonic final advance at four aspect ratios, closed surface, reduced-motion behavior, preserved entrance portal block, and unchanged shooting-star timing/pause behavior. Temporary preview fixtures removed.


## Jungle wayfinding cleanup — version 41

- Removed the legacy elevated Explore Exhibits and Parties & Events signs at the old side-room junction. Removed the separate Immersive Museum sign and post that appeared beside the Mini Golf section.
- Renamed the first numbered destination to Immersive Museum, retaining its /exhibits/ immersive museum preview destination. Updated shared navigation and the overview card to use the same name.
- Kept the remaining order: Mini Golf, Parties & Events, Coming Soon, Events Calendar, Artists & Team. No changes to travel, timing, environments, portals or footer behavior.
- Previewed stops 1 and 2 without the obsolete signs. Clicked both cards: Immersive Museum opens the museum preview; Mini Golf opens its own golf page. No browser rendering errors; script syntax and generated page checks pass. Temporary preview pages removed.
