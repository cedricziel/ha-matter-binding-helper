"""Unit tests for repair_group_bindings (re-provision groupcast bindings)."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.matter_binding_helper.matter import bindings
from custom_components.matter_binding_helper.matter.bindings import (
    repair_group_bindings,
)
from custom_components.matter_binding_helper.matter.models import (
    BindingEntry,
    GroupOperationResult,
)


@pytest.mark.asyncio
async def test_repair_only_reprovisions_groupcast_bindings():
    hass = MagicMock()
    endpoint_bindings = [
        # groupcast binding -> should be re-provisioned
        BindingEntry(node_id=4, endpoint_id=1, cluster_id=6, target_group_id=5),
        # unicast binding -> ignored
        BindingEntry(
            node_id=4,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
        ),
        # groupcast but wildcard cluster -> ignored (no cluster to provision)
        BindingEntry(node_id=4, endpoint_id=1, cluster_id=None, target_group_id=7),
    ]

    provision = AsyncMock(return_value=GroupOperationResult(True, "ok"))
    with (
        patch.object(
            bindings, "get_bindings", AsyncMock(return_value=endpoint_bindings)
        ),
        patch.object(bindings, "provision_group_for_binding", provision),
    ):
        results = await repair_group_bindings(hass, node_id=4, endpoint_id=1)

    # Only the one valid groupcast binding is re-provisioned.
    assert provision.await_count == 1
    call = provision.await_args
    assert call.kwargs["group_id"] == 5
    assert call.kwargs["cluster_id"] == 6
    assert call.kwargs["source_node_id"] == 4

    assert len(results) == 1
    assert results[0]["target_group_id"] == 5
    assert results[0]["success"] is True


@pytest.mark.asyncio
async def test_repair_reports_failures():
    hass = MagicMock()
    endpoint_bindings = [
        BindingEntry(node_id=4, endpoint_id=1, cluster_id=6, target_group_id=5),
    ]
    provision = AsyncMock(
        return_value=GroupOperationResult(False, "member offline", "device_error")
    )
    with (
        patch.object(
            bindings, "get_bindings", AsyncMock(return_value=endpoint_bindings)
        ),
        patch.object(bindings, "provision_group_for_binding", provision),
    ):
        results = await repair_group_bindings(hass, node_id=4, endpoint_id=1)

    assert results[0]["success"] is False
    assert "offline" in results[0]["message"]


@pytest.mark.asyncio
async def test_repair_no_group_bindings_is_empty():
    hass = MagicMock()
    with patch.object(
        bindings,
        "get_bindings",
        AsyncMock(
            return_value=[BindingEntry(node_id=4, endpoint_id=1, target_node_id=2)]
        ),
    ):
        results = await repair_group_bindings(hass, node_id=4, endpoint_id=1)
    assert results == []
