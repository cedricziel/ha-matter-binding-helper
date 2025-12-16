#!/usr/bin/env python3
"""
Commission a Matter device using the python-matter-server API.

Usage:
    docker exec matter-server python3 /scripts/commission-device.py --ip 192.168.65.3 20202021
"""

import argparse
import json
import socket
import ssl
import sys
from urllib.parse import urlparse


def websocket_handshake(sock, host, path):
    """Perform WebSocket handshake."""
    key = "dGhlIHNhbXBsZSBub25jZQ=="  # Fixed key for simplicity
    request = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n"
        f"\r\n"
    )
    sock.sendall(request.encode())

    # Read response
    response = b""
    while b"\r\n\r\n" not in response:
        response += sock.recv(1024)

    if b"101" not in response:
        raise Exception(f"WebSocket handshake failed: {response.decode()}")


def send_ws_frame(sock, data):
    """Send a WebSocket text frame."""
    payload = data.encode()
    length = len(payload)

    # Build frame: FIN + text opcode, mask bit set, length, mask, payload
    frame = bytearray()
    frame.append(0x81)  # FIN + text

    if length < 126:
        frame.append(0x80 | length)  # Mask bit + length
    elif length < 65536:
        frame.append(0x80 | 126)
        frame.extend(length.to_bytes(2, 'big'))
    else:
        frame.append(0x80 | 127)
        frame.extend(length.to_bytes(8, 'big'))

    # Masking key (all zeros for simplicity - server doesn't care)
    mask = bytes([0, 0, 0, 0])
    frame.extend(mask)

    # Masked payload (with zero mask = unmasked)
    frame.extend(payload)

    sock.sendall(frame)


def send_pong(sock, payload):
    """Send a WebSocket pong frame."""
    frame = bytearray()
    frame.append(0x8A)  # FIN + pong
    length = len(payload)
    frame.append(0x80 | length)  # Mask bit + length
    frame.extend(bytes([0, 0, 0, 0]))  # Mask key
    frame.extend(payload)  # Payload (masked with zeros = same)
    sock.sendall(frame)


def recv_ws_frame(sock):
    """Receive a WebSocket frame, handling pings automatically."""
    while True:
        # Read header
        header = sock.recv(2)
        if len(header) < 2:
            return None

        opcode = header[0] & 0x0F
        masked = (header[1] & 0x80) != 0
        length = header[1] & 0x7F

        if length == 126:
            length = int.from_bytes(sock.recv(2), 'big')
        elif length == 127:
            length = int.from_bytes(sock.recv(8), 'big')

        mask = None
        if masked:
            mask = sock.recv(4)

        # Read payload
        payload = b""
        while len(payload) < length:
            chunk = sock.recv(min(4096, length - len(payload)))
            if not chunk:
                break
            payload += chunk

        if masked and mask:
            payload = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))

        if opcode == 0x09:  # Ping - respond with pong
            send_pong(sock, payload)
            continue  # Keep waiting for actual data
        if opcode == 0x08:  # Close
            return None
        if opcode == 0x01:  # Text
            return payload.decode()
        # Other frame types - skip


def commission_device(server_url, ip_addr, pin_code, pairing_code=None):
    """Commission a device using raw WebSocket."""
    parsed = urlparse(server_url)
    host = parsed.hostname or "localhost"
    port = parsed.port or (443 if parsed.scheme == "wss" else 80)
    path = parsed.path or "/"

    print(f"Connecting to {host}:{port}...")

    # Create socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(90)  # 90 second timeout

    try:
        sock.connect((host, port))

        if parsed.scheme == "wss":
            context = ssl.create_default_context()
            sock = context.wrap_socket(sock, server_hostname=host)

        # WebSocket handshake
        websocket_handshake(sock, f"{host}:{port}", path)
        print("WebSocket connected")

        # Wait for server_info (sent as first message)
        msg = recv_ws_frame(sock)
        if msg is None:
            raise Exception("Connection closed before server_info")
        try:
            data = json.loads(msg)
            schema = data.get("schema_version") or data.get("data", {}).get("schema_version")
            print(f"Server schema version: {schema}")
        except json.JSONDecodeError:
            pass  # Non-critical

        # Send commission command
        if pairing_code:
            # Use commission_with_code for mDNS-based discovery (supports different ports)
            print(f"Commissioning device with pairing code {pairing_code}...")
            cmd = {
                "message_id": "1",
                "command": "commission_with_code",
                "args": {
                    "code": pairing_code,
                    "network_only": True
                }
            }
        elif ip_addr:
            print(f"Commissioning device at {ip_addr} with PIN {pin_code}...")
            cmd = {
                "message_id": "1",
                "command": "commission_on_network",
                "args": {
                    "setup_pin_code": pin_code,
                    "ip_addr": ip_addr
                }
            }
        else:
            raise Exception("Either --ip or --code must be provided")
        send_ws_frame(sock, json.dumps(cmd))

        # Wait for response
        while True:
            msg = recv_ws_frame(sock)
            if msg is None:
                raise Exception("Connection closed while waiting for response")
            try:
                data = json.loads(msg)
                # Skip events
                if data.get("event"):
                    continue
                # Check for our response
                if data.get("message_id") == "1":
                    if "error_code" in data:
                        print(f"\n✗ Commissioning failed: {data.get('details', 'Unknown error')}")
                        return None
                    result = data.get("result", {})
                    node_id = result.get("node_id")
                    print(f"\n✓ Success! Device commissioned.")
                    print(f"  Node ID: {node_id}")
                    return node_id
            except json.JSONDecodeError:
                pass

    finally:
        sock.close()


def main():
    parser = argparse.ArgumentParser(description="Commission a Matter device")
    parser.add_argument("code", nargs="?", help="PIN code (e.g., 20202021) - required with --ip")
    parser.add_argument("--ip", help="Device IP address (uses commission_on_network)")
    parser.add_argument("--pairing-code", help="QR or manual pairing code (uses commission_with_code for mDNS discovery)")
    parser.add_argument("--server", default="ws://localhost:5580/ws", help="Matter server URL")

    args = parser.parse_args()

    if not args.ip and not args.pairing_code:
        parser.error("Either --ip or --pairing-code must be provided")
    if args.ip and not args.code:
        parser.error("PIN code is required when using --ip")

    try:
        pin = int(args.code) if args.code else None
        result = commission_device(args.server, args.ip, pin, args.pairing_code)
        if result:
            print("Done.")
            sys.exit(0)
        else:
            sys.exit(1)
    except socket.timeout:
        print("\n✗ Connection timed out")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nInterrupted.")
        sys.exit(130)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
