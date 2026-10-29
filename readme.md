Add user enviroment variable to your QGIS project folder.
Required to mount the docker container

PYTHONPATH=plugin python3 -c "from scripts.debug import read_project; read_project()"


Stuff that needs work:
Raster layers or at least openstreetmap doesn't get loaded properly. Right now I'm just filtering them out as a work around.

Time codes are in an odd way "PyQt5.QtCore.QDateTime(2026, 8, 21, 10, 37, 30, 810, PyQt5.QtCore.Qt.TimeSpec(1))"
Not the end of the world, but needs to be fixed at some point.

redeploy the plugin, remember to run outside of the container.
& "C:\Program Files\QGIS 3.44.7\apps\Python312\python.exe" `
  .\scripts\deploy_plugin.py `
  --plugins-dir "$env:APPDATA\QGIS\QGIS3\profiles\default\python\plugins"
