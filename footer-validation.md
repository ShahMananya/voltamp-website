# VOLAMP Footer Validation

The homepage footer was rebuilt around the supplied reference structure. It now includes a Blog-led top bar, five columns titled ABOUT VOLAMP, SHOP CATEGORIES, HELP, ORDER SUPPORT, and SOCIAL MEDIA LINKS, followed by a bottom copyright strip reading `Volamp Elektrikals © 2026. All rights reserved.`

The category column uses all 11 VOLAMP main categories. The order-support column includes the requested placeholder support number, order tracking, Quick Order, invoice payment, price list, and complaints/cases actions. The social column uses the supplied LinkedIn, Facebook, Instagram, and YouTube URLs. The GeM Government e Marketplace mark is loaded from managed web storage and links to `https://gem.gov.in/`.

A Chromium trace passed in desktop and mobile light/dark states. Each state reported five footer columns, a loaded GeM image with the expected alternative text, the Blog headline, the requested copyright text, and responsive grid behavior: five desktop columns and one mobile column. TypeScript and all six Vitest tests passed.

The Order Support phone now displays `9512365582` and links to `tel:+919512365582`. The updated Chromium trace confirmed the number and tel destination in desktop and mobile light/dark states.
