"""A device-less fake of the raw python-matter-server client.

Simulates the two backends' fabric-scoped + set_acl_entry semantics so the
higher-level flows (write_acl, …) can be exercised in milliseconds. It mimics
the *raw* client surface that ``RealMatterClient`` wraps, so it plugs into the
integration via the direct-connection slot:

    hass.data[DOMAIN] = {"e": {"connection": SimpleNamespace(client=fake)}}

``backend="python"`` accepts camelCase ACL keys (chip); ``backend="matterjs"``
reads snake_case (``auth_mode`` / target ``device_type``) and rejects an entry
with CONSTRAINT_ERROR when those keys are absent — exactly the divergence the
dual-key fix targets.
"""

from __future__ import annotations

from typing import Any

CONSTRAINT_ERROR = 0x87  # 135


class FakeNode:
    def __init__(self, node_id: int, available: bool = True) -> None:
        self.node_id = node_id
        self.available = available
        self.endpoints: dict[int, Any] = {}


class FakeMatterClient:
    """Raw-style fake Matter client for device-less flow tests."""

    def __init__(
        self,
        backend: str = "python",
        node_ids: tuple[int, ...] = (1,),
        fabric_index: int = 1,
    ) -> None:
        self.backend = backend
        self.fabric = fabric_index
        self._nodes = [FakeNode(n) for n in node_ids]
        self.attrs: dict[tuple[int, str], Any] = {}
        self.acl: dict[int, list[dict[str, Any]]] = {}

    # --- raw client surface -------------------------------------------------
    def get_nodes(self) -> list[FakeNode]:
        return self._nodes

    async def read_attribute(self, node_id: int, attribute_path: str) -> Any:
        if attribute_path.endswith(
            "/62/5"
        ):  # OperationalCredentials.CurrentFabricIndex
            return {attribute_path: self.fabric}
        if attribute_path.endswith("/31/0"):  # AccessControl.ACL
            return {attribute_path: list(self.acl.get(node_id, []))}
        return {attribute_path: self.attrs.get((node_id, attribute_path), [])}

    async def write_attribute(self, node_id: int, attribute_path: str, value: Any):
        self.attrs[(node_id, attribute_path)] = value

    async def send_command(self, command: str, **kwargs: Any) -> Any:
        if command == "set_acl_entry":
            return self._set_acl_entry(kwargs["node_id"], kwargs["entry"])
        raise NotImplementedError(command)

    # --- set_acl_entry simulation ------------------------------------------
    def _set_acl_entry(
        self, node_id: int, entries: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        results = []
        normalized = []
        for entry in entries:
            status = self._acl_status(entry)
            results.append({"Status": status})
            if status == 0:
                normalized.append(entry)
        if all(r["Status"] == 0 for r in results):
            self.acl[node_id] = normalized
        return results

    def _acl_status(self, entry: dict[str, Any]) -> int:
        if self.backend == "matterjs":
            # matter.js reads snake_case auth_mode and target device_type; absence
            # of those keys yields a malformed entry the device rejects.
            if "auth_mode" not in entry:
                return CONSTRAINT_ERROR
            for target in entry.get("targets") or []:
                if "device_type" not in target and target.get("endpoint") is not None:
                    return CONSTRAINT_ERROR
            return 0
        # python-matter-server (chip) reads camelCase.
        if "authMode" not in entry:
            return CONSTRAINT_ERROR
        return 0
