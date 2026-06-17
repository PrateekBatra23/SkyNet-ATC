const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const flightSocket = require("./sockets/flightHandler");
const flightRoutes = require("./routes/flights");
const summaryRoutes = require("./routes/summary");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const simulationRoutes = require("./routes/simulation")(io);

app.use("/api/flights", flightRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/simulation", simulationRoutes);

flightSocket(io);

app.get("/", (req, res) => {
  res.send("ATC Backend Running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});