@echo off
setlocal
set "DIR=%~dp0"
set "MVN_BIN=%DIR%..\..\maven\apache-maven-3.9.6\bin\mvn.cmd"
if not exist "%MVN_BIN%" (
    mvn %*
) else (
    "%MVN_BIN%" %*
)
