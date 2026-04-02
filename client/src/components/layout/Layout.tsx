import * as React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}
    >
      {/* Sidebar on the left, full height */}
      <Sidebar />
      {/* Main content area: column with header, main, footer */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "100vh",
        }}
      >
        {/* Topbar only above main content, not above sidebar */}
        <Topbar />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            pt: 3, // Remove extra top padding, Topbar is inside column
            backgroundColor: "#f8fafc",
            transition: "all 0.2s ease-in-out",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Outlet />
          </Box>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
