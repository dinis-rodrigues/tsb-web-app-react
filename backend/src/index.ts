import express from "express";
import cors from "cors";
// const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4000;

import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const adminCredentials = require("./tsb-dev-admin-key.json");

const firebaseApp = initializeApp({
  credential: cert(adminCredentials),
  databaseURL:
    "https://tsb-application-dev-default-rtdb.europe-west1.firebasedatabase.app",
});

const auth = getAuth(firebaseApp);

// This displays message that the server running and listening to specified port
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

// define a route handler for the default home page
app.get("/", (req, res) => {
  // res.send("Hello world!");
  // console.log(`server started at http://localhost:${port}`);
  // console.log("Hello world!");
});

app.post("/auth", (req, res) => {
  const tokenId = req.body.tokenId;
  console.log(req.body);
  auth
    .verifyIdToken(tokenId)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      console.log("Verified ID token:", uid);
      // ...
    })
    .catch((error) => {
      // Handle error
      console.log(error);
    });
});
