@echo off > nul & setLocal EnableDelayedExpansion

For /F "tokens=2 Delims==" %%I In ('assoc .xls') Do Set V=%%~I
Echo !V!

if %~x1== .csv GOTO :CSV ELSE GOTO :NONCSV

:NONCSV
ECHO NONCSV
%1
GOTO :EOF

:CSV
ECHO CSV
move /Y %1 "%APPDATA%\WMSmc\templates\%~n2.csv"
"%APPDATA%\WMSmc\templates\%2"

GOTO :EOF