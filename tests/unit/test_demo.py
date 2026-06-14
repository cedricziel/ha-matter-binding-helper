"""Unit tests for matter/demo.py."""

import pytest
from unittest.mock import MagicMock

from custom_components.matter_binding_helper.matter.models import (
    ACLEntry,
    BindingEntry,
)
from custom_components.matter_binding_helper.matter.demo import (
    is_demo_mode,
    get_demo_nodes,
    get_demo_bindings,
    set_demo_bindings,
    add_demo_binding,
    remove_demo_binding,
    get_demo_acl,
    set_demo_acl,
    add_demo_acl_entry,
    remove_demo_acl_entry,
    _demo_bindings,
    _demo_acl_entries,
)


@pytest.fixture(autouse=True)
def reset_demo_state():
    """Reset demo state before and after each test."""
    # Store original state
    original_bindings = dict(_demo_bindings)
    original_acl = dict(_demo_acl_entries)

    # Clear for test
    _demo_bindings.clear()
    _demo_acl_entries.clear()

    yield

    # Restore original state
    _demo_bindings.clear()
    _demo_bindings.update(original_bindings)
    _demo_acl_entries.clear()
    _demo_acl_entries.update(original_acl)


class TestIsDemoMode:
    """Tests for is_demo_mode function."""

    def test_demo_mode_enabled(self):
        """Test detecting demo mode when enabled."""
        mock_entry = MagicMock()
        mock_entry.options = {"demo_mode": True}

        mock_hass = MagicMock()
        mock_hass.config_entries.async_entries.return_value = [mock_entry]

        assert is_demo_mode(mock_hass) is True

    def test_demo_mode_disabled(self):
        """Test detecting demo mode when disabled."""
        mock_entry = MagicMock()
        mock_entry.options = {"demo_mode": False}

        mock_hass = MagicMock()
        mock_hass.config_entries.async_entries.return_value = [mock_entry]

        assert is_demo_mode(mock_hass) is False

    def test_demo_mode_not_set_defaults_false(self):
        """Test demo mode defaults to False when not set."""
        mock_entry = MagicMock()
        mock_entry.options = {}

        mock_hass = MagicMock()
        mock_hass.config_entries.async_entries.return_value = [mock_entry]

        assert is_demo_mode(mock_hass) is False

    def test_no_config_entries_defaults_false(self):
        """Test demo mode defaults to False with no entries."""
        mock_hass = MagicMock()
        mock_hass.config_entries.async_entries.return_value = []

        assert is_demo_mode(mock_hass) is False


class TestGetDemoNodes:
    """Tests for get_demo_nodes function."""

    def test_returns_list(self):
        """Test that demo nodes returns a list."""
        nodes = get_demo_nodes()
        assert isinstance(nodes, list)

    def test_has_multiple_nodes(self):
        """Test that demo nodes has multiple entries."""
        nodes = get_demo_nodes()
        assert len(nodes) >= 3

    def test_nodes_have_required_fields(self):
        """Test that each node has required fields."""
        nodes = get_demo_nodes()
        for node in nodes:
            assert "node_id" in node
            assert "name" in node
            assert "available" in node
            assert "device_info" in node
            assert "endpoints" in node

    def test_nodes_have_unique_ids(self):
        """Test that node IDs are unique."""
        nodes = get_demo_nodes()
        node_ids = [n["node_id"] for n in nodes]
        assert len(node_ids) == len(set(node_ids))

    def test_endpoints_have_binding_cluster_flag(self):
        """Test that endpoints have binding cluster flag."""
        nodes = get_demo_nodes()
        for node in nodes:
            for endpoint in node["endpoints"]:
                assert "has_binding_cluster" in endpoint

    def test_has_unavailable_node(self):
        """Test that at least one demo node is unavailable."""
        nodes = get_demo_nodes()
        unavailable = [n for n in nodes if not n["available"]]
        assert len(unavailable) >= 1

    def test_has_switch_device(self):
        """Test that demo includes a switch device (device type 259)."""
        nodes = get_demo_nodes()
        has_switch = False
        for node in nodes:
            for endpoint in node["endpoints"]:
                for dt in endpoint.get("device_types", []):
                    if dt.get("id") == 259:
                        has_switch = True
        assert has_switch

    def test_has_light_device(self):
        """Test that demo includes a light device (device type 256/257)."""
        nodes = get_demo_nodes()
        has_light = False
        for node in nodes:
            for endpoint in node["endpoints"]:
                for dt in endpoint.get("device_types", []):
                    if dt.get("id") in [256, 257]:
                        has_light = True
        assert has_light


class TestDemoBindings:
    """Tests for demo binding operations."""

    def test_get_bindings_empty(self):
        """Test getting bindings for empty node."""
        bindings = get_demo_bindings(99, 1)
        assert bindings == []

    def test_add_binding(self):
        """Test adding a binding."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
        )
        add_demo_binding(binding)

        bindings = get_demo_bindings(1, 1)
        assert len(bindings) == 1
        assert bindings[0].target_node_id == 2

    def test_add_multiple_bindings(self):
        """Test adding multiple bindings to same endpoint."""
        binding1 = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
        )
        binding2 = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=8,
            target_node_id=3,
            target_endpoint_id=1,
        )
        add_demo_binding(binding1)
        add_demo_binding(binding2)

        bindings = get_demo_bindings(1, 1)
        assert len(bindings) == 2

    def test_set_bindings(self):
        """Test setting bindings replaces existing."""
        # Add initial binding
        binding1 = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
        )
        add_demo_binding(binding1)

        # Set completely new bindings
        new_bindings = [
            BindingEntry(
                node_id=1,
                endpoint_id=1,
                cluster_id=8,
                target_node_id=3,
                target_endpoint_id=1,
            )
        ]
        set_demo_bindings(1, 1, new_bindings)

        bindings = get_demo_bindings(1, 1)
        assert len(bindings) == 1
        assert bindings[0].cluster_id == 8

    def test_remove_binding_success(self):
        """Test removing a binding returns True."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
        )
        add_demo_binding(binding)

        result = remove_demo_binding(1, 1, 2, 1, None, None)
        assert result is True
        assert len(get_demo_bindings(1, 1)) == 0

    def test_remove_binding_not_found(self):
        """Test removing non-existent binding returns False."""
        result = remove_demo_binding(1, 1, 99, 99, None, None)
        assert result is False

    def test_remove_binding_by_cluster(self):
        """Test removing binding by cluster ID."""
        binding1 = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
        )
        binding2 = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=8,
            target_node_id=2,
            target_endpoint_id=1,
        )
        add_demo_binding(binding1)
        add_demo_binding(binding2)

        # Remove only cluster 6
        result = remove_demo_binding(1, 1, 2, 1, None, 6)
        assert result is True

        bindings = get_demo_bindings(1, 1)
        assert len(bindings) == 1
        assert bindings[0].cluster_id == 8

    def test_remove_all_matching_bindings(self):
        """Test that remove removes all matching bindings."""
        # Add two identical bindings
        binding1 = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
        )
        binding2 = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
        )
        add_demo_binding(binding1)
        add_demo_binding(binding2)

        # Remove should remove BOTH
        result = remove_demo_binding(1, 1, 2, 1, None, None)
        assert result is True
        assert len(get_demo_bindings(1, 1)) == 0

    def test_remove_group_binding(self):
        """Test removing a group binding."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_group_id=100,
        )
        add_demo_binding(binding)

        result = remove_demo_binding(1, 1, None, None, 100, None)
        assert result is True
        assert len(get_demo_bindings(1, 1)) == 0

    def test_remove_binding_group_mismatch(self):
        """Test that group None vs value doesn't match."""
        # Add binding without group
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
            target_group_id=None,
        )
        add_demo_binding(binding)

        # Try to remove with different group - should not match
        result = remove_demo_binding(1, 1, 2, 1, 100, None)
        assert result is False
        assert len(get_demo_bindings(1, 1)) == 1


class TestDemoACL:
    """Tests for demo ACL operations."""

    def test_get_acl_default(self):
        """Test getting ACL for node without custom entries."""
        acl = get_demo_acl(99)
        # Should return default admin entry
        assert len(acl) >= 1
        # Should have admin privilege
        assert any(e.privilege == 5 for e in acl)

    def test_get_acl_returns_copy(self):
        """Test that get_demo_acl returns a copy of defaults."""
        acl1 = get_demo_acl(99)
        acl2 = get_demo_acl(99)
        # Should be equal but not same object
        assert acl1 is not acl2

    def test_set_acl(self):
        """Test setting custom ACL for a node."""
        custom_entries = [
            ACLEntry(
                privilege=3,
                auth_mode=2,
                subjects=[2],
                targets=[],
                fabric_index=1,
            )
        ]
        set_demo_acl(1, custom_entries)

        acl = get_demo_acl(1)
        assert len(acl) == 1
        assert acl[0].privilege == 3

    def test_add_acl_entry_new_node(self):
        """Test adding ACL entry to node without entries."""
        entry = ACLEntry(
            privilege=3,
            auth_mode=2,
            subjects=[2],
            targets=[],
            fabric_index=1,
        )
        add_demo_acl_entry(1, entry)

        acl = get_demo_acl(1)
        # Should have default + new entry
        assert len(acl) >= 2
        assert any(e.privilege == 3 and 2 in e.subjects for e in acl)

    def test_add_acl_entry_existing_node(self):
        """Test adding ACL entry to node with entries."""
        # Set initial entry
        initial = [
            ACLEntry(
                privilege=5,
                auth_mode=2,
                subjects=[1],
                targets=[],
                fabric_index=1,
            )
        ]
        set_demo_acl(1, initial)

        # Add another entry
        new_entry = ACLEntry(
            privilege=3,
            auth_mode=2,
            subjects=[2],
            targets=[],
            fabric_index=1,
        )
        add_demo_acl_entry(1, new_entry)

        acl = get_demo_acl(1)
        assert len(acl) == 2

    def test_remove_acl_entry_success(self):
        """Test removing an ACL entry."""
        entries = [
            ACLEntry(
                privilege=5,
                auth_mode=2,
                subjects=[1],
                targets=[],
                fabric_index=1,
            ),
            ACLEntry(
                privilege=3,
                auth_mode=2,
                subjects=[2],
                targets=[],
                fabric_index=1,
            ),
        ]
        set_demo_acl(1, entries)

        result = remove_demo_acl_entry(1, source_node_id=2)
        assert result is True

        acl = get_demo_acl(1)
        assert len(acl) == 1
        assert acl[0].privilege == 5

    def test_remove_acl_entry_not_found(self):
        """Test removing non-existent ACL entry."""
        entries = [
            ACLEntry(
                privilege=5,
                auth_mode=2,
                subjects=[1],
                targets=[],
                fabric_index=1,
            )
        ]
        set_demo_acl(1, entries)

        result = remove_demo_acl_entry(1, source_node_id=99)
        assert result is False

    def test_remove_acl_entry_no_entries(self):
        """Test removing from node with no custom entries."""
        result = remove_demo_acl_entry(99, source_node_id=1)
        assert result is False


class TestDemoBindingsIsolation:
    """Tests for demo bindings isolation between endpoints."""

    def test_different_endpoints_isolated(self):
        """Test that different endpoints have isolated bindings."""
        binding1 = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
        )
        binding2 = BindingEntry(
            node_id=1,
            endpoint_id=2,
            cluster_id=8,
            target_node_id=3,
            target_endpoint_id=1,
        )
        add_demo_binding(binding1)
        add_demo_binding(binding2)

        # Check isolation
        ep1_bindings = get_demo_bindings(1, 1)
        ep2_bindings = get_demo_bindings(1, 2)

        assert len(ep1_bindings) == 1
        assert len(ep2_bindings) == 1
        assert ep1_bindings[0].cluster_id == 6
        assert ep2_bindings[0].cluster_id == 8

    def test_different_nodes_isolated(self):
        """Test that different nodes have isolated bindings."""
        binding1 = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
        )
        binding2 = BindingEntry(
            node_id=2,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=3,
            target_endpoint_id=1,
        )
        add_demo_binding(binding1)
        add_demo_binding(binding2)

        # Check isolation
        node1_bindings = get_demo_bindings(1, 1)
        node2_bindings = get_demo_bindings(2, 1)

        assert len(node1_bindings) == 1
        assert len(node2_bindings) == 1
        assert node1_bindings[0].target_node_id == 2
        assert node2_bindings[0].target_node_id == 3
