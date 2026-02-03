---
inclusion: manual
keywords: material-ui, mui, styling, theme, sx, components
---

# Material-UI Styling and Theming Guide

## Material-UI Version

Your project uses **Material-UI v6** (`@mui/material@^6.5.0`)

## Theme Configuration

### Theme Setup
```typescript
// theme/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff'
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036',
      contrastText: '#fff'
    },
    error: {
      main: '#f44336'
    },
    warning: {
      main: '#ff9800'
    },
    info: {
      main: '#2196f3'
    },
    success: {
      main: '#4caf50'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500
    },
    body1: {
      fontSize: '1rem'
    },
    body2: {
      fontSize: '0.875rem'
    },
    button: {
      textTransform: 'none' // Disable uppercase buttons
    }
  },
  spacing: 8, // Base spacing unit (1 = 8px)
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }
    }
  }
};

export const theme = createTheme(themeOptions);
```

### Theme Provider Setup
```typescript
// main.tsx or App.tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS */}
      {/* Your app */}
    </ThemeProvider>
  );
}
```

## Styling Methods

### 1. sx Prop (Preferred Method)

**Use sx prop for component-specific styling:**

```typescript
<Box
  sx={{
    // Spacing (uses theme.spacing)
    p: 2,              // padding: 16px (2 * 8px)
    pt: 3,             // paddingTop: 24px
    px: 2,             // paddingLeft & paddingRight: 16px
    m: 1,              // margin: 8px
    mb: 2,             // marginBottom: 16px
    gap: 2,            // gap: 16px
    
    // Colors (uses theme.palette)
    color: 'primary.main',
    bgcolor: 'background.paper',
    borderColor: 'divider',
    
    // Typography
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    
    // Layout
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    
    // Sizing
    width: '100%',
    height: 'auto',
    minHeight: 200,
    maxWidth: 600,
    
    // Borders
    border: 1,
    borderRadius: 2,
    
    // Shadows
    boxShadow: 2,
    
    // Responsive
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    },
    
    // Pseudo-classes
    '&:hover': {
      bgcolor: 'action.hover',
      cursor: 'pointer'
    },
    
    // Child selectors
    '& .MuiButton-root': {
      margin: 1
    }
  }}
>
  Content
</Box>
```

### 2. Theme Access in sx Prop
```typescript
<Box
  sx={(theme) => ({
    color: theme.palette.primary.main,
    bgcolor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(1)
    }
  })}
>
  Content
</Box>
```

### 3. styled() API (For Reusable Components)

```typescript
import { styled } from '@mui/material/styles';
import { Box, Button } from '@mui/material';

// Styled component
const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)'
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2)
  }
}));

// With props
interface StyledButtonProps {
  variant?: 'primary' | 'secondary';
}

const StyledButton = styled(Button)<StyledButtonProps>(({ theme, variant }) => ({
  borderRadius: 20,
  padding: theme.spacing(1, 3),
  backgroundColor: variant === 'primary' 
    ? theme.palette.primary.main 
    : theme.palette.secondary.main,
  
  '&:hover': {
    backgroundColor: variant === 'primary'
      ? theme.palette.primary.dark
      : theme.palette.secondary.dark
  }
}));

// Usage
<StyledCard>
  <StyledButton variant="primary">Click Me</StyledButton>
</StyledCard>
```

## Spacing System

### Theme Spacing Values
```typescript
// theme.spacing(n) = n * 8px (default)

sx={{
  p: 0,    // 0px
  p: 0.5,  // 4px
  p: 1,    // 8px
  p: 2,    // 16px
  p: 3,    // 24px
  p: 4,    // 32px
  p: 5,    // 40px
}}
```

### Spacing Shortcuts
```typescript
sx={{
  // Padding
  p: 2,        // padding: 16px (all sides)
  pt: 2,       // paddingTop: 16px
  pr: 2,       // paddingRight: 16px
  pb: 2,       // paddingBottom: 16px
  pl: 2,       // paddingLeft: 16px
  px: 2,       // paddingLeft & paddingRight: 16px
  py: 2,       // paddingTop & paddingBottom: 16px
  
  // Margin
  m: 2,        // margin: 16px (all sides)
  mt: 2,       // marginTop: 16px
  mr: 2,       // marginRight: 16px
  mb: 2,       // marginBottom: 16px
  ml: 2,       // marginLeft: 16px
  mx: 2,       // marginLeft & marginRight: 16px
  my: 2,       // marginTop & marginBottom: 16px
  
  // Gap (for flex/grid)
  gap: 2,      // gap: 16px
  rowGap: 2,   // rowGap: 16px
  columnGap: 2 // columnGap: 16px
}}
```

## Color System

### Palette Colors
```typescript
sx={{
  // Primary colors
  color: 'primary.main',
  color: 'primary.light',
  color: 'primary.dark',
  color: 'primary.contrastText',
  
  // Secondary colors
  color: 'secondary.main',
  
  // Status colors
  color: 'error.main',
  color: 'warning.main',
  color: 'info.main',
  color: 'success.main',
  
  // Background colors
  bgcolor: 'background.default',
  bgcolor: 'background.paper',
  
  // Text colors
  color: 'text.primary',
  color: 'text.secondary',
  color: 'text.disabled',
  
  // Action colors
  bgcolor: 'action.hover',
  bgcolor: 'action.selected',
  bgcolor: 'action.disabled',
  
  // Divider
  borderColor: 'divider'
}}
```

### Custom Colors
```typescript
sx={{
  // Hex colors
  color: '#1976d2',
  bgcolor: '#f5f5f5',
  
  // RGB/RGBA
  color: 'rgb(25, 118, 210)',
  bgcolor: 'rgba(0, 0, 0, 0.1)',
  
  // Transparent
  bgcolor: 'transparent'
}}
```

## Typography System

### Typography Variants
```typescript
<Typography variant="h1">Heading 1</Typography>
<Typography variant="h2">Heading 2</Typography>
<Typography variant="h3">Heading 3</Typography>
<Typography variant="h4">Heading 4</Typography>
<Typography variant="h5">Heading 5</Typography>
<Typography variant="h6">Heading 6</Typography>
<Typography variant="subtitle1">Subtitle 1</Typography>
<Typography variant="subtitle2">Subtitle 2</Typography>
<Typography variant="body1">Body 1 (default)</Typography>
<Typography variant="body2">Body 2</Typography>
<Typography variant="caption">Caption</Typography>
<Typography variant="overline">OVERLINE</Typography>
```

### Typography Styling
```typescript
<Typography
  variant="h4"
  sx={{
    fontWeight: 'bold',      // or 400, 500, 600, 700
    fontSize: 24,            // or '1.5rem'
    textAlign: 'center',     // left, center, right, justify
    color: 'primary.main',
    textTransform: 'uppercase', // uppercase, lowercase, capitalize
    letterSpacing: 1,
    lineHeight: 1.5,
    textDecoration: 'underline',
    fontStyle: 'italic'
  }}
>
  Styled Text
</Typography>
```

## Layout Patterns

### Flexbox Layout
```typescript
<Box
  sx={{
    display: 'flex',
    flexDirection: 'row',        // row, column, row-reverse, column-reverse
    justifyContent: 'center',    // flex-start, center, flex-end, space-between, space-around
    alignItems: 'center',        // flex-start, center, flex-end, stretch, baseline
    gap: 2,
    flexWrap: 'wrap',           // nowrap, wrap, wrap-reverse
    flex: 1                     // flex-grow
  }}
>
  <Box sx={{ flex: 1 }}>Item 1</Box>
  <Box sx={{ flex: 2 }}>Item 2</Box>
</Box>
```

### Grid Layout
```typescript
import { Grid } from '@mui/material';

<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Item 1</Card>
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Item 2</Card>
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Item 3</Card>
  </Grid>
</Grid>

// Grid breakpoints:
// xs: 0px+     (mobile)
// sm: 600px+   (tablet)
// md: 900px+   (small laptop)
// lg: 1200px+  (desktop)
// xl: 1536px+  (large desktop)
```

### Stack Layout (Simplified Flexbox)
```typescript
import { Stack } from '@mui/material';

// Vertical stack
<Stack spacing={2}>
  <Item>Item 1</Item>
  <Item>Item 2</Item>
  <Item>Item 3</Item>
</Stack>

// Horizontal stack
<Stack direction="row" spacing={2}>
  <Item>Item 1</Item>
  <Item>Item 2</Item>
</Stack>

// With dividers
<Stack
  direction="row"
  spacing={2}
  divider={<Divider orientation="vertical" flexItem />}
>
  <Item>Item 1</Item>
  <Item>Item 2</Item>
</Stack>
```

## Responsive Design

### Breakpoint System
```typescript
sx={{
  // Mobile first (default)
  fontSize: 14,
  
  // Tablet and up
  [theme.breakpoints.up('sm')]: {
    fontSize: 16
  },
  
  // Desktop and up
  [theme.breakpoints.up('md')]: {
    fontSize: 18
  },
  
  // Large desktop and up
  [theme.breakpoints.up('lg')]: {
    fontSize: 20
  }
}}

// Or desktop first
sx={{
  fontSize: 20,
  
  [theme.breakpoints.down('lg')]: {
    fontSize: 18
  },
  
  [theme.breakpoints.down('md')]: {
    fontSize: 16
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: 14
  }
}}
```

### Responsive Values
```typescript
sx={{
  // Shorthand for responsive values
  fontSize: { xs: 14, sm: 16, md: 18, lg: 20 },
  padding: { xs: 1, sm: 2, md: 3 },
  display: { xs: 'none', md: 'block' }
}}
```

### useMediaQuery Hook
```typescript
import { useMediaQuery, useTheme } from '@mui/material';

const MyComponent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  return (
    <Box>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </Box>
  );
};
```

## Common Component Patterns

### Card with Hover Effect
```typescript
<Card
  sx={{
    height: '100%',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 4
    }
  }}
>
  <CardContent>
    <Typography variant="h6">Card Title</Typography>
    <Typography variant="body2" color="text.secondary">
      Card content
    </Typography>
  </CardContent>
</Card>
```

### Centered Container
```typescript
<Box
  sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  }}
>
  <Box sx={{ maxWidth: 600, width: '100%', p: 3 }}>
    {/* Content */}
  </Box>
</Box>
```

### Sticky Header
```typescript
<AppBar
  position="sticky"
  sx={{
    top: 0,
    zIndex: theme.zIndex.appBar,
    bgcolor: 'background.paper',
    color: 'text.primary',
    boxShadow: 1
  }}
>
  <Toolbar>
    {/* Header content */}
  </Toolbar>
</AppBar>
```

### Scrollable Container
```typescript
<Box
  sx={{
    maxHeight: 400,
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      width: 8
    },
    '&::-webkit-scrollbar-thumb': {
      bgcolor: 'divider',
      borderRadius: 4
    }
  }}
>
  {/* Scrollable content */}
</Box>
```

## Shadows and Elevation

```typescript
sx={{
  // Predefined shadows (0-24)
  boxShadow: 0,  // No shadow
  boxShadow: 1,  // Subtle shadow
  boxShadow: 2,  // Default card shadow
  boxShadow: 3,  // Elevated shadow
  boxShadow: 4,  // Hover shadow
  boxShadow: 8,  // Modal shadow
  boxShadow: 24, // Maximum shadow
  
  // Custom shadow
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
}}
```

## Transitions and Animations

```typescript
sx={{
  // Basic transition
  transition: 'all 0.2s ease-in-out',
  
  // Specific properties
  transition: 'transform 0.3s, box-shadow 0.3s',
  
  // With hover
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: 4
  }
}}
```

## Z-Index System

```typescript
sx={{
  // Use theme z-index values
  zIndex: theme.zIndex.mobileStepper,  // 1000
  zIndex: theme.zIndex.speedDial,      // 1050
  zIndex: theme.zIndex.appBar,         // 1100
  zIndex: theme.zIndex.drawer,         // 1200
  zIndex: theme.zIndex.modal,          // 1300
  zIndex: theme.zIndex.snackbar,       // 1400
  zIndex: theme.zIndex.tooltip,        // 1500
  
  // Custom z-index
  zIndex: 1,
  zIndex: 10,
  zIndex: 100
}}
```

## Dark Mode Support

```typescript
// theme/theme.ts
import { createTheme, PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
          primary: { main: '#1976d2' },
          background: { default: '#f5f5f5', paper: '#ffffff' }
        }
      : {
          // Dark mode colors
          primary: { main: '#90caf9' },
          background: { default: '#121212', paper: '#1e1e1e' }
        })
  }
});

// App.tsx
const [mode, setMode] = useState<PaletteMode>('light');
const theme = useMemo(() => getTheme(mode), [mode]);

<ThemeProvider theme={theme}>
  <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
    Toggle Theme
  </Button>
</ThemeProvider>
```

## Best Practices

✅ **DO:**
- Use sx prop for component-specific styling
- Use theme values (spacing, colors, breakpoints)
- Use styled() for reusable styled components
- Follow Material Design guidelines
- Use responsive design patterns
- Leverage theme customization
- Use proper spacing units
- Implement hover states for interactive elements
- Use semantic color names (primary, error, etc.)

❌ **DON'T:**
- Use inline styles (style prop)
- Hardcode pixel values (use theme.spacing)
- Hardcode colors (use theme.palette)
- Use makeStyles (deprecated in MUI v5+)
- Forget responsive design
- Override too many default styles
- Use !important (indicates design issue)
- Ignore accessibility contrast ratios
- Mix styling methods inconsistently

## Performance Tips

1. **Avoid creating sx objects in render:**
```typescript
// ❌ BAD - Creates new object every render
<Box sx={{ p: 2, color: 'primary.main' }}>

// ✅ GOOD - Memoize or move outside component
const boxStyles = { p: 2, color: 'primary.main' };
<Box sx={boxStyles}>
```

2. **Use styled() for frequently used components:**
```typescript
// ✅ GOOD - Styled component is created once
const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  color: theme.palette.primary.main
}));
```

3. **Avoid deep nesting in sx:**
```typescript
// ❌ BAD - Complex nested selectors
sx={{
  '& .MuiCard-root': {
    '& .MuiCardContent-root': {
      '& .MuiTypography-root': {
        color: 'red'
      }
    }
  }
}}

// ✅ GOOD - Direct styling on component
<Typography sx={{ color: 'red' }}>
```
