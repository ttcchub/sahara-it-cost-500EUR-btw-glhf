class AgeVerificationPopup extends ModalDialog {
  constructor() {
    super();
    this.closed = getCookie('age-verification-closed');
    this.newsletterPopup = document.getElementById(
      'NewsletterModal-newsletter-popup'
    );
  }

  connectedCallback() {
    if (Shopify.designMode) {
      if (this.dataset.openInDesignMode === 'true') {
        this.show();
      }
      return;
    }

    setTimeout(() => {
      if (this.closed !== null) return;
      this.newsletterPopup.classList.add(
        'newsletter-popup-is-hidden'
      );
      this.show();
    }, 1000);
  }

  hide() {
    super.hide();
    this.newsletterPopup.classList.remove(
      'newsletter-popup-is-hidden'
    );
    setCookie('age-verification-closed', 'true');
  }
}

customElements.define('age-verification-popup', AgeVerificationPopup);
