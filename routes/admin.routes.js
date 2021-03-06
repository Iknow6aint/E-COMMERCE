const express = require('express');
const{
    getAddProducts,
    postAddProducts,
    getEditProduct,
    postEditProduct,
    getProducts,
    deleteProduct
}= require('../controllers/admin.controllers')
const isAuth = require('../middlewares/is-auth')
const adminRouter = express.Router();

adminRouter.get("/add-product",isAuth,getAddProducts);
adminRouter.post("/add-product",isAuth,postAddProducts);
adminRouter.get('/products',isAuth,getProducts);
adminRouter.get("/edit-product/:productId", isAuth, getEditProduct);
adminRouter.post("/edit-products/:productId",isAuth,postEditProduct);
adminRouter.delete("/product/:productId", isAuth, deleteProduct);



module.exports = adminRouter;

