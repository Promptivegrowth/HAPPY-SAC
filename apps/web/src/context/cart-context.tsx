"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface CartItem {
    id: string
    product_id: string
    product_size_id: string
    nombre: string
    talla: string
    precio: number
    cantidad: number
    imagen?: string
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    // Cargar desde localStorage al iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('happy_sac_cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error("Error loading cart", e)
            }
        }
    }, [])

    // Guardar en localStorage cuando cambie el carrito
    useEffect(() => {
        localStorage.setItem('happy_sac_cart', JSON.stringify(items))
    }, [items])

    const addItem = (newItem: CartItem) => {
        setItems((prev) => {
            const existingItem = prev.find(item => item.product_size_id === newItem.product_size_id)
            if (existingItem) {
                return prev.map(item =>
                    item.product_size_id === newItem.product_size_id
                        ? { ...item, cantidad: item.cantidad + newItem.cantidad }
                        : item
                )
            }
            return [...prev, newItem]
        })
        toast.success("Producto agregado al carrito")
    }

    const removeItem = (product_size_id: string) => {
        setItems((prev) => prev.filter(item => item.product_size_id !== product_size_id))
        toast.info("Producto eliminado")
    }

    const updateQuantity = (product_size_id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(product_size_id)
            return
        }
        setItems((prev) => prev.map(item =>
            item.product_size_id === product_size_id ? { ...item, cantidad: quantity } : item
        ))
    }

    const clearCart = () => {
        setItems([])
        localStorage.removeItem('happy_sac_cart')
    }

    const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0)
    const totalPrice = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
