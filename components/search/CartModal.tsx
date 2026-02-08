'use client';

import React from 'react';
import type { Product } from '@/types/product';
import { Button } from '../ui';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { product: Product; quantity: number }[];
  onRemoveItem: (productId: string) => void;
}

export const CartModal = ({ isOpen, onClose, cartItems, onRemoveItem }: CartModalProps) => {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price.amount * item.quantity,
    0
  );

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Side Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <h2 id="cart-title" className="text-xl font-bold tracking-tight">Your Cart</h2>
          <button 
            onClick={onClose}
            aria-label="Close cart"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6" tabIndex={0} aria-label="Cart items list">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="bg-gray-50 p-6 rounded-full mb-4" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <button 
                onClick={onClose}
                className="mt-4 text-sm font-semibold text-black underline underline-offset-4 hover:text-black/70 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6" role="list">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-4" role="listitem">
                  <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.product.images[0]?.url || ''} 
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-black line-clamp-1">{item.product.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{item.product.vendor}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-semibold">
                        <span className="sr-only">Price: </span>
                        {formatPrice(item.product.price.amount, item.product.price.currency)} x {item.quantity}
                      </p>
                      <button 
                        onClick={() => onRemoveItem(item.product.id)}
                        aria-label={`Remove ${item.product.title} from cart`}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white" aria-labelledby="cart-summary-heading">
            <h2 id="cart-summary-heading" className="sr-only">Cart Summary</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[20px] font-medium text-black">Subtotal</span>
              <span className="text-[20px] font-medium text-black">
                {formatPrice(totalAmount, cartItems[0].product.price.currency)}
              </span>
            </div>
            
            <Button 
              variant="primary" 
              aria-label="Proceed to checkout"
              className="w-full rounded-full h-[45px] text-[18px] font-medium bg-black hover:bg-black/90 flex items-center justify-center gap-2 mb-3"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Checkout</span>
            </Button>

            <p className="text-[13px] text-gray-500 text-center mb-6">
              Gift cards & discount codes applied at checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
