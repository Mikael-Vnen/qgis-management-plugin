import os
import shutil
import subprocess
import argparse
from pathlib import Path
from tempfile import TemporaryDirectory, mkdtemp

REPO_ROOT = Path(__file__).resolve().parents[1]
PLUGIN_NAME = "qgis_management"


def build_frontend():
    npm = shutil.which("npm.cmd" if os.name == "nt" else "npm")

    if npm is None:
        raise RuntimeError("npm was not found. Check that Node.js is installed.")

    subprocess.run(
        [npm, "run", "build"],
        cwd=REPO_ROOT / "frontend",
        check=True,
    )


def assemble_plugin(staging_dir: Path) -> Path:
    source = REPO_ROOT / "plugin" / PLUGIN_NAME
    frontend_dist = REPO_ROOT / "frontend" / "dist"
    staged_plugin = staging_dir / PLUGIN_NAME

    required_files = [
        source / "__init__.py",
        source / "metadata.txt",
        source / "plugin.py",
        frontend_dist / "index.html",
    ]

    for path in required_files:
        if not path.is_file():
            raise FileNotFoundError(f"Required file missing: {path}")

    shutil.copytree(
        source,
        staged_plugin,
        ignore=shutil.ignore_patterns("web", "__pycache__", "*.pyc", "*.pyo"),
    )

    shutil.copytree(frontend_dist, staged_plugin / "web")

    return staged_plugin


def deploy_plugin(staged_plugin: Path, plugins_dir: Path) -> Path:
    plugins_dir = plugins_dir.expanduser().resolve()

    if plugins_dir.name != "plugins" or plugins_dir.parent.name != "python":
        raise ValueError("Expected the QGIS profile's python/plugins directory.")

    plugins_dir.mkdir(parents=True, exist_ok=True)
    destination = plugins_dir / PLUGIN_NAME

    if destination.is_symlink() or destination.is_junction():
        raise ValueError("Deployment destination must not be a link or junction.")

    if destination.exists() and not destination.is_dir():
        raise ValueError(f"Destination is not a directory: {destination}")

    work_dir = Path(mkdtemp(prefix=".plugin-deploy-", dir=plugins_dir))
    incoming = work_dir / PLUGIN_NAME
    backup = work_dir / "previous"

    shutil.copytree(staged_plugin, incoming)

    try:
        if destination.exists():
            destination.rename(backup)

        incoming.rename(destination)

    except OSError:
        if backup.exists() and not destination.exists():
            backup.rename(destination)
        raise

    else:
        shutil.rmtree(work_dir)

    return destination


if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Build and deploy the QGIS plugin.")
    parser.add_argument(
        "--plugins-dir",
        type=Path,
        required=True,
        help="The active QGIS profile's python/plugins directory.",
    )
    args = parser.parse_args()

    build_frontend()

    with TemporaryDirectory(prefix="qgis-management-build-") as temp_dir:
        staged_plugin = assemble_plugin(Path(temp_dir))
        destination = deploy_plugin(staged_plugin, args.plugins_dir)

    print(f"Plugin deployed to: {destination}")
    print("Open QGIS and enable the plugin in Manage and Install Plugins.")
    
