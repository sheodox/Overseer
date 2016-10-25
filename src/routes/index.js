var express = require('express');
var router = express.Router();

/* GET home page for / and any client side routing urls */
router.get('/|/w/', function(req, res) {
    res.render('index', { title: 'Home' });
});

module.exports = router;
