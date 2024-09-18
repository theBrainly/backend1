// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
app.use(express.json());
app.use(cors());
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { log } = require("console");

app.get("/", (req, res) => {
  res.send("Welcome to my API!");
});

const FILE_DIR = path.join(__dirname, "./files");
function extractErrorMessage(stderr,language) {
  // Regex to match file paths (e.g., /Users/akashsharma/Documents/project/backend/files/fileName.cpp)
  var filePathRegex = "";
  if(language==="cpp"){
    filePathRegex=/\/[^\s]+\.cpp/g
  }
  
  // Remove all file paths from the stderr
  const cleanedStderr = stderr.replace(filePathRegex, "");

  // Optional: you can also trim any leading/trailing spaces if necessary
  const finalErrorMessage = cleanedStderr.trim();

  return finalErrorMessage;
}


// Function to compile code
function compileCode(filePath, language, res) {
    let command;
    const fileName = path.basename(filePath, path.extname(filePath));
  
    switch (language) {
      case 'cpp':
        command = `g++ ${filePath} `;
        console.log(command);
        
        break;
      case 'java':
        command = `javac ${filePath} && java -cp ${FILE_DIR} ${fileName}`;
        break;
      case 'js':
        command = `node -c ${filePath}`;
        break;
      default:
        return res.status(400).json({ error: 'Unsupported language.' });
    }
    
    console.log(`Executing command: ${command}`);
    exec(command, (err, stdout, stderr) => {
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(`Failed to delete file: ${unlinkErr.message}`);
            }
          });
      if (err) {
        
        // Compilation failed
        const errorMessage = extractErrorMessage(stderr,language);
        console.error(`Compilation error: ${errorMessage}`);
        return res.status(400).json({
          success: false,
          
          
          error: errorMessage|| 'Compilation failed.'
        });
      }
  
      // Compilation succeeded
      res.json({
        success: true,
        message: 'Code compiled successfully.',
        output: stdout
      });
    });
  }


app.post('/api/run', (req, res) => {
    let fileName=""
    const {  content, language } = req.body;
    fileName="text"+"."+language;
    if (!fileName || !content || !language) {
      return res.status(400).json({ error: 'File name, content, and language are required.' });
    }
    console.log(content)
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
