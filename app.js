const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
  socket.on("send-location", function (data) {
    io.emit("receive-location", { id: socket.id, name: "UNKNOWN", ...data });
  });

  socket.on("disconnect", function () {
    io.emit("user-disconnected", socket.id);
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
