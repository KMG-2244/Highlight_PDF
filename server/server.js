const express = require("express");
const pdf2html = require("pdf2html");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const open = require("open");
const axios = require("axios");

const app = express();

const port = 3000;

app.use(cors());

// Configure multer to store uploaded files in the 'uploads' directory
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    // The path to the uploaded file is in req.file.path
    const pdfPath = req.file.path;
    let html = await pdf2html.html(pdfPath);

     // Extract the original filename (including extension)
     const originalFilename = req.file.originalname;
     const nameWithoutExtension = originalFilename.replace(/\.[^/.]+$/, '');

    // Hit an API to get JSON data
    const apiResponse = await axios.get("https://reqres.in/api/users?page=2");
    const dataAPI = apiResponse.data;

    const data = { "Policy Number" : "01-0002-175",
                   "Insured Name" : "TWLOHA INC"};

    // Loop over the values in the JSON and highlight them in the HTML
    for (const key in data) {
      const value = data[key];
      const regex = new RegExp(value, "g");
      html = html.replace(
        regex,
        `<span style="background-color: #FFFF00;" title="${key}">${value}</span>`
      );
    }
    console.log(html);
// font-family: Arial, sans-serif;
    const fullHtml = `
  <head>
  <title>${nameWithoutExtension}</title>
  <link rel="icon" type="image/jpeg" href="https://i.postimg.cc/BQwgb5SX/company-Logo.jpg">
    <style>
      body {
        font-family: roboto;
        font-size: 18px;
        margin: 0;
        padding: 0;
        background-color: #f8f8f8;
      }
      
      #left {
        flex: 2.2;
        overflow: auto;
        padding: 20px;
        border-right: 1px solid #ddd;
      }
      
      div {
        box-sizing: border-box;
      }

      #right {
        flex: 0.7;
        background-color: #f0f0f0;
        overflow: auto;
        padding: 20px;
        color: #333;
        line-height: 1.6;
        display: none;
        transition: transform 0.3s ease-in-out; /* Add smooth transition effect */
        transform: translateX(100%); /* Initially move the panel out of the viewport */
      }
      
      #right pre {
        white-space: pre-wrap;
        font-size: 16px;
      }
      
      #hamburger {
        cursor: pointer;
        padding: 10px;
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 20%;
        z-index: 1;
        transition: background-color 0.3s ease-in-out; /* Add smooth transition for background color */
      }
      
      #hamburger div {
        height: 3px;
        width: 25px;
        background-color: #333;
        margin: 4px 0;
        border-radius: 1px;
        transition: background-color 0.3s ease-in-out; /* Add smooth transition for background color */
      }

      /* Change hamburger color on hover */
      #hamburger:hover {
        background-color: #eee;
      }

      /* Change hamburger line color on hover */
      #hamburger:hover div {
        background-color: #555;
      }
    </style>
  </head>

  <body>
    <div style="display: flex; height: 100vh;">
      <div id="left">
        ${html}  <!-- Left side with highlighted PDF data -->
      </div>
      <div id="right">
        <pre>${JSON.stringify(
          dataAPI,
          null,
          2
        )}</pre>  <!-- Right side with JSON data -->
      </div>
    </div>
    <div id="hamburger" onclick="toggleRightPanel()">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </body>
  
  <script>
  function toggleRightPanel() {
    const rightPanel = document.getElementById('right');
  
    if (rightPanel.style.display === 'none' || rightPanel.style.display === '') {
      rightPanel.style.display = 'block';
      setTimeout(() => {
        rightPanel.style.transform = 'translateX(0)';
      }, 10); // Adding a small delay to allow the display change to take effect before the transform
    } else {
      rightPanel.style.transform = 'translateX(100%)';
      setTimeout(() => {
        rightPanel.style.display = 'none';
      }, 300); // Using the same duration as the transition to hide the panel after transition completes
    }
  }
  
  </script>
`;

    // Send the complete HTML to the client
    res.send(fullHtml);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error");
  }
});

// Route handler for '/index.html'
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "./server.html"));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  open("http://localhost:" + port + "/index.html");
});