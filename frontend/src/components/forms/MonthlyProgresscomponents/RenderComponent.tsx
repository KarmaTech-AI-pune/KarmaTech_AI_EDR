import { tab } from './MonthlyProgressForm'
import { useFormControls } from '../../../hooks/MontlyProgress/useForm';
import { Box } from '@mui/material';

const RenderComponent = ({ tabs }: { tabs: tab[] }) => {
    const { currentPageIndex } = useFormControls();

  return (
    <>
      {tabs.map((tab, index) => (
        <Box key={tab.id} sx={{ display: currentPageIndex === index ? 'block' : 'none' }}>
          {tab.component}
        </Box>
      ))}
    </>
  )
}

export default RenderComponent
