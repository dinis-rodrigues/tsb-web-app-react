import express from "express";
const app = express();
const port = process.env.PORT || 5000;

// This displays message that the server running and listening to specified port
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

// define a route handler for the default home page
app.get("/", (req, res) => {
  res.send("Hello world!");
});
