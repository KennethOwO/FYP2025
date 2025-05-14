const { verifyRequest } = require('../middlewares/authenticateToken.middleware');
const CommunicationService = require('../services/CommunicationService');

const CommunicationController = {
  async fetchLogsByUser(req, res) {
    try {
      await verifyRequest(req, res, async (req, res) => {
        const logBody = req.body;
        const log = await CommunicationService.fetchLogsByUser(logBody);
        res.status(200).json(log);
      })
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async CreateLogsByUser(req, res) {
    try {
      await verifyRequest(req, res, async (req, res) => {
        const logBody = req.body;
        const currentTime = new Date();
        const logTimestamp = currentTime
          .toLocaleString("en-GB", { year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
          .replace(",", " -");

        logBody.timestamp = logTimestamp;
        const newLog = await CommunicationService.CreateLogsByUser(logBody);
        res.status(201).json(newLog);
      })
    } catch (error) {
      console.error('Error creating logs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async DeleteAllLogsByUser(req, res) {
    try {
      await verifyRequest(req, res, async (req, res) => {
        const id = req.params.id;
        const logBody = req.body;
        const log = await CommunicationService.DeleteAllLogsByUser(id, logBody);
        res.status(200).json(log);
      })
    } catch (error) {
      console.error('Error deleting history logs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async fetchNLPOutput(req, res) {
    try {
      // Extracting submittedText from the request body
      const data = req.body; // This should match how the frontend sends the data
      const response = await CommunicationService.fetchNLPOutput(data); // Send the correct key to the service
      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching NLP output:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async fetchSLROutput(req, res) {
    try {
      const video = req.file; // Ensure this is set correctly
      if (!video) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      // Pass the video to the service or handle as needed
      const response = await CommunicationService.fetchSLROutput({ video });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

module.exports = CommunicationController;
