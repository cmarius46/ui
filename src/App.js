import React from "react";
import Home from "./pages/Home";

import { Container } from "@mui/material";

function App() {
  return (
    <Container
      maxWidth="md"
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Home />
    </Container>
  );
}

export default App;
