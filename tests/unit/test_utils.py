"""Unit tests for matter/utils.py."""

import pytest
from unittest.mock import MagicMock

from custom_components.matter_binding_helper.matter.models import (
    BindingEntry,
    OperationErrorType,
)
from custom_components.matter_binding_helper.matter.utils import (
    parse_error_type,
    get_user_friendly_error,
    check_node_available,
    binding_matches,
    get_cluster_privilege,
)


class TestParseErrorType:
    """Tests for parse_error_type function."""

    def test_permission_denied_unsupported(self):
        """Test parsing unsupported error as permission denied."""
        err = Exception("UnsupportedAttribute: cluster 0x001E")
        assert parse_error_type(err) == OperationErrorType.PERMISSION_DENIED

    def test_permission_denied_access(self):
        """Test parsing access error as permission denied."""
        err = Exception("Access denied to endpoint")
        assert parse_error_type(err) == OperationErrorType.PERMISSION_DENIED

    def test_permission_denied_not_allowed(self):
        """Test parsing not allowed error as permission denied."""
        err = Exception("Operation not allowed")
        assert parse_error_type(err) == OperationErrorType.PERMISSION_DENIED

    def test_timeout_error(self):
        """Test parsing timeout error."""
        err = Exception("Request timed out after 30 seconds")
        assert parse_error_type(err) == OperationErrorType.DEVICE_TIMEOUT

    def test_timed_out_error(self):
        """Test parsing timed out error variant."""
        err = Exception("Connection timed out")
        assert parse_error_type(err) == OperationErrorType.DEVICE_TIMEOUT

    def test_unavailable_error(self):
        """Test parsing unavailable error."""
        err = Exception("Device unavailable")
        assert parse_error_type(err) == OperationErrorType.DEVICE_UNAVAILABLE

    def test_offline_error(self):
        """Test parsing offline error as unavailable."""
        err = Exception("Node is offline")
        assert parse_error_type(err) == OperationErrorType.DEVICE_UNAVAILABLE

    def test_not_reachable_error(self):
        """Test parsing not reachable error as unavailable."""
        err = Exception("Device not reachable")
        assert parse_error_type(err) == OperationErrorType.DEVICE_UNAVAILABLE

    def test_disconnected_error(self):
        """Test parsing disconnected error as unavailable."""
        err = Exception("Client disconnected")
        assert parse_error_type(err) == OperationErrorType.DEVICE_UNAVAILABLE

    def test_invalid_request_invalid(self):
        """Test parsing invalid error."""
        err = Exception("Invalid parameter value")
        assert parse_error_type(err) == OperationErrorType.INVALID_REQUEST

    def test_invalid_request_malformed(self):
        """Test parsing malformed error."""
        err = Exception("Malformed request")
        assert parse_error_type(err) == OperationErrorType.INVALID_REQUEST

    def test_invalid_request_not_found(self):
        """Test parsing not found error."""
        err = Exception("Endpoint not found")
        assert parse_error_type(err) == OperationErrorType.INVALID_REQUEST

    def test_invalid_request_does_not_exist(self):
        """Test parsing does not exist error."""
        err = Exception("Cluster does not exist")
        assert parse_error_type(err) == OperationErrorType.INVALID_REQUEST

    def test_unknown_error(self):
        """Test parsing unknown error."""
        err = Exception("Something completely unexpected happened")
        assert parse_error_type(err) == OperationErrorType.UNKNOWN_ERROR

    def test_case_insensitive(self):
        """Test parsing is case insensitive."""
        err = Exception("TIMEOUT ERROR")
        assert parse_error_type(err) == OperationErrorType.DEVICE_TIMEOUT

    def test_empty_message(self):
        """Test parsing empty error message."""
        err = Exception("")
        assert parse_error_type(err) == OperationErrorType.UNKNOWN_ERROR


class TestGetUserFriendlyError:
    """Tests for get_user_friendly_error function."""

    def test_permission_denied_message(self):
        """Test user-friendly message for permission denied."""
        err = Exception("some error")
        msg = get_user_friendly_error(OperationErrorType.PERMISSION_DENIED, err)
        assert "Permission denied" in msg
        assert "administrator access" in msg

    def test_device_unavailable_message(self):
        """Test user-friendly message for unavailable device."""
        err = Exception("some error")
        msg = get_user_friendly_error(OperationErrorType.DEVICE_UNAVAILABLE, err)
        assert "unavailable" in msg
        assert "powered on" in msg

    def test_device_timeout_message(self):
        """Test user-friendly message for timeout."""
        err = Exception("some error")
        msg = get_user_friendly_error(OperationErrorType.DEVICE_TIMEOUT, err)
        assert "did not respond" in msg

    def test_device_rejected_message(self):
        """Test user-friendly message for device rejection."""
        err = Exception("some error")
        msg = get_user_friendly_error(OperationErrorType.DEVICE_REJECTED, err)
        assert "rejected" in msg

    def test_invalid_request_message(self):
        """Test user-friendly message for invalid request."""
        err = Exception("some error")
        msg = get_user_friendly_error(OperationErrorType.INVALID_REQUEST, err)
        assert "Invalid request" in msg

    def test_unknown_error_includes_original(self):
        """Test unknown error includes original message."""
        err = Exception("Original error details")
        msg = get_user_friendly_error(OperationErrorType.UNKNOWN_ERROR, err)
        assert "Original error details" in msg

    def test_success_fallback(self):
        """Test SUCCESS type falls through to default."""
        err = Exception("some message")
        msg = get_user_friendly_error(OperationErrorType.SUCCESS, err)
        assert "some message" in msg


class TestCheckNodeAvailable:
    """Tests for check_node_available function."""

    def test_node_available(self):
        """Test checking an available node."""
        mock_node = MagicMock()
        mock_node.node_id = 1
        mock_node.available = True

        mock_client = MagicMock()
        mock_client.get_nodes.return_value = [mock_node]

        is_available, msg = check_node_available(mock_client, 1)
        assert is_available is True
        assert msg is None

    def test_node_unavailable(self):
        """Test checking an unavailable node."""
        mock_node = MagicMock()
        mock_node.node_id = 1
        mock_node.available = False

        mock_client = MagicMock()
        mock_client.get_nodes.return_value = [mock_node]

        is_available, msg = check_node_available(mock_client, 1)
        assert is_available is False
        assert "unavailable" in msg

    def test_node_not_found(self):
        """Test checking a non-existent node."""
        mock_client = MagicMock()
        mock_client.get_nodes.return_value = []

        is_available, msg = check_node_available(mock_client, 99)
        assert is_available is False
        assert "not found" in msg

    def test_multiple_nodes_finds_correct_one(self):
        """Test finding the correct node among multiple."""
        mock_node1 = MagicMock()
        mock_node1.node_id = 1
        mock_node1.available = False

        mock_node2 = MagicMock()
        mock_node2.node_id = 2
        mock_node2.available = True

        mock_client = MagicMock()
        mock_client.get_nodes.return_value = [mock_node1, mock_node2]

        is_available, msg = check_node_available(mock_client, 2)
        assert is_available is True

    def test_exception_returns_available(self):
        """Test that exceptions don't block operations."""
        mock_client = MagicMock()
        mock_client.get_nodes.side_effect = Exception("Connection error")

        # Should return True to not block the operation
        is_available, msg = check_node_available(mock_client, 1)
        assert is_available is True
        assert msg is None


class TestBindingMatches:
    """Tests for binding_matches function."""

    def test_exact_match(self):
        """Test exact match of all fields."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=3,
            target_group_id=None,
        )
        assert binding_matches(binding, 2, 3, None, 6) is True

    def test_match_without_cluster_id(self):
        """Test match when cluster_id is None (don't check)."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=3,
        )
        # cluster_id=None means don't check cluster
        assert binding_matches(binding, 2, 3, None, None) is True

    def test_no_match_wrong_node(self):
        """Test no match when target node differs."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=3,
        )
        assert binding_matches(binding, 99, 3, None, 6) is False

    def test_no_match_wrong_endpoint(self):
        """Test no match when target endpoint differs."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=3,
        )
        assert binding_matches(binding, 2, 99, None, 6) is False

    def test_no_match_wrong_cluster(self):
        """Test no match when cluster differs."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=3,
        )
        assert binding_matches(binding, 2, 3, None, 8) is False

    def test_match_group_binding(self):
        """Test matching a group binding."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_group_id=100,
        )
        assert binding_matches(binding, None, None, 100, 6) is True

    def test_no_match_wrong_group(self):
        """Test no match when group differs."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_group_id=100,
        )
        assert binding_matches(binding, None, None, 200, 6) is False

    def test_none_target_node_skips_check(self):
        """Test that None target_node_id skips that check."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=3,
        )
        # When target_node_id=None in the match call, don't check node
        assert binding_matches(binding, None, 3, None, 6) is True

    def test_none_target_endpoint_skips_check(self):
        """Test that None target_endpoint_id skips that check."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=3,
        )
        # When target_endpoint_id=None in the match call, don't check endpoint
        assert binding_matches(binding, 2, None, None, 6) is True


class TestGetClusterPrivilege:
    """Tests for get_cluster_privilege function."""

    def test_on_off_cluster_operate(self):
        """Test On/Off cluster requires Operate privilege."""
        # On/Off cluster ID = 0x0006 = 6
        privilege = get_cluster_privilege(6)
        assert privilege == 3  # Operate

    def test_level_control_cluster_operate(self):
        """Test Level Control cluster requires Operate privilege."""
        # Level Control cluster ID = 0x0008 = 8
        privilege = get_cluster_privilege(8)
        assert privilege == 3  # Operate

    def test_unknown_cluster_default(self):
        """Test unknown cluster returns default privilege."""
        # Unknown cluster should return default (Operate = 3)
        privilege = get_cluster_privilege(99999)
        assert privilege == 3  # Default is Operate

    def test_thermostat_cluster_operate(self):
        """Test Thermostat cluster requires Operate privilege."""
        # Thermostat cluster ID = 0x0201 = 513
        privilege = get_cluster_privilege(0x0201)
        assert privilege == 3  # Operate

    def test_color_control_cluster_operate(self):
        """Test Color Control cluster requires Operate privilege."""
        # Color Control cluster ID = 0x0300 = 768
        privilege = get_cluster_privilege(0x0300)
        assert privilege == 3  # Operate
