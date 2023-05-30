<?php

namespace OpenAdmin\ModalForm;

use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;

class ModalFormServiceProvider extends ServiceProvider
{

    protected $routeMiddleware = [
        'admin.modal-form.bootstrap'  => Middleware\Bootstrap::class,
    ];

    /**
     * The application's route middleware groups.
     *
     * @var array
     */
    protected $middlewareGroups = [
        'admin' => [
            'admin.modal-form.bootstrap',
        ],
    ];

    /**
     * {@inheritdoc}
     */
    public function boot(ModalForm $extension)
    {
        if (! ModalForm::boot()) {
            return ;
        }

        if ($views = $extension->views()) {
            $this->loadViewsFrom($views, 'modal-form');
        }

        if ($this->app->runningInConsole() && $assets = $extension->assets()) {
            $this->publishes(
                [$assets => public_path('vendor/open-admin-ext/modal-form')],
                'modal-form'
            );
        }

        // $this->app->booted(function () {
        //     ModalForm::routes(__DIR__.'/../routes/web.php');
        // });
    }

    public function register()
    {
        $this->registerRouteMiddleware();
    }

    public function registerRouteMiddleware(){
        // register route middleware.
        /**
         * @var Router $router
         */
        $router = app('router');
        foreach ($this->routeMiddleware as $key => $middleware) {
            $router->aliasMiddleware($key, $middleware);
        }

        // register middleware group.
        foreach ($this->middlewareGroups as $key => $middleware) {
            $middlewareGroups = $router->getMiddlewareGroups();
            if(key_exists($key, $middlewareGroups)){
                $groupMiddleware = $middlewareGroups[$key];
                $middleware = array_merge($groupMiddleware, $middleware);
            }
            $router->middlewareGroup($key, $middleware);
        }
    }
}