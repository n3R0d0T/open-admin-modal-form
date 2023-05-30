let modals = [];

document.addEventListener('pjax:start', function () {
    if (modals.length) {
        modals.forEach(function (modal, key) {
            modal.dismiss();
        });
    }
});