FROM qgis/qgis:3.44.15-noble

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3-pyqt5.qtwebchannel \
        python3-pyqt5.qtwebengine \
    && rm -rf /var/lib/apt/lists/*
