import { tab } from "./MonthlyProgressForm";
import { useFormControls } from "../../../hooks/MontlyProgress/useForm";
import { useFormContext } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Box, Tab, Tabs } from "@mui/material";
import { useMemo } from "react";



const FormHeader = ({ tabs }: { tabs: tab[] }) => {
  const { currentPageIndex, setpage } = useFormControls();
  const {
    trigger
  } = useFormContext<MonthlyProgressSchemaType>();

  const tabsStyles = useMemo(
  () => ({
    "& .MuiTab-root": {
      textTransform: "none",
      fontWeight: 500,
      color: "#666",
      minWidth: 120,
      "&.Mui-selected": {
        color: "#1976d2",
      },
    },
    "& .MuiTabs-indicator": {
      backgroundColor: "#1976d2",
    },
  }),
  []
);

  return (
    <Box>
      <Tabs
        value={currentPageIndex}
        onChange={(event, newValue) => {
          setpage(newValue);
          trigger(tabs[newValue].inputs);
        }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={tabsStyles}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.id}
            label={tab.label}
            onClick={() => {
              setpage(index);
              trigger(tab.inputs);
            }}
            sx={tabsStyles}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default FormHeader;
