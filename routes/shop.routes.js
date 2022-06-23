const express = require("express");
const isAuth = require("../middlewares/is-auth")

const {
    getProducts,
    postCart,
    postCartDelete,
    postOrder,
    getOrders,
    getIndex,
    getCart,
    getOneProduct
} = require("../controllers/shop.controllers")


const shopRouter =express.Router();
shopRouter.get("/",getIndex)
shopRouter.get("/products/:productId", getOneProduct);
shopRouter.get("/cart",isAuth,getCart);
shopRouter.post("/cart",isAuth,postCart);
shopRouter.post("/cart-delete-item",isAuth,postCartDelete);
shopRouter.get("/orders",isAuth,getOrders);
shopRouter.post("/orders",isAuth,postOrder);
shopRouter.get("/products",getProducts);

module.exports =shopRouter;
