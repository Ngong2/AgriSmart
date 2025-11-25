const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  listMyProducts
} = require('../controllers/productsController');

router.get('/', listProducts);
router.get('/my-products', auth, listMyProducts);
router.get('/:id', getProduct);
router.post('/', auth, upload.single('image'), createProduct);
router.put('/:id', auth, upload.single('image'), updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;
