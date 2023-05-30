<?php

namespace OpenAdmin\ModalForm\Http\Controllers;

use OpenAdmin\Admin\Layout\Content;
use Illuminate\Routing\Controller;

class ModalFormController extends Controller
{
    public function index(Content $content)
    {
        return $content
            ->title('Title')
            ->description('Description')
            ->body(view('modal-form::index'));
    }
}