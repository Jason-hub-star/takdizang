$base = "http://127.0.0.1:3007"
$headers = @{ "Content-Type" = "application/json" }

$root = (Invoke-WebRequest -Uri "$base/" -UseBasicParsing).StatusCode
$projectsPage = (Invoke-WebRequest -Uri "$base/projects" -UseBasicParsing).StatusCode
$workspacePage = (Invoke-WebRequest -Uri "$base/workspace" -UseBasicParsing).StatusCode
$settingsPage = (Invoke-WebRequest -Uri "$base/settings" -UseBasicParsing).StatusCode
$landingPage = (Invoke-WebRequest -Uri "$base/landing" -UseBasicParsing).StatusCode

$composeProject = Invoke-RestMethod -Uri "$base/api/projects" -Method Post -Headers $headers -Body (@{
  name = "Storage Compose Smoke"
  mode = "compose"
} | ConvertTo-Json)

$shortformProject = Invoke-RestMethod -Uri "$base/api/projects" -Method Post -Headers $headers -Body (@{
  name = "Storage Shortform Smoke"
  mode = "shortform-video"
} | ConvertTo-Json)

$composeId = $composeProject.id
$shortformId = $shortformProject.id

$pngPath = "C:\Users\gmdqn\takdizang\.codex-smoke-upload.png"
[IO.File]::WriteAllBytes(
  $pngPath,
  [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z0WQAAAAASUVORK5CYII=")
)

$envPath = "C:\Users\gmdqn\takdizang\.env.local"
$serviceRole = ((Get-Content $envPath | Where-Object { $_ -match "^SUPABASE_SERVICE_ROLE_KEY=" }) -replace '^SUPABASE_SERVICE_ROLE_KEY="?', "" -replace '"$', "")
$storageHeaders = @{
  apikey = $serviceRole
  Authorization = "Bearer $serviceRole"
  "Content-Type" = "application/json"
}

try {
  $assetUploadJson = & curl.exe -sS -X POST `
    -F "file=@$pngPath" `
    -F "sourceType=uploaded" `
    -F "preserveOriginal=true" `
    "$base/api/projects/$shortformId/assets"
  $assetUpload = $assetUploadJson | ConvertFrom-Json

  $assetList = Invoke-RestMethod -Uri "$base/api/projects/$shortformId/assets" -Method Get
  $uploadedPath = $assetUpload.asset.filePath
  $uploadedPreview = $assetUpload.asset.previewPath

  $uploadResponse = Invoke-WebRequest -Uri ($base + $uploadedPath) -UseBasicParsing
  $previewResponse = Invoke-WebRequest -Uri ($base + $uploadedPreview) -UseBasicParsing

  $composePage = (Invoke-WebRequest -Uri "$base/projects/$composeId/compose" -UseBasicParsing).StatusCode
  $editorPage = (Invoke-WebRequest -Uri "$base/projects/$shortformId/editor" -UseBasicParsing).StatusCode
  $previewPage = (Invoke-WebRequest -Uri "$base/projects/$shortformId/preview" -UseBasicParsing).StatusCode
  $resultPage = (Invoke-WebRequest -Uri "$base/projects/$shortformId/result" -UseBasicParsing).StatusCode

  Invoke-RestMethod -Uri "$base/api/projects/$shortformId" -Method Delete | Out-Null
  Invoke-RestMethod -Uri "$base/api/projects/$composeId" -Method Delete | Out-Null

  $deletedStatus = "unknown"
  $storageRemaining = -1
  $storageBody = @{ prefix = "projects/$shortformId"; limit = 100; offset = 0 } | ConvertTo-Json
  for ($attempt = 0; $attempt -lt 15; $attempt++) {
    $assetsRemaining = @(Invoke-RestMethod -Uri "https://fpejnupyptyxwfhvmsop.supabase.co/storage/v1/object/list/project-assets" -Headers $storageHeaders -Method Post -Body $storageBody).Count
    $artifactsRemaining = @(Invoke-RestMethod -Uri "https://fpejnupyptyxwfhvmsop.supabase.co/storage/v1/object/list/artifacts" -Headers $storageHeaders -Method Post -Body $storageBody).Count
    $thumbnailsRemaining = @(Invoke-RestMethod -Uri "https://fpejnupyptyxwfhvmsop.supabase.co/storage/v1/object/list/thumbnails" -Headers $storageHeaders -Method Post -Body $storageBody).Count
    $storageRemaining = $assetsRemaining + $artifactsRemaining + $thumbnailsRemaining

    if ($storageRemaining -eq 0) {
      $deletedStatus = "storage-empty"
      break
    }

    Start-Sleep -Seconds 1
    $deletedStatus = "storage-remaining-$storageRemaining"
  }

  [pscustomobject]@{
    Root = $root
    Projects = $projectsPage
    Workspace = $workspacePage
    Settings = $settingsPage
    Landing = $landingPage
    ComposeId = $composeId
    ShortformId = $shortformId
    AssetCount = @($assetList.assets).Count
    UploadedPath = $uploadedPath
    PreviewPath = $uploadedPreview
    UploadStatus = [int]$uploadResponse.StatusCode
    UploadContentType = $uploadResponse.Headers["Content-Type"]
    PreviewStatus = [int]$previewResponse.StatusCode
    PreviewContentType = $previewResponse.Headers["Content-Type"]
    ComposePage = $composePage
    EditorPage = $editorPage
    PreviewPage = $previewPage
    ResultPage = $resultPage
    Cleanup = $deletedStatus
    StorageRemaining = $storageRemaining
  } | ConvertTo-Json -Depth 5
} finally {
  if (Test-Path $pngPath) {
    Remove-Item $pngPath -Force
  }
}
