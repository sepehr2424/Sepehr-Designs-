// Central image configuration. Swap any URL here to change imagery
// sitewide — nothing else needs to change.

const unsplash = (id: string, params = 'auto=format&fit=crop&w=1600&q=80') =>
  `https://images.unsplash.com/${id}?${params}`

export const images = {
  heroPrimary: {
    src: unsplash('photo-1600585154340-be6161a56a0c', 'auto=format&fit=crop&w=2000&q=85'),
    alt: 'Bright, modern living room with floor-to-ceiling windows and natural light',
  },
  heroSecondary: {
    src: unsplash('photo-1560518883-ce09059eeffa', 'auto=format&fit=crop&w=1200&q=80'),
    alt: 'Elegant staged living space with warm natural lighting',
  },
  aboutPrimary: {
    src: unsplash('photo-1512917774080-9991f1c4c750', 'auto=format&fit=crop&w=1600&q=80'),
    alt: 'Real estate viewing coordinator reviewing a property with a client in a bright interior',
  },
  aboutSecondary: {
    src: unsplash('photo-1560472354-b33ff0c44a43', 'auto=format&fit=crop&w=900&q=80'),
    alt: 'Property keys handed over after a completed viewing',
  },
  consultationDesk: {
    src: unsplash('photo-1497366216548-37526070297c', 'auto=format&fit=crop&w=1400&q=80'),
    alt: 'Property listing documents, floor plans, and a notebook on a clean desk',
  },
  bookingAccent: {
    src: unsplash('photo-1556020685-ae41abfc9365', 'auto=format&fit=crop&w=1200&q=80'),
    alt: 'Sunlit modern interior prepared for a private property viewing',
  },
  footerBanner: {
    src: unsplash('photo-1523217582562-09d0def993a6', 'auto=format&fit=crop&w=2000&q=80'),
    alt: 'Luxury property exterior at dusk with warm interior lighting',
  },
  services: {
    apartment: {
      src: unsplash('photo-1615874959474-d609969a20ed', 'auto=format&fit=crop&w=900&q=80'),
      alt: 'Bright modern apartment living space with contemporary furnishings',
    },
    house: {
      src: unsplash('photo-1502672260266-1c1ef2d93688', 'auto=format&fit=crop&w=900&q=80'),
      alt: 'Modern house exterior with clean architectural lines',
    },
    luxury: {
      src: unsplash('photo-1600607687939-ce8a6c25118c', 'auto=format&fit=crop&w=900&q=80'),
      alt: 'Elegant luxury kitchen with marble countertops and premium finishes',
    },
    rental: {
      src: unsplash('photo-1560185127-6ed189bf02f4', 'auto=format&fit=crop&w=900&q=80'),
      alt: 'Clean, practical rental apartment interior ready for viewing',
    },
    investment: {
      src: unsplash('photo-1521791136064-7986c2920216', 'auto=format&fit=crop&w=900&q=80'),
      alt: 'Property consultation desk with floor plans and a laptop',
    },
    virtual: {
      src: unsplash('photo-1521791136064-7986c2920216', 'auto=format&fit=crop&w=900&q=80'),
      alt: 'Laptop set up for a live virtual property tour',
    },
  },
} as const

export const serviceImageByName = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('luxury')) return images.services.luxury
  if (key.includes('virtual')) return images.services.virtual
  if (key.includes('investment')) return images.services.investment
  if (key.includes('rental')) return images.services.rental
  if (key.includes('house')) return images.services.house
  if (key.includes('apartment')) return images.services.apartment
  return images.services.apartment
}
