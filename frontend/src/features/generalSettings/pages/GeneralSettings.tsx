import { useState } from "react"
import { Box, Tabs, Tab, Paper } from "@mui/material"
import WbsOptions from "../../wbs/components/WbsOptions"

const GeneralSettings = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box maxWidth="100vw" mx="auto" sx={{ mt: 2 }}>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <Tab label="Manpower" id="wbs-tab-manpower" />
          <Tab label="ODC" id="wbs-tab-odc" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <Box role="tabpanel" hidden={activeTab !== 0} id="wbs-tabpanel-manpower">
            <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
              <WbsOptions formType={0} />
            </Box>
          </Box>

          <Box role="tabpanel" hidden={activeTab !== 1} id="wbs-tabpanel-odc">
            <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
              <WbsOptions formType={1} />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default GeneralSettings
