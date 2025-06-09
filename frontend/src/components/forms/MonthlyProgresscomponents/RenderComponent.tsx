import { tab } from './MonthlyProgressForm'
import { useFormControls } from '../../../hooks/MontlyProgress/useForm';

const RenderComponent = ({ tabs }: { tabs: tab[] }) => {
    const { currentPageIndex } = useFormControls();

    const currentTab = tabs[currentPageIndex];
    
    if(!currentTab.component){
        return null;
    }   

  return (
    <>{currentTab.component}</>
  )
}

export default RenderComponent
