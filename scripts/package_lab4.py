"""Create a source-only ZIP for the NET108 Lab 4 submission."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


root = Path(__file__).resolve().parents[1]
labs = root / "File Lab và Dự Án cuối/Lab 1 - 8"
lab4 = labs / "Lab 4"
output = lab4 / "Lab4_NET108_Submission.zip"
files = [lab4 / "Lab4_NET108_AI_Native_Commerce.docx"]
for folder in (lab4 / "Source", labs / "Lab 3/Source", labs / "Lab 3/Database"):
    files.extend(
        file for file in folder.rglob("*")
        if file.is_file() and not any(part in {"bin", "obj", ".vs", ".git"} for part in file.parts)
    )
files.extend((root / "docs/labs/LAB4-RUN.md", root / "scripts/lab4-smoke.ps1"))
with ZipFile(output, "w", ZIP_DEFLATED) as archive:
    for file in sorted(files):
        archive.write(file, file.relative_to(root))
with ZipFile(output) as archive:
    corrupt = archive.testzip()
    if corrupt:
        raise RuntimeError(f"Invalid ZIP member: {corrupt}")
    print(f"{output.name}: {len(archive.namelist())} files")
