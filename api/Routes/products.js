const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({dest: 'uploads/'})

const Product = require('../Models/product.js');

//GET all products
router.get('/', (req, res, next) => {
    Product.find()
    .select('name price _id')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/product/' + doc._id
                    }
                }
            })
        }
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

//POST a new product
router.post('/', upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });

    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Product Created!',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/product/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(
                {error: err}
            );
        });
    
    
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id')
    .exec()
    .then(doc => {
        console.log('from database' + doc);
        if(doc){
            res.status(200).json(doc);
        }else{
            res.status(404).json(
                {message: 'No valid entry found for provided ID'}
            )
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});


/**
 * Use 
 * [
 * {"propName: PropertyName, value: value"}
 * ]
 */
router.patch('/:productId', (req, res, next) => {
   const id = req.params.productId;
   const updateOps = {};

   for (const ops of req.body) {
       updateOps[ops.propName] = ops.value;
   }
    Product.update({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        console.log(res);
        res.status(200).json(
            {message: 'Product Updated!'}
        );
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    }
    );
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json(
            {message: 'Product Deleted'}
        );
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

module.exports = router;

