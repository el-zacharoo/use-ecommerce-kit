import React from "react";

export enum ActionTypes {
    CLEAR = "CLEAR",
    REMOVE = "REMOVE",
    CART = "CART",
    INC = "INC",
    DEC = "DEC",
    GET_TOTALS = "GET_TOTALS",
}

export type ProductTypes = {
    productId: string;
    name: string;
    price: number;
    amount: number[];
    // generic type for any other fields
    [key: string]: any;
};

export type State = {
    cart: ProductTypes[];
    amount: number;
    total: number;
};

export type Action = {
    type: ActionTypes;
    payload: {
        id: string;
        amount: number;
        product: ProductTypes;
    };
};

export type CartContextValue = {
    state: State;
    dispatch: React.Dispatch<Action>;
} | undefined;
