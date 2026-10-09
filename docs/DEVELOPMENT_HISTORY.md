# Seismique private walkthrough

Static hosted version of the approved interactive portal and jungle concept. Site audience is managed by Sites; this update preserves its existing access policy.

The complete page is in `dist/index.html`; Three.js r160 is served locally from `dist/assets/three.min.js`. Ticket checkout remains a concept preview.

No build is required. Preserve the project ID in `.openai/hosting.json` when updating this Site.

The page fits one mobile viewport. Swipe, scroll, or use the arrow keys to follow the museum route. Parties & Events and Explore Exhibits appear as optional detours after entering the jungle. Each destination takes the camera through an interior junction automatically; the exhibit detour opens the photo gallery on arrival. Back to the jungle restores the saved position. Reduced-motion users change destinations without animated camera travel.

The sculpted logo lighting uses the official homepage logo palette, sampled September 25, 2026: purple #600DFF, coral #FF4D67, yellow #F9D003, repeated in reading order. Source: https://www.seismique.com/ (SEISMIQUE LOGO no squiggle.png). Letter outlines and geometry are preserved.

Portal refinement: arrival powers only the machine and logo. The first 17% of travel opens the liquid energy surface with less than one world unit of camera movement. Continued scrolling crosses a long, outward-flaring tunnel into an illuminated canopy. Reverse travel closes the surface. The unrelated source illustration is hidden during loading.

Validation: JavaScript execution and motion/state simulation cover both motion preferences, stationary power-up, scroll-controlled opening, monotonic camera travel, and both detours with return. These checks do not verify GPU rendering.

The tunnel is 10.5 world units long, retaining the flowing material introduced in version 7 and reflecting the physical entrance. Camera travel gives the passage a longer segment before jungle arrival. The opening uses a single circular edge that settles into the fixed rim, with the duplicate ring removed.

Laser refinement: opening retracts beam endpoints toward their emitters and fades main beams, branches, impacts and surface strike light before the opening reaches the hardware. The opening edge is a soft surface glow without a separate floating ring. Fully open emitters retain a steady glow; reverse scroll restores the beams. Tunnel geometry, shader and camera timing are unchanged.

Depth correction: the membrane and tunnel mouth now sit behind the machine rim and emitter tips. The emitter aim uses a stable target while beams retract, preventing the opening radius from tipping the heads back into the surface. The tunnel keeps its 10.5-unit depth and flowing material.

Reference fidelity: inner laser heads retain their original fixed flange orientation. Cream housings and black trim are unchanged. Dark recessed nozzle mouths replace the spinning blades and bright central dots; a thin cyan rim and restrained light provide the power-up. Tunnel length, flowing material and scroll timing remain unchanged.


## Visitor navigation and planning

A compact Menu contains Exhibits, Mini Golf, Parties & Events, Plan Your Visit, Overview, and the portal link. Get tickets remains available in both views. Skip tour opens the exhibit gallery directly. Hash URLs can open each section directly.

The walkthrough fills the entire viewport on mobile and desktop. The duplicate Seismique header and separate introductory copy are removed. Tap Enter starts an approximately 11-second journey that stops at the jungle entrance; swipe, scroll or arrow keys then control movement. Enter becomes Pause during travel and Continue when interrupted. Reduced motion jumps directly to the jungle. Menu contains effects and destination-motion controls. Active detours support pause/resume. Information navigation works even if 3D fails to initialize. Ticket links go to official checkout; events use a labeled email inquiry.

Visitor styles and navigation are in `dist/assets/visitor.css` and `dist/assets/visitor.js`. `CONTENT_REVIEW.md` records verified sources and remaining factual review items. These additions do not alter the portal geometry or the tunnel material.

## Exhibit gallery

`dist/assets/exhibits.js` contains nine featured exhibit names and short descriptions. Photographs reference Seismique’s existing official image URLs; availability depends on that image host. Selecting a photograph opens a native accessible dialog with a larger image, description, and ticket link. Escape or Close returns focus to the selected card. The gallery remains reachable without WebGL through `#exhibits` and the main navigation. The mini golf information and ticket links remain available separately.

Individual artist credits are intentionally omitted pending confirmation by the creative team; the gallery links to the official artist directory. The gallery is a selection, not a complete inventory. Photo provenance is recorded in `EXHIBIT_PHOTOS.json`; outstanding content checks are in `CONTENT_REVIEW.md`.

## Jungle visual reference

The October 3 update uses the supplied IMG_2856.mov to guide thicker braided trunks, interlocking overhead branches, multicolored glowing pods at varied heights, orange foliage, reddish stone beds, and a textured teal walkway. The navigation and portal are preserved.

Jungle refinement: trunks now have irregular ridges, relief knots and fine bark grooves. Smaller curved foliage and fern leaflets vary the planting scale. Selected glowing pods light nearby surfaces; rounded stones and seamless floor mottling soften the materials. The museum sign moves to the path edge, with smaller junction signs and unchanged navigation controls.

## Meeting-inspired previews

Coming Soon, Events Calendar, and Artists & Team are available as separate information views through the Menu. The entrance includes a Coming Soon shortcut. `dist/assets/calendar.js` supplies month browsing and date selection; no event dates or offer terms are fabricated. Project concepts follow the meeting transcript, with previews clearly labeled and individual artist/staff credits awaiting confirmation.

## Jungle discovery posts

Coming Soon, Events Calendar, and Artists & Team appear as accessible, clickable markers projected onto physical posts along the jungle route. Only the marker for the current stretch of the trail appears. Each opens its existing information page; Back to jungle preserves the paused progress. Menu access and the earlier entrance teaser remain available.

## Floating jungle options

The floating boxes now run in this order: Explore Exhibits, Mini Golf, Parties & Events, Coming Soon, Events Calendar, Artists & Team. Boxes alternate sides and appear on successive stretches of the existing trail. The fixed pair of bottom destination buttons and duplicate junction signs are removed from the visitor experience; the boxes open their information pages directly and returning preserves the paused jungle position.

## Side paths beside floating boxes

Each of the six floating options now has a short curved side path with low stone edging and subtle colored edge lighting. Shared positions align each box with its opening. Plants, pods, and nearby trunks leave the entrances clear while the main trail continues ahead.

## Separate visitor pages

Floating boxes and menu links navigate to independent static pages at /exhibits/, /mini-golf/, /parties/, /coming-soon/, /calendar/, and /artists-team/. Overview, museum admission, and visit planning also have their own pages. Information pages load only their relevant interactions, without the 3D scene. The Back to jungle link restores this tab's saved tour progress via session storage. Old section hash links redirect to the matching page. Run scripts/build-pages.py after editing content sections in dist/index.html to refresh the standalone page outputs.

## Sculpted bark texture

Tree trunks, roots, and canopy limbs now use deeper irregular geometric fluting and a shared 512px longitudinal bark texture. The grain follows each branch rather than crossing it, with dark fissures, fine surface breakup, stronger bump relief, and warmer purple ridge color. Texture length follows limb length to keep the grain scale consistent.

## Tree silhouette revision

Trees now have broad continuous trunks, six grounded buttress roots, three unequal primary boughs, smaller attached forks, and sparse foliage at the tips. The rope-like spiral strands and ring-shaped knots are replaced by a natural branching hierarchy. Canopy lanterns attach to boughs, and two additional trees frame the early trail. Bark relief remains, with a slower longitudinal twist.

## Reference canopy and raised planting beds

Seven substantial attached boughs and their smaller forks form a lower interlocking canopy. Ten asymmetrical planting islands replace the continuous stone borders, with larger orange-red blocks, raised soil, draped roots, and concentrated orange foliage. Island placement tests main-trail and side-path clearance; ground plants follow soil height.

## Recessed bark channels

Replaced the high-contrast striped bark color with subtle granular mottling. Six irregular rounded channels now recess the actual trunk, root, and limb geometry, using 64 radial samples on trunks and 48 on major limbs. Relief softens toward fine tips, and normals are joined across the texture seam. Fine bump strength is reduced so lighting follows the sculpted channels.

## Irregular stacked stonework

The planter walls now use three beveled slab forms with broad worn faces, chipped edges, varied lengths and thicknesses, offset joints, and shallow face-depth variation. Slabs follow each bed by arc length; dark backing shows through narrow joints. Shared granular bump and russet color variation give restrained roughness. Side-path edging uses matching smaller slabs placed outside the walking surface.

## Color-cycling jungle bulbs

Each glowing pod now smoothly cycles through LED colors over 14–20 seconds with a different initial hue and rate. Its halo, floor glow, and selected nearby light share that color. The animation uses the existing effects clock, so Pause effects freezes it and reduced-motion visitors start with still colors. The first two overhead pods now cast light on nearby surfaces.

## Purple side lighting and plant variety

Four low purple side washes span the jungle and graze the sculpted bark, with reduced white ambient fill. Ground planting now mixes lanceolate leaves, cupped lobed leaves, and complete pinnate fern fronds with connected central stems. Orange and green fans cluster in the raised beds; small trailing vines attach to outer bed edges and selected canopy branches. New ground foliage checks its transformed bounds against the trail and side paths.

## Cinematic Exhibits page

The /exhibits/ route now presents ten ordered sections: full-screen photo hero, experience explanation, six large exhibit previews, visitor interaction, discovery collage, audience imagery, artist spotlight, admission/bundle choice, visit planning, and final ticket CTA. The canonical page is pages/exhibits.html; scripts/build-pages.py preserves it when rebuilding other routes. Dedicated exhibits-experience.css and exhibits-experience.js supply responsive layouts, restrained hero/exhibit motion, reduced-motion support, and a keyboard-accessible image dialog. Shared visitor navigation retains the return-to-jungle link.


## More space between jungle stops

The six side paths are now evenly spaced 5.2 scene units apart (26 units from first to last, previously 18). The camera continues to z=-45 within the existing planted jungle. Cards appear by distance to their path opening, with a 1.4-unit unlabelled stretch between options and the final card available at the endpoint. Wheel, touch, and keyboard input use a shared continuous pacing conversion that requires 40% more travel input in the jungle. Portal timing is preserved.

Validation: inline JavaScript parses; sampled the full jungle route to confirm every card is reachable, no two cards overlap, and scenic gaps exist. Forward/backward input across the portal boundary and both travel endpoints pass. The local browser rendered the first stop without console errors.


## Shared global footer
Edit `components/footer.html` for footer content and `dist/assets/global-footer.css` / `global-footer.js` for presentation and mobile disclosures. Run `scripts/build-pages.py` from this checkout to insert the same component into the homepage, cinematic Exhibits template, and all standalone information pages. The footer is outside the immersive root, in normal document flow. The jungle releases downward scrolling at its endpoint, and the menu also links directly to visit information. Sticky navigation and ticket links remain available.


## Alien Grass destination accents

`dist/assets/destination-grass.js` adds six frosted globe clusters on slender blue stems, rooted with small leaf sprouts beside the existing destination options. Card visibility drives a staggered, eased wake and outgoing fade. Each stop has a related pastel LED palette; two shared point lights provide localized spill. A narrower placement on the inner planting shoulder keeps clusters visible on phones. Card glass catches a subtle matching tint without changing labels or links.

The shared effects clock freezes color and brightness when effects are paused. Reduced motion uses still colors and direct active-state changes. All cluster light fades out before the final portal view. The entrance, jungle camera route, six destination order, final ticket CTA, and footer remain unchanged.

Validation: desktop 1440×900 and phone 375×812 rendered correctly with no browser errors. Behavioral checks passed for active-only lighting, staggered wake, outgoing fade, focus feedback, paused freeze, reduced-motion stability, and final-portal fade.


## Organic Alien Grass variation

The globe accents now use gently bowed blue stems, looser height/depth arrangements, attached leaves, and two partially screened globes in each cluster. A soft two-color emission blend gives the frosted surface subtle internal color movement; it shares the existing effects clock and freezes with Pause effects/reduced motion. Geometry is rebuilt only at the mobile breakpoint, with the previous curved geometry disposed. Navigation, card placement, active-state handoff, and the six-stop journey stay unchanged.

Validation: browser previews on desktop and 375px mobile showed clear destination text and no rendering errors. Behavioral checks include internal color uniforms when verifying pause and reduced-motion stability, plus finite curved geometry, activation, stagger, handoff, and final fade.


## Progressive bioluminescent jungle

The existing foliage now uses a richer emerald/teal palette with occasional warm accents. `dist/assets/jungle-lighting.js` adds selective translucent leaf highlights, soft grazing color on bark, and reflected path pools through the existing materials. Instanced foliage receives world-space shading; distant foliage stays darker. Existing side and canopy lights are retuned and distributed along the route, with intensity increasing gradually through the jungle. Hanging pods have blended luminous color and a bounded glow increase. The existing ten mist pockets now provide soft, feathered shafts and haze; no scenery or additional light sources were added.

Color progression follows journey position and reverses with backward travel. Subtle motion uses the shared effects clock, so Pause effects and reduced motion remain supported. The floor shader retains its final-portal fade. Navigation, destination cards, portal geometry, galaxy, and footer are unchanged.

Validation: desktop and 375px mobile previews at early, middle, deep, and ending positions; no browser errors or horizontal mobile overflow. Checks cover continuous bounded progression, contrast-preserving fog, paused clocks, reduced motion, instanced shader coordinates, and preservation of the final floor fade.
