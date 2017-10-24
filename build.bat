@echo off

echo Building Type Script
call tsc AppLogic/Main.ts --sourceMap --outFile Main.js

echo Browserify-ing

call browserify Main.js -o bundle.js

echo Done!