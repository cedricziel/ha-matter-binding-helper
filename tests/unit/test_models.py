"""Unit tests for matter/models.py."""

import pytest
from dataclasses import FrozenInstanceError

from custom_components.matter_binding_helper.matter.models import (
    ACLEntry,
    ACLProvisioningResult,
    ACLTarget,
    BindingEntry,
    BindingVerificationResult,
    GroupEntry,
    OperationErrorType,
    ScheduleTransition,
    WeeklySchedule,
)


class TestOperationErrorType:
    """Tests for OperationErrorType enum."""

    def test_all_error_types_have_string_values(self):
        """All error types should have string values for serialization."""
        for error_type in OperationErrorType:
            assert isinstance(error_type.value, str)

    def test_error_types_are_unique(self):
        """All error type values should be unique."""
        values = [e.value for e in OperationErrorType]
        assert len(values) == len(set(values))

    def test_expected_error_types_exist(self):
        """Expected error types should exist."""
        assert OperationErrorType.SUCCESS
        assert OperationErrorType.PERMISSION_DENIED
        assert OperationErrorType.DEVICE_UNAVAILABLE
        assert OperationErrorType.DEVICE_TIMEOUT
        assert OperationErrorType.DEVICE_REJECTED
        assert OperationErrorType.INVALID_REQUEST
        assert OperationErrorType.UNKNOWN_ERROR


class TestBindingEntry:
    """Tests for BindingEntry dataclass."""

    def test_create_unicast_binding(self):
        """Test creating a unicast binding (node-to-node)."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_node_id=2,
            target_endpoint_id=1,
        )
        assert binding.node_id == 1
        assert binding.endpoint_id == 1
        assert binding.cluster_id == 6
        assert binding.target_node_id == 2
        assert binding.target_endpoint_id == 1
        assert binding.target_group_id is None

    def test_create_group_binding(self):
        """Test creating a group binding."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_group_id=100,
        )
        assert binding.target_node_id is None
        assert binding.target_endpoint_id is None
        assert binding.target_group_id == 100

    def test_to_dict(self):
        """Test converting binding to dictionary."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=2,
            cluster_id=6,
            target_node_id=3,
            target_endpoint_id=4,
        )
        result = binding.to_dict()
        assert result == {
            "node_id": 1,
            "endpoint_id": 2,
            "cluster_id": 6,
            "target_node_id": 3,
            "target_endpoint_id": 4,
            "target_group_id": None,
        }

    def test_to_dict_with_group(self):
        """Test to_dict with group binding."""
        binding = BindingEntry(
            node_id=1,
            endpoint_id=1,
            cluster_id=6,
            target_group_id=50,
        )
        result = binding.to_dict()
        assert result["target_group_id"] == 50
        assert result["target_node_id"] is None


class TestScheduleTransition:
    """Tests for ScheduleTransition dataclass."""

    def test_create_heat_transition(self):
        """Test creating a heat-only transition."""
        transition = ScheduleTransition(
            transition_time=360,  # 6:00 AM
            heat_setpoint=20.0,
        )
        assert transition.transition_time == 360
        assert transition.heat_setpoint == 20.0
        assert transition.cool_setpoint is None

    def test_create_cool_transition(self):
        """Test creating a cool-only transition."""
        transition = ScheduleTransition(
            transition_time=720,  # 12:00 PM
            cool_setpoint=24.0,
        )
        assert transition.cool_setpoint == 24.0
        assert transition.heat_setpoint is None

    def test_to_dict(self):
        """Test converting transition to dictionary."""
        transition = ScheduleTransition(
            transition_time=480,
            heat_setpoint=21.5,
            cool_setpoint=25.0,
        )
        result = transition.to_dict()
        assert result == {
            "transition_time": 480,
            "heat_setpoint": 21.5,
            "cool_setpoint": 25.0,
        }

    def test_from_matter(self):
        """Test creating from Matter SDK struct."""

        class MockMatterTransition:
            transitionTime = 600
            heatSetpoint = 2100  # 21.0°C in 0.01°C units
            coolSetpoint = 2500  # 25.0°C

        transition = ScheduleTransition.from_matter(MockMatterTransition())
        assert transition.transition_time == 600
        assert transition.heat_setpoint == 21.0
        assert transition.cool_setpoint == 25.0

    def test_from_matter_with_none(self):
        """Test from_matter handles None values."""

        class MockMatterTransition:
            transitionTime = 300
            heatSetpoint = None
            coolSetpoint = 2400

        transition = ScheduleTransition.from_matter(MockMatterTransition())
        assert transition.heat_setpoint is None
        assert transition.cool_setpoint == 24.0


class TestWeeklySchedule:
    """Tests for WeeklySchedule dataclass."""

    def test_create_schedule(self):
        """Test creating a weekly schedule."""
        transitions = [
            ScheduleTransition(transition_time=360, heat_setpoint=20.0),
            ScheduleTransition(transition_time=480, heat_setpoint=18.0),
        ]
        schedule = WeeklySchedule(
            day_of_week=0b00111110,  # Mon-Fri
            mode=1,  # Heat only
            transitions=transitions,
        )
        assert schedule.day_of_week == 0b00111110
        assert schedule.mode == 1
        assert len(schedule.transitions) == 2

    def test_get_day_names_weekdays(self):
        """Test extracting day names for weekdays."""
        schedule = WeeklySchedule(
            day_of_week=0b00111110,  # Mon-Fri (bits 1-5)
            mode=1,
            transitions=[],
        )
        result = schedule.to_dict()
        assert "monday" in result["day_names"]
        assert "friday" in result["day_names"]
        assert "sunday" not in result["day_names"]
        assert "saturday" not in result["day_names"]

    def test_get_day_names_weekend(self):
        """Test extracting day names for weekend."""
        schedule = WeeklySchedule(
            day_of_week=0b01000001,  # Sun + Sat
            mode=1,
            transitions=[],
        )
        result = schedule.to_dict()
        assert "sunday" in result["day_names"]
        assert "saturday" in result["day_names"]
        assert len(result["day_names"]) == 2

    def test_get_day_names_away(self):
        """Test extracting away mode."""
        schedule = WeeklySchedule(
            day_of_week=0b10000000,  # Away bit
            mode=1,
            transitions=[],
        )
        result = schedule.to_dict()
        assert "away" in result["day_names"]

    def test_get_mode_names_heat(self):
        """Test mode name for heat only."""
        schedule = WeeklySchedule(day_of_week=1, mode=1, transitions=[])
        result = schedule.to_dict()
        assert result["mode_names"] == ["heat"]

    def test_get_mode_names_cool(self):
        """Test mode name for cool only."""
        schedule = WeeklySchedule(day_of_week=1, mode=2, transitions=[])
        result = schedule.to_dict()
        assert result["mode_names"] == ["cool"]

    def test_get_mode_names_both(self):
        """Test mode names for heat and cool."""
        schedule = WeeklySchedule(day_of_week=1, mode=3, transitions=[])
        result = schedule.to_dict()
        assert "heat" in result["mode_names"]
        assert "cool" in result["mode_names"]

    def test_to_dict_includes_transitions(self):
        """Test to_dict includes serialized transitions."""
        schedule = WeeklySchedule(
            day_of_week=1,
            mode=1,
            transitions=[ScheduleTransition(transition_time=360, heat_setpoint=20.0)],
        )
        result = schedule.to_dict()
        assert len(result["transitions"]) == 1
        assert result["transitions"][0]["transition_time"] == 360


class TestGroupEntry:
    """Tests for GroupEntry dataclass."""

    def test_create_group(self):
        """Test creating a group entry."""
        group = GroupEntry(
            group_id=1,
            name="Living Room Lights",
            members=[
                {"node_id": 1, "endpoint_id": 1},
                {"node_id": 2, "endpoint_id": 1},
            ],
        )
        assert group.group_id == 1
        assert group.name == "Living Room Lights"
        assert len(group.members) == 2

    def test_to_dict(self):
        """Test converting group to dictionary."""
        group = GroupEntry(
            group_id=5,
            name="Test Group",
            members=[{"node_id": 3, "endpoint_id": 2}],
        )
        result = group.to_dict()
        assert result == {
            "group_id": 5,
            "name": "Test Group",
            "members": [{"node_id": 3, "endpoint_id": 2}],
        }


class TestACLTarget:
    """Tests for ACLTarget dataclass."""

    def test_create_cluster_target(self):
        """Test creating an ACL target for a specific cluster."""
        target = ACLTarget(cluster=6, endpoint=1)
        assert target.cluster == 6
        assert target.endpoint == 1
        assert target.device_type is None

    def test_create_device_type_target(self):
        """Test creating an ACL target for a device type."""
        target = ACLTarget(device_type=256)
        assert target.device_type == 256
        assert target.cluster is None
        assert target.endpoint is None

    def test_to_dict(self):
        """Test converting ACL target to dictionary."""
        target = ACLTarget(cluster=8, endpoint=2)
        result = target.to_dict()
        assert result == {
            "cluster": 8,
            "endpoint": 2,
            "device_type": None,
        }


class TestACLEntry:
    """Tests for ACLEntry dataclass."""

    def test_create_admin_entry(self):
        """Test creating an admin ACL entry."""
        entry = ACLEntry(
            privilege=5,  # Administer
            auth_mode=2,  # CASE
            subjects=[1],
            targets=[],
            fabric_index=1,
        )
        assert entry.privilege == 5
        assert entry.auth_mode == 2
        assert entry.subjects == [1]
        assert entry.targets == []
        assert entry.fabric_index == 1

    def test_create_operate_entry_with_targets(self):
        """Test creating an operate ACL entry with targets."""
        targets = [ACLTarget(cluster=6, endpoint=1)]
        entry = ACLEntry(
            privilege=3,  # Operate
            auth_mode=2,  # CASE
            subjects=[2, 3],
            targets=targets,
            fabric_index=1,
        )
        assert entry.privilege == 3
        assert len(entry.subjects) == 2
        assert len(entry.targets) == 1

    def test_privilege_name_administer(self):
        """Test privilege name for Administer."""
        entry = ACLEntry(
            privilege=5, auth_mode=2, subjects=[], targets=[], fabric_index=1
        )
        result = entry.to_dict()
        assert result["privilege_name"] == "Administer"

    def test_privilege_name_operate(self):
        """Test privilege name for Operate."""
        entry = ACLEntry(
            privilege=3, auth_mode=2, subjects=[], targets=[], fabric_index=1
        )
        result = entry.to_dict()
        assert result["privilege_name"] == "Operate"

    def test_privilege_name_view(self):
        """Test privilege name for View."""
        entry = ACLEntry(
            privilege=1, auth_mode=2, subjects=[], targets=[], fabric_index=1
        )
        result = entry.to_dict()
        assert result["privilege_name"] == "View"

    def test_privilege_name_unknown(self):
        """Test privilege name for unknown value."""
        entry = ACLEntry(
            privilege=99, auth_mode=2, subjects=[], targets=[], fabric_index=1
        )
        result = entry.to_dict()
        assert "Unknown" in result["privilege_name"]
        assert "99" in result["privilege_name"]

    def test_auth_mode_name_case(self):
        """Test auth mode name for CASE."""
        entry = ACLEntry(
            privilege=3, auth_mode=2, subjects=[], targets=[], fabric_index=1
        )
        result = entry.to_dict()
        assert result["auth_mode_name"] == "CASE"

    def test_auth_mode_name_pase(self):
        """Test auth mode name for PASE."""
        entry = ACLEntry(
            privilege=3, auth_mode=1, subjects=[], targets=[], fabric_index=1
        )
        result = entry.to_dict()
        assert result["auth_mode_name"] == "PASE"

    def test_auth_mode_name_group(self):
        """Test auth mode name for Group."""
        entry = ACLEntry(
            privilege=3, auth_mode=3, subjects=[], targets=[], fabric_index=1
        )
        result = entry.to_dict()
        assert result["auth_mode_name"] == "Group"

    def test_to_dict_includes_targets(self):
        """Test to_dict serializes targets correctly."""
        targets = [ACLTarget(cluster=6, endpoint=1)]
        entry = ACLEntry(
            privilege=3, auth_mode=2, subjects=[2], targets=targets, fabric_index=1
        )
        result = entry.to_dict()
        assert len(result["targets"]) == 1
        assert result["targets"][0]["cluster"] == 6


class TestBindingVerificationResult:
    """Tests for BindingVerificationResult dataclass."""

    def test_create_success_result(self):
        """Test creating a successful result."""
        result = BindingVerificationResult(
            success=True,
            verified=True,
            message="Binding created successfully",
            bindings_found=1,
        )
        assert result.success is True
        assert result.verified is True
        assert result.bindings_found == 1
        # Default error_type is SUCCESS, not None
        assert result.error_type == OperationErrorType.SUCCESS

    def test_create_failure_result(self):
        """Test creating a failure result."""
        result = BindingVerificationResult(
            success=False,
            verified=False,
            message="Device unavailable",
            error_type=OperationErrorType.DEVICE_UNAVAILABLE,
        )
        assert result.success is False
        assert result.error_type == OperationErrorType.DEVICE_UNAVAILABLE

    def test_to_dict(self):
        """Test converting result to dictionary."""
        result = BindingVerificationResult(
            success=True,
            verified=True,
            message="OK",
            bindings_found=2,
        )
        d = result.to_dict()
        assert d["success"] is True
        assert d["verified"] is True
        assert d["message"] == "OK"
        assert d["bindings_found"] == 2
        # error_type is serialized as its value
        assert d["error_type"] == "success"

    def test_to_dict_with_error_type(self):
        """Test to_dict includes error type value."""
        result = BindingVerificationResult(
            success=False,
            verified=False,
            message="Error",
            error_type=OperationErrorType.PERMISSION_DENIED,
        )
        d = result.to_dict()
        assert d["error_type"] == "permission_denied"


class TestACLProvisioningResult:
    """Tests for ACLProvisioningResult dataclass."""

    def test_create_success_result(self):
        """Test creating a successful ACL provisioning result."""
        result = ACLProvisioningResult(
            success=True,
            message="ACL provisioned",
            acl_entries_count=2,
        )
        assert result.success is True
        assert result.acl_entries_count == 2
        # Default error_type is SUCCESS
        assert result.error_type == OperationErrorType.SUCCESS

    def test_create_with_default_count(self):
        """Test creating result with default entry count."""
        result = ACLProvisioningResult(
            success=True,
            message="Done",
        )
        assert result.acl_entries_count == 0

    def test_to_dict(self):
        """Test converting ACL result to dictionary."""
        result = ACLProvisioningResult(
            success=True,
            message="Done",
            acl_entries_count=1,
        )
        d = result.to_dict()
        assert d["success"] is True
        assert d["message"] == "Done"
        assert d["acl_entries_count"] == 1
        # error_type is serialized as its value
        assert d["error_type"] == "success"

    def test_to_dict_with_error(self):
        """Test to_dict with error type."""
        result = ACLProvisioningResult(
            success=False,
            message="Failed",
            error_type=OperationErrorType.DEVICE_TIMEOUT,
        )
        d = result.to_dict()
        assert d["error_type"] == "device_timeout"
