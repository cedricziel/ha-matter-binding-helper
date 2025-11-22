<?php

declare(strict_types=1);

namespace App\Service;

/**
 * Registry for Matter cluster and device type name lookups.
 */
class MatterRegistry
{
    private const CLUSTER_NAMES = [
        0x0003 => 'Identify',
        0x0004 => 'Groups',
        0x0005 => 'Scenes',
        0x0006 => 'On/Off',
        0x0008 => 'Level Control',
        0x001D => 'Descriptor',
        0x001E => 'Binding',
        0x001F => 'Access Control',
        0x0028 => 'Basic Information',
        0x0029 => 'OTA Software Update Provider',
        0x002A => 'OTA Software Update Requestor',
        0x002B => 'Localization Configuration',
        0x002C => 'Time Format Localization',
        0x002D => 'Unit Localization',
        0x002E => 'Power Source Configuration',
        0x002F => 'Power Source',
        0x0030 => 'General Commissioning',
        0x0031 => 'Network Commissioning',
        0x0032 => 'Diagnostic Logs',
        0x0033 => 'General Diagnostics',
        0x0034 => 'Software Diagnostics',
        0x0035 => 'Thread Network Diagnostics',
        0x0036 => 'WiFi Network Diagnostics',
        0x0037 => 'Ethernet Network Diagnostics',
        0x0038 => 'Time Synchronization',
        0x0039 => 'Bridged Device Basic Information',
        0x003C => 'Administrator Commissioning',
        0x003E => 'Node Operational Credentials',
        0x003F => 'Group Key Management',
        0x0040 => 'Fixed Label',
        0x0041 => 'User Label',
        0x0045 => 'Boolean State',
        0x0050 => 'Mode Select',
        0x0101 => 'Door Lock',
        0x0102 => 'Window Covering',
        0x0200 => 'Pump Configuration and Control',
        0x0201 => 'Thermostat',
        0x0202 => 'Fan Control',
        0x0204 => 'Thermostat User Interface Configuration',
        0x0300 => 'Color Control',
        0x0301 => 'Ballast Configuration',
        0x0400 => 'Illuminance Measurement',
        0x0402 => 'Temperature Measurement',
        0x0403 => 'Pressure Measurement',
        0x0404 => 'Flow Measurement',
        0x0405 => 'Relative Humidity Measurement',
        0x0406 => 'Occupancy Sensing',
        0x0500 => 'IAS Zone',
        0x0503 => 'Wake on LAN',
        0x0504 => 'Channel',
        0x0505 => 'Target Navigator',
        0x0506 => 'Media Playback',
        0x0507 => 'Media Input',
        0x0508 => 'Low Power',
        0x0509 => 'Keypad Input',
        0x050A => 'Content Launcher',
        0x050B => 'Audio Output',
        0x050C => 'Application Launcher',
        0x050D => 'Application Basic',
        0x050E => 'Account Login',
    ];

    private const DEVICE_TYPE_NAMES = [
        10 => 'Door Lock',
        17 => 'Power Source',
        21 => 'Contact Sensor',
        22 => 'Root Node',
        23 => 'Bridged Node',
        44 => 'Smoke/CO Alarm',
        256 => 'On/Off Light',
        257 => 'Dimmable Light',
        258 => 'Color Temperature Light',
        259 => 'On/Off Light Switch',
        260 => 'Dimmer Switch',
        261 => 'Color Dimmer Switch',
        262 => 'Light Sensor',
        263 => 'Occupancy Sensor',
        266 => 'On/Off Plug-in Unit',
        267 => 'Dimmable Plug-in Unit',
        268 => 'Pump',
        514 => 'Window Covering',
        515 => 'Window Covering Controller',
        769 => 'Thermostat',
        770 => 'Temperature Sensor',
        771 => 'Humidity Sensor',
        772 => 'Fan',
        773 => 'Air Purifier',
        774 => 'Air Quality Sensor',
    ];

    public function getClusterName(int $id): string
    {
        return self::CLUSTER_NAMES[$id] ?? sprintf('Cluster 0x%04X', $id);
    }

    public function getDeviceTypeName(int $id): string
    {
        return self::DEVICE_TYPE_NAMES[$id] ?? "Device Type $id";
    }

    public function getAllClusterNames(): array
    {
        return self::CLUSTER_NAMES;
    }

    public function getAllDeviceTypeNames(): array
    {
        return self::DEVICE_TYPE_NAMES;
    }
}
