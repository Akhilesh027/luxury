export const menuData = {
  catalog: {
    items: ["Sofas & armchairs", "Beds & mattresses", "Cabinets & cupboards", "Tables & chairs"],
    megas: {
      "Sofas & armchairs": {
        id: "sofas",
        columns: [
          {
            title: "Sofas",
            links: [
              { label: "Modular Sofas", href: "/catalog?category=modular-sofas" },
              { label: "Recliner Sofas", href: "/catalog?category=recliner-sofas" },
              { label: "Scandi Sofas", href: "/catalog?category=scandi-sofas" },
              { label: "Corner Sofas", href: "/catalog?category=corner-sofas" },
            ],
          },
          {
            title: "Armchairs",
            links: [
              { label: "Modern Armchairs", href: "/catalog?category=modern-armchairs" },
              { label: "Classic Armchairs", href: "/catalog?category=classic-armchairs" },
              { label: "Retro Armchairs", href: "/catalog?category=retro-armchairs" },
              { label: "Modular Armchairs", href: "/catalog?category=modular-armchairs" },
            ],
          },
          {
            title: "Material",
            links: [
              { label: "Fabrics", href: "/catalog?material=fabric" },
              { label: "Leather", href: "/catalog?material=leather" },
              { label: "Wood", href: "/catalog?material=wood" },
              { label: "Metals", href: "/catalog?material=metal" },
            ],
          },
          {
            title: "Room",
            links: [
              { label: "Living room", href: "/catalog?room=living-room" },
              { label: "Bedroom", href: "/catalog?room=bedroom" },
              { label: "Office", href: "/catalog?room=office" },
              { label: "Studio", href: "/catalog?room=studio" },
            ],
          },
        ],
      },
      "Beds & mattresses": {
        id: "beds",
        columns: [
          {
            title: "Beds & mattresses",
            links: [
              { label: "Single beds", href: "/catalog?category=single-beds" },
              { label: "Double beds", href: "/catalog?category=double-beds" },
            ],
          },
          {
            title: "Frames & storage",
            links: [
              { label: "Storage beds", href: "/catalog?category=storage-beds" },
              { label: "Headboards", href: "/catalog?category=headboards" },
            ],
          },
          {
            title: "Mattress types",
            links: [
              { label: "Memory foam", href: "/catalog?category=memory-foam" },
              { label: "Pocket spring", href: "/catalog?category=pocket-spring" },
            ],
          },
        ],
      },
      "Cabinets & cupboards": {
        id: "cabinets",
        columns: [
          {
            title: "Cabinets & cupboards",
            links: [
              { label: "Wardrobes", href: "/catalog?category=wardrobes" },
              { label: "Sideboards", href: "/catalog?category=sideboards" },
            ],
          },
          {
            title: "Finish",
            links: [
              { label: "Wood", href: "/catalog?material=wood" },
              { label: "Metal", href: "/catalog?material=metal" },
            ],
          },
        ],
      },
      "Tables & chairs": {
        id: "tables",
        columns: [
          {
            title: "Tables & chairs",
            links: [
              { label: "Dining tables", href: "/catalog?category=dining-tables" },
              { label: "Coffee tables", href: "/catalog?category=coffee-tables" },
            ],
          },
          {
            title: "Chairs",
            links: [
              { label: "Dining chairs", href: "/catalog?category=dining-chairs" },
              { label: "Bar stools", href: "/catalog?category=bar-stools" },
            ],
          },
        ],
      },
    },
  },
  concepts: {
    items: ["Loft", "Scandi", "Living room", "Bedroom", "Modern", "Classics", "Aesthetic"],
    megas: {
      Loft: {
        id: "loft",
        columns: [
          {
            title: "Loft",
            links: [
              { label: "Industrial pieces", href: "/catalog?style=industrial" },
              { label: "Raw materials", href: "/catalog?style=raw" },
            ],
          },
        ],
      },
      Scandi: {
        id: "scandi",
        columns: [
          {
            title: "Scandi",
            links: [
              { label: "Light woods", href: "/catalog?style=scandi" },
              { label: "Minimal decor", href: "/catalog?style=minimal" },
            ],
          },
        ],
      },
      "Living room": {
        id: "livingroom",
        columns: [
          {
            title: "Living room",
            links: [
              { label: "Sofas", href: "/catalog?room=living-room&category=sofas" },
              { label: "TV stands", href: "/catalog?room=living-room&category=tv-stands" },
            ],
          },
        ],
      },
      Bedroom: {
        id: "bedroom",
        columns: [
          {
            title: "Bedroom",
            links: [
              { label: "Bed frames", href: "/catalog?room=bedroom&category=beds" },
              { label: "Side tables", href: "/catalog?room=bedroom&category=side-tables" },
            ],
          },
        ],
      },
      Modern: {
        id: "modern",
        columns: [
          {
            title: "Modern",
            links: [{ label: "Sleek lines", href: "/catalog?style=modern" }],
          },
        ],
      },
      Classics: {
        id: "classics",
        columns: [
          {
            title: "Classics",
            links: [{ label: "Timeless pieces", href: "/catalog?style=classic" }],
          },
        ],
      },
      Aesthetic: {
        id: "aesthetic",
        columns: [
          {
            title: "Aesthetic",
            links: [{ label: "Color themes", href: "/catalog?style=aesthetic" }],
          },
        ],
      },
    },
  },
  rooms: {
    items: ["Living room", "Bedroom", "Children's", "Hallway", "Kitchen", "Office", "Studio"],
    megas: {
      "Living room": {
        id: "livingroom-r",
        columns: [
          {
            title: "Living room",
            links: [
              { label: "Sofas", href: "/catalog?room=living-room" },
              { label: "Coffee tables", href: "/catalog?room=living-room&category=coffee-tables" },
            ],
          },
        ],
      },
      Bedroom: {
        id: "bedroom-r",
        columns: [
          {
            title: "Bedroom",
            links: [
              { label: "Beds", href: "/catalog?room=bedroom" },
              { label: "Wardrobes", href: "/catalog?room=bedroom&category=wardrobes" },
            ],
          },
        ],
      },
      "Children's": {
        id: "children-r",
        columns: [
          {
            title: "Children's",
            links: [
              { label: "Kids beds", href: "/catalog?room=children" },
              { label: "Study desks", href: "/catalog?room=children&category=desks" },
            ],
          },
        ],
      },
      Hallway: {
        id: "hallway-r",
        columns: [
          {
            title: "Hallway",
            links: [{ label: "Console tables", href: "/catalog?room=hallway" }],
          },
        ],
      },
      Kitchen: {
        id: "kitchen-r",
        columns: [
          {
            title: "Kitchen",
            links: [{ label: "Dining", href: "/catalog?room=kitchen" }],
          },
        ],
      },
      Office: {
        id: "office-r",
        columns: [
          {
            title: "Office",
            links: [{ label: "Desks", href: "/catalog?room=office" }],
          },
        ],
      },
      Studio: {
        id: "studio-r",
        columns: [
          {
            title: "Studio",
            links: [{ label: "Multi-use", href: "/catalog?room=studio" }],
          },
        ],
      },
    },
  },
};

export const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200",
    title: "How to combine minimalism and comfort?",
    hotspots: [
      { top: "28%", left: "62%", productId: 1, productName: "Luxury Bed Frame", price: 458990 },
      { top: "62%", left: "32%", productId: 2, productName: "Bedside Cabinet", price: 89990 },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200",
    title: "Eclecticism in the interior",
    hotspots: [
      { top: "32%", left: "48%", productId: 3, productName: "Designer Armchair", price: 245000 },
      { top: "67%", left: "70%", productId: 4, productName: "Modern Side Table", price: 67990 },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200",
    title: "How to decorate your interior in Brutalism?",
    hotspots: [
      { top: "37%", left: "52%", productId: 5, productName: "Industrial Pendant", price: 34990 },
      { top: "72%", left: "28%", productId: 6, productName: "Concrete Console", price: 156990 },
    ],
  },
  {
    image: "https://plus.unsplash.com/premium_photo-1681046751108-a516bea00570?q=80&w=1165",
    title: "Modern luxury living spaces",
    hotspots: [
      { top: "57%", left: "52%", productId: 1, productName: "Velvet Sofa", price: 789990 },
      { top: "72%", left: "22%", productId: 7, productName: "Marble Coffee Table", price: 234990 },
    ],
  },
];

export const popularCategories = [
  {
    image: "https://images.unsplash.com/photo-1698936061086-2bf99c7b9fc5?q=80&w=1074",
    title: "Straight sofas",
    count: 803,
    slug: "straight-sofas",
  },
  {
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=600",
    title: "Corner sofas",
    count: 211,
    slug: "corner-sofas",
  },
  {
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
    title: "Beds",
    count: 434,
    slug: "beds",
  },
  {
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=765",
    title: "Chairs",
    count: 373,
    slug: "chairs",
  },
  {
    image: "https://images.unsplash.com/photo-1504977402025-84285fea814b?q=80&w=687",
    title: "Shelves",
    count: 46,
    slug: "shelves",
  },
  {
    image: "https://plus.unsplash.com/premium_photo-1661779760365-a44d80161cee?q=80&w=1074",
    title: "TV stands",
    count: 105,
    slug: "tv-stands",
  },
];

export const allProducts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",
      "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=1200",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200",
    ],
    discount: 25,
    colors: ["#8B7355", "#4A6741", "#D4A574", "#2C3E50"],
    type: "Straight Sofa",
    title: "Haynes",
    oldPrice: 1278195,
    newPrice: 958990,
    category: "straight-sofas",
    room: "living-room",
    material: "fabric",
    style: "modern",
    description: "The Haynes sofa combines timeless elegance with modern comfort. Featuring premium fabric upholstery and solid wood legs, this piece is perfect for contemporary living spaces.",
    dimensions: { width: 220, depth: 95, height: 85 },
    inStock: true,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200",
      "https://images.unsplash.com/photo-1558211583-d26f610c1eb1?q=80&w=1200",
    ],
    discount: 34,
    colors: ["#F5DEB3", "#4169E1", "#FFB6C1", "#808080"],
    type: "Straight Sofa",
    title: "Boston",
    oldPrice: 1218998,
    newPrice: 789990,
    category: "straight-sofas",
    room: "living-room",
    material: "leather",
    style: "classic",
    description: "The Boston sofa brings classic American design to your living room. Crafted with genuine leather and featuring generous cushioning for ultimate comfort.",
    dimensions: { width: 240, depth: 100, height: 90 },
    inStock: true,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1615873968403-89e7dc0eaa67?q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1615873968403-89e7dc0eaa67?q=80&w=1200",
    ],
    discount: 15,
    colors: ["#808080"],
    type: "TV Stand",
    title: "Bruno",
    oldPrice: 217544,
    newPrice: 149990,
    category: "tv-stands",
    room: "living-room",
    material: "wood",
    style: "scandi",
    description: "The Bruno TV stand features clean Scandinavian lines with ample storage. Crafted from solid oak with soft-close drawers.",
    dimensions: { width: 180, depth: 45, height: 55 },
    inStock: true,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1588620707396-9e1c05f86167?q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1588620707396-9e1c05f86167?q=80&w=1200",
      "https://images.unsplash.com/photo-1550226891-ef816aed4a98?q=80&w=1200",
    ],
    discount: 20,
    colors: ["#8B4513", "#D2691E", "#F5DEB3", "#228B22"],
    type: "Straight Sofa",
    title: "Hart",
    oldPrice: 4560911,
    newPrice: 2348990,
    category: "straight-sofas",
    room: "living-room",
    material: "leather",
    style: "luxury",
    description: "The Hart represents the pinnacle of luxury seating. Hand-stitched Italian leather meets uncompromising comfort in this statement piece.",
    dimensions: { width: 280, depth: 110, height: 95 },
    inStock: true,
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?q=80&w=1200",
    ],
    discount: 30,
    colors: ["#2F4F4F", "#D2691E"],
    type: "Armchair",
    title: "Milano",
    oldPrice: 345000,
    newPrice: 241500,
    category: "modern-armchairs",
    room: "living-room",
    material: "fabric",
    style: "modern",
    description: "The Milano armchair brings Italian flair to any space. Featuring sculptural lines and premium velvet upholstery.",
    dimensions: { width: 85, depth: 90, height: 80 },
    inStock: true,
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200",
    ],
    discount: 18,
    colors: ["#F5F5DC", "#8B7355", "#2C3E50"],
    type: "Corner Sofa",
    title: "Verona",
    oldPrice: 1890000,
    newPrice: 1549800,
    category: "corner-sofas",
    room: "living-room",
    material: "fabric",
    style: "modern",
    description: "The Verona corner sofa maximizes seating space without compromising on style. Modular design allows for flexible configurations.",
    dimensions: { width: 320, depth: 260, height: 85 },
    inStock: true,
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",
    ],
    discount: 22,
    colors: ["#1a1a1a", "#8B7355"],
    type: "Double Bed",
    title: "Aurora",
    oldPrice: 567890,
    newPrice: 442950,
    category: "double-beds",
    room: "bedroom",
    material: "wood",
    style: "modern",
    description: "The Aurora bed frame combines modern aesthetics with timeless elegance. Solid walnut construction with upholstered headboard.",
    dimensions: { width: 180, depth: 210, height: 120 },
    inStock: true,
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=765",
    images: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=765",
    ],
    discount: 10,
    colors: ["#F5DEB3", "#808080", "#2C3E50"],
    type: "Dining Chair",
    title: "Enzo",
    oldPrice: 45990,
    newPrice: 41391,
    category: "dining-chairs",
    room: "kitchen",
    material: "wood",
    style: "scandi",
    description: "The Enzo dining chair pairs perfectly with any table. Solid ash frame with comfortable curved backrest.",
    dimensions: { width: 45, depth: 52, height: 82 },
    inStock: true,
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200",
    ],
    discount: 28,
    colors: ["#D4A574", "#808080"],
    type: "Coffee Table",
    title: "Marble Luxe",
    oldPrice: 234990,
    newPrice: 169192,
    category: "coffee-tables",
    room: "living-room",
    material: "marble",
    style: "luxury",
    description: "The Marble Luxe coffee table is a statement piece featuring genuine Carrara marble top with brushed gold legs.",
    dimensions: { width: 120, depth: 60, height: 45 },
    inStock: true,
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",
    ],
    discount: 35,
    colors: ["#2C3E50", "#4A6741"],
    type: "Wardrobe",
    title: "Nordic Plus",
    oldPrice: 890000,
    newPrice: 578500,
    category: "wardrobes",
    room: "bedroom",
    material: "wood",
    style: "scandi",
    description: "The Nordic Plus wardrobe offers generous storage with a minimalist aesthetic. Sliding doors with soft-close mechanism.",
    dimensions: { width: 200, depth: 60, height: 220 },
    inStock: false,
  },
];

export const newProducts = allProducts.slice(0, 6);

export const ideasData = [
  {
    image: "https://images.unsplash.com/photo-1582133776712-0b942f3ef601?q=80&w=1074",
    title: "Organizing a place for reading",
    hotspots: [
      { top: "30%", left: "40%", productId: 5, productName: "Milano Armchair", price: 241500 },
      { top: "60%", left: "70%", productId: 3, productName: "Bruno TV Stand", price: 149990 },
    ],
  },
  {
    image: "https://plus.unsplash.com/premium_photo-1690971631383-326a8b5d8ed7?q=80&w=880",
    title: "A romantic armchair in a modern interior",
    hotspots: [
      { top: "35%", left: "30%", productId: 5, productName: "Milano Armchair", price: 241500 },
      { top: "65%", left: "55%", productId: 9, productName: "Marble Luxe Table", price: 169192 },
    ],
  },
  {
    image: "https://plus.unsplash.com/premium_photo-1725295198039-b92478b0ff30?q=80&w=674",
    title: "A modern take on the Gustavian style",
    hotspots: [
      { top: "25%", left: "50%", productId: 1, productName: "Haynes Sofa", price: 958990 },
      { top: "50%", left: "30%", productId: 8, productName: "Enzo Chair", price: 41391 },
      { top: "70%", left: "65%", productId: 9, productName: "Marble Luxe Table", price: 169192 },
    ],
  },
];

export const roomsData = [
  {
    image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1092",
    title: "Living room",
    slug: "living-room",
  },
  {
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=880",
    title: "Bedroom",
    slug: "bedroom",
  },
  {
    image: "https://images.unsplash.com/photo-1701281941420-d3ad09f5380c?q=80&w=1170",
    title: "Children's",
    slug: "children",
  },
  {
    image: "https://plus.unsplash.com/premium_photo-1683141463475-0f27567ff2f1?q=80&w=1388",
    title: "Hallway",
    slug: "hallway",
  },
  {
    image: "https://images.unsplash.com/photo-1601760561441-16420502c7e0?q=80&w=1170",
    title: "Kitchen",
    slug: "kitchen",
  },
  {
    image: "https://images.unsplash.com/photo-1716703433576-13ff2922db95?q=80&w=1170",
    title: "Studio",
    slug: "studio",
  },
];

export const cities = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad"];

export const filterOptions = {
  categories: [
    { label: "Straight Sofas", value: "straight-sofas" },
    { label: "Corner Sofas", value: "corner-sofas" },
    { label: "Modern Armchairs", value: "modern-armchairs" },
    { label: "Double Beds", value: "double-beds" },
    { label: "TV Stands", value: "tv-stands" },
    { label: "Wardrobes", value: "wardrobes" },
    { label: "Coffee Tables", value: "coffee-tables" },
    { label: "Dining Chairs", value: "dining-chairs" },
  ],
  rooms: [
    { label: "Living Room", value: "living-room" },
    { label: "Bedroom", value: "bedroom" },
    { label: "Kitchen", value: "kitchen" },
    { label: "Office", value: "office" },
    { label: "Children's", value: "children" },
  ],
  materials: [
    { label: "Fabric", value: "fabric" },
    { label: "Leather", value: "leather" },
    { label: "Wood", value: "wood" },
    { label: "Metal", value: "metal" },
    { label: "Marble", value: "marble" },
  ],
  styles: [
    { label: "Modern", value: "modern" },
    { label: "Classic", value: "classic" },
    { label: "Scandi", value: "scandi" },
    { label: "Luxury", value: "luxury" },
    { label: "Industrial", value: "industrial" },
  ],
  priceRanges: [
    { label: "Under ₹50,000", min: 0, max: 50000 },
    { label: "₹50,000 - ₹2,00,000", min: 50000, max: 200000 },
    { label: "₹2,00,000 - ₹5,00,000", min: 200000, max: 500000 },
    { label: "₹5,00,000 - ₹10,00,000", min: 500000, max: 1000000 },
    { label: "Over ₹10,00,000", min: 1000000, max: Infinity },
  ],
};
