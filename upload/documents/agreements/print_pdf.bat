@echo off
setlocal ENABLEEXTENSIONS
set KEY_NAME=HKEY_CLASSES_ROOT\Software\Adobe\Acrobat\Exe
set EXE=acrord32.exe

FOR /F "skip=2 tokens=1,2*" %%A IN ('REG QUERY "%KEY_NAME%" 2^>nul') DO (
    set EXE=%%C
)

%EXE% /S /O /H /P %1%

rem sleep for 30 secs
ping 127.0.0.1 -n 30 >nul

del /q %1%
exit
