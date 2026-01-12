# Metro Bundler 포트(8081) 종료 스크립트

Write-Host "8081 포트를 사용 중인 프로세스를 찾는 중..." -ForegroundColor Yellow

# 8081 포트를 사용하는 프로세스 찾기
$netstatOutput = netstat -ano | findstr :8081 | findstr LISTENING

if ($netstatOutput) {
    # PID 추출 (마지막 컬럼)
    $processIds = $netstatOutput | ForEach-Object {
        $_.Trim() -split '\s+' | Select-Object -Last 1
    } | Sort-Object -Unique

    foreach ($procId in $processIds) {
        try {
            $process = Get-Process -Id $procId -ErrorAction Stop
            Write-Host "프로세스 발견: $($process.ProcessName) (PID: $procId)" -ForegroundColor Cyan
            
            # 프로세스 종료
            Stop-Process -Id $procId -Force -ErrorAction Stop
            Write-Host "✓ 프로세스 종료 완료 (PID: $procId)" -ForegroundColor Green
        }
        catch {
            Write-Host "× 프로세스 종료 실패 (PID: $procId): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}
else {
    Write-Host "✓ 8081 포트를 사용 중인 프로세스가 없습니다." -ForegroundColor Green
}

Write-Host "`n완료!" -ForegroundColor Green
