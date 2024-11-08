#!/bin/bash

# Open first terminal for backend
osascript -e 'tell application "Terminal"
    do script "cd \"'$(pwd)'/backend/src/NJSAPI\" && dotnet watch run"
end tell'

# Wait a moment to ensure first terminal is opened
sleep 1

# Open second terminal for frontend
osascript -e 'tell application "Terminal"
    do script "cd \"'$(pwd)'/frontend\" && npm run dev"
end tell'
