import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import {
  Button,
  Alert,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  CloudUploadOutlined,
  FindInPageOutlined,
  ExpandMoreSharp,
} from "@mui/icons-material";

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [items, setItems] = useState([]);

  const [showNoFile, setShowNoFile] = useState(false);
  const [showWrongType, setShowWrongType] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showServerError, setShowServerError] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setItems([]);

    if (isExcel(file)) {
      hideAllAlerts();
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      hideAllAlerts();
      setShowWrongType(true);
    }
  };

  const isExcel = (file) => {
    return (
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  };

  const hideAllAlerts = () => {
    setShowSuccess(false);
    setShowWrongType(false);
    setShowNoFile(false);
    setShowServerError(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      hideAllAlerts();
      setSelectedFile(null);
      setShowNoFile(true);
      return;
    }

    // Save the id - to be used in the next request
    const id = uuidv4();

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("id", id);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData
      );
      if (response.status === 200) {
        hideAllAlerts();
        setShowSuccess(true);

        // Wait 5 seconds
        setTimeout(async () => {
          // Check if the server finished processing the file
          const confirmResponse = await axios.get(
            `http://localhost:8000/confirm?id=${id}`
          );
          //   If the server finished processing the file, display the summaries
          if (confirmResponse.status === 200) {
            hideAllAlerts();
            setShowSuccess(true);
            console.log(confirmResponse.data.data);
            setItems(confirmResponse.data.data);
          } else {
            // If the server didn't finish processing the file, display the basic error
            hideAllAlerts();
            setShowServerError(true);
          }
          setShowSuccess(false);
          setSelectedFile(null);
          document.getElementById("contained-button-file").value = null;
        }, 15000);
      } else {
        hideAllAlerts();
        setShowServerError(true);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      hideAllAlerts();
      setShowServerError(true);
    }

    setSelectedFile(null);
    document.getElementById("contained-button-file").value = null;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: "20px",
        height: "100vh",
        overflowY: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#2C2C2C",
          border: "1px solid #574900",
          borderRadius: "5px",
          width: "100%",
          height: "50%",
          padding: "20px",
          boxSizing: "border-box",
          boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.1)",
          maxHeight: "40%",
        }}
      >
        <Typography
          variant="h3"
          sx={{ textAlign: "center", marginBottom: "50px" }}
          color="white"
        >
          Youtube Video Summarizer
        </Typography>
        <input
          accept=".xlsx"
          id="contained-button-file"
          type="file"
          hidden
          onChange={handleFileChange}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginBottom: "20px",
          }}
        >
          <label htmlFor="contained-button-file">
            <Button
              variant="outlined"
              color="primary"
              component="span"
              sx={{ marginRight: "15px" }}
              startIcon={<FindInPageOutlined />}
            >
              Select File
            </Button>
          </label>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleUpload}
            sx={{ marginLeft: "15px" }}
            startIcon={<CloudUploadOutlined />}
          >
            Upload
          </Button>
        </Box>
        {selectedFile && (
          <Alert variant="outlined" severity="info">
            Uploaded file: {selectedFile.name}
          </Alert>
        )}
        {showSuccess && (
          <Alert variant="outlined" severity="success">
            File sent. Waiting for summaries...
          </Alert>
        )}
        {showServerError && (
          <Alert variant="outlined" severity="error">
            File didn't reach the server!
          </Alert>
        )}
        {showNoFile && (
          <Alert
            variant="outlined"
            severity="warning"
            sx={{ width: "fit-content" }}
          >
            Please select a file first.
          </Alert>
        )}
        {showWrongType && (
          <Alert
            variant="outlined"
            severity="warning"
            sx={{ width: "fit-content" }}
          >
            File could not be uploaded. Please select an .xlsx file.
          </Alert>
        )}
      </Box>

      {items?.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            marginTop: "20px",
            height: "100%",
            maxHeight: "60%",
            overflowY: "scroll",
            background: "#eee",
            borderRadius: "5px",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            sx={{ marginTop: "20px" }}
            color="#333"
          >
            Summaries successfully sent to the following emails
          </Typography>
          <Box sx={{ padding: "20px" }}>
            {items.map((item, index) => (
              <Accordion key={index} sx={{ marginBottom: "16px" }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreSharp />}
                  aria-controls={`panel${index}a-content`}
                  id={`panel${index}a-header`}
                >
                  <Typography>{item.email}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography align="justify" sx={{marginBottom: "5px"}}>{item.url}</Typography>
                  <Typography align="justify">{item.summary}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Home;
