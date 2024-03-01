# use-ecommerce-kit

`use-ecommerce-kit` is a React library designed for ecommerce state management. It enables users to perform actions like adding items to their shopping cart, adjusting quantities, removing items, clearing the entire cart, and viewing its contents.

## Installation

To install the library using npm, run the following command:

```bash
npm install use-ecommerce-kit
```

Note: This library heavily relies on `@tanstack/react-query`.

## Usage
The following parameters are required in order for the items to load properly in the cart

```javascript
type ProductTypes = {
    productId: string,
    name: string,
    price: number,
    amount: number[],
    // generic type for any other fields
    [key: string]: any,
};
```
You can also use any other fields That fit within your ecommerce requirements.

### Cart Provider
Each hook must be used within the CartProvider JSX element, which is what provides the cart state with the context.
```javascript
import React from "react";
import { CartProvider } from "use-ecommerce-kit";

const App = () => {
    return (
        <CartProvider>
            <ChildComponents />
        </CartProvider>
    );
};
```

### Add to cart
```javascript
import React from "react";
import { useCartContext } from "use-ecommerce-kit";

const ShopItem = () => {
    const productInfo = {
        productId: "1234",
        name: "T-Shirt",
        price: 23,
        // optional fields
        image: "src/asset.png",
        description: "fresh drip",
    };
    const { addToCart } = useCartContext();

    const handleCart = () => {
        //  passes the ID, amount added, and product info to context
        addToCart(productInfo.productId, 1, productInfo);
    };

    return (
        <div>
            <h1>{productInfo.name}</h1>
            <img src={productInfo.image} alt="product-image" />
            <h4>${contentEntry.fields.price.toFixed(2)}</h4>
            <p>{productInfo.decription}</p>
            <button onClick={handleCart}>Add to Cart</button>
        </div>
    );
};
```

### Increase and Decrease Quantities
```javascript
import React from "react";
import { useCartContext } from "use-ecommerce-kit";

const CartItem = () => {
    const { state, increase, decrease, remove } = useCartContext();

    return (
        <div>
        {state.cart.map((item, index) =>
            <div key={index}>
                <h3>{item.name}</h3>
                <p>Quantity: {item.amount.length}</p>
                <button onClick={() => increase(item.productId)}>Increase</button>
                <button onClick={() => decrease(item.productId)}>Decrease</button>
                <button onClick={() => remove(item.productId)}>Remove</button>
            </div>
        )}
         </div>
    );
};
```

### Clearing the cart
```javascript
import React from "react";
import { useCartContext } from "use-ecommerce-kit";

const CartSummary = () => {
    const { clear } = useCartContext();

    return (
        <div>
            <h2>Cart Summary</h2>
            <button onClick={clear}>Clear Cart</button>
        </div>
    );
};
```

### Display total price & quantity
```javascript
import React from "react";
import { useCartContext } from "use-ecommerce-kit";

const CartTotal = () => {
    const { state } = useCartContext();

    return (
        <div>
            // total price
            <h2>Total Price: ${state.total.toFixed(2)}</h2>
            // total quantity 
             <h1>{state.amount}</h
        </div>
    );
};
```
