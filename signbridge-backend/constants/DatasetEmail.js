// send to public
require('dotenv').config();

//send to public
const request_accepted = (userName) => {
    return {
        subject: "Request Accepted",
        message1: `Dear ${userName},`,
        message2: "We are pleased to inform you that the sign expert has accepted your request. Thank you for your submission. We will now proceed with processing your request.",
        message3: ""
    }
}

//send to admin
const request_accepted_by_sign_expert = (requestId) => {
    return {
        subject: `Request Accepted/Submitted by Sign Expert (ID: ${requestId})`,
        message1: `Dear Admin,`,
        message2: "We are pleased to inform you that the sign expert has accepted/submitted a new request.",
        message3: `The request id is ${requestId}.`
    }
}

// send to public
const request_cancelled = (userName) => {
    return {
        subject: "Request Cancelled",
        message1: `Dear ${userName},`,
        message2: "We regret to inform you that the sign expert has cancelled your request. This may be due to inaccuracies or redundancy with existing requests. If you any further enquiries please contact us through our feedback section.",
        message3: ""
    }
}

// send to sign expert
const request_submitted_by_public = (requestId) => {
    return {
        subject: `Request Submitted by Public (ID: ${requestId})`,
        message1: `Dear Sign Expert,`,
        message2: "There is an incoming request submitted by the public",
        message3: `The request id is ${requestId}.`
    }
}

// send to sign expert
const request_accepted_by_admin = (requestId) => {
    return {
        subject: `Request Accepted by Admin (ID: ${requestId})`,
        message1: `Dear Sign Expert,`,
        message2: "We are pleased to inform you that the admin has accepted your request.",
        message3: `The request id is ${requestId}.`
    }
}

// send to sign expert
const request_updated_by_admin = (requestId) => {
    return {
        subject: `Request Updated by Admin (ID: ${requestId})`,
        message1: `Dear Sign Expert,`,
        message2: "The admin has updated the request with the avatar video.",
        message3: `The request id is ${requestId}.`
    }
}

// send to admin
const request_rejected_by_sign_expert = (requestId) => {
    return {
        subject: `Request with Avatar Video Rejected (ID: ${requestId})`,
        message1: `Dear Admin,`,
        message2: "We regret to inform you that the sign expert has rejected the avatar video. Please resubmit another avatar video or contact the sign expert in question.",
        message3: `The request id is ${requestId}.`
    }
}

// send to admin
const request_verified_by_sign_expert = (requestId) => {
    return {
        subject: `Request with Avatar Video Verified (ID: ${requestId})`,
        message1: `Dear Admin,`,
        message2: "We are pleased to inform you that the sign expert has verified the avatar video.",
        message3: `The request id is ${requestId}.`
    }
}

const REQUEST = {
    "New_Request_Accepted": { "type": request_accepted, receiver: "" },
    "New_Request_Accepted_2": { "type": request_accepted_by_sign_expert, "receiver": process.env.EMAIL_USER },
    "Request_Cancelled": { "type": request_cancelled, receiver: "" },
    "Request_Verified": { "type": request_verified_by_sign_expert, "receiver": process.env.EMAIL_USER },
    "Request_Rejected": { "type": request_rejected_by_sign_expert, "receiver": process.env.EMAIL_USER },
    "Request_Accepted_by_Admin": { "type": request_accepted_by_admin, "receiver": process.env.SIGN_EXPERT },
    "Request_Updated_by_Admin": { "type": request_updated_by_admin, "receiver": process.env.SIGN_EXPERT },
    "Submitted_by_Public": { "type": request_submitted_by_public, "receiver": process.env.SIGN_EXPERT },
}

module.exports = {
    REQUEST
}