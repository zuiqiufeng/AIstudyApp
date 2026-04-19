$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$base = 'D:\Documents\HBuilderProjects\ai学习小程序\static\tabbar'
$inactive = [System.Drawing.Color]::FromArgb(138, 149, 160)
$active = [System.Drawing.Color]::FromArgb(30, 42, 51)

function New-Pen {
	param(
		[System.Drawing.Color]$Color,
		[float]$Width = 6
	)

	$pen = New-Object System.Drawing.Pen($Color, $Width)
	$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
	$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
	$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
	return $pen
}

function New-Canvas {
	param(
		[string]$Path,
		[scriptblock]$Draw,
		[System.Drawing.Color]$Color
	)

	$bitmap = New-Object System.Drawing.Bitmap 96, 96
	$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
	$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
	$graphics.Clear([System.Drawing.Color]::Transparent)

	& $Draw $graphics $Color

	$bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
	$graphics.Dispose()
	$bitmap.Dispose()
}

$homeIcon = {
	param($graphics, $color)

	$pen = New-Pen $color 6
	$graphics.DrawLines($pen, [System.Drawing.Point[]]@(
		[System.Drawing.Point]::new(20, 44),
		[System.Drawing.Point]::new(48, 22),
		[System.Drawing.Point]::new(76, 44)
	))
	$graphics.DrawRectangle($pen, 28, 42, 40, 30)
	$graphics.DrawLine($pen, 48, 72, 48, 55)
	$pen.Dispose()
}

$hotIcon = {
	param($graphics, $color)

	$pen = New-Pen $color 6
	$graphics.DrawLine($pen, 24, 68, 24, 52)
	$graphics.DrawLine($pen, 46, 68, 46, 40)
	$graphics.DrawLine($pen, 68, 68, 68, 28)
	$graphics.DrawLines($pen, [System.Drawing.Point[]]@(
		[System.Drawing.Point]::new(22, 54),
		[System.Drawing.Point]::new(46, 42),
		[System.Drawing.Point]::new(68, 30),
		[System.Drawing.Point]::new(76, 38)
	))
	$pen.Dispose()
}

$knowledgeIcon = {
	param($graphics, $color)

	$pen = New-Pen $color 5.5
	$graphics.DrawArc($pen, 14, 26, 34, 42, 270, 180)
	$graphics.DrawArc($pen, 48, 26, 34, 42, 90, 180)
	$graphics.DrawLine($pen, 48, 24, 48, 70)
	$graphics.DrawLine($pen, 28, 38, 40, 36)
	$graphics.DrawLine($pen, 56, 36, 68, 38)
	$pen.Dispose()
}

$mineIcon = {
	param($graphics, $color)

	$pen = New-Pen $color 6
	$graphics.DrawEllipse($pen, 34, 18, 28, 28)
	$graphics.DrawArc($pen, 22, 40, 52, 34, 200, 140)
	$pen.Dispose()
}

New-Canvas (Join-Path $base 'home.png') $homeIcon $inactive
New-Canvas (Join-Path $base 'home-active.png') $homeIcon $active
New-Canvas (Join-Path $base 'hot.png') $hotIcon $inactive
New-Canvas (Join-Path $base 'hot-active.png') $hotIcon $active
New-Canvas (Join-Path $base 'knowledge.png') $knowledgeIcon $inactive
New-Canvas (Join-Path $base 'knowledge-active.png') $knowledgeIcon $active
New-Canvas (Join-Path $base 'mine.png') $mineIcon $inactive
New-Canvas (Join-Path $base 'mine-active.png') $mineIcon $active

Get-ChildItem -LiteralPath $base -Filter '*.png' |
	Select-Object Name, Length |
	Format-Table -Wrap
