"""Unit tests for binding parsing with None cluster_id (Issue #110).

Tests that bindings with cluster_id=None (any cluster per Matter spec)
are handled correctly without causing TypeError.
"""

from custom_components.matter_binding_helper.matter.bindings import (
    _parse_binding_value,
)


class TestParseBindingValueNoneCluster:
    """Tests for _parse_binding_value with None cluster_id."""

    def test_parse_dict_binding_with_none_cluster(self):
        """Test parsing dict binding where Cluster key exists but is None."""
        binding_value = [
            {
                "Node": 5,
                "Endpoint": 1,
                "Cluster": None,  # Explicitly None
            }
        ]
        result = _parse_binding_value(
            node_id=1, endpoint_id=1, binding_value=binding_value
        )

        assert len(result) == 1
        assert result[0].cluster_id is None
        assert result[0].target_node_id == 5
        assert result[0].target_endpoint_id == 1

    def test_parse_dict_binding_without_cluster_key(self):
        """Test parsing dict binding where Cluster key is missing entirely."""
        binding_value = [
            {
                "Node": 5,
                "Endpoint": 1,
                # No Cluster key at all
            }
        ]
        result = _parse_binding_value(
            node_id=1, endpoint_id=1, binding_value=binding_value
        )

        assert len(result) == 1
        assert result[0].cluster_id is None
        assert result[0].target_node_id == 5

    def test_parse_dict_binding_with_cluster_zero(self):
        """Test parsing dict binding with cluster_id=0 (valid cluster ID)."""
        binding_value = [
            {
                "Node": 5,
                "Endpoint": 1,
                "Cluster": 0,  # 0 is falsy but valid
            }
        ]
        result = _parse_binding_value(
            node_id=1, endpoint_id=1, binding_value=binding_value
        )

        assert len(result) == 1
        # Note: 0 is a valid cluster ID, should not be converted to None
        # However, with the or-chain fix, we need explicit None check
        # The current implementation treats 0 as a valid value
        assert result[0].cluster_id == 0

    def test_parse_dict_binding_with_valid_cluster(self):
        """Test parsing dict binding with a normal cluster_id."""
        binding_value = [
            {
                "Node": 5,
                "Endpoint": 1,
                "Cluster": 6,  # On/Off cluster
            }
        ]
        result = _parse_binding_value(
            node_id=1, endpoint_id=1, binding_value=binding_value
        )

        assert len(result) == 1
        assert result[0].cluster_id == 6

    def test_parse_object_binding_with_none_cluster(self):
        """Test parsing object binding where cluster attribute is None.

        This reproduces the exact scenario from issue #110 where
        esp-matter devices return binding objects with cluster=None.
        """

        class MockBinding:
            """Mock binding object like from esp-matter device."""

            cluster = None
            node = 5
            endpoint = 1
            group = None

        binding_value = [MockBinding()]
        result = _parse_binding_value(
            node_id=1, endpoint_id=1, binding_value=binding_value
        )

        assert len(result) == 1
        assert result[0].cluster_id is None
        assert result[0].target_node_id == 5
        assert result[0].target_endpoint_id == 1

    def test_parse_object_binding_with_valid_cluster(self):
        """Test parsing object binding with a normal cluster value."""

        class MockBinding:
            cluster = 8  # Level Control
            node = 5
            endpoint = 1
            group = None

        binding_value = [MockBinding()]
        result = _parse_binding_value(
            node_id=1, endpoint_id=1, binding_value=binding_value
        )

        assert len(result) == 1
        assert result[0].cluster_id == 8

    def test_parse_multiple_bindings_mixed_cluster(self):
        """Test parsing multiple bindings with mixed cluster values."""
        binding_value = [
            {"Node": 5, "Endpoint": 1, "Cluster": 6},
            {"Node": 6, "Endpoint": 1, "Cluster": None},
            {"Node": 7, "Endpoint": 2},  # No Cluster key
        ]
        result = _parse_binding_value(
            node_id=1, endpoint_id=1, binding_value=binding_value
        )

        assert len(result) == 3
        assert result[0].cluster_id == 6
        assert result[1].cluster_id is None
        assert result[2].cluster_id is None

    def test_parse_group_binding_with_none_cluster(self):
        """Test parsing group binding with None cluster."""
        binding_value = [
            {
                "Group": 100,
                "Cluster": None,
            }
        ]
        result = _parse_binding_value(
            node_id=1, endpoint_id=1, binding_value=binding_value
        )

        assert len(result) == 1
        assert result[0].cluster_id is None
        assert result[0].target_group_id == 100
        assert result[0].target_node_id is None


class TestBindingEntryKeyFormat:
    """Tests for _binding_entry camelCase vs numeric TLV tag key rendering."""

    def test_unicast_entry_camelcase(self):
        from custom_components.matter_binding_helper.matter.bindings import (
            _binding_entry,
        )

        target = {"cluster": 6, "node": 3, "endpoint": 1, "group": None}
        assert _binding_entry(target, tag_keys=False) == {
            "cluster": 6,
            "fabricIndex": 1,
            "node": 3,
            "endpoint": 1,
        }

    def test_unicast_entry_tag_keys(self):
        from custom_components.matter_binding_helper.matter.bindings import (
            _binding_entry,
        )

        # node=1, endpoint=3, cluster=4, fabricIndex=254
        target = {"cluster": 6, "node": 3, "endpoint": 1, "group": None}
        assert _binding_entry(target, tag_keys=True) == {
            "4": 6,
            "254": 1,
            "1": 3,
            "3": 1,
        }

    def test_groupcast_entry_tag_keys(self):
        from custom_components.matter_binding_helper.matter.bindings import (
            _binding_entry,
        )

        # group=2, cluster=4, fabricIndex=254 (no node/endpoint for groupcast)
        target = {"cluster": 6, "node": None, "endpoint": None, "group": 7}
        assert _binding_entry(target, tag_keys=True) == {"4": 6, "254": 1, "2": 7}


class TestParseBindingValueTagKeys:
    """matter.js returns Binding entries keyed by numeric TLV tags."""

    def test_parse_groupcast_binding_tag_keys(self):
        # cluster=4 -> 6 (On/Off), group=2 -> 7
        result = _parse_binding_value(1, 1, [{"4": 6, "2": 7, "254": 1}])
        assert len(result) == 1
        assert result[0].cluster_id == 6
        assert result[0].target_group_id == 7
        assert result[0].target_node_id is None

    def test_parse_unicast_binding_tag_keys(self):
        # cluster=4 -> 6, node=1 -> 3, endpoint=3 -> 1
        result = _parse_binding_value(1, 1, [{"4": 6, "1": 3, "3": 1, "254": 1}])
        assert len(result) == 1
        assert result[0].cluster_id == 6
        assert result[0].target_node_id == 3
        assert result[0].target_endpoint_id == 1
