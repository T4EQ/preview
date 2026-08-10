document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initContactForm();
});

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (!toggle || !links) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function initContactForm() {
  const form = document.querySelector('.c-form');

  if (!form) {
    return;
  }

  const status = form.querySelector('.c-form__status');
  const button = form.querySelector('button[type="submit"]');
  const action = form.getAttribute('action');
  const email = form.getAttribute('data-email');
  const hasEndpoint = action && action !== '#' && /^https?:/i.test(action);

  const setStatus = (message, ok) => {
    if (!status) {
      return;
    }
    status.textContent = message;
    status.hidden = false;
    status.classList.toggle('is-success', ok === true);
    status.classList.toggle('is-error', ok === false);
  };

  form.addEventListener('submit', async (event) => {
    if (!form.checkValidity()) {
      return; // let the browser show native validation messages
    }

    event.preventDefault();

    const data = new FormData(form);

    // No form endpoint configured: open the visitor's email app instead.
    if (!hasEndpoint) {
      if (!email) {
        return;
      }
      const name = (data.get('name') || '').toString();
      const from = (data.get('email') || '').toString();
      const message = (data.get('message') || '').toString();
      const subject = encodeURIComponent('Website enquiry from ' + name);
      const body = encodeURIComponent(message + '\n\n\u2014 ' + name + ' (' + from + ')');
      window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
      return;
    }

    // Form endpoint configured: submit in the background and stay on the page.
    const originalLabel = button ? button.textContent : '';
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending\u2026';
    }

    try {
      const response = await fetch(action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        setStatus("Thanks \u2014 your message has been sent. We'll be in touch.", true);
      } else {
        setStatus(
          'Sorry, something went wrong.' + (email ? ' Please email us directly at ' + email + '.' : ''),
          false
        );
      }
    } catch (error) {
      setStatus(
        'Sorry, something went wrong.' + (email ? ' Please email us directly at ' + email + '.' : ''),
        false
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    }
  });
}