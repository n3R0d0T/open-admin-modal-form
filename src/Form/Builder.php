<?php


namespace OpenAdmin\ModalForm\Form;


use OpenAdmin\Admin\Facades\Admin;
use OpenAdmin\ModalForm\Facades\Modal;

class Builder extends \OpenAdmin\Admin\Form\Builder
{
    protected $view = 'modal-form::form';

    /**
     * Width for label and field.
     *
     * @var array
     */
    protected $width = [
        'label' => 3,
        'field' => 8,
    ];

    /**
     * @var ModalForm
     */
    protected $form;

    /**
     * @return string
     */
    public function render():string
    {
        Modal::style(file_get_contents(public_path('/vendor/laravel-admin-ext/modal-form/css/modal-form.css')));
        return view($this->view, $this->getData())->render();
    }

    /**
     * Do initialize.
     */
    public function init()
    {
        parent::init();
        $this->getTools()
            ->disableList()
            ->disableView()
            ->disableDelete();
        $this->footer = new Footer($this);
    }

    public function open($options = []): string
    {
        $open = parent::open($options);
        return str_replace('pjax-container', '', $open);
    }

    /**
     * @return array
     */
    protected function getData()
    {
        $this->removeReservedFields();

        $tabObj = $this->form->setTab();

        if(!$tabObj->isEmpty()){
            $script = $this->getScript();
            Admin::script($script);
        }

        return [
            'id'     => $this->form->getId(),
            'form'   => $this,
            'size'   => $this->form->getSize(),
            'tabObj' => $tabObj,
            'width'  => $this->width,
            'layout' => $this->form->getLayout(),
        ];
    }

    /**
     * @return string
     */
    protected function getScript(){
        return <<<'SCRIPT'

        var hash = document.location.hash;
        if (hash) {
          var tabs = document.querySelectorAll('.nav-tabs a[href="' + hash + '"]');
          if (tabs.length > 0) {
            tabs[0].click();
          }
        }
        
        // Change hash for page-reload
        var tabLinks = document.querySelectorAll('.nav-tabs a');
        tabLinks.forEach(function(tabLink) {
          tabLink.addEventListener('shown.bs.tab', function(e) {
            history.pushState(null, null, e.target.hash);
          });
        });
        
        var errorTabs = document.querySelectorAll('.has-error');
        if (errorTabs.length > 0) {
          errorTabs.forEach(function(errorTab) {
            var tabId = '#' + errorTab.closest('.tab-pane').id;
            var icon = document.querySelector('li a[href="' + tabId + '"] i');
            icon.classList.remove('hide');
          });
        
          var firstErrorTab = document.querySelector('.has-error:first-of-type').closest('.tab-pane').id;
          var firstTabLink = document.querySelector('li a[href="#' + firstErrorTab + '"]');
          if (firstTabLink) {
            firstTabLink.click();
          }
        }        
        
SCRIPT;
    }
}