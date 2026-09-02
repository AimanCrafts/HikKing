<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
<<<<<<< HEAD
=======
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
<<<<<<< HEAD
        //
=======
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
        ]);
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
<<<<<<< HEAD
    })->create();
=======
    })->create();
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
