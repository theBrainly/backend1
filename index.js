// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(express.json());
app.use(cors());
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

app.get("/", (req, res) => {
  res.send("Welcome to my API!");
});

const FILE_DIR = path.join(__dirname, "./files");

// Function to compile code
function compileCode(filePath, language, res) {
  let command;
  const fileName = path.basename(filePath, path.extname(filePath));

  switch (language) {
    case "cpp":
      command = `g++ ${filePath} -o ${FILE_DIR}/${fileName} && ${FILE_DIR}/${fileName}`;
      break;
    case "java":
      command = `javac ${filePath} && java -cp ${FILE_DIR} ${fileName}`;
      break;
    case "js":
      command = `node ${filePath}`;
      break;
    default:
      return res.status(400).json({ error: "Unsupported language." });
  }

  exec(command, (err, stdout, stderr) => {
    if (err) {
      // Remove the directory path from the error message
      const errorMessage = stderr.replace(new RegExp(FILE_DIR, "g"), "");
      return res.status(400).json({
        success: false,
        error: errorMessage || "Compilation failed.",
      });
    }

    // Compilation succeeded
    res.json({
      success: true,
      message: "Code compiled successfully.",
      output: stdout,
    });
  });
}

app.post("/api/run", (req, res) => {
  const { content, language } = req.body;

  if (!content || !language) {
    return res
      .status(400)
      .json({ error: "Content and language are required." });
  }

  const codeFilePath = path.join(FILE_DIR, "fileName.cpp");

  fs.writeFile(codeFilePath, content, "utf8", (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Failed to write content to file." });
    }

    compileCode(codeFilePath, language, res);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
