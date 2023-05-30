class Modal {
    constructor(result) {
      this.el = document.querySelector(result);
      this.id = this.el.getAttribute('id');
      this.init();
    }
  
    init() {
      this.handleSubmit();
      this.handleReset();
      this.show();
      this.handleHide();
    }
  
    setButton(modalButton) {
      this.modalButton = modalButton;
      return this;
    }
  
    handleSubmit() {
      const form = this.el.querySelector('form');
      const that = this;
      form.addEventListener('submit', function (e) {
        that.modalButton.dispatchEvent(new Event('modelCreating'));
        e.preventDefault();
        that.clearErrors();
        that.disableButtons();
        that.loading();
        fetch(form.getAttribute('action'), {
          method: form.getAttribute('method'),
          body: new URLSearchParams(new FormData(form)),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(response.status.toString());
            }
            return response.json();
          })
          .then((result) => {
            if (result.status) {
              toastr.success(result.message);
              that.modalButton.dataset.modelId = result.modelId;
              that.modalButton.dispatchEvent(new Event('modelCreated'));
              that.dismiss();
            } else {
              that.modalButton.dispatchEvent(new Event('modelValidationFailed'));
              that.handleErrors(result);
            }
          })
          .catch((error) => {
            that.modalButton.dispatchEvent(new Event('modelFailed'));
            swal(error.message, 'error');
          })
          .finally(() => {
            that.enableButtons();
            that.loading(false);
          });
      });
    }
  
    loading(isLoading = true) {
      if (isLoading) {
        this.loadingElement = document.createElement('div');
        this.loadingElement.className = 'modal-backdrop in';
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'editableform-loading';
        loadingDiv.style.position = 'absolute';
        loadingDiv.style.top = '50%';
        loadingDiv.style.left = '50%';
        loadingDiv.style.zIndex = '10000';
        this.loadingElement.appendChild(loadingDiv);
        this.el.querySelector('.modal-dialog').appendChild(this.loadingElement);
      } else {
        if (this.loadingElement) {
          this.loadingElement.remove();
        }
      }
    }
  
    handleReset() {
      const resetButton = this.el.querySelector('[type="reset"]');
      resetButton.addEventListener('click', () => {
        this.clearErrors();
      });
    }
  
    getButtons() {
      return this.el.querySelectorAll('.btn');
    }
  
    enableButtons() {
      const buttons = this.getButtons();
      buttons.forEach((button) => {
        const tagName = button.tagName;
        switch (tagName) {
          case 'A':
            button.href = button.dataset.dataHref;
            button.removeAttribute('data-data-href');
            break;
          case 'BUTTON':
            button.removeAttribute('disabled');
            break;
        }
      });
    }
  
    disableButtons() {
      const buttons = this.getButtons();
      buttons.forEach((button) => {
        const tagName = button.tagName;
        switch (tagName) {
          case 'A':
            button.dataset.dataHref = button.href;
            button.href = 'javascript:void(0)';
            break;
          case 'BUTTON':
            button.setAttribute('disabled', 'true');
            break;
        }
      });
    }
  
    handleHide() {
      const that = this;
      this.el.addEventListener('hidden.bs.modal', function () {
        const index = modals.findIndex((element) => {
          return element.id === that.id;
        });
        if (index > -1) {
          modals.slice(index, 1);
        }
        that.el.remove();
      });
    }
  
    show() {
      this.appendModal();
      this.modal = new bootstrap.Modal(this.el, {
        backdrop: 'static',
        keyboard: false,
      });
      this.modal.show();
    }
  
    appendModal() {
      const mainHeader = document.querySelector('header.main-header');
      mainHeader.parentNode.insertBefore(this.el, mainHeader);
    }
  
    dismiss() {
      const modal = bootstrap.Modal.getInstance(this.el);
      modal.hide();
    }
  
    clearErrors() {
      const formGroups = this.el.querySelectorAll('.has-error');
      formGroups.forEach((formGroup) => {
        formGroup.classList.remove('has-error');
        const inputErrors = formGroup.querySelectorAll('[for="inputError"]');
        inputErrors.forEach((inputError) => {
          const brSibling = inputError.nextElementSibling;
          if (brSibling.tagName === 'BR') {
            brSibling.remove();
          }
          inputError.remove();
        });
      });
    }
  
    handleErrors(result) {
      const that = this;
      if (result.hasOwnProperty('validation')) {
        const messages = result.validation;
        Object.entries(messages).forEach(([key, message]) => {
          const input = that.el.querySelector(`[name="${key}"]`);
          if (input) {
            const formInput = new FormInput(input);
            formInput.showMessage(message);
          }
        });
      }
    }
  }
  
  class FormInput {
    constructor(input) {
      this.el = input;
      this.formGroup = this.el.closest('.form-group');
      this.inputGroup = this.formGroup.querySelector('.input-group');
    }
  
    showMessage(message) {
      this.formGroup.classList.add('has-error');
      if (Array.isArray(message)) {
        message.forEach((error) => {
          this.inputGroup.insertAdjacentHTML(
            'beforebegin',
            this.getErrorLabel(error)
          );
        });
      }
    }
  
    getErrorLabel(error) {
      return `<label class="control-label" for="inputError"><i class="fa fa-times-circle-o"></i> ${error}</label><br/>`;
    }
  }
  
  document
    .querySelectorAll('a[data-form="modal"]:not([data-form-event-attached])')
    .forEach((element) => {
      const modalButton = element;
      modalButton.setAttribute('data-form-event-attached', true);
      modalButton.addEventListener('click', function (e) {
        e.preventDefault();
        if (!modalButton.hasAttribute('disabled')) {
          fetch(modalButton.href, {
            method: 'GET',
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(response.status.toString());
              }
              return response.text();
            })
            .then((result) => {
              const modal = new Modal(result);
              modals.push(modal);
              modal.setButton(modalButton);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
    });
  