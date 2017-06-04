import express from 'express';

const router = express.Router();

/* GET home page for / and any client side routing urls */
router.get('/|/w/', function(req, res) {
    res.render('index');
});

module.exports = router;
