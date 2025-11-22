#!/usr/bin/env bash

set -euo pipefail

# Load .env file
if [[ -f ".env" ]]; then
  set -a
  source .env
  set +a
else
  echo "Error: .env nicht gefunden!"
  exit 1
fi

# Required vars check
if [[ -z "${HA_HOST:-}" ]]; then
  echo "Error: HA_HOST ist nicht gesetzt!"
  exit 1
fi

if [[ -z "${HA_TOKEN:-}" ]]; then
  echo "Error: HA_TOKEN ist nicht gesetzt!"
  exit 1
fi

# Check for websocat
if ! command -v websocat &>/dev/null; then
  echo "Error: websocat ist nicht installiert!"
  echo "Install mit: brew install websocat"
  exit 1
fi

# Convert http(s) to ws(s) URL
WS_URL="${HA_HOST/http:/ws:}"
WS_URL="${WS_URL/https:/wss:}"
WS_URL="${WS_URL}/api/websocket"

# --- WEBSOCKET HELPER ---

ws_call() {
  local CMD_TYPE="$1"
  local CMD_DATA="${2:-}"

  # Build the command JSON
  local CMD_JSON
  if [[ -n "$CMD_DATA" ]]; then
    CMD_JSON=$(jq -nc --arg type "$CMD_TYPE" --argjson data "$CMD_DATA" '{id: 1, type: $type} + $data')
  else
    CMD_JSON=$(jq -nc --arg type "$CMD_TYPE" '{id: 1, type: $type}')
  fi

  local AUTH_MSG
  AUTH_MSG=$(jq -nc --arg token "$HA_TOKEN" '{type: "auth", access_token: $token}')

  # Send auth + command via stdin with small delays, capture all output
  local OUTPUT
  OUTPUT=$({ echo "$AUTH_MSG"; sleep 0.1; echo "$CMD_JSON"; sleep 0.5; } | timeout 10 websocat "$WS_URL" 2>/dev/null)

  if [[ -z "$OUTPUT" ]]; then
    echo "Error: No response from WebSocket" >&2
    return 1
  fi

  # Get the last line (the result)
  local RESULT
  RESULT=$(echo "$OUTPUT" | tail -1)

  # Check for error in result
  if echo "$RESULT" | jq -e '.error' &>/dev/null; then
    echo "$RESULT" | jq -r '.error.message // "Unknown error"' >&2
    return 1
  fi

  echo "$RESULT" | jq '.result // .'
}

# --- FUNCTIONS ---

list_nodes() {
  ws_call "matter_binding_helper/list_nodes"
}

debug_node() {
  local NODE_ID="$1"
  if [[ -z "$NODE_ID" ]]; then
    echo "Usage: $0 node <node_id>"
    exit 1
  fi
  ws_call "matter_binding_helper/debug_node" "{\"node_id\": $NODE_ID}"
}

list_bindings() {
  local NODE_ID="$1"
  local ENDPOINT_ID="$2"
  if [[ -z "$NODE_ID" || -z "$ENDPOINT_ID" ]]; then
    echo "Usage: $0 bindings <node_id> <endpoint_id>"
    exit 1
  fi
  ws_call "matter_binding_helper/list_bindings" "{\"node_id\": $NODE_ID, \"endpoint_id\": $ENDPOINT_ID}"
}

list_groups() {
  ws_call "matter_binding_helper/list_groups"
}

debug_devices() {
  ws_call "matter_binding_helper/debug_devices"
}

debug_match() {
  local NODE_ID="$1"
  if [[ -z "$NODE_ID" ]]; then
    echo "Usage: $0 match <node_id>"
    exit 1
  fi
  ws_call "matter_binding_helper/debug_match" "{\"node_id\": $NODE_ID}"
}

debug_bindings() {
  local NODE_ID="$1"
  local ENDPOINT_ID="$2"
  if [[ -z "$NODE_ID" || -z "$ENDPOINT_ID" ]]; then
    echo "Usage: $0 debug-bindings <node_id> <endpoint_id>"
    exit 1
  fi
  ws_call "matter_binding_helper/debug_bindings" "{\"node_id\": $NODE_ID, \"endpoint_id\": $ENDPOINT_ID}"
}

# --- COMMAND DISPATCH ---

show_help() {
  echo "Matter Binding Helper CLI"
  echo ""
  echo "Usage: $0 <command> [args]"
  echo ""
  echo "Commands:"
  echo "  nodes                              List all Matter nodes"
  echo "  node <node_id>                     Debug info for a specific node"
  echo "  bindings <node_id> <ep_id>         List bindings for node endpoint"
  echo "  debug-bindings <node_id> <ep_id>   Debug: Dump raw binding cluster data"
  echo "  groups                             List all Matter groups"
  echo "  devices                            Debug: List HA devices with Matter identifiers"
  echo "  match <node_id>                    Debug: Test device matching for a node"
  echo ""
  echo "Environment (from .env):"
  echo "  HA_HOST   Home Assistant URL (e.g., http://homeassistant.local:8123)"
  echo "  HA_TOKEN  Long-lived access token"
}

case "${1:-}" in
  nodes)
    list_nodes
    ;;
  node)
    debug_node "${2:-}"
    ;;
  bindings)
    list_bindings "${2:-}" "${3:-}"
    ;;
  debug-bindings)
    debug_bindings "${2:-}" "${3:-}"
    ;;
  groups)
    list_groups
    ;;
  devices)
    debug_devices
    ;;
  match)
    debug_match "${2:-}"
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    show_help
    exit 1
    ;;
esac
