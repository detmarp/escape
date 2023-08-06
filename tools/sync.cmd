@echo off
set git=D:\Programs\Git\cmd\git.exe

pushd %~dp0..

echo * Status
%git% status --porcelain


set lines=0
for /f "delims=" %%i in ('%git% status --porcelain') do set /a lines=lines+1

if %lines%==0 goto nochanges

echo * Commiting local changes: %lines%
%git% add -A --all --no-ignore-removal
%git% commit -m "commiting local changes"

:nochanges

echo * Status
%git% status
%git% log -1

echo * Fetch and merge

%git% fetch
%git% merge --no-edit

set lines=0
for /f "delims=" %%i in ('%git% status --porcelain') do set /a lines=lines+1

if %lines%==0 goto nonewchanges

echo * Commit again
%git% add -A --all --no-ignore-removal
%git% commit -m "commiting after merge"

:nonewchanges

echo * Push
%git% push

echo * Status
%git% status
%git% log -1

popd
goto :eof
