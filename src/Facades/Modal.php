<?php


namespace OpenAdmin\ModalForm\Facades;

use Illuminate\Support\Facades\Facade;

class Modal extends Facade
{
    protected static function getFacadeAccessor()
    {
        return \OpenAdmin\ModalForm\Modal::class;
    }
}