const Order = require("../models/order.models");
const Product = require("../models/products.models");
const{cloudinary}=require("../utils/cloudinary");

const fs = require("fs");
const path = require("path")

const ITEMS_PER_PAGE = 8;

function getProducts(req,res,next){
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
         .countDocuments()
         .then((numProducts)=>{
            totalItems =numProducts;
            return Product.find()
             .skip((page -1)* ITEMS_PER_PAGE)
             .limit(ITEMS_PER_PAGE)
         })
         .then((products)=>{
            res.render("shop/product-list",{
                prods: products,
                pageTitle: "Products",
                path:"/products",
                currentPage:page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });

         })
         .catch((err)=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
         });
};

function getOneProduct(req,res,next){
    const prodId =req.params.productId;

    Product.findById(prodId)
     .then((product)=>{
        res.render('shop/product-detail',{
            product,
            pageTiltle: product.title,
            path: "/products",
        })
     })
     .catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode =500;
        return next(error)
     })
}





module.exports = {
    getProducts,
}