param(
  [string]$BaseUrl = "http://127.0.0.1:3007"
)

$base = $BaseUrl
$headers = @{ "Content-Type" = "application/json" }
$envPath = "C:\Users\gmdqn\takdizang\.env.local"
$serviceRole = ((Get-Content $envPath | Where-Object { $_ -match "^SUPABASE_SERVICE_ROLE_KEY=" }) -replace '^SUPABASE_SERVICE_ROLE_KEY="?', "" -replace '"$', "")
$storageHeaders = @{
  apikey = $serviceRole
  Authorization = "Bearer $serviceRole"
  "Content-Type" = "application/json"
}

function Wait-ForJob {
  param(
    [string]$Url,
    [int]$MaxAttempts = 60,
    [int]$DelaySeconds = 2
  )

  for ($attempt = 0; $attempt -lt $MaxAttempts; $attempt++) {
    $result = Invoke-RestMethod -Uri $Url -Method Get
    if ($result.job.status -eq "done") {
      return $result
    }
    if ($result.job.status -eq "failed") {
      throw "Job failed at $Url :: $($result.job.error)"
    }
    Start-Sleep -Seconds $DelaySeconds
  }

  throw "Job timed out at $Url"
}

$pngPath = "C:\Users\gmdqn\takdizang\.codex-artifact-upload.png"
[IO.File]::WriteAllBytes(
  $pngPath,
  [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z0WQAAAAASUVORK5CYII=")
)

try {
  $project = Invoke-RestMethod -Uri "$base/api/projects" -Method Post -Headers $headers -Body (@{
    name = "Artifact Smoke"
    mode = "shortform-video"
    briefText = "제품명: 아티팩트 스모크 테스트용 텀블러`n타깃: 20-30대 직장인`n문제: 책상 위에서 음료 온도가 빨리 식는다`n해결: 12시간 보온, 누수 방지, 미니멀 디자인`nCTA: 지금 상세페이지와 숏폼에 바로 적용"
  } | ConvertTo-Json)

  $projectId = $project.id

  $generateJob = Invoke-RestMethod -Uri "$base/api/projects/$projectId/generate" -Method Post -Headers $headers -Body (@{} | ConvertTo-Json)
  $generateResult = Wait-ForJob -Url "$base/api/projects/$projectId/generate?jobId=$($generateJob.jobId)" -MaxAttempts 40 -DelaySeconds 2

  $assetUploadJson = & curl.exe -sS -X POST `
    -F "file=@$pngPath" `
    -F "sourceType=uploaded" `
    -F "preserveOriginal=true" `
    "$base/api/projects/$projectId/assets"
  $assetUpload = $assetUploadJson | ConvertFrom-Json

  $thumbnailResult = $null
  $thumbnailError = $null
  try {
    $thumbnailJob = Invoke-RestMethod -Uri "$base/api/projects/$projectId/thumbnail" -Method Post -Headers $headers -Body (@{ templateKey = "1:1" } | ConvertTo-Json)
    $thumbnailResult = Wait-ForJob -Url "$base/api/projects/$projectId/thumbnail?jobId=$($thumbnailJob.jobId)" -MaxAttempts 80 -DelaySeconds 3
  } catch {
    $thumbnailError = $_.Exception.Message
  }

  $scriptJob = Invoke-RestMethod -Uri "$base/api/projects/$projectId/marketing-script" -Method Post -Headers $headers -Body (@{ templateKey = "9:16" } | ConvertTo-Json)
  $scriptResult = Wait-ForJob -Url "$base/api/projects/$projectId/marketing-script?jobId=$($scriptJob.jobId)" -MaxAttempts 40 -DelaySeconds 2

  $exportJob = Invoke-RestMethod -Uri "$base/api/projects/$projectId/export" -Method Post -Headers $headers -Body (@{ type = "result" } | ConvertTo-Json)
  $exportResult = Wait-ForJob -Url "$base/api/projects/$projectId/export?jobId=$($exportJob.jobId)" -MaxAttempts 20 -DelaySeconds 2

  $projectDetail = Invoke-RestMethod -Uri "$base/api/projects/$projectId" -Method Get
  $thumbnailPath = if ($thumbnailResult -and $thumbnailResult.artifact) { $thumbnailResult.artifact.filePath } else { $null }
  $scriptPath = $scriptResult.artifact.filePath
  $thumbnailFetch = if ($thumbnailPath) { Invoke-WebRequest -Uri ($base + $thumbnailPath) -UseBasicParsing } else { $null }
  $scriptFetch = Invoke-WebRequest -Uri ($base + $scriptPath) -UseBasicParsing
  $resultPage = (Invoke-WebRequest -Uri "$base/projects/$projectId/result" -UseBasicParsing).StatusCode

  Invoke-RestMethod -Uri "$base/api/projects/$projectId" -Method Delete | Out-Null

  $storageRemaining = -1
  $storageBody = @{ prefix = "projects/$projectId"; limit = 100; offset = 0 } | ConvertTo-Json
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    $assetsRemaining = @(Invoke-RestMethod -Uri "https://fpejnupyptyxwfhvmsop.supabase.co/storage/v1/object/list/project-assets" -Headers $storageHeaders -Method Post -Body $storageBody).Count
    $artifactsRemaining = @(Invoke-RestMethod -Uri "https://fpejnupyptyxwfhvmsop.supabase.co/storage/v1/object/list/artifacts" -Headers $storageHeaders -Method Post -Body $storageBody).Count
    $thumbnailsRemaining = @(Invoke-RestMethod -Uri "https://fpejnupyptyxwfhvmsop.supabase.co/storage/v1/object/list/thumbnails" -Headers $storageHeaders -Method Post -Body $storageBody).Count
    $storageRemaining = $assetsRemaining + $artifactsRemaining + $thumbnailsRemaining
    if ($storageRemaining -eq 0) {
      break
    }
    Start-Sleep -Seconds 1
  }

  [pscustomobject]@{
    ProjectId = $projectId
    GenerateStatus = $generateResult.job.status
    UploadPath = $assetUpload.asset.filePath
    ThumbnailStatus = if ($thumbnailResult) { $thumbnailResult.job.status } else { "failed" }
    ThumbnailError = $thumbnailError
    ThumbnailPath = $thumbnailPath
    ThumbnailContentType = if ($thumbnailFetch) { $thumbnailFetch.Headers["Content-Type"] } else { $null }
    MarketingScriptStatus = $scriptResult.job.status
    MarketingScriptPath = $scriptPath
    MarketingScriptContentType = $scriptFetch.Headers["Content-Type"]
    ExportStatus = $exportResult.job.status
    ExportArtifacts = @($exportResult.artifacts).Count
    ResultPage = $resultPage
    ProjectStatus = $projectDetail.status
    ProjectAssets = @($projectDetail.assets).Count
    ProjectExports = @($projectDetail.exports).Count
    StorageRemaining = $storageRemaining
  } | ConvertTo-Json -Depth 5
} finally {
  if (Test-Path $pngPath) {
    Remove-Item $pngPath -Force
  }
}
