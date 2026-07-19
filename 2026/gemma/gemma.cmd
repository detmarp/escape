@echo off
setlocal

cd /d "%~dp0"

set "PYTHON=.venv\Scripts\python.exe"

if not exist "%PYTHON%" (
    echo Creating virtual environment in .venv...
    py -3 -m venv .venv >nul 2>&1
    if errorlevel 1 (
        python -m venv .venv >nul 2>&1
    )
    if errorlevel 1 (
        echo Failed to create virtual environment.
        pause
        exit /b 1
    )
)

"%PYTHON%" -c "import pygame" >nul 2>&1
if errorlevel 1 (
    echo Installing pygame...
    "%PYTHON%" -m pip --disable-pip-version-check install --quiet pygame
    if errorlevel 1 (
        echo Failed to install pygame.
        pause
        exit /b 1
    )
)

"%PYTHON%" gemma.py
set "EXITCODE=%ERRORLEVEL%"

if not "%EXITCODE%"=="0" (
    echo.
    echo gemma.py exited with code %EXITCODE%.
    pause
)

exit /b %EXITCODE%
