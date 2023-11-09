::https://rpgmakerunion.ru/thread/rpg-maker-mv-oshibka-v-profile-nwjs-reshaem-problemu.25
@echo Произвожу очистку кэша NW.js...
@del /F /Q "%LOCALAPPDATA%\nwjs\User Data\Web Data" >nul 2>&1
@del /F /Q "%LOCALAPPDATA%\nwjs\User Data\Web Data-journal" >nul 2>&1
@del /F /Q "%LOCALAPPDATA%\KADOKAWA\RPGMV\Web Data" >nul 2>&1
@del /F /Q "%LOCALAPPDATA%\KADOKAWA\RPGMV\Web Data-journal" >nul 2>&1
@del /F /Q "%LOCALAPPDATA%\User Data\Default\Web Data" >nul 2>&1
@del /F /Q "%LOCALAPPDATA%\User Data\Default\Web Data-journal" >nul 2>&1
@echo.
@echo Очистка прошла успешно!
@echo Нажмите любую клавишу, чтобы закрыть это окно.
@echo За играми заходите на rpgmakerunion.ru :)
@echo.
@pause