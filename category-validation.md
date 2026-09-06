# Category Navigation Validation

The Volamp category navigation now uses a cascading two-panel structure with 11 main categories. HDC and LDC expose the supplied subcategories; the other nine categories expose an explicit subcategory placeholder until their lists are provided. Main-category, subcategory, and Explore Categories actions navigate to dedicated `/category/:slug` routes.

Validation completed on 2026-09-06:

- Dedicated HDC, LDC, and LT Aluminium Arm Cable routes rendered with styled Volamp category pages.
- Desktop and mobile marketplace previews rendered with the new category menu and 11-category grid.
- Mobile search preview `/?q=LV` displayed the LV Power Cable result.
- Mobile Enquire Now preview `/?surface=inquiry` displayed the responsive inquiry form.
- Mobile account preview `/?surface=account` displayed customer portal and employee access actions.
- Dark-mode HDC/LDC category route previews rendered with the dark theme.
- Cascading menu items use mouse hover and keyboard `onFocus` handlers, while click handlers navigate to category routes.
- TypeScript checks passed and all 4 Vitest tests passed.

## Final keyboard-focused evidence

The deterministic `?surface=keyboard` preview opened the HDC cascade and focused `LT Aluminium Arm Cable`; the `?surface=keyboard-ldc` preview opened the LDC cascade and focused `Multi Core Flexible`. Both states were captured in light and dark desktop previews. The focused rows exposed the same route actions as mouse hover, and the menu buttons retain `onFocus` handlers for Categories, main families, and subcategories.

## Real keyboard-only trace (final)

A headless Chromium DevTools trace exercised actual key events against the live preview. For HDC, the sequence was `Categories` → `Tab` → `HDC (Heavy Duty Cable)` → `ArrowRight` → `LT Aluminium Arm Cable`. For LDC, the sequence was `Categories` → `Tab` → `HDC (Heavy Duty Cable)` → `Tab` → `LDC (Low Duty Cable)` → `ArrowRight` → `Multi Core Flexible`. The subcategory buttons received focus and exposed the same detail/action panel as pointer hover. This confirms real keyboard progression rather than only a query-parameter preview state.

## Hover-gap fix

The desktop pointer trace now moves from the Categories trigger through the former `.65rem` gap and into the cascading panel without closing it. The menu remained open at the trigger, bridge, panel edge, and panel content states, and HDC became active once the pointer entered the panel. The fix adds an invisible desktop-only hit-area bridge on `.category-menu-wrap::after`; it is disabled on mobile, where the panel uses the existing fixed layout.
