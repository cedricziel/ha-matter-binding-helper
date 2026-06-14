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

# Tunables (override via .env or environment)
#   WS_BUFFER  websocat max message size in bytes. The default websocat buffer is
#              64 KiB, which silently TRUNCATES large responses (e.g. list_nodes on
#              a fabric with many devices) and leaves you with empty output. Keep
#              this generous.
#   WS_WAIT    seconds to keep the connection open collecting the reply. The
#              Matter server can be slow on first contact; raise this (e.g.
#              WS_WAIT=10) if a command returns "No command result".
WS_BUFFER="${WS_BUFFER:-16777216}"
WS_WAIT="${WS_WAIT:-4}"

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

  # Send auth + command, then hold the connection open WS_WAIT seconds so the
  # (sometimes slow) Matter server can deliver the full reply before the pipe
  # closes. `-B "$WS_BUFFER"` raises websocat's message-size cap; without it large
  # responses (e.g. list_nodes on a big fabric) are silently truncated and never
  # match the grep below — which is what makes a command return nothing at all.
  local RESULT
  RESULT=$(
    { echo "$AUTH_MSG"; sleep 0.2; echo "$CMD_JSON"; sleep "$WS_WAIT"; } \
      | timeout "$((WS_WAIT + 10))" websocat -B "$WS_BUFFER" "$WS_URL" 2>/dev/null \
      | grep -m1 '"id":1' || true
  )

  if [[ -z "$RESULT" ]]; then
    echo "Error: No command result received from WebSocket" >&2
    echo "  (auth failed, command unknown, or the server took longer than ${WS_WAIT}s — try: WS_WAIT=30 $0 ...)" >&2
    return 1
  fi

  # Guard against a truncated response (would indicate WS_BUFFER is too small).
  if ! echo "$RESULT" | jq -e . &>/dev/null; then
    echo "Error: Received malformed/truncated JSON (${#RESULT} bytes)." >&2
    echo "  Raise the buffer and retry, e.g.: WS_BUFFER=$((WS_BUFFER * 2)) $0 ..." >&2
    return 1
  fi

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

create_group() {
  local NAME="$1"
  local GID="${2:-}"
  if [[ -z "$NAME" ]]; then
    echo "Usage: $0 group-create <name> [group_id]"
    exit 1
  fi
  if [[ -n "$GID" ]]; then
    ws_call "matter_binding_helper/create_group" "{\"name\": \"$NAME\", \"group_id\": $GID}"
  else
    ws_call "matter_binding_helper/create_group" "{\"name\": \"$NAME\"}"
  fi
}

delete_group() {
  local GID="$1"
  if [[ -z "$GID" ]]; then
    echo "Usage: $0 group-delete <group_id>"
    exit 1
  fi
  ws_call "matter_binding_helper/delete_group" "{\"group_id\": $GID}"
}

group_add() {
  local GID="$1" NODE="$2" EP="${3:-1}"
  if [[ -z "$GID" || -z "$NODE" ]]; then
    echo "Usage: $0 group-add <group_id> <node_id> [endpoint_id]"
    exit 1
  fi
  ws_call "matter_binding_helper/add_to_group" \
    "{\"group_id\": $GID, \"node_id\": $NODE, \"endpoint_id\": $EP}"
}

group_remove() {
  local GID="$1" NODE="$2" EP="${3:-1}"
  if [[ -z "$GID" || -z "$NODE" ]]; then
    echo "Usage: $0 group-remove <group_id> <node_id> [endpoint_id]"
    exit 1
  fi
  ws_call "matter_binding_helper/remove_from_group" \
    "{\"group_id\": $GID, \"node_id\": $NODE, \"endpoint_id\": $EP}"
}

# Inspect a node's Group Key Management cluster (GroupKeyMap + GroupTable).
# Handy for debugging groupcast provisioning ("did the key/map actually land?").
group_keys() {
  local NODE="$1"
  if [[ -z "$NODE" ]]; then
    echo "Usage: $0 groupkeys <node_id>"
    exit 1
  fi
  ws_call "matter_binding_helper/debug_cluster_attributes" \
    "{\"node_id\": $NODE, \"endpoint_id\": 0, \"cluster_id\": 63}"
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

debug_client() {
  ws_call "matter_binding_helper/debug_client"
}

cluster_commands() {
  local NODE_ID="$1"
  local ENDPOINT_ID="$2"
  local CLUSTER_ID="${3:-}"
  if [[ -z "$NODE_ID" || -z "$ENDPOINT_ID" ]]; then
    echo "Usage: $0 commands <node_id> <endpoint_id> [cluster_id]"
    exit 1
  fi
  if [[ -n "$CLUSTER_ID" ]]; then
    ws_call "matter_binding_helper/debug_cluster_commands" "{\"node_id\": $NODE_ID, \"endpoint_id\": $ENDPOINT_ID, \"cluster_id\": $CLUSTER_ID}"
  else
    ws_call "matter_binding_helper/debug_cluster_commands" "{\"node_id\": $NODE_ID, \"endpoint_id\": $ENDPOINT_ID}"
  fi
}

cluster_attrs() {
  local NODE_ID="$1"
  local ENDPOINT_ID="$2"
  local CLUSTER_ID="$3"
  if [[ -z "$NODE_ID" || -z "$ENDPOINT_ID" || -z "$CLUSTER_ID" ]]; then
    echo "Usage: $0 cluster <node_id> <endpoint_id> <cluster_id>"
    exit 1
  fi
  ws_call "matter_binding_helper/debug_cluster_attributes" "{\"node_id\": $NODE_ID, \"endpoint_id\": $ENDPOINT_ID, \"cluster_id\": $CLUSTER_ID}"
}

eve_schedule() {
  local NODE_ID="$1"
  local ENDPOINT_ID="${2:-1}"
  if [[ -z "$NODE_ID" ]]; then
    echo "Usage: $0 eve-schedule <node_id> [endpoint_id]"
    exit 1
  fi
  ws_call "matter_binding_helper/get_eve_schedule" "{\"node_id\": $NODE_ID, \"endpoint_id\": $ENDPOINT_ID}"
}

debug_telemetry() {
  ws_call "matter_binding_helper/debug_telemetry"
}

debug_v3() {
  local NODE_ID="$1"
  local ENDPOINT_ID="${2:-1}"
  if [[ -z "$NODE_ID" ]]; then
    echo "Usage: $0 debug-v3 <node_id> [endpoint_id]"
    exit 1
  fi
  ws_call "matter_binding_helper/debug_v3_extraction" "{\"node_id\": $NODE_ID, \"endpoint_id\": $ENDPOINT_ID}"
}

list_acl() {
  local NODE_ID="$1"
  if [[ -z "$NODE_ID" ]]; then
    echo "Usage: $0 acl <node_id>"
    exit 1
  fi
  ws_call "matter_binding_helper/list_acl" "{\"node_id\": $NODE_ID}"
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
  echo "  commands <node_id> <ep_id> [cid]   List accepted commands for clusters"
  echo "  cluster <node_id> <ep_id> <cid>    Dump all attributes from a cluster"
  echo "  debug-bindings <node_id> <ep_id>   Debug: Dump raw binding cluster data"
  echo "  debug-client                       Debug: Show Matter client API methods"
  echo "  groups                             List all Matter groups"
  echo "  group-create <name> [gid]          Create a group (id auto-allocated)"
  echo "  group-delete <gid>                 Delete a group"
  echo "  group-add <gid> <node> [ep]        Add a node endpoint to a group"
  echo "  group-remove <gid> <node> [ep]     Remove a node endpoint from a group"
  echo "  groupkeys <node>                   Dump a node's GroupKeyMap + GroupTable"
  echo "  devices                            Debug: List HA devices with Matter identifiers"
  echo "  match <node_id>                    Debug: Test device matching for a node"
  echo "  eve-schedule <node_id> [ep_id]     Get parsed Eve thermostat schedule"
  echo "  acl <node_id>                      List Access Control List entries for a node"
  echo "  telemetry                          Debug: Preview telemetry data (v3)"
  echo "  debug-v3 <node_id> [ep_id]         Debug: Show v3 extraction details"
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
  commands)
    cluster_commands "${2:-}" "${3:-}" "${4:-}"
    ;;
  cluster)
    cluster_attrs "${2:-}" "${3:-}" "${4:-}"
    ;;
  debug-bindings)
    debug_bindings "${2:-}" "${3:-}"
    ;;
  debug-client)
    debug_client
    ;;
  groups)
    list_groups
    ;;
  group-create)
    create_group "${2:-}" "${3:-}"
    ;;
  group-delete)
    delete_group "${2:-}"
    ;;
  group-add)
    group_add "${2:-}" "${3:-}" "${4:-}"
    ;;
  group-remove)
    group_remove "${2:-}" "${3:-}" "${4:-}"
    ;;
  groupkeys)
    group_keys "${2:-}"
    ;;
  devices)
    debug_devices
    ;;
  match)
    debug_match "${2:-}"
    ;;
  eve-schedule)
    eve_schedule "${2:-}" "${3:-}"
    ;;
  acl)
    list_acl "${2:-}"
    ;;
  telemetry)
    debug_telemetry
    ;;
  debug-v3)
    debug_v3 "${2:-}" "${3:-}"
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    show_help
    exit 1
    ;;
esac
