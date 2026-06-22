
// const express = require("express");
// const app = express();
// const connectDB = require("./config/database")
// const cookieParser = require("cookie-parser")
// const cors = require("cors")
 

// // app.use(cors({
// //     origin:[
// //         "http://localhost:5173"
// //     ],
// //     credentials:true
// // }))
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));
 
// const AuthRouter = require("./Routes/auth")
// const profileRouter = require("./Routes/profile")
// const ApplicationRouter = require("./Routes/Application")
// const userDocumentRouter = require("./Routes/userDocument")
// const AdminApplicationRouter = require("./Routes/AdminApplication")
// const userRouter = require("./Routes/userRoutes")

// const fs = require("fs");
// const path = require("path");
// const http = require("http");
// const server = http.createServer(app);
// const uploadPath = path.join(__dirname, "uploads");

// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath);
// }
 
// const { Server } = require("socket.io");

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     credentials: true
//   }
// });

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);
// });

// app.use(express.json());        // Parses JSON data
// app.use(express.urlencoded({ extended: true }));  // Parses form data
// // app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(cookieParser())

//     app.use("/",AuthRouter)
//     app.use("/",profileRouter)
//     app.use("/",ApplicationRouter)
//     app.use("/",userDocumentRouter)
//     app.use("/",AdminApplicationRouter)
//     app.use("/",userRouter)
 

// connectDB().then(()=>{
//  console.log("connected successfully database")
//     app.listen(7000,(req,res)=>{
        
//        console.log("running server")
//     })

// }).catch((err)=>{
//     console.log(err.message)
//     console.log("not connected database")
// })


 const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const http = require("http");
const server = http.createServer(app);

// Import routes
const AuthRouter = require("./Routes/auth");
const profileRouter = require("./Routes/profile");
const ApplicationRouter = require("./Routes/Application");
const userDocumentRouter = require("./Routes/userDocument");
const AdminApplicationRouter = require("./Routes/AdminApplication");
const userRouter = require("./Routes/userRoutes");

// ✅ CREATE UPLOADS FOLDER - IMPORTANT FIX
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("✅ Uploads folder created at:", uploadPath);
}

// ✅ Also create subfolders if needed
const subFolders = ['documents', 'profiles'];
subFolders.forEach(folder => {
  const folderPath = path.join(uploadPath, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✅ Created subfolder: ${folder}`);
  }
});

// Socket.io setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

// ✅ CORS Configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cookieParser());

// Routes
app.use("/", AuthRouter);
app.use("/", profileRouter);
app.use("/", ApplicationRouter);
app.use("/", userDocumentRouter);
app.use("/", AdminApplicationRouter);
app.use("/", userRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

// Start server
connectDB().then(() => {
  console.log("Connected successfully to database");
  server.listen(7000, () => {
    console.log("Server running on port 7000");
  });
}).catch((err) => {
  console.log(err.message);
  console.log("Not connected to database");
});