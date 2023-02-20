import express from "express";

const PORT: number = 3000;
const app: express.Application = express();

// app.set("view engine", "pug");
// app.set("views", __dirname + "/public/views");
// app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.sendStatus(200));

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
