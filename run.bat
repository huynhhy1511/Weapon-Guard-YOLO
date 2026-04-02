@echo off
echo ==============================================
echo       KHOI DONG BACKEND FASTAPI (WDSS API)
echo ==============================================

echo [1/2] Kiem tra moi truong ao...
if not exist ".venv\Scripts\uvicorn.exe" (
    echo [Loi] Khong tim thay uvicorn trong thu muc .venv! Vui long kiem tra lai.
    pause
    exit /b
)

echo [2/2] Dang chay server tai http://localhost:8000
echo Nhan Ctrl+C de dung server.
echo.
.\.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
