export type Product = {
  id: string
  name: string
  price: number
  oldPrice?: number
  category: string
  brand: string
  size: string // ej: "750ml"
  image?: string
  description?: string
  accent: string
  featured?: boolean
}

export const products: Product[] = [
  {
    id: "aguardiente-antioqueno-750",
    name: "Aguardiente Antioqueño",
    price: 45000,
    category: "Aguardiente",
    brand: "Fábrica de Licores de Antioquia",
    size: "750ml",
    description: "Aguardiente tradicional, ideal para reuniones.",
    accent: "#178b72",
    featured: true,
  },
  {
    id: "ron-medellin-anejo-750",
    name: "Ron Medellín Añejo",
    price: 52000,
    category: "Ron",
    brand: "Fábrica de Licores de Antioquia",
    size: "750ml",
    description: "Ron añejo con notas dulces y suaves.",
    accent: "#bf6a2d",
    featured: true,
  },
  {
    id: "whisky-red-label-750",
    name: "Johnnie Walker Red Label",
    price: 99000,
    oldPrice: 112000,
    category: "Whisky",
    brand: "Johnnie Walker",
    size: "750ml",
    description: "Whisky blended, perfecto para coctelería.",
    accent: "#b6282f",
    featured: true,
  },
  {
    id: "vino-casillero-cabernet-750",
    name: "Casillero del Diablo Cabernet",
    price: 58000,
    category: "Vino",
    brand: "Concha y Toro",
    size: "750ml",
    description: "Vino tinto intenso con notas de frutos negros.",
    accent: "#721e30",
    featured: true,
  },
  {
    id: "tequila-jose-cuervo-750",
    name: "José Cuervo Especial",
    price: 108000,
    category: "Tequila",
    brand: "José Cuervo",
    size: "750ml",
    description: "Tequila dorado suave, ideal para compartir.",
    accent: "#c99a2e",
  },
  {
    id: "cerveza-corona-six-pack",
    name: "Corona Extra Six Pack",
    price: 39000,
    category: "Cerveza",
    brand: "Corona",
    size: "6 x 330ml",
    description: "Cerveza lager refrescante en presentación de seis unidades.",
    accent: "#e1b52f",
  },
  {
    id: "vodka-smirnoff-700",
    name: "Smirnoff No. 21",
    price: 61000,
    category: "Vodka",
    brand: "Smirnoff",
    size: "700ml",
    description: "Vodka clásico de triple destilación.",
    accent: "#b4212a",
  },
  {
    id: "gin-tanqueray-750",
    name: "Tanqueray London Dry Gin",
    price: 119000,
    category: "Gin",
    brand: "Tanqueray",
    size: "750ml",
    description: "Gin seco con un perfil fresco de enebro y cítricos.",
    accent: "#1e704f",
  },
]
