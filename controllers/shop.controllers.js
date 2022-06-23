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

function getIndex(req,res,next){
    const page = +req.query.page || 1;
    let totalItem;

    Product.find()
     .countDocuments()
      .then((numProducts)=>{
        totalItem =numProducts;
        return Product.find()
         .skip((page -1) * ITEMS_PER_PAGE)
         .limit(ITEMS_PER_PAGE)
      })
      .then((products) => {
        res.render("shop/index", {
          prods: products,
          pageTitle: "Shopmip | Your Favourite Shopping Destination",
          path: "/",
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
          cloudinary: cloudinary,
        });
      })
      .catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode =500;
        return next(error);
      });
};

function getCart(req,res,next){
    req.user
     .populate("cart.items.productId")
     .execPopulate()
     .then((user)=>{
        console.log(user.cart.items);
        const products = user.cart.items;
        res.render("shop/cart",{
            path:"/cart",
            pageTiltle:"Your Cart",
            products,
        });
     })
     .catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
     });
};

function postCart(req,res,next){
    const prodId = req.body.productId;
    Product.findById(prodId)
     .then((product)=>{
        return req.user.addToCart(product)
     })
      .then((result)=>{
        //cosole.log(result);
        res.redirect("/cart")
      });
};

function postCartDelete(req,res,next){
    const prodId = req.body.productId;
    req.user
     .removeFromCart(prodId)
     .then((result)=>{
        res.redirect("/cart")
     })
      .catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      })
};

function postOrder(req,res,next){
    req.user
     .populate("cart.items.productId")
     .execPopulate()
     .then((user)=>{
        const products = user.cart.items.map((i)=>{
            return{quantity: i.quantity, product:{...i.productId._doc}};
        });
        const order = new Order({
            user:{
                email:req.user.email,
                userId:req.user
            },
            products,
        });
        return order.save()
     })
     .then((result)=>{
        return req.user.clearCart()
     })
     .then(()=>res.redirect("/orders"))
     .catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500
     });
};

function getOrders(req, res, next){
    Order.find({ "user.userId": req.user._id })
      .then((orders) => {
        res.render("shop/orders", {
          path: "/orders",
          pageTitle: "Your Orders",
          orders: orders,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };


module.exports = {
    getProducts,
    postCart,
    postCartDelete,
    postOrder,
    getOrders,
    getIndex,
    getCart,
    getOneProduct
}