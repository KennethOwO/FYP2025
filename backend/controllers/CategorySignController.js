const CategorySignService = require("../services/CategorySignService");
const FirebaseService = require('../services/FirebaseService');
const { adminVerifyRequest } = require("../middlewares/authenticateToken.middleware");

const CategorySignController = {
  async fetchSign(req, res) {
    const cat = req.params.cat;
    try {
      const signs = await CategorySignService.fetchSign(cat);
      res.status(200).json(signs);
    } catch (error) {
      console.error("Error fetching signs for:", cat, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async UpdateSign(req, res) {
    try {
      await adminVerifyRequest(req, res, async (req, res) => {
        const signId = parseInt(req.params.id);
        const thumbnail = req.file;

        // Get the current sign to find its existing thumbnail
        const signs = await CategorySignService.fetchSign();
        const currentSign = signs.find(s => s.signId === signId);
        const prev_thumbnail = currentSign ? currentSign.thumbnail : null;

        // Delete previous thumbnail from Firebase if it exists
        if (prev_thumbnail) {
          await FirebaseService.deleteLibraryImageInStorage(prev_thumbnail);
        }

        if (thumbnail) {
          // Upload new thumbnail using sign keyword as filename
          const imageURL = await FirebaseService.uploadLibraryImageToStorageAndGetURL(
            thumbnail,
            currentSign.keyword // Use the sign's keyword for the filename
          );

          if (imageURL) {
            const result = await CategorySignService.UpdateSign(signId, { thumbnail: imageURL });
            return res.status(201).json(result);
          } else {
            return res.status(500).json({ error: 'Failed to upload image' });
          }
        } else {
          return res.status(400).json({ error: 'Image is required' });
        }
      });
    } catch (error) {
      console.error('Error updating sign thumbnail', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  //WORK IN PROGRESS
  async updateAvatarSigns(res) {
    try {
      const result = await CategorySignService.updateAvatarSigns();
      if (res) {
        res.status(200).json({ message: 'Avatar signs updated successfully' });
      }
    } catch (error) {
      console.error('Error updating avatar signs:', error);
      if (res) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  },
};

module.exports = CategorySignController;
