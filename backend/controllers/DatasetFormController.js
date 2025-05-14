const DatasetFormService = require("../services/DatasetFormService")
const FirebaseService = require("../services/FirebaseService")
const { sendEmail, datasetTemplate } = require("../utils/email");
const { REQUEST } = require("../constants/DatasetEmail")
const UserService = require("../services/UserService")
const { verifyRequest, adminVerifyRequest, signExpertVerifyRequest, signExpertOrAdminVerifyRequest } = require("../middlewares/authenticateToken.middleware");

const DatasetFormController = {
    async ProcessVideoAndSubmitFormData(req, res, next) {
        try {
            await verifyRequest(req, res, async (req, res) => {
                const { user_id, name, email, text_sentence, status_SE_en, status_SE_bm, status_Admin_en, status_Admin_bm, updatedMessage } = req.body;
                const avatar_link = "";
                const videoInfo = req.file;
                const videoContent = await FirebaseService.uploadVideoToStorageAndGetURL(videoInfo, "demoVid", "demo");
                if (videoContent) {
                    const video_link = videoContent.downloadURL
                    const submitted_time = videoContent.timestamp
                    const video_name = videoContent.filename
                    const result = await DatasetFormService.SubmitForm({ user_id: parseInt(user_id), name, email, text_sentence, status_SE_en, status_SE_bm, status_Admin_en, status_Admin_bm, submitted_time, video_link, video_name, avatar_link })
                    const collectionID = result.newFormId;
                    const request = REQUEST[updatedMessage]
                    if (request) {
                        const request_details = request.type(collectionID)
                        const mailOption = {
                            email: request.receiver,
                            subject: request_details.subject,
                            message: datasetTemplate(request_details.message1, request_details.message2, request_details.message3)
                        }
                        await sendEmail(mailOption);
                    }
                    res.status(201).json(result.result);
                }
            })
        } catch (error) {
            next(error)
        }
    },

    async GetAllFormsForSignExpert(req, res) {
        try {
            await signExpertVerifyRequest(req, res, async (req, res) => {
                const forms = await DatasetFormService.GetAllFormsForSignExpert();
                res.status(200).json(forms);
            })
        } catch (error) {
            console.error("Error fetching forms:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async GetAllFormsForAdmin(req, res) {
        try {
            await adminVerifyRequest(req, res, async (req, res) => {
                const forms = await DatasetFormService.GetAllFormsForAdmin();
                res.status(200).json(forms);
            })
        } catch (error) {
            console.error("Error fetching forms:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async UpdateFormStatusById(req, res) {
        try {
            await signExpertOrAdminVerifyRequest(req, res, async (req, res) => {
                const formId = req.params.id;
                const { message, ...updatedFormData } = req.body;
                const request = REQUEST[message]
                if (request) {
                    if (message === "New_Request_Accepted") {
                        const formDetail = await DatasetFormService.GetFormById(formId);
                        const user = await UserService.getUserById(parseInt(formDetail.user_id))
                        const request_details = request.type(user.username)
                        const mailOption = {
                            email: user.email,
                            subject: request_details.subject,
                            message: datasetTemplate(request_details.message1, request_details.message2, request_details.message3)
                        }
                        await sendEmail(mailOption);
                        const message2 = "New_Request_Accepted_2"
                        const request2 = REQUEST[message2]
                        const request_details2 = request2.type(formId)
                        const mailOption2 = {
                            email: request2.receiver,
                            subject: request_details2.subject,
                            message: datasetTemplate(request_details2.message1, request_details2.message2, request_details2.message3)
                        }
                        await sendEmail(mailOption2);
                    }
                    else {
                        const request_details = request.type(formId)
                        const mailOption = {
                            email: request.receiver,
                            subject: request_details.subject,
                            message: datasetTemplate(request_details.message1, request_details.message2, request_details.message3)
                        }
                        await sendEmail(mailOption);
                    }
                }
                await DatasetFormService.UpdateFormByID(formId, updatedFormData);
                res.status(200).json({ message: "Form updated successfully" });
            })
        } catch (error) {
            console.error("Error updating form:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async UpdateFormStatusWithVideoById(req, res) {
        try {
            await adminVerifyRequest(req, res, async (req, res) => {
                const formId = req.params.id;
                const { message, ...updatedFormData } = req.body;
                const form = await DatasetFormService.GetFormById(formId)
                const avatar_link = form.avatar_link
                if (avatar_link != "") {
                    await FirebaseService.deleteVideoFromStorage(avatar_link);
                }
                // Handle the uploaded video file
                const videoInfo = req.file;
                const videoContent = await FirebaseService.uploadVideoToStorageAndGetURL(videoInfo, "avatarVid", "avatar");
                if (videoContent) {
                    const video_link = videoContent.downloadURL
                    const video_name = videoContent.filename
                    updatedFormData.avatar_link = video_link;
                    updatedFormData.avatar_name = video_name;
                    await DatasetFormService.UpdateFormByID(formId, updatedFormData);
                    res.status(200).json({ message: "Form updated successfully" });
                }
                const request = REQUEST[message]
                if (request) {
                    const request_details = request.type(formId)
                    const mailOption = {
                        email: request.receiver,
                        subject: request_details.subject,
                        message: datasetTemplate(request_details.message1, request_details.message2, request_details.message3)
                    }
                    await sendEmail(mailOption);
                }
            })
        } catch (error) {
            console.error("Error updating form:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    async GetFormById(req, res) {
        try {
            await signExpertOrAdminVerifyRequest(req, res, async (req, res) => {
                const formId = req.params.id;
                const formDetail = await DatasetFormService.GetFormById(formId);
                res.status(200).json(formDetail)
            })
        } catch (error) {
            console.error("Error updating form:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async GetDemoVideoById(req, res) {
        try {
            await signExpertOrAdminVerifyRequest(req, res, async (req, res) => {
                const formId = req.params.id;
                const video = await DatasetFormService.GetDemoVideoById(formId);
                const downloadUrl = video.videoLink;
                const filename = video.videoName || 'default_video.mp4'; // Set default filename if unavailable
                const response = await fetch(downloadUrl);
                if (!response.ok) {
                    throw new Error('Error fetching video');
                }
                const arrayBuffer = await response.arrayBuffer(); // Convert blob to array buffer
                const buffer = Buffer.from(arrayBuffer); // Convert array buffer to buffer
                const contentType = response.headers.get('content-type') || 'video/mp4'; // Use response content type or default to video/mp4

                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(buffer); // Send the buffer data as the response body 
            })
        } catch (error) {
            console.error("Error fetching video:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    async GetAvatarVideoById(req, res) {
        try {
            await signExpertOrAdminVerifyRequest(req, res, async (req, res) => {
                const formId = req.params.id;
                const video = await DatasetFormService.GetAvatarVideoById(formId);
                const downloadUrl = video.videoLink;
                const filename = video.videoName || 'default_video.mp4'; // Set default filename if unavailable
                const response = await fetch(downloadUrl);
                if (!response.ok) {
                    throw new Error('Error fetching video');
                }
                const arrayBuffer = await response.arrayBuffer(); // Convert blob to array buffer
                const buffer = Buffer.from(arrayBuffer); // Convert array buffer to buffer
                const contentType = response.headers.get('content-type') || 'video/mp4'; // Use response content type or default to video/mp4

                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(buffer); // Send the buffer data as the response body


            })

        } catch (error) {
            console.error("Error fetching video:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async DeleteFormById(req, res) {
        try {
            await signExpertVerifyRequest(req, res, async (req, res) => {

                const formId = req.params.id;
                const { message } = req.body;
                // Assuming you have a deleteById function that handles deletion

                const form = await DatasetFormService.GetFormById(formId);
                const request = REQUEST[message]
                if (request) {
                    const user = await UserService.getUserById(parseInt(form.user_id))
                    const request_details = request.type(user.username)
                    const mailOption = {
                        email: user.email,
                        subject: request_details.subject,
                        message: datasetTemplate(request_details.message1, request_details.message2, request_details.message3)
                    }
                    await sendEmail(mailOption);
                }
                const videoUrl = form.video_link;
                await FirebaseService.deleteVideoFromStorage(videoUrl);
                await DatasetFormService.DeleteFormByID(formId);
                // Respond with success message
                res.status(200).json({ message: `Form with ID ${formId} deleted successfully` });
            })
        } catch (error) {
            console.error("Error deleting form:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
module.exports = DatasetFormController