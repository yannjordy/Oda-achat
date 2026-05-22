## Error Type
Runtime Error

## Error Message
./Documents/oda-market/src/app/layout.js:5:1
Module not found: Can't resolve '@/components/cart/CartFloating'
  3 | import PageTracker from '@/components/layout/PageTracker';
  4 | import { CartProvider } from '@/lib/CartContext';
> 5 | import CartFloating from '@/components/cart/CartFloating';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  6 |
  7 | export const metadata = {
  8 |   title: "ODA Market | La Marketplace du Cameroun 🇨🇲",

Import map: aliased to relative './src/components/cart/CartFloating' inside of [project]/Documents/oda-market


https://nextjs.org/docs/messages/module-not-found




    at <unknown> (Error: ./Documents/oda-market/src/app/layout.js:5:1)
    at <unknown> (Error: (./Documents/oda-market/src/app/layout.js:5:1)

Next.js version: 16.2.6 (Turbopack)

