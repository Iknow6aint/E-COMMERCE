const Product = require("../models/products.models")
const {validationResult} = require("express-validators")
const {deleteFile} = require('../utils/files');
const path = require('path');
const {cloudinary}=require('../utils/cloudinary');
const streamifier =require('streamifier');
const { Error } = require("mongoose");
const productsModels = require("../models/products.models");



function getAddProducts(req,res,next){
    if(!req.session.isLoggedIn){
        return res.redirect("/login");
    }
    res.render("admin/edit-product",{
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: false,
        errorMessage: [],
        validationErrors: [],
    });
};

async function postAddProducts(req,res,next){
    const {title,price,description}=req.body;
    const image =req.file;

    //check if image or not
    if(!image){
        return res.status(422).render('admin/edit-product',{
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            product: {
              title: title,
              price: price,
              description: description,
            },
            errorMessage:"Attached image is required.",
            validationErrors:[]
        })
    }

    //vlaidation check
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render("admin/edit-product",{
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            product: {
              title,
              imageUrl: imageURL,
              price,
              description: description,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        })
    }

    let streamUpload =(req)=>{
        return new Promise((resolve,reject)=>{
            let stream = cloudinary.uploader.upload_stream((error,result)=>{
                if(result){
                    resolve(result)
                }else{
                    reject(error)
                }
            })
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req){
        let result = await streamUpload(req);
        return result;
    }

    const uploadedImage = await upload(req);
    const imageURL = uploadedImage.secure_url;
    const publicId = uploadedImage.public_id;
    

    const product = new product({
        title,
        price,
        description,
        imageURL,
        publicId,
        userId:req.user,
    })

    product
     .save()
     .then((result)=>{
        console.log("created product");
        res.redirect('/admin/products')
     })
     .catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode =500;
        return next(error)
     })
};

function getEditProduct(req,res,next){
    const editMode = req.query.edit;

    if(!editMode){
        return res.redirect("/");
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
     .then((product)=>{
        if(!product){
            return res.redirect('/')
        }
        res.render('admin/edit-product',{
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: editMode,
            product: product,
            hasError: false,
            errorMessage: [],
            validationErrors: [],
        });
     })
      .catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      })
}

async function postEditProduct (req,res,next){
    const prodId =req.body.productId;
    const newPrice =req.body.price;
    const newTitle =req.body.title;
    const image = req.file;
    const newDesc = req.body.description;
    const errors = validationResult(req);

    let newImageUrl;
    let newPublicId;

    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product',{
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: true,
            hasError: true,
            product: {
            title: updatedTitle,
            price: updatedPrice,
            description: updatedDesc,
            _id: prodId,
           },
           errorMessage:errors.array()[0].msg,
           validationErrors:errors.array()
        });
    }

    if(image){
        let streamUpload =(req)=>{
            return new Promise((resolve,reject)=>{
                let stream = cloudinary.uploader.upload_stream((error,result)=>{
                    if(result){
                        resolve(result);
                    }else{
                        reject(error);
                    }
                });
                 streamifier.createReadStream(req.file.buffer).pipe(stream)
            });
        };

        async function upload(req){
            let result =await streamUpload(req);
            return result;
        }

        const  uploadedImage = await upload(req);
        newImageUrl = uploadedImage.secure_url;
        newPublicId = uploadedImage.public_id;
    }else{
        Product.findById(prodId)
         .then((product)=>{
            newImageUrl  = product.imageURL;
            newPublicId = product.publicId;
         });
    }


    Product.findById(prodId)
     .then((product)=>{
        if(product.userId.toString()!== req.user._id.toString()){
            return res.redirect("/")
        }

        //product is a mongoose oblect that has its own methods 
        product.title = newTitle;
        product.price  = newPrice;
        product.description = newDesc;

        if(image){
            fileHelper
             .deleteFile(product.publicId)
             .then((result)=>console.log("edit and delete sucess",result))
             .catch((err)=>{
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
             });
             product.imageUrl = newImageURL;
             product.publicId = newPublicId;
        }
        return product.save().then((result) => {
            console.log("UPDATED PRODUCT");
            res.redirect("/admin/products");
          });
     })
     .catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
     })

}

function getProducts(req,res,next){
    Product.find({userId:req.user._id})
     .then((product)=>{
        res.render("admin/products",{
            prods:productsModels,
            pageTitle:"Admin Products",
            path:"/admin/products"
        })
     })
     .catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode =500;
        return next(error);
     });
}

function deleteProduct(req,res,next){
    const prodId = req.params.product;
    Product.findById(prodId)
     .then((product)=>{
        if (!product) {
            return next(new Error("product not found"));
        }
        return deleteFile(product.publicId)
     })
     .then((result)=>{
        console.log("edit and delete success",result)
        return Product.deleteOne({_id:prodId,userId:req.userId});
     })
      .then(()=>{
        console.log('DESTROYED PRODUCT');
        res.status(200).json({message:"sucess!"})
      })
      .catch((err)=>{
        res.status(500).json({message:"delete failed"})
      });
};


module.exports ={
    getAddProducts,
    postAddProducts,
    getEditProduct,
    postEditProduct,
    getProducts,
    deleteProduct
}