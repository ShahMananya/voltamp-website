/**
 * VOLAMP ELEKTRIKALS: Master Google Knowledge Graph & Carousels Schema
 * Powers Google Knowledge Panels, Google Search Carousels (ItemList),
 * Sitelinks Search Box, and Rich FAQ Snippets.
 */

export const HOME_KNOWLEDGE_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    // 1. Core Corporate & LocalBusiness Entity for Google Knowledge Panel
    {
      "@type": ["Corporation", "WholesaleStore", "ElectricalSupplyStore", "LocalBusiness"],
      "@id": "https://www.volampelektrikals.com/#organization",
      "name": "VOLAMP ELEKTRIKALS",
      "legalName": "VOLAMP ELEKTRIKALS PRIVATE LIMITED",
      "alternateName": [
        "VOLAMP",
        "Volamp Elektrikals",
        "Volamp Elektrikals Pvt Ltd",
        "VOLAMP ELEKTRIKALS PVT LTD",
        "Volamp Wires and Cables Ahmedabad",
        "Volamp Switchgear & Lugs",
        "Volamp Electricals"
      ],
      "url": "https://www.volampelektrikals.com",
      "logo": "https://www.volampelektrikals.com/volamp-logo.png",
      "image": [
        "https://www.volampelektrikals.com/team/volamp-khadia-storefront.jpg",
        "https://www.volampelektrikals.com/volamp-logo.png"
      ],
      "description": "Premier wholesale distributor and master stockist of industrial cables, house wires, switchgear, cable lugs, brass cable glands, and solar DC cabling in Ahmedabad, Gujarat. Authorized distributor and channel partner for Polycab India, Finolex Cables, KEI Industries, Schneider Electric, Dowells, and Comet.",
      "telephone": "+919512365582",
      "email": "sales@volampelektrikals.com",
      "foundingDate": "1964",
      "founder": [
        {
          "@type": "Person",
          "name": "Bipin Shah"
        }
      ],
      "taxID": "24AAICV0754B1ZO",
      "vatID": "U31900GJ2021PTC122730",
      "priceRange": "$$",
      "director": [
        {
          "@type": "Person",
          "name": "Naimil Vipul Patel",
          "jobTitle": "CEO & Director"
        },
        {
          "@type": "Person",
          "name": "Vipulbhai Chaturbhai Patel",
          "jobTitle": "Director"
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1753, Dhobi's Pole Sir, Chinubhai Rd, Old City, Khadia",
        "addressLocality": "Ahmedabad",
        "addressRegion": "Gujarat",
        "postalCode": "380001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 23.0225,
        "longitude": 72.5950
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "09:30",
          "closes": "19:30"
        }
      ],
      "hasMap": "https://maps.app.goo.gl/FPiAvDJEKCsxTLgT8?g_st=iw",
      "areaServed": [
        { "@type": "City", "name": "Ahmedabad" },
        { "@type": "State", "name": "Gujarat" },
        { "@type": "Country", "name": "India" }
      ],
      "sameAs": [
        "https://maps.app.goo.gl/FPiAvDJEKCsxTLgT8?g_st=iw",
        "https://maps.app.goo.gl/WgS6fp3TaEsH2GBU7",
        "https://www.indiamart.com/volamp-elektrikals/profile.html",
        "https://www.zaubacorp.com/VOLAMP-ELEKTRIKALS-PRIVATE-LIMITED-U31900GJ2021PTC122730",
        "https://tracxn.com/d/legal-entities/india/volamp-elektrikals-private-limited/__zVrCPOD2dqIHgX77DHZQ2M16ODn3Y2mDXxPTyci6fp4",
        "https://www.linkedin.com/company/volampelektrikals/",
        "https://www.youtube.com/@cablezone",
        "https://x.com/volampelektrik",
        "https://www.instagram.com/volampp",
        "https://www.facebook.com/profile.php?id=61587485305483",
        "https://www.pinterest.com/volampelektrikals/"
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+91-9512365582",
          "contactType": "sales",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi", "Gujarati"]
        },
        {
          "@type": "ContactPoint",
          "telephone": "+91-9512365582",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi", "Gujarati"]
        }
      ],
      "knowsAbout": [
        "Armoured Power Cables",
        "Unarmoured Flexible Cables",
        "LT XLPE Power Cables",
        "HT XLPE Power Cables",
        "IS 7098 (Cross-linked Polyethylene Insulated Cables)",
        "IS 1554 (PVC Insulated Heavy Duty Electrical Cables)",
        "IS 694 (PVC Insulated Flexible Copper Building Wires)",
        "EN 50618 (Electric Cables for Photovoltaic Systems)",
        "IEC 62444 (Cable Glands for Electrical Installations)",
        "Polycab India (https://www.wikidata.org/entity/Q104868979)",
        "Schneider Electric (https://www.wikidata.org/entity/Q380512)",
        "Finolex Cables (https://www.wikidata.org/entity/Q110629731)",
        "KEI Industries",
        "Dowells Crimping Lugs",
        "Comet Cable Glands"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "84",
        "bestRating": "5",
        "worstRating": "1"
      },
      "brand": [
        { "@type": "Brand", "name": "Polycab" },
        { "@type": "Brand", "name": "Finolex" },
        { "@type": "Brand", "name": "KEI Industries" },
        { "@type": "Brand", "name": "Schneider Electric" },
        { "@type": "Brand", "name": "L&T Switchgear" },
        { "@type": "Brand", "name": "Dowells" },
        { "@type": "Brand", "name": "Comet Glands" }
      ],
      "department": [
        {
          "@type": "Warehouse",
          "name": "VOLAMP Central Fulfillment Center / Logistics Terminal",
          "telephone": "+919512365582",
          "email": "logistics@volampelektrikals.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Near NH-48 & SP Ring Road Junction, Aslali",
            "addressLocality": "Ahmedabad",
            "addressRegion": "Gujarat",
            "postalCode": "382427",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 22.9064,
            "longitude": 72.5878
          },
          "openingHours": "Mo-Sa 08:00-20:00",
          "hasMap": "https://maps.app.goo.gl/WgS6fp3TaEsH2GBU7"
        }
      ]
    },

    // 2. WebSite Entity for Google Sitelinks Search Box
    {
      "@type": "WebSite",
      "@id": "https://www.volampelektrikals.com/#website",
      "url": "https://www.volampelektrikals.com",
      "name": "VOLAMP ELEKTRIKALS",
      "alternateName": "Volamp Elektrikals Official Wholesale Portal",
      "publisher": {
        "@id": "https://www.volampelektrikals.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.volampelektrikals.com/products?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },

    // 3. Google Carousel 1: Fast-Moving Electrical Products (ItemList)
    {
      "@type": "ItemList",
      "@id": "https://www.volampelektrikals.com/#product-carousel",
      "name": "Fast-Moving Industrial Cables & Switchgear in Ahmedabad",
      "description": "High-demand cables, flexible wires, solar cables, and distribution equipment available for immediate dispatch from Volamp Aslali logistics terminal.",
      "numberOfItems": 8,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "0.5 SQMM X 1 CORE Unarmoured Copper CABLE",
          "url": "https://www.volampelektrikals.com/product/CAB-000001",
          "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3",
          "item": {
            "@type": "Product",
            "name": "Polycab 0.5 SQMM X 1 CORE Unarmoured Copper CABLE",
            "sku": "CAB-000001",
            "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3",
            "description": "Polycab 0.5 SQMM X 1 CORE Unarmoured Copper CABLE - Industrial Flexible (FRLS) Insulated Cable IS 694:1990.",
            "brand": { "@type": "Brand", "name": "Polycab" },
            "offers": {
              "@type": "Offer",
              "price": "12.93",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.volampelektrikals.com/product/CAB-000001"
            }
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "0.75 SQMM X 1 CORE Unarmoured Copper CABLE",
          "url": "https://www.volampelektrikals.com/product/CAB-000002",
          "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3",
          "item": {
            "@type": "Product",
            "name": "Polycab 0.75 SQMM X 1 CORE Unarmoured Copper CABLE",
            "sku": "CAB-000002",
            "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3",
            "description": "Polycab 0.75 SQMM X 1 CORE Unarmoured Copper CABLE - Industrial Flexible (FRLS) Insulated Cable IS 694:1990.",
            "brand": { "@type": "Brand", "name": "Polycab" },
            "offers": {
              "@type": "Offer",
              "price": "18.67",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.volampelektrikals.com/product/CAB-000002"
            }
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "1 SQMM X 1 CORE Unarmoured Copper CABLE",
          "url": "https://www.volampelektrikals.com/product/CAB-000003",
          "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3",
          "item": {
            "@type": "Product",
            "name": "Polycab 1 SQMM X 1 CORE Unarmoured Copper CABLE",
            "sku": "CAB-000003",
            "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3",
            "description": "Polycab 1 SQMM X 1 CORE Unarmoured Copper CABLE - Industrial Flexible (FRLS) Insulated Cable IS 694:1990.",
            "brand": { "@type": "Brand", "name": "Polycab" },
            "offers": {
              "@type": "Offer",
              "price": "23.95",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.volampelektrikals.com/product/CAB-000003"
            }
          }
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "1.5 SQMM X 1 CORE Unarmoured Copper CABLE",
          "url": "https://www.volampelektrikals.com/product/CAB-000004",
          "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3",
          "item": {
            "@type": "Product",
            "name": "Polycab 1.5 SQMM X 1 CORE Unarmoured Copper CABLE",
            "sku": "CAB-000004",
            "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3",
            "description": "Polycab 1.5 SQMM X 1 CORE Unarmoured Copper CABLE - Industrial Flexible (FRLS) Insulated Cable IS 694:1990.",
            "brand": { "@type": "Brand", "name": "Polycab" },
            "offers": {
              "@type": "Offer",
              "price": "34.68",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.volampelektrikals.com/product/CAB-000004"
            }
          }
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "2.5 SQMM X 1 CORE Unarmoured Copper CABLE",
          "url": "https://www.volampelektrikals.com/product/CAB-000005",
          "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3",
          "item": {
            "@type": "Product",
            "name": "Polycab 2.5 SQMM X 1 CORE Unarmoured Copper CABLE",
            "sku": "CAB-000005",
            "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3",
            "description": "Polycab 2.5 SQMM X 1 CORE Unarmoured Copper CABLE - Industrial Flexible (FRLS) Insulated Cable IS 694:1990.",
            "brand": { "@type": "Brand", "name": "Polycab" },
            "offers": {
              "@type": "Offer",
              "price": "57.75",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.volampelektrikals.com/product/CAB-000005"
            }
          }
        },
        {
          "@type": "ListItem",
          "position": 6,
          "name": "Solar DC Cable 1C x 4 sqmm (H1Z2Z2-K)",
          "url": "https://www.volampelektrikals.com/product/SOL-000001",
          "image": "https://www.volampelektrikals.com/products/solar-panel.jpg?v=3",
          "item": {
            "@type": "Product",
            "name": "Solar DC Cable 1C x 4 sqmm (H1Z2Z2-K)",
            "sku": "SOL-000001",
            "image": "https://www.volampelektrikals.com/products/solar-panel.jpg?v=3",
            "description": "UV, ozone and weather-resistant crosslinked halogen-free photovoltaic cable for 1500V DC solar plants.",
            "brand": { "@type": "Brand", "name": "Polycab" },
            "offers": {
              "@type": "Offer",
              "price": "76.00",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.volampelektrikals.com/product/SOL-000001"
            }
          }
        },
        {
          "@type": "ListItem",
          "position": 7,
          "name": "10kA C-Curve Miniature Circuit Breaker (MCB)",
          "url": "https://www.volampelektrikals.com/product/SWG-000001",
          "image": "https://www.volampelektrikals.com/products/switchgear.jpg?v=3",
          "item": {
            "@type": "Product",
            "name": "10kA C-Curve Miniature Circuit Breaker (MCB)",
            "sku": "SWG-000001",
            "image": "https://www.volampelektrikals.com/products/switchgear.jpg?v=3",
            "description": "IS/IEC 60898-1 certified final distribution protection device with bi-connect terminals.",
            "brand": { "@type": "Brand", "name": "Schneider Electric" },
            "offers": {
              "@type": "Offer",
              "price": "185.00",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.volampelektrikals.com/product/SWG-000001"
            }
          }
        },
        {
          "@type": "ListItem",
          "position": 8,
          "name": "Dowells 25 sqmm Tinned Copper Crimping Lugs",
          "url": "https://www.volampelektrikals.com/category/lugs",
          "image": "https://www.volampelektrikals.com/products/cable-lugs.jpg?v=3",
          "item": {
            "@type": "Product",
            "name": "Dowells 25 sqmm Tinned Copper Crimping Lugs",
            "sku": "LUG-000001",
            "image": "https://www.volampelektrikals.com/products/cable-lugs.jpg?v=3",
            "description": "Heavy-duty electrolytic copper tubular ring terminals compliant with IS 8337.",
            "brand": { "@type": "Brand", "name": "Dowells" },
            "offers": {
              "@type": "Offer",
              "price": "14.50",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.volampelektrikals.com/category/lugs"
            }
          }
        }
      ]
    },

    // 4. Google Carousel 2: Manufacturer Authorized Brand Portals (ItemList)
    {
      "@type": "ItemList",
      "@id": "https://www.volampelektrikals.com/#brand-carousel",
      "name": "Manufacturer Authorized Brand Hubs & Master Stockist Desks",
      "description": "Official wholesale distributor portals for Polycab, Finolex, KEI, Schneider Electric, Dowells, and Comet in Gujarat.",
      "numberOfItems": 6,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Polycab Wires & Cables Stockist Ahmedabad",
          "url": "https://www.volampelektrikals.com/dealers/polycab-ahmedabad",
          "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Finolex Cables Channel Partner Ahmedabad",
          "url": "https://www.volampelektrikals.com/dealers/finolex-cables-ahmedabad",
          "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "KEI Industries Star Dealer Gujarat",
          "url": "https://www.volampelektrikals.com/dealers/kei-cables-gujarat",
          "image": "https://www.volampelektrikals.com/products/cable-cross-section.jpg?v=3"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Schneider Electric Switchgear Hub Ahmedabad",
          "url": "https://www.volampelektrikals.com/dealers/schneider-electric-ahmedabad",
          "image": "https://www.volampelektrikals.com/products/switchgear.jpg?v=3"
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Dowells Cable Lugs & Crimping Terminals",
          "url": "https://www.volampelektrikals.com/category/lugs",
          "image": "https://www.volampelektrikals.com/products/cable-lugs.jpg?v=3"
        },
        {
          "@type": "ListItem",
          "position": 6,
          "name": "Comet Single & Double Compression Cable Glands",
          "url": "https://www.volampelektrikals.com/category/glands",
          "image": "https://www.volampelektrikals.com/products/cable-gland.jpg?v=3"
        }
      ]
    },

    // 5. Google Carousel 3: 8 Master Product Categories (ItemList)
    {
      "@type": "ItemList",
      "@id": "https://www.volampelektrikals.com/#category-carousel",
      "name": "8 Master Industrial Electrical Categories",
      "description": "Comprehensive electrical distribution categories with verified technical specifications.",
      "numberOfItems": 8,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Wires & Cables (LT/HT XLPE Armoured & Flexible)",
          "url": "https://www.volampelektrikals.com/category/wire-cables",
          "image": "https://www.volampelektrikals.com/products/cables.jpg?v=3"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Switchgear & Distribution (MCB, MCCB, ACB)",
          "url": "https://www.volampelektrikals.com/category/switch-gears",
          "image": "https://www.volampelektrikals.com/products/switchgear.jpg?v=3"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Solar DC Photovoltaic Cables (1500V H1Z2Z2-K)",
          "url": "https://www.volampelektrikals.com/category/solar",
          "image": "https://www.volampelektrikals.com/products/solar-panel.jpg?v=3"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Cable Lugs & Crimping Terminals (Dowells IS 8337)",
          "url": "https://www.volampelektrikals.com/category/lugs",
          "image": "https://www.volampelektrikals.com/products/cable-lugs.jpg?v=3"
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Cable Glands & Terminations (Comet Flameproof/Weatherproof)",
          "url": "https://www.volampelektrikals.com/category/glands",
          "image": "https://www.volampelektrikals.com/products/cable-gland.jpg?v=3"
        },
        {
          "@type": "ListItem",
          "position": 6,
          "name": "Earthing & Lightning Protection Systems",
          "url": "https://www.volampelektrikals.com/category/earthing",
          "image": "https://www.volampelektrikals.com/products/earthing-rods.png?v=3"
        },
        {
          "@type": "ListItem",
          "position": 7,
          "name": "Conduit & Raceway Piping (Rigid PVC & Metal)",
          "url": "https://www.volampelektrikals.com/category/pipes",
          "image": "https://www.volampelektrikals.com/products/pvc-pipe.jpg?v=3"
        },
        {
          "@type": "ListItem",
          "position": 8,
          "name": "Wiring Devices & Industrial Accessories",
          "url": "https://www.volampelektrikals.com/category/wiring-devices",
          "image": "https://www.volampelektrikals.com/products/wiring-devices.jpg?v=3"
        }
      ]
    },

    // 6. Google FAQ Rich Snippets (FAQPage)
    {
      "@type": "FAQPage",
      "@id": "https://www.volampelektrikals.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is VOLAMP ELEKTRIKALS an authorized distributor for Polycab, Finolex, and KEI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. VOLAMP ELEKTRIKALS PRIVATE LIMITED is an authorized channel partner, wholesale distributor, and star stockist for India's leading electrical manufacturers, including Polycab India, Finolex Cables, KEI Industries, Schneider Electric, Dowells, and Comet. Every consignment is supplied with authentic brand packaging, serial numbers, and manufacturer warranties."
          }
        },
        {
          "@type": "Question",
          "name": "Does Volamp provide original Manufacturer Test Certificates (MTC)?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We issue authentic routine and type Manufacturer Test Certificates (MTC) and factory routine test reports with heat numbers and batch traceability directly from the manufacturer for all industrial cables, switchgear, and earthing supplies."
          }
        },
        {
          "@type": "Question",
          "name": "What is the delivery turnaround time for cables in Ahmedabad and Gujarat?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In-stock orders from our Aslali logistics terminal and Khadia corporate depot are dispatched within 24 to 48 hours across Ahmedabad, Sanand, Vatva, Naroda, Changodar, Gandhinagar, and major GIDC industrial estates across Gujarat. Pan-India project dispatches operate via direct express logistics."
          }
        },
        {
          "@type": "Question",
          "name": "Can I order custom cut drum lengths for industrial LT and HT armoured cables?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Volamp operates dedicated drum cutting and respooling bays at our Aslali central warehouse, providing exact running-meter lengths cut to engineering schedules without forcing clients to purchase full standard factory drums."
          }
        },
        {
          "@type": "Question",
          "name": "Where are Volamp's corporate hubs and central warehouse located?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our corporate registered office and historical trading depot is located at 1753, Dhobi's Pole Sir, Chinubhai Rd, Khadia, Ahmedabad, Gujarat 380001. Our central wholesale warehouse and logistics terminal is strategically situated near the NH-48 and SP Ring Road Junction, Aslali, Ahmedabad 382427."
          }
        }
      ]
    }
  ]
};
