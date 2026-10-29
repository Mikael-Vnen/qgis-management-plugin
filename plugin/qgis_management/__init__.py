
def classFactory(iface):
  from .plugin import QgisManagement
  return QgisManagement(iface)
