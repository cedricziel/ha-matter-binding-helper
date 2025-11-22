<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\TelemetryService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class ApiController extends AbstractController
{
    public function __construct(
        private TelemetryService $telemetryService,
        private RateLimiterFactory $apiSubmitLimiter,
    ) {}

    #[Route('/', name: 'api_docs_redirect', methods: ['GET'])]
    public function docsRedirect(): Response
    {
        return $this->redirect('/api/docs.html');
    }

    #[Route('/submit', name: 'api_submit', methods: ['POST'])]
    public function submit(Request $request): JsonResponse
    {
        // Rate limiting
        $limiter = $this->apiSubmitLimiter->create($request->getClientIp() ?? 'unknown');
        if (!$limiter->consume()->isAccepted()) {
            return $this->json(
                ['status' => 'error', 'error' => 'Rate limit exceeded. Please try again later.'],
                Response::HTTP_TOO_MANY_REQUESTS
            );
        }

        // Parse JSON
        $content = $request->getContent();
        if (empty($content)) {
            return $this->json(
                ['status' => 'error', 'error' => 'Empty request body'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $payload = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(
                ['status' => 'error', 'error' => 'Invalid JSON: ' . json_last_error_msg()],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Process submission
        $ipHash = hash('sha256', $request->getClientIp() ?? 'unknown');
        $result = $this->telemetryService->processSubmission($payload, $ipHash);

        if ($result['success']) {
            return $this->json([
                'status' => 'ok',
                'message' => $result['message'],
                'devices_processed' => $result['devices_processed'] ?? 0,
            ]);
        }

        return $this->json(
            ['status' => 'error', 'error' => $result['error']],
            Response::HTTP_BAD_REQUEST
        );
    }
}
