import React, { useReducer, createContext, useContext, JSX } from "react";

import {
    useQuery,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import cloneDeep from "lodash/cloneDeep";

import {
    ProductTypes,
    ActionTypes,
    State,
    Action,
    CartContextValue,
} from "./types";

const anyFields = (
    id: string,
    fields: { [key: string]: any },
    amount: number
): ProductTypes => {
    return {
        productId: id,
        name: fields.name,
        price: fields.price,
        amount: [amount],
        ...fields,
    };
};

const queryClient = new QueryClient();
const CartContext = createContext<CartContextValue>(undefined);

// Change amount of items in Cart (increase / decrease)
function changeAmount(state: State, id: string, method: string): void {
    const tempCart = state.cart.map((item) => {
        if (item.productId !== id) {
            return item;
        }
        function remainder() {
            switch (method) {
                case ActionTypes.INC:
                    return item.amount.concat(1);
                case ActionTypes.DEC:
                    return item.amount.slice(0, -1);
                default:
                    throw new Error(`No Matching "${method}" - method type`);
            }
        }
        const newAmount = remainder();
        return { ...item, amount: newAmount };
    });

    state.cart = tempCart;

    state.amount = state.cart.reduce(
        (acc, item) => acc + item.amount.length,
        0
    );
    state.total = state.cart.reduce(
        (acc, item) => acc + item.amount.length * item.price,
        0
    );
}

const reducer = (state: State, action: Action): State => {
    let newState = cloneDeep(state);
    switch (action.type) {
        case ActionTypes.CLEAR: {
            newState = {
                cart: [],
                amount: 0,
                total: 0,
            };
            return newState;
        }
        case ActionTypes.REMOVE: {
            const tempCart = state.cart.filter(
                (item) => item.productId !== action.payload.id
            );
            newState.cart = tempCart;
            newState.amount = newState.cart.reduce(
                (acc, item) => acc + item.amount.length,
                0
            );
            newState.total = newState.cart.reduce(
                (acc, item) => acc + item.amount.length * item.price,
                0
            );
            return newState;
        }
        case ActionTypes.CART: {
            const { id, amount, product } = action.payload;
            const tempItem = state.cart.find((i) => i.productId === id);

            if (tempItem) {
                const tempCart = state.cart.map((cartItem) => {
                    if (cartItem.productId !== id) {
                        return cartItem;
                    }
                    let newAmount = cartItem.amount.concat(amount);
                    return { ...cartItem, amount: newAmount };
                });

                return { ...state, cart: tempCart };
            }

            const newField = anyFields(id, product, amount);

            newState.cart = [...state.cart, newField];
            newState.amount = newState.cart.reduce(
                (acc, item) =>
                    acc + Array.from(String(item.amount), Number).length,
                0
            );
            newState.total = newState.cart.reduce(
                (acc, item) =>
                    acc +
                    Array.from(String(item.amount), Number).length * item.price,
                0
            );
            return newState;
        }
        case ActionTypes.INC: {
            changeAmount(newState, action.payload.id, ActionTypes.INC);
            return newState;
        }
        case ActionTypes.DEC: {
            changeAmount(newState, action.payload.id, ActionTypes.DEC);
            return newState;
        }
        case ActionTypes.GET_TOTALS: {
            const { total, amount } = state.cart.reduce(
                (cartTotal, cartItem) => {
                    const { price, amount } = cartItem;
                    const itemTotal = price * amount.length || 0;
                    cartTotal.total += itemTotal;
                    cartTotal.amount += amount.length || 0;

                    return cartTotal;
                },
                { total: 0, amount: 0 }
            );
            newState.total = total;
            newState.amount = amount;
            return newState;
        }
        default:
            throw new Error(`No Matching "${action.type}" - action type`);
    }
};

//Store cart data in local storage
const getLocalStorage = () => {
    const cart = localStorage.getItem("cart");
    if (cart) {
        return JSON.parse(cart);
    }
    return [];
};

const initialState = {
    cart: getLocalStorage(),
    amount: 0,
    total: 0,
};

type CartProviderProps = {
    children: React.ReactNode;
};

export const useCartContext = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    const { state, dispatch } = context;

    // add to cart
    const addToCart = (
        id: string,
        amount: number,
        product: ProductTypes
    ): void => {
        dispatch({ type: ActionTypes.CART, payload: { id, amount, product } });
    };

    // remove
    const remove = (id: string): void => {
        dispatch({
            type: ActionTypes.REMOVE,
            payload: { id, amount: 0, product: {} as ProductTypes },
        });
    };

    // increase
    const increase = (id: string): void => {
        dispatch({
            type: ActionTypes.INC,
            payload: { id, amount: 0, product: {} as ProductTypes },
        });
    };

    // decrease
    const decrease = (id: string): void => {
        dispatch({
            type: ActionTypes.DEC,
            payload: { id, amount: 0, product: {} as ProductTypes },
        });
    };

    // clear
    const clear = (): void => {
        dispatch({
            type: ActionTypes.CLEAR,
            payload: { id: "", amount: 0, product: {} as ProductTypes },
        });
    };

    // get totals
    const getTotal = (): ProductTypes[][] => {
        dispatch({
            type: ActionTypes.GET_TOTALS,
            payload: { id: "", amount: 0, product: {} as ProductTypes },
        });
        localStorage.setItem("cart", JSON.stringify(state.cart));
        return [state.cart];
    };

    useQuery({
        queryKey: [state.cart],
        queryFn: getTotal,
        refetchOnWindowFocus: false,
    });

    return {
        state,
        addToCart,
        clear,
        decrease,
        increase,
        remove,
    };
};

export const CartProvider = ({ children }: CartProviderProps): JSX.Element => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <QueryClientProvider client={queryClient}>
            <CartContext.Provider value={{ state, dispatch }}>
                {children}
            </CartContext.Provider>
        </QueryClientProvider>
    );
};

export default CartProvider;
