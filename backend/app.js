// const fs = require('fs');
// const https = require('https');

require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { MongoClient } = require("mongodb");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
const port = process.env.PORT;
const dbName = process.env.DATABASE_NAME;
const dbUrl = process.env.DATABASE_URL;
const client = new MongoClient(dbUrl);
const database = client.db(dbName);
const mongoSanitize = require("express-mongo-sanitize");


app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: {
    status: 429,
    error: "Too many requests. Please try again later.",
  },
});
app.use(limiter);

// const options = {
//     key: fs.readFileSync(path.join(__dirname, 'config', '192.168.1.5-key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, 'config', '192.168.1.5.pem'))
// };

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

app.get('/test', (req, res) => {
  res.json({ message: "Test route OK" });
});


// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "ngrok-skip-browser-warning", // ✅ ADD THIS
    ],
    exposedHeaders: ["Content-Type"],
    credentials: true,
    maxAge: 86400,
  })
);

app.use(bodyParser.json({ limit: "250mb" }));
app.use(bodyParser.urlencoded({ limit: "250mb", extended: true, parameterLimit: 50000 }));
app.use(cookieParser());

// —— 新增：把 public/glosses 下的 .jsonl 当静态资源暴露 —— 
app.use(
  "/glosses",
  express.static(path.join(__dirname, "public/glosses"))
);

// enabling the Helmet middleware
app.use(helmet());
// Set cache control headers to disable caching for API responses
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    next();
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
      frameSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      scriptSrc: ["'self'"], // Remove 'unsafe-inline' if possible
      styleSrc: ["'self'", "'unsafe-inline'"], // Optional: OK for Tailwind/dev
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  })
);


// setting "X-Frame-Options" to "DENY"
app.use(helmet.frameguard({ action: "deny" }));
// not loading the noSniff() middleware
app.use(helmet({ noSniff: false }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
//uncomment for production
// app.use(helmet.hsts({
//     maxAge: 31536000, // 1 year
//     includeSubDomains: true, // Apply to subdomains as well
//     preload: true // Allow inclusion in the preload list
// }));

// Add these headers before your routes
app.use((req, res, next) => {
    res.header("X-Content-Type-Options", "nosniff");
    res.header("X-XSS-Protection", "1; mode=block");
    res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
});

// -------------------Newly Added Working According to Folder Structure----------------------------------------
const userRoutes = require("./routes/UserRoutes");
app.use(userRoutes);

const feedbackRoutes = require("./routes/FeedbackRoutes");
app.use(feedbackRoutes);

const faqRoutes = require("./routes/FaqRoutes");
app.use(faqRoutes);

const categoryRoutes = require("./routes/CategoryRoutes");
app.use(categoryRoutes);

const categorySignRoutes = require("./routes/CategorySignRoutes");
app.use(categorySignRoutes);

const communicationRoutes = require("./routes/CommunicationRoutes");
app.use(communicationRoutes);

const slrRoutes = require("./routes/SLRRoutes");
app.use("/api/slr", slrRoutes);

const slpRoutes = require("./routes/SLPRoutes");
app.use("/api/slp", slpRoutes);

app.use("/cache", express.static(path.join(__dirname, "public/cache")));

const notificationRoutes = require("./routes/NotificationRoutes");
app.use(notificationRoutes);

const leaderboardRoutes = require("./routes/LeaderBoardRoutes");
app.use(leaderboardRoutes);

const formRoutes = require("./routes/DatasetFormRoutes");
app.use(formRoutes);

const edithomepageRoutes = require("./routes/EditHomepageRoutes");
app.use(edithomepageRoutes);

app.use(mongoSanitize({
  onSanitize: ({ req, key }) => {
    console.warn(`🛡️ MongoDB injection attempt detected and removed: ${key}`);
  }
}));

// const CsrfTokenRoutes = require("./routes/CsrfTokenRoutes");
// app.use(CsrfTokenRoutes);

// ------------------------------------------------------------------------------------------------------------
const UserController = require("./controllers/UserController");
const FaqController = require("./controllers/FaqController");
const CategoryController = require("./controllers/CategoryController");
const CategorySignController = require("./controllers/CategorySignController");
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Backend running on http://0.0.0.0:${port} (LAN accessible)`);
    UserController.insertPresetAccounts();
    CategoryController.insertPresetSignCategories();
    CategorySignController.updateAvatarSigns();
    UserController.insertPresetCountry();
    FaqController.insertFixFaq();
});
// https.createServer(options, app).listen(port, '0.0.0.0', () => {
//     console.log(`✅ Backend running on https://0.0.0.0:${port} (LAN accessible)`);
//     UserController.insertPresetAccounts();
//     CategoryController.insertPresetSignCategories();
//     CategorySignController.updateAvatarSigns();
//     UserController.insertPresetCountry();
//     FaqController.insertFixFaq();
// });


