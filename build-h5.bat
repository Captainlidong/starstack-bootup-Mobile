@echo off
chcp 65001 >nul
REM ============================================================
REM  星栈移动端 - 一键构建 H5 生产包
REM  利用 HBuilderX 内置编译工具链,无需 npm / DCloud 账号
REM  产物: unpackage\dist\build\h5\
REM ============================================================

REM 如 HBuilderX 安装路径不同,请修改下面这一行
set "HX_DIR=D:\Ddownload\HBuilderX.5.34.2026102909\HBuilderX"

set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

set "UNI_INPUT_DIR=%PROJECT_DIR%"
set "UNI_OUTPUT_DIR=%PROJECT_DIR%\unpackage\dist\build\h5"
set "UNI_PLATFORM=h5"
set "UNI_CLI_CONTEXT=%HX_DIR%\plugins\uniapp-cli-vite"
set "UNI_HBUILDERX_PLUGINS=%HX_DIR%\plugins"
set "HX_Version=5.34.2026102909"
set "NODE_ENV=production"

echo 项目目录: %UNI_INPUT_DIR%
echo 构建中...
cd /d "%UNI_CLI_CONTEXT%"
"%HX_DIR%\plugins\node\node.exe" node_modules\@dcloudio\vite-plugin-uni\bin\uni.js build

if exist "%UNI_OUTPUT_DIR%\index.html" (
    echo.
    echo ✅ 构建成功!产物在: %UNI_OUTPUT_DIR%
    echo    部署方法见 docs\DEPLOY.md
) else (
    echo.
    echo ❌ 构建失败,请检查上方报错信息
)
pause
