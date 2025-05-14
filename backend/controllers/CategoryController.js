const CategoryService = require('../services/CategoryService');
const FirebaseService = require('../services/FirebaseService');
const { verifyRequest, adminVerifyRequest, signExpertVerifyRequest, signExpertOrAdminVerifyRequest } = require("../middlewares/authenticateToken.middleware");

const CategoryController = {
  async fetchCat(req, res) {
    try {
      const cat = await CategoryService.fetchCat();
      res.status(200).json(cat);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async insertPresetSignCategories(res) {
    try {
      const result = await CategoryService.insertPresetSignCategories();
      if (res) {
        res.status(200).json({ message: 'Preset sign categories inserted successfully' });
      }
    } catch (error) {
      console.error('Error inserting preset sign categories:', error);
      if (res) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  },

  async CreateCat(req, res) {
    try {
      await adminVerifyRequest(req, res, async (req, res) => {
        const { category_name } = req.body;
        const category_thumbnail = req.file;

        if (category_thumbnail) {
          const imageURL = await FirebaseService.uploadLibraryImageToStorageAndGetURL(category_thumbnail);

          if (imageURL) {
            const result = await CategoryService.CreateCat({ category_name: category_name, category_thumbnail: imageURL });
            return res.status(201).json(result);
          } else {
            return res.status(500).json({ error: 'Failed to upload image' });
          }
        } else {
          return res.status(400).json({ error: 'Image is required' });
        }
      })
    } catch (error) {
      console.error('Error creating new category', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async UpdateCat(req, res) {
    try {
      await adminVerifyRequest(req, res, async (req, res) => {
        const catId = parseInt(req.params.id);
        const { category_name } = req.body;
        const category_thumbnail = req.file;

        const cat = await CategoryService.fetchCat();
        const category = cat.find(c => c.category_id === catId);
        const prev_category_thumbnail = category ? category.category_thumbnail : null;

        if (category_thumbnail) {
          if (prev_category_thumbnail) {
            await FirebaseService.deleteLibraryImageInStorage(prev_category_thumbnail);
          }
          const imageURL = await FirebaseService.uploadLibraryImageToStorageAndGetURL(category_thumbnail);
          if (!imageURL) {
            return res.status(500).json({ error: 'Failed to upload image' });
          }
          const result = await CategoryService.UpdateCat(catId, { 
            category_name: category_name, 
            category_thumbnail: imageURL 
          });
          return res.status(201).json(result);
        } else {
          const result = await CategoryService.UpdateCat(catId, { 
            category_name: category_name,
            category_thumbnail: prev_category_thumbnail 
          });
          return res.status(201).json(result);
        }
      })
    } catch (error) {
      console.error('Error updating category', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async DeleteCat(req, res) {
    try {
      await adminVerifyRequest(req, res, async (req, res) => {
        const id = parseInt(req.params.id);
        const cat = await CategoryService.DeleteCat(id);
        res.status(200).json(cat);
      })
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = CategoryController;
