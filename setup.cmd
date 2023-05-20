cd /D %~dp0
D:\python3\python.exe -m venv venv
call venv\Scripts\activate.bat
echo "deactivate -- to deactivate"

rem pip install markdown-server
pip install tiny-markdown-server
