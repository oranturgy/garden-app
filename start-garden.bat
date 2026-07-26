@echo off
title Garden App Server
cd /d "C:\Users\oran.turgeman\claude stuff\garden-app"
echo Starting Garden App...
start "Garden App Server" cmd /k "npm start"
timeout /t 5 /nobreak > nul
start "" "http://192.168.1.209:3000"
