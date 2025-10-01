import { AppBar, Toolbar, Typography, Box, Select, MenuItem, Button } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useState } from "react";

const Header = () => {
  const [region, setRegion] = useState("All");

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Project Management Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Strategic Project Analysis & Resource Management
          </Typography>
        </Box>

        <Box display="flex" gap={2} alignItems="center">
          <Select
            size="small"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <MenuItem value="All">All Regions</MenuItem>
            <MenuItem value="North America">North America</MenuItem>
            <MenuItem value="Europe">Europe</MenuItem>
            <MenuItem value="Asia Pacific">Asia Pacific</MenuItem>
          </Select>
          <Button variant="contained" startIcon={<NotificationsIcon />}>
            Notifications
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
