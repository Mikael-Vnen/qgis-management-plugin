from pathlib import Path
from qgis.PyQt.QtCore import QUrl
from qgis.PyQt.QtWidgets import QAction
from PyQt5.QtWebChannel import QWebChannel
from PyQt5.QtWebEngineWidgets import QWebEngineView
from .bridge import ProjectBridge


class ManagementWindow(QWebEngineView):
    def closeEvent(self, event):
        event.ignore()
        self.hide()


class QgisManagement:

  def __init__(self, iface):
    # save reference to the QGIS interface
    self.iface   = iface
    self.window  = None
    self.channel = None
    self.bridge  = None


  def initGui(self):

    self.action = QAction("QGIS management", self.iface.mainWindow())
    self.action.setObjectName("testAction")
    self.action.setWhatsThis("Configuration for test plugin")
    self.action.setStatusTip("This is status tip")
    self.action.triggered.connect(self.open_window)

    # add toolbar button and menu item
    self.iface.addToolBarIcon(self.action)
    self.iface.addPluginToMenu("&QGIS management", self.action)


  def open_window(self):
    if self.window is None:
        html_path = Path(__file__).resolve().parent / "web" / "index.html"

        if not html_path.is_file():
            raise FileNotFoundError(f"Frontend build missing: {html_path}")

        self.window = ManagementWindow()

        page = self.window.page()
        self.channel = QWebChannel(page)
        self.bridge = ProjectBridge(self.channel)

        self.channel.registerObject("projectBridge", self.bridge)
        page.setWebChannel(self.channel)

        self.window.setWindowTitle("QGIS Management")
        self.window.resize(900, 650)
        self.window.load(QUrl.fromLocalFile(str(html_path)))

    self.window.show()
    self.window.raise_()
    self.window.activateWindow()


  def unload(self):
    self.iface.removePluginMenu("&QGIS management", self.action)
    self.iface.removeToolBarIcon(self.action)
    self.action.deleteLater()

    if self.window is not None:
        self.window.hide()
        self.window.deleteLater()
        self.window = None
        self.bridge = None
        self.channel = None
