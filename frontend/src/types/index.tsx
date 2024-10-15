// File: frontend/src/types/index.ts
// Purpose: typescript types

export type screensArrayType = {
    [key : string] : JSX.Element
}

export type projectManagementAppContextType  = {
    screenState: string,
    setScreenState: React.Dispatch<React.SetStateAction<string>>,
    isAuthenticated: boolean,
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}