from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)


class ChannelManager:
    def __init__(self):
        # channel_id -> list of connected websockets
        self.channels: Dict[str, List[WebSocket]] = {}

    async def connect(self, channel: str, websocket: WebSocket):
        await websocket.accept()
        if channel not in self.channels:
            self.channels[channel] = []
        self.channels[channel].append(websocket)
        logger.info(f"WS connected: channel={channel}, total={len(self.channels[channel])}")

    def disconnect(self, channel: str, websocket: WebSocket):
        if channel in self.channels:
            self.channels[channel].discard(websocket) if hasattr(self.channels[channel], 'discard') else None
            try:
                self.channels[channel].remove(websocket)
            except ValueError:
                pass
            if not self.channels[channel]:
                del self.channels[channel]
        logger.info(f"WS disconnected: channel={channel}")

    async def broadcast(self, channel: str, message: dict):
        if channel not in self.channels:
            return
        dead = []
        for ws in self.channels[channel]:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(channel, ws)

    def list_channels(self) -> List[str]:
        return list(self.channels.keys())


manager = ChannelManager()
