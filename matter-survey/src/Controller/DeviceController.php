<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\DeviceRepository;
use App\Service\MatterRegistry;
use App\Service\TelemetryService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DeviceController extends AbstractController
{
    public function __construct(
        private DeviceRepository $deviceRepo,
        private TelemetryService $telemetryService,
        private MatterRegistry $matterRegistry,
    ) {}

    #[Route('/', name: 'device_index', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $page = max(1, $request->query->getInt('page', 1));
        $search = trim($request->query->getString('q', ''));
        $perPage = 50;
        $offset = ($page - 1) * $perPage;

        if ($search !== '') {
            $devices = $this->deviceRepo->searchDevices($search, $perPage);
            $totalDevices = count($devices);
        } else {
            $devices = $this->deviceRepo->getAllDevices($perPage, $offset);
            $totalDevices = $this->deviceRepo->getDeviceCount();
        }

        $totalPages = max(1, (int) ceil($totalDevices / $perPage));
        $stats = $this->telemetryService->getStats();

        return $this->render('device/index.html.twig', [
            'devices' => $devices,
            'stats' => $stats,
            'page' => $page,
            'totalPages' => $totalPages,
            'totalDevices' => $totalDevices,
            'search' => $search,
        ]);
    }

    #[Route('/device/{id}', name: 'device_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): Response
    {
        $device = $this->deviceRepo->getDevice($id);

        if (!$device) {
            throw $this->createNotFoundException('Device not found');
        }

        $endpoints = $this->deviceRepo->getDeviceEndpoints($id);
        $versions = $this->deviceRepo->getDeviceVersions($id);

        return $this->render('device/show.html.twig', [
            'device' => $device,
            'endpoints' => $endpoints,
            'versions' => $versions,
            'matterRegistry' => $this->matterRegistry,
        ]);
    }
}
