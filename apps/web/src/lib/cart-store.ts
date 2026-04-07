import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
    product_id: string
    product_size_id: string
    slug: string
    codigo: string
    nombre: string
    talla: string
    precio: number
    cantidad: number
    imagen_url: string
    stock_disponible: number
}

interface CartStore {
    items: CartItem[]
    isOpen: boolean

    // Acciones
    addItem: (item: Omit<CartItem, 'cantidad'>) => void
    removeItem: (product_size_id: string) => void
    updateQuantity: (product_size_id: string, cantidad: number) => void
    clearCart: () => void
    openCart: () => void
    closeCart: () => void

    // Computed
    getTotalItems: () => number
    getTotalPrice: () => number
    getSubtotal: () => number
    getIGV: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (newItem) => set((state) => {
                const existing = state.items.find(i => i.product_size_id === newItem.product_size_id)
                if (existing) {
                    // Si ya existe, incrementar cantidad (respetando stock)
                    const nuevaCantidad = Math.min(existing.cantidad + 1, newItem.stock_disponible)
                    return {
                        items: state.items.map(i =>
                            i.product_size_id === newItem.product_size_id
                                ? { ...i, cantidad: nuevaCantidad }
                                : i
                        ),
                        isOpen: true
                    }
                }
                // Si no existe, agregar con cantidad 1
                return {
                    items: [...state.items, { ...newItem, cantidad: 1 }],
                    isOpen: true
                }
            }),

            removeItem: (product_size_id) => set((state) => ({
                items: state.items.filter(i => i.product_size_id !== product_size_id)
            })),

            updateQuantity: (product_size_id, cantidad) => set((state) => {
                if (cantidad <= 0) {
                    return { items: state.items.filter(i => i.product_size_id !== product_size_id) }
                }
                return {
                    items: state.items.map(i =>
                        i.product_size_id === product_size_id
                            ? { ...i, cantidad: Math.min(cantidad, i.stock_disponible) }
                            : i
                    )
                }
            }),

            clearCart: () => set({ items: [] }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            getTotalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
            getSubtotal: () => get().items.reduce((sum, i) => sum + (i.precio * i.cantidad), 0),
            getIGV: () => get().getSubtotal() * 0.18,
            getTotalPrice: () => get().getSubtotal(),  // Precios web ya incluyen IGV
        }),
        {
            name: 'happy-sac-cart',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items }),  // Solo persistir items
        }
    )
)
