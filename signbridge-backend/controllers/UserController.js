const UserService = require("../services/UserService");
const jwt = require("jsonwebtoken");
const e = require("express");
const { verifyRequest, adminVerifyRequest, publicOrSignExpertVerifyRequest } = require("../middlewares/authenticateToken.middleware");
require("dotenv");

const UserController = {
   async SignUpUser(req, res) {
      try {
         await verifyRequest(req, res, async (req, res) => {
            const {
               firebase_id,
               username,
               email,
               picture,
               acc_type,
               role_access,
            } = req.body;

            const newUser = await UserService.SignUpUser({
               firebase_id,
               username,
               email,
               picture: picture || process.env.FIREBASE_PROFILE_PICTURE,
               acc_type: acc_type || "traditional",
               role_access: role_access || "public",
               email_verified: false,
            });

            if (newUser) {
               return res.status(409).json({
                  message: "User already exist. Please login.",
               });
            }

            if (newUser === null) {
               return res.status(200).json({ message: "Login successfully" });
            }

            return res.status(201).json({
               message:
                  "Verification email sent. Please verify your email to complete registration.",
            });
         })
      } catch (error) {
         console.error("Error registering user:", error);
         res.status(500).json({ error: "Internal Server Error" });
      }
   },

   async VerifyEmail(req, res) {
      try {
         await verifyRequest(req, res, async (req, res) => {
            // console.log("Verify email:", req.body);
            await UserService.VerifyEmail(req.body.firebase_id);
            res.status(200).json({ message: "Email verified" });
         })
      } catch (error) {
         console.error("Error verifying email:", error);
         res.status(500).json({ error: "Internal Server Error" });
      }
   },

   async insertPresetAccounts(req, res) {
      try {
         await UserService.insertPresetAccounts();
         if (res) {
            res.status(200).json({
               message: "Preset accounts inserted successfully",
            });
         }
      } catch (error) {
         console.error("Error inserting preset accounts:", error);
         if (res) {
            res.status(500).json({ error: "Internal Server Error" });
         }
      }
   },

   async GetAllUsers(req, res) {
      try {
         await adminVerifyRequest(req, res, async (req, res) => {
            const users = await UserService.GetAllUsers();
            res.status(200).json(users);
         });
      } catch (error) {
         console.error("Error fetching users:", error);
         res.status(500).json({ error: "Internal Server Error" });
      }
   },

   async GetUserByEmail(req, res) {
      try {
         await verifyRequest(req, res, async (req, res, decodedToken) => {
            const email = decodedToken.email;
            const user = await UserService.GetUserByEmail(email);

            if (user) {
               return res.status(200).send(user);
            } else {
               return res.status(404).send({ error: "User not found" });
            }
         });
      } catch (error) {
         console.error("Error fetching user:", error);
         res.status(500).json({ error: "Internal Server Error" });
      }
   },

   async UpdateUserProfileById(req, res) {
      try {
         await verifyRequest(req, res, async (req, res) => {
            const { userID } = req.params;
            const updatedData = req.body;

            const result = await UserService.UpdateUserProfileById(
               userID,
               updatedData
            );
            res.status(201).json(result);
         })
      } catch (error) {
         console.error("Error updating user profile:", error);
         res.status(500).json({ error: "Internal Server Error" });
      }
   },

   // For country
   async insertPresetCountry(req, res) {
      try {
         await UserService.insertPresetCountry();
         if (res) {
            res.status(200).json({
               message: "Preset country inserted successfully",
            });
         }
      } catch (error) {
         console.error("Error inserting preset country:", error);
         if (res) {
            res.status(500).json({ error: "Internal Server Error" });
         }
      }
   },

   async GetAllCountries(req, res) {
      try {
         await verifyRequest(req, res, async (req, res) => {
            const countries = await UserService.GetAllCountries();
            return res.status(200).json(countries);
         })
      } catch (error) {
         console.error("Error fetching countries:", error);
         return res.status(500).json({ error: "Internal Server Error" });
      }
   },

   // For fetching the user's datasetcollection
   async GetUserDatasetCollection(req, res) {
      try {
         await publicOrSignExpertVerifyRequest(req, res, async (req, res) => {
            const { userID } = req.params;
            const datasetCollection = await UserService.GetDatasetById(userID);

            if (datasetCollection) {
               res.status(200).json(datasetCollection);
            } else {
               res.status(404).json({
                  error: "User dataset collection not found",
               });
            }
         })
      } catch (error) {
         console.error("Error fetching user dataset collection:", error);
         res.status(500).json({ error: "Internal Server Error" });
      }
   },

   // For fetching all datasetcollection
   async GetAllDatasetCollection(req, res) {
      try {
         await adminVerifyRequest(req, res, async (req, res) => {
            const datasetCollection =
               await UserService.GetAllUserDatasetCollection();

            if (datasetCollection) {
               res.status(200).json(datasetCollection);
            } else {
               res.status(404).json({ error: "Dataset collection not found" });
            }
         });
      } catch (error) {
         console.error("Error fetching dataset collection:", error);
         res.status(500).json({ error: "Internal Server Error" });
      }
   },
};

module.exports = UserController;
