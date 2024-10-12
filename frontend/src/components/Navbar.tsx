// File: frontend/src/components/Navbar.tsx
// Purpose: basic Navbar to navigate between pages

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { useContext } from 'react';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType } from '../types';

const pages = ['Home', 'Project Details'];

export const Navbar = () => {
  
    const {setScreenState} = useContext(projectManagementAppContext) as projectManagementAppContextType


    return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() =>  setScreenState(page)
                }
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
         
            
        </Toolbar>
      </Container>
    </AppBar>
  );
}