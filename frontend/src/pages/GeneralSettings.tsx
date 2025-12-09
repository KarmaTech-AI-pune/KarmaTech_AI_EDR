import { Box, Typography } from "@mui/material"
import WbsOptions from "../features/wbs/components/WbsOptions"

const GeneralSettings = () => {
  return (
    <Box maxWidth="100vw" mx="auto">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={6}>
        <Typography variant="h5">WBS Description</Typography>
      </Box>
      
      <WbsOptions />
      
    </Box>
  )
}

export default GeneralSettings
